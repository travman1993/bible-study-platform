// backend/routes/studies.js
const express = require('express');
const Study = require('../models/Study');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { verifyToken, requireTeacher } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Generate secure join code
const generateJoinCode = () => {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
};

// CREATE STUDY (Teachers only)
router.post('/', verifyToken, requireTeacher, async (req, res) => {
  try {
    const { title, startTime, maxParticipants } = req.body;

    // Check subscription
    const subscription = await Subscription.findOne({ 
      userId: req.userId,
      status: 'active'
    });

    if (!subscription) {
      return res.status(403).json({ 
        error: 'Active subscription required to create studies' 
      });
    }

    // Create study
    const study = new Study({
      title: title || 'Untitled Study',
      creatorId: req.userId,
      joinCode: generateJoinCode(),
      startTime: startTime || new Date(),
      status: 'scheduled',
      settings: {
        maxParticipants: maxParticipants || subscription.maxParticipants,
        bibleVersion: 'ESV',
        allowParticipantAudio: true,
        recordSession: true
      }
    });

    await study.save();

    // Add to user's created studies
    const user = await User.findById(req.userId);
    user.createdStudies.push(study._id);
    await user.save();

    res.status(201).json({
      success: true,
      study: {
        id: study._id,
        title: study.title,
        joinCode: study.joinCode,
        status: study.status
      }
    });
  } catch (err) {
    console.error('Study creation error:', err);
    res.status(500).json({ error: 'Failed to create study' });
  }
});

// JOIN STUDY (Any authenticated user)
router.post('/join/:joinCode', verifyToken, async (req, res) => {
  try {
    const { joinCode } = req.params;

    const study = await Study.findOne({ joinCode });
    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    // Check if already joined
    const alreadyJoined = study.participants.some(p => p.userId?.toString() === req.userId);
    if (alreadyJoined) {
      return res.json({ 
        success: true, 
        message: 'Already joined this study',
        study: { id: study._id, title: study.title }
      });
    }

    // Add participant
    study.participants.push({
      userId: req.userId,
      joinedAt: new Date(),
      role: 'participant'
    });

    await study.save();

    // Add to user's participated studies
    const user = await User.findById(req.userId);
    if (!user.participatedStudies.includes(study._id)) {
      user.participatedStudies.push(study._id);
      await user.save();
    }

    res.json({
      success: true,
      study: {
        id: study._id,
        title: study.title,
        creatorId: study.creatorId,
        status: study.status,
        passage: study.passage
      }
    });
  } catch (err) {
    console.error('Join study error:', err);
    res.status(500).json({ error: 'Failed to join study' });
  }
});

// GET STUDY (Only creator or participants)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);
    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    // Check access
    const isCreator = study.creatorId.toString() === req.userId;
    const isParticipant = study.participants.some(p => p.userId?.toString() === req.userId);

    if (!isCreator && !isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      study: {
        id: study._id,
        title: study.title,
        passage: study.passage,
        highlights: study.highlights,
        participants: study.participants.length,
        status: study.status,
        isCreator
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch study' });
  }
});

// GET MY STUDIES
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('createdStudies');
    
    res.json({
      success: true,
      studies: user.createdStudies.map(s => ({
        id: s._id,
        title: s.title,
        status: s.status,
        participants: s.participants.length,
        createdAt: s.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch studies' });
  }
});

module.exports = router;