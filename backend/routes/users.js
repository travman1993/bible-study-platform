// backend/routes/studies.js - FIXED VERSION
const express = require('express');
const Study = require('../models/Study');
const User = require('../models/User');
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
    const { title, startTime, endTime, description, group, topic } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    console.log('Creating study:', { title, startTime });

    // Create study
    const study = new Study({
      title: title,
      description: description || '',
      topic: topic || '',
      group: group || 'General',
      creatorId: req.userId,
      joinCode: generateJoinCode(),
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : null,
      status: 'scheduled',
      participants: [{
        userId: req.userId,
        role: 'teacher',
        joinedAt: new Date()
      }],
      settings: {
        maxParticipants: 50,
        bibleVersion: 'ESV',
        allowParticipantAudio: true,
        recordSession: true
      }
    });

    await study.save();
    console.log('Study saved:', study._id);

    // Add to user's created studies
    const user = await User.findById(req.userId);
    user.createdStudies.push(study._id);
    await user.save();
    console.log('User updated with study');

    return res.status(201).json({
      success: true,
      study: {
        _id: study._id,
        id: study._id,
        title: study.title,
        joinCode: study.joinCode,
        status: study.status,
        startTime: study.startTime,
        createdAt: study.createdAt
      }
    });
  } catch (err) {
    console.error('Study creation error:', err);
    return res.status(500).json({ error: 'Failed to create study', details: err.message });
  }
});

// GET ALL STUDIES (Only teacher's studies)
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('createdStudies').populate('participatedStudies');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Combine created and participated studies
    const created = user.createdStudies.map(s => ({
      _id: s._id,
      id: s._id,
      title: s.title,
      status: s.status,
      startTime: s.startTime,
      endTime: s.endTime,
      participants: s.participants?.length || 0,
      createdAt: s.createdAt,
      isCreator: true
    }));

    const participated = user.participatedStudies.map(s => ({
      _id: s._id,
      id: s._id,
      title: s.title,
      status: s.status,
      startTime: s.startTime,
      endTime: s.endTime,
      participants: s.participants?.length || 0,
      createdAt: s.createdAt,
      isCreator: false
    }));

    const allStudies = [...created, ...participated];

    return res.json({
      success: true,
      studies: allStudies
    });
  } catch (err) {
    console.error('Get studies error:', err);
    return res.status(500).json({ error: 'Failed to fetch studies', details: err.message });
  }
});

// GET STUDY DETAILS
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const study = await Study.findById(req.params.id).populate('creatorId', 'name email');

    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    // Check access
    const isCreator = study.creatorId._id.toString() === req.userId;
    const isParticipant = study.participants?.some(p => p.userId?.toString() === req.userId);

    if (!isCreator && !isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({
      success: true,
      study: {
        _id: study._id,
        id: study._id,
        title: study.title,
        topic: study.topic,
        description: study.description,
        passage: study.passage,
        highlights: study.highlights,
        participants: study.participants,
        status: study.status,
        joinCode: study.joinCode,
        startTime: study.startTime,
        endTime: study.endTime,
        creatorId: study.creatorId,
        isCreator
      }
    });
  } catch (err) {
    console.error('Get study error:', err);
    return res.status(500).json({ error: 'Failed to fetch study', details: err.message });
  }
});

// JOIN STUDY
router.post('/:joinCode/join', verifyToken, async (req, res) => {
  try {
    const { joinCode } = req.params;

    const study = await Study.findOne({ joinCode });
    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    // Check if already joined
    const alreadyJoined = study.participants?.some(p => p.userId?.toString() === req.userId);
    if (alreadyJoined) {
      return res.json({ 
        success: true, 
        message: 'Already joined this study',
        study: { 
          _id: study._id,
          id: study._id,
          title: study.title 
        }
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

    return res.json({
      success: true,
      study: {
        _id: study._id,
        id: study._id,
        title: study.title,
        creatorId: study.creatorId,
        status: study.status,
        passage: study.passage,
        joinCode: study.joinCode
      }
    });
  } catch (err) {
    console.error('Join study error:', err);
    return res.status(500).json({ error: 'Failed to join study', details: err.message });
  }
});

// UPDATE STUDY (Teachers only)
router.put('/:id', verifyToken, requireTeacher, async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);
    
    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    if (study.creatorId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only creator can update study' });
    }

    // Update allowed fields
    const { title, passage, status, settings } = req.body;
    if (title) study.title = title;
    if (passage) study.passage = passage;
    if (status) study.status = status;
    if (settings) study.settings = { ...study.settings, ...settings };

    await study.save();

    return res.json({
      success: true,
      study: study
    });
  } catch (err) {
    console.error('Update study error:', err);
    return res.status(500).json({ error: 'Failed to update study', details: err.message });
  }
});

// ADD HIGHLIGHT
router.post('/:id/highlights', verifyToken, async (req, res) => {
  try {
    const { text, color, start, end } = req.body;

    const study = await Study.findById(req.params.id);
    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    const highlight = {
      text: text,
      color: color || 'yellow',
      userId: req.userId,
      timestamp: new Date(),
      start: start,
      end: end
    };

    study.highlights.push(highlight);
    await study.save();

    return res.json({
      success: true,
      highlight: highlight
    });
  } catch (err) {
    console.error('Add highlight error:', err);
    return res.status(500).json({ error: 'Failed to add highlight', details: err.message });
  }
});

// DELETE STUDY (Teachers only)
router.delete('/:id', verifyToken, requireTeacher, async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);
    
    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    if (study.creatorId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only creator can delete study' });
    }

    await Study.deleteOne({ _id: req.params.id });

    // Remove from user
    const user = await User.findById(req.userId);
    user.createdStudies = user.createdStudies.filter(s => s.toString() !== req.params.id);
    await user.save();

    return res.json({
      success: true,
      message: 'Study deleted'
    });
  } catch (err) {
    console.error('Delete study error:', err);
    return res.status(500).json({ error: 'Failed to delete study', details: err.message });
  }
});

module.exports = router;