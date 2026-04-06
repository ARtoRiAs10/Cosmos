// src/controllers/userController.js
// SRP: HTTP request/response handling ONLY. Business logic lives in models/services.
// KISS: Two endpoints — register user, get all users.

const User = require('../models/User');

/**
 * POST /api/users/register
 * Creates or retrieves a user by username.
 * Returns userId + avatarColor so the client can persist them in localStorage.
 */
const registerUser = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || username.trim().length < 2) {
      return res.status(400).json({ error: 'Username must be at least 2 characters.' });
    }

    // Upsert by username — same name gets same user record (KISS for demo purposes)
    let user = await User.findOne({ username: username.trim() });
    if (!user) {
      user = await User.create({ username: username.trim() });
    }

    return res.status(200).json({
      userId: user._id,
      username: user.username,
      avatarColor: user.avatarColor,
      position: user.position,
    });
  } catch (err) {
    console.error('[registerUser]', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * GET /api/users
 * Returns all users (for admin/debug purposes).
 */
const getUsers = async (_req, res) => {
  try {
    const users = await User.find({}, '-__v').lean();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { registerUser, getUsers };
