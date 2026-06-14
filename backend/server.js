const path = require('path');
const dotenv = require('dotenv');

// Load environment variables FIRST — before any other module reads process.env
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { connectDb } = require('./config/db');
const apiRouter = require('./routes/index');

const PORT = process.env.PORT || 8000;

// Set up express app
const app = express();

// Parse cookies and request bodies
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS
const corsOriginsEnv = process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000';
let origins = corsOriginsEnv.split(',').map(o => o.trim()).filter(Boolean);
if (origins.includes('*')) {
  origins = ['http://localhost:5173', 'http://localhost:3000'];
}

app.use(cors({
  origin: origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept']
}));

// Create HTTP Server wrapping Express app and mount Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: origins,
    credentials: true
  },
  pingInterval: 25000,
  pingTimeout: 60000
});

// ── Presence tracking (in-memory) ──
// Maps userId → Set<socketId> (supports multiple tabs/devices)
const onlineUsers = new Map();

function setUserOnline(userId, socketId) {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
}

function setUserOffline(userId, socketId) {
  if (onlineUsers.has(userId)) {
    onlineUsers.get(userId).delete(socketId);
    if (onlineUsers.get(userId).size === 0) {
      onlineUsers.delete(userId);
      return true; // user fully offline
    }
  }
  return false;
}

function isUserOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}

// Share helpers with controllers
app.set('onlineUsers', onlineUsers);
app.set('isUserOnline', isUserOnline);

// ── Socket.io connection events ──
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  let currentUserId = null;

  // Join user room + broadcast presence
  socket.on('join', (userId) => {
    if (!userId) return;
    currentUserId = userId;
    socket.join(userId);
    setUserOnline(userId, socket.id);
    console.log(`Socket ${socket.id} joined user room ${userId}`);

    // Broadcast online status to all connected sockets
    socket.broadcast.emit('user_online', { userId });

    // Send this user the current online users list
    const onlineList = Array.from(onlineUsers.keys());
    socket.emit('online_users_list', onlineList);
  });

  // ── Typing indicators ──
  socket.on('typing_start', ({ receiverId }) => {
    if (currentUserId && receiverId) {
      io.to(receiverId).emit('user_typing', { userId: currentUserId });
    }
  });

  socket.on('typing_stop', ({ receiverId }) => {
    if (currentUserId && receiverId) {
      io.to(receiverId).emit('user_stopped_typing', { userId: currentUserId });
    }
  });

  // ── Message delivery acknowledgment ──
  socket.on('message_delivered', async ({ messageId }) => {
    try {
      const Message = require('./models/Message');
      const msg = await Message.findOneAndUpdate(
        { id: messageId, status: 'sent' },
        { $set: { status: 'delivered' } },
        { new: true, projection: { _id: 0 } }
      );
      if (msg) {
        io.to(msg.sender_id).emit('message_status', {
          id: messageId,
          status: 'delivered'
        });
      }
    } catch (err) {
      console.error('message_delivered error:', err);
    }
  });

  // ── Read receipts ──
  socket.on('messages_read', async ({ senderId }) => {
    if (!currentUserId || !senderId) return;
    try {
      const Message = require('./models/Message');
      await Message.updateMany(
        {
          sender_id: senderId,
          receiver_id: currentUserId,
          status: { $in: ['sent', 'delivered'] }
        },
        { $set: { status: 'read', read: true } }
      );
      io.to(senderId).emit('messages_read_ack', {
        readerId: currentUserId,
        readAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('messages_read error:', err);
    }
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    if (currentUserId) {
      const fullyOffline = setUserOffline(currentUserId, socket.id);
      if (fullyOffline) {
        const lastSeen = new Date().toISOString();
        socket.broadcast.emit('user_offline', {
          userId: currentUserId,
          lastSeen
        });
      }
    }
  });
});

// Share io instance with routing controllers
app.set('io', io);

// Mount modular API routes under /api
app.use('/api', apiRouter);

// Root status check
app.get('/', (req, res) => {
  return res.status(200).json({
    status: "running",
    service: "Satnami Matrimony Backend API",
    version: "1.0.0"
  });
});

// Start server
server.listen(PORT, async () => {
  await connectDb();
  console.log(`Modular MVC server is running on port ${PORT} with Socket.io`);
});

// Graceful Shutdown
const gracefulShutdown = () => {
  if (mongoose.connection) {
    mongoose.connection.close().then(() => {
      console.log("Mongoose connection closed gracefully.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
