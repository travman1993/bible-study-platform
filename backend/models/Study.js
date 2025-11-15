// backend/models/Study.js
const mongoose = require('mongoose');

const studySchema = new mongoose.Schema({
  title: { type: String, required: true },
  teacherId: { type: String, required: true },
  joinCode: { type: String, unique: true },
  passage: { type: String },
  highlights: [{
    text: String,
    color: String,
    userId: String,
    timestamp: Date,
    start: Number,
    end: Number
  }],
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
});

module.exports = mongoose.model('Study', studySchema);