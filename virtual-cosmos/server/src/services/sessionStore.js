// src/services/sessionStore.js
// SRP: Manages in-memory live-user state (positions, socketId map).
// Why in-memory vs MongoDB for positions?
//   Position updates fire ~10x/sec per user. Writing each to DB would
//   flood MongoDB. We keep live state in RAM and persist only on disconnect.
// OCP: Internal data structure can change without touching socket handlers.

const store = new Map(); // key: userId (string), value: UserSession

/**
 * @typedef {{ userId: string, socketId: string, username: string,
 *             avatarColor: string, position: {x:number,y:number} }} UserSession
 */

const sessionStore = {
  /** Add or overwrite a user session */
  set(userId, session) {
    store.set(userId, session);
  },

  /** Retrieve a session by userId */
  get(userId) {
    return store.get(userId) || null;
  },

  /** Remove a session (on disconnect) */
  remove(userId) {
    store.delete(userId);
  },

  /** All active sessions as an array */
  all() {
    return [...store.values()];
  },

  /** Find session by socketId — used on disconnect event */
  findBySocketId(socketId) {
    for (const session of store.values()) {
      if (session.socketId === socketId) return session;
    }
    return null;
  },

  /** Update just the position of an existing session */
  updatePosition(userId, position) {
    const session = store.get(userId);
    if (session) {
      session.position = position;
      store.set(userId, session);
    }
  },

  count() {
    return store.size;
  },
};

module.exports = sessionStore;
