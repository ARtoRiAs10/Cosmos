// src/config/env.js
// SRP: This module is solely responsible for loading & exposing env config.
// DRY: All env vars are accessed from ONE place — no scattered process.env calls.
require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/virtual-cosmos',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  // Proximity radius in canvas units — configurable without touching logic
  proximityRadius: parseInt(process.env.PROXIMITY_RADIUS, 10) || 150,
};

module.exports = config;
