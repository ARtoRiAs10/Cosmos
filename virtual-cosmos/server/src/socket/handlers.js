// src/socket/handlers.js
// SRP: Each handler function handles exactly one socket event.
// OCP: New events can be added without modifying existing handlers.
// DRY: Proximity logic delegates to utils/proximity.js; session to sessionStore.

const sessionStore = require('../services/sessionStore');
const User = require('../models/User');
const Message = require('../models/Message');
const { isWithinProximity, buildRoomId } = require('../utils/proximity');
const config = require('../config/env');

// ─── Helper ────────────────────────────────────────────────────────────────

/**
 * Broadcast updated player list to ALL connected clients.
 * Called after any position/connection change.
 */
const broadcastPlayers = (io) => {
  io.emit('players:update', sessionStore.all());
};

/**
 * Evaluate proximity between the mover and every other online user.
 * Emits connect/disconnect room events as needed.
 * KISS: Linear scan is fine for small virtual spaces (<100 users).
 */
const evaluateProximity = (io, socket, movedSession) => {
  const others = sessionStore.all().filter((s) => s.userId !== movedSession.userId);

  for (const other of others) {
    const roomId = buildRoomId(movedSession.userId, other.userId);
    const inRange = isWithinProximity(
      movedSession.position,
      other.position,
      config.proximityRadius
    );

    if (inRange) {
      // Tell both sockets to join the proximity room
      socket.join(roomId);
      const otherSocket = io.sockets.sockets.get(other.socketId);
      if (otherSocket) otherSocket.join(roomId);

      // Notify both clients a chat connection formed
      io.to(roomId).emit('proximity:connected', {
        roomId,
        users: [
          { userId: movedSession.userId, username: movedSession.username },
          { userId: other.userId, username: other.username },
        ],
      });
    } else {
      // Leave the room if they drifted apart
      socket.leave(roomId);
      const otherSocket = io.sockets.sockets.get(other.socketId);
      if (otherSocket) otherSocket.leave(roomId);

      io.to(socket.id).emit('proximity:disconnected', { roomId });
      if (otherSocket) otherSocket.emit('proximity:disconnected', { roomId });
    }
  }
};

// ─── Event Handlers ────────────────────────────────────────────────────────

/**
 * Handle: user joins the cosmos
 * Payload: { userId, username, avatarColor, position }
 */
const onJoin = async (io, socket, payload) => {
  try {
    const { userId, username, avatarColor, position } = payload;

    // Upsert into MongoDB for persistence
    await User.findByIdAndUpdate(
      userId,
      { socketId: socket.id, isOnline: true, position, avatarColor },
      { new: true, upsert: false }
    );

    // Register in-memory session
    sessionStore.set(userId, {
      userId,
      socketId: socket.id,
      username,
      avatarColor,
      position,
    });

    // Send the joining user a snapshot of everyone currently online
    socket.emit('players:snapshot', sessionStore.all());

    // Tell everyone else a new user arrived
    broadcastPlayers(io);

    console.log(`[Socket] ${username} joined (${socket.id})`);
  } catch (err) {
    console.error('[onJoin] Error:', err.message);
    socket.emit('error', { message: 'Failed to join cosmos.' });
  }
};

/**
 * Handle: position update from a moving user
 * Payload: { userId, position: { x, y } }
 * Throttled client-side to ~20 updates/sec
 */
const onMove = (io, socket, payload) => {
  const { userId, position } = payload;
  const session = sessionStore.get(userId);
  if (!session) return;

  // Clamp to canvas bounds (800x600) to prevent cheating / drift
  const clamped = {
    x: Math.max(20, Math.min(position.x, 1580)),
    y: Math.max(20, Math.min(position.y, 980)),
  };

  sessionStore.updatePosition(userId, clamped);
  session.position = clamped;

  // Broadcast new position to all peers
  broadcastPlayers(io);

  // Re-evaluate who is now in/out of proximity
  evaluateProximity(io, socket, session);
};

/**
 * Handle: chat message sent inside a proximity room
 * Payload: { roomId, senderId, senderName, text }
 */
const onChatMessage = async (io, socket, payload) => {
  try {
    const { roomId, senderId, senderName, text } = payload;

    if (!text || text.trim().length === 0) return;

    // Persist message to MongoDB
    const msg = await Message.create({
      roomId,
      senderId,
      senderName,
      text: text.trim(),
    });

    // Broadcast to all users in this proximity room
    io.to(roomId).emit('chat:message', {
      _id: msg._id,
      roomId,
      senderId,
      senderName,
      text: msg.text,
      createdAt: msg.createdAt,
    });
  } catch (err) {
    console.error('[onChatMessage] Error:', err.message);
  }
};

/**
 * Handle: fetch recent chat history when proximity room opens
 * Payload: { roomId }
 */
const onChatHistory = async (socket, payload) => {
  try {
    const { roomId } = payload;
    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    socket.emit('chat:history', { roomId, messages: messages.reverse() });
  } catch (err) {
    console.error('[onChatHistory] Error:', err.message);
  }
};

/**
 * Handle: user disconnects (tab close, network drop, etc.)
 */
const onDisconnect = async (io, socket) => {
  const session = sessionStore.findBySocketId(socket.id);
  if (!session) return;

  sessionStore.remove(session.userId);

  // Persist offline state to MongoDB
  await User.findByIdAndUpdate(session.userId, {
    isOnline: false,
    socketId: null,
    position: session.position,
  }).catch(() => {}); // non-critical, swallow error

  // Notify remaining clients
  broadcastPlayers(io);

  // Notify anyone who was in proximity with this user
  io.emit('proximity:userLeft', { userId: session.userId });

  console.log(`[Socket] ${session.username} disconnected`);
};

// ─── Register All Handlers ─────────────────────────────────────────────────

/**
 * Attach all event listeners to a socket.
 * OCP: Add new handlers here without changing the socket init code.
 */
const registerHandlers = (io, socket) => {
  socket.on('user:join', (payload) => onJoin(io, socket, payload));
  socket.on('user:move', (payload) => onMove(io, socket, payload));
  socket.on('chat:send', (payload) => onChatMessage(io, socket, payload));
  socket.on('chat:history', (payload) => onChatHistory(socket, payload));
  socket.on('disconnect', () => onDisconnect(io, socket));
};

module.exports = { registerHandlers };
