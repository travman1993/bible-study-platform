// backend/routes/studies.js
const express = require('express');
const Study = require('../models/Study');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create study
router.post('/', verifyToken, async (req, res) => {
  try {
    const study = new Study({
      title: req.body.title,
      teacherId: req.userId,
      joinCode: generateJoinCode()
    });
    await study.save();
    res.json(study);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get study
router.get('/:id', async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);
    res.json(study);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add highlight
router.post('/:id/highlights', verifyToken, async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);
    study.highlights.push({
      ...req.body,
      userId: req.userId,
      timestamp: new Date()
    });
    await study.save();
    res.json(study);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const generateJoinCode = () => Math.random().toString(36).substr(2, 9).toUpperCase();

module.exports = router;