require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const authRoutes = require('./auth/authRoutes');
const logRoutes = require('./logs/logRoutes');
const analyticsRoutes = require('./analytics/analyticsRoutes');
const alertRoutes = require('./alerts/alertRoutes');
const toolsRoutes = require('./tools/jwtRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/tools', toolsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.io – live log feed
io.on('connection', (socket) => {
  console.log('[Socket.io] Client connected:', socket.id);
  socket.on('disconnect', () => console.log('[Socket.io] Client disconnected:', socket.id));
});

const { MongoMemoryServer } = require('mongodb-memory-server');

// MongoDB connection
async function startServer() {
  let mongoUri = process.env.MONGO_URI;
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('[MongoDB] Connected to AuthSentinel database (Local/Remote)');
  } catch(e) {
    console.log('[MongoDB] Local connect failed, falling back to Memory Server...');
    const mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('[MongoDB] Connected to IN-MEMORY Database for demonstration!');
    console.log('[MongoDB] Running seed function on new memory database...');
    try {
      const seedDb = require('../seed_func');
      await seedDb();
    } catch(err) {
      console.log('[Seed] Error seeding memory db:', err.message);
    }
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));
}

startServer();
