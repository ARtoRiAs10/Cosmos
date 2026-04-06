// src/socket/index.js
// SRP: Creates & configures the Socket.IO server instance.
// OCP: Transport options, cors, etc. can be changed without touching handlers.

const { Server } = require('socket.io');
const config = require('../config/env');
const { registerHandlers } = require('./handlers');

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Prefer WebSocket, fall back to polling — KISS
    transports: ['websocket', 'polling'],
    pingTimeout: 10000,
    pingInterval: 5000,
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);
    registerHandlers(io, socket);
  });

  return io;
};

module.exports = initSocket;
