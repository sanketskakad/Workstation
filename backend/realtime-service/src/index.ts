import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 4004;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

const pubSubClient = createClient({ url: REDIS_URL });

pubSubClient.connect().then(() => {
  console.log('Realtime Service connected to Redis PubSub');

  // Subscribe to task events
  pubSubClient.subscribe('task.created', (message) => {
    io.emit('message', JSON.stringify({ type: 'task.created', payload: JSON.parse(message) }));
  });
  pubSubClient.subscribe('task.updated', (message) => {
    io.emit('message', JSON.stringify({ type: 'task.updated', payload: JSON.parse(message) }));
  });
  pubSubClient.subscribe('task.deleted', (message) => {
    io.emit('message', JSON.stringify({ type: 'task.deleted', payload: JSON.parse(message) }));
  });
}).catch(console.error);

io.use((socket, next) => {
  const token = socket.handshake.query?.token as string;
  if (!token) return next(new Error('Authentication error'));
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Example room joining
  socket.on('join_project', (projectId) => {
    socket.join(`project:${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.get('/health', (req, res) => res.json({ status: 'Realtime Service running' }));

server.listen(PORT, () => {
  console.log(`Realtime service running on port ${PORT}`);
});
