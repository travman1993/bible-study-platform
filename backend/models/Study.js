// backend/models/Study.js - FIXED VERSION
const mongoose = require('mongoose');

const studySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  
  creatorId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  
  joinCode: { 
    type: String, 
    unique: true,
    sparse: true
  },
  
  // Bible content
  passage: { 
    type: String,
    default: ''
  },
  
  bibleVersion: {
    type: String,
    default: 'ESV',
    enum: ['KJV', 'ESV', 'NIV', 'NASB']
  },
  
  // Study info
  topic: {
    type: String,
    default: ''
  },
  
  description: {
    type: String,
    default: ''
  },
  
  group: {
    type: String,
    default: 'General'
  },
  
  // Timing
  startTime: { 
    type: Date,
    default: Date.now
  },
  
  endTime: {
    type: Date
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['scheduled', 'active', 'completed', 'cancelled'], 
    default: 'scheduled'
  },
  
  // Participants
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['teacher', 'participant'],
      default: 'participant'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    name: String,
    email: String
  }],
  
  // Highlights
  highlights: [{
    text: String,
    color: {
      type: String,
      default: 'yellow',
      enum: ['yellow', 'green', 'blue', 'pink', 'purple']
    },
    userId: mongoose.Schema.Types.ObjectId,
    timestamp: {
      type: Date,
      default: Date.now
    },
    start: Number,
    end: Number
  }],
  
  // Notes
  notes: [{
    userId: mongoose.Schema.Types.ObjectId,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Settings
  settings: {
    maxParticipants: {
      type: Number,
      default: 50
    },
    allowParticipantAudio: {
      type: Boolean,
      default: true
    },
    recordSession: {
      type: Boolean,
      default: true
    },
    allowChat: {
      type: Boolean,
      default: true
    }
  },
  
  // Recording
  recordingUrl: String,
  recordingStatus: {
    type: String,
    enum: ['not-started', 'recording', 'completed', 'failed'],
    default: 'not-started'
  },
  
  // Metadata
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
});

// Middleware to update timestamps
studySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for performance
studySchema.index({ creatorId: 1, createdAt: -1 });
studySchema.index({ joinCode: 1 });
studySchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Study', studySchema);