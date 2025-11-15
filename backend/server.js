// Import libraries
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();

// Create HTTP server (needed for WebSockets)
const server = http.createServer(app);

// Set up Socket.IO with CORS (so frontend can connect)
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// BASIC ROUTES (Test to make sure it's working)
// ============================================

app.get('/', (req, res) => {
  res.json({ message: 'Bible Study Platform Backend is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server is healthy' });
});

// ============================================
// SOCKET.IO - Real-time events
// ============================================

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a teacher joins
  socket.on('join-study', (studyId) => {
    socket.join(`study-${studyId}`);
    console.log(`User ${socket.id} joined study ${studyId}`);
  });

  // When teacher highlights text
  socket.on('highlight-text', (data) => {
    // Broadcast to everyone in this study
    io.to(`study-${data.studyId}`).emit('highlight-updated', data);
    console.log(`Highlight sent to study-${data.studyId}:`, data);
  });

  // When someone disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Socket.IO ready for connections`);
});