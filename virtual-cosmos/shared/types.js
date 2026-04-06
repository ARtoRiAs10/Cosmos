/**
 * shared/types.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Canonical data contracts shared between client and server.
 * In a TypeScript monorepo these would be .ts interfaces imported by both.
 * In this JS project they serve as living documentation. DRY principle:
 * shapes are defined once here, referenced in comments across both sides.
 * ──────────────────────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} UserSession
 * @property {string} userId         - MongoDB ObjectId string
 * @property {string} socketId        - Socket.IO socket id (ephemeral)
 * @property {string} username        - Display name
 * @property {string} avatarColor     - Hex color, e.g. "#6366f1"
 * @property {{ x: number, y: number }} position - Canvas coordinates
 */

/**
 * @typedef {Object} ProximityRoom
 * @property {string} roomId          - Deterministic: sorted(userId1, userId2).join('_')
 * @property {{ userId: string, username: string }[]} users
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} _id             - MongoDB ObjectId string
 * @property {string} roomId
 * @property {string} senderId        - MongoDB ObjectId string
 * @property {string} senderName
 * @property {string} text
 * @property {string} createdAt       - ISO 8601 timestamp
 */

// ─── Socket Event Reference ────────────────────────────────────────────────
//
// CLIENT → SERVER
//   user:join      { userId, username, avatarColor, position }
//   user:move      { userId, position: {x, y} }
//   chat:send      { roomId, senderId, senderName, text }
//   chat:history   { roomId }
//
// SERVER → CLIENT
//   players:snapshot   UserSession[]      (sent once on join to new user)
//   players:update     UserSession[]      (broadcast after any move/join/leave)
//   proximity:connected  { roomId, users: [{userId, username}] }
//   proximity:disconnected { roomId }
//   proximity:userLeft  { userId }
//   chat:message       ChatMessage
//   chat:history       { roomId, messages: ChatMessage[] }
//
// ──────────────────────────────────────────────────────────────────────────────
