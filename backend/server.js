// Import libraries
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

require('dotenv').config();

// Create Express app
const app = express();

// Create HTTP server (needed for WebSockets)
const server = http.createServer(app);

// Set up Socket.IO with CORS (so frontend can connect)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});

const validateHighlight = (data) => {
    if (!data.studyId || typeof data.studyId !== 'string') throw new Error('Invalid studyId');
    if (!data.text || data.text.length > 500) throw new Error('Invalid text');
    if (!['yellow', 'green', 'blue', 'red'].includes(data.color)) throw new Error('Invalid color');
  };

// Middleware
app.use(cors());
app.use(express.json());


// backend/server.js
const { verifyToken } = require('./middleware/auth');
const { validateHighlight } = require('./validators/highlight');


io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication failed'));
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = decoded.userId;
    socket.data.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});
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
    const { error, value } = validateHighlight(data);
    
    if (error) {
      return socket.emit('error', { 
        message: 'Invalid highlight data',
        details: error.details 
      });
    }
    
    // Process valid data
    io.to(`study-${value.studyId}`).emit('highlight-updated', value);
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

app.use(errorHandler);
