const path = require('path');
const dotenv = require('dotenv');

// Load environment variables FIRST — before any other module reads process.env
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
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
app.listen(PORT, async () => {
  await connectDb();
  console.log(`Modular MVC server is running on port ${PORT}`);
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
