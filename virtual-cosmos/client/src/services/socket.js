// src/services/socket.js
// SRP: Owns the Socket.IO client connection lifecycle.
// Singleton: One socket instance for the whole app (DRY — no duplicate connections).
// Why Socket.IO over raw WebSocket?
//   Auto-reconnect, room management, and event namespacing out of the box (KISS).

import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

// Lazy singleton — created on first import, reused everywhere
const socket = io(SOCKET_URL, {
  autoConnect: false,       // We manually connect after user registration
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
