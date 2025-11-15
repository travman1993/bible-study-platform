// backend/routes/verses.js
const express = require('express');
const bibleService = require('../services/bibleService');

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });
    
    const passages = await bibleService.searchPassage(q);
    res.json(passages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:reference', async (req, res) => {
  try {
    const passage = await bibleService.getPassage(req.params.reference);
    res.json(passage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;