// src/models/Message.js
// SRP: Describes chat message persistence.
// Messages are tied to a "room" which is derived from proximity logic.
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // roomId = sorted userId pair, e.g. "user1_user2" — deterministic, DRY
    roomId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
