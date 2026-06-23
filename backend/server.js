import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('TechVani DB Connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io Real-Time Context Chat & Translation Streaming
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-document-room', (documentId) => {
    socket.join(`doc_${documentId}`);
    console.log(`Socket ${socket.id} joined room for document: ${documentId}`);
  });

  socket.on('chat-message', async (data) => {
    const { documentId, message, userId } = data;
    // In a full production cycle, this triggers the aiService contextual pipeline
    const botResponse = `Processed context query for "${message.substring(0, 20)}..." in document ${documentId}.`;
    
    io.to(`doc_${documentId}`).emit('receive-chat-message', {
      sender: 'TechVani AI',
      text: botResponse,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('translation-progress', (data) => {
    const { documentId, progress, stage } = data;
    io.to(`doc_${documentId}`).emit('update-progress', { progress, stage });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`TechVani Server running on port ${PORT}`);
});