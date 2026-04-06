// src/services/api.js
// DRY: All fetch() calls go through this module — base URL in one place.
// SRP: Only responsible for HTTP communication.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const fetchJSON = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
};

/**
 * Register or retrieve a user by username.
 * @param {string} username
 * @returns {Promise<{ userId: string, username: string, avatarColor: string, position: {x,y} }>}
 */
export const registerUser = (username) =>
  fetchJSON('/users/register', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
