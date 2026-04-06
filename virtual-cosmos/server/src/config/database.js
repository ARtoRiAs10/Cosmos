// src/config/database.js
// SRP: Only handles database connection lifecycle.
const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`[DB] MongoDB connected: ${config.mongoUri}`);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
