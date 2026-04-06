// src/app.js
// SRP: Express app factory — middleware & routes only, no server lifecycle.
// Separating app from server allows easy testing (import app without binding a port).

const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const userRoutes = require('./routes/userRoutes');

const createApp = () => {
  const app = express();

  // ─── Middleware ─────────────────────────────────────────────────────────
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(express.json());

  // ─── Routes ─────────────────────────────────────────────────────────────
  app.use('/api/users', userRoutes);

  // Health check — useful for deployment & Docker healthchecks
  app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  // 404 fallback
  app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

  return app;
};

module.exports = createApp;
