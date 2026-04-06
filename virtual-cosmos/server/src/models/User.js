// src/models/User.js
// SRP: Describes the User data shape & persistence only.
// Using Mongoose for schema validation at the DB layer (fail-fast principle).
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    // Avatar color is stored so it persists across reconnects
    avatarColor: {
      type: String,
      default: () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`,
    },
    // Last known position — persisted for session recovery
    position: {
      x: { type: Number, default: 400 },
      y: { type: Number, default: 300 },
    },
    // socketId is ephemeral — updated on each connection
    socketId: { type: String, default: null },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
