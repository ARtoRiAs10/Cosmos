// LoginScreen.jsx — Clean office-tool login matching cosmos.video aesthetic
// Light background, centered card, simple username entry
import React, { useState } from 'react';
import { registerUser } from '../../services/api';
import socket from '../../services/socket';
import useCosmosStore from '../../store/useCosmosStore';

// Preset avatar colors (not too dark, not too light)
const COLORS = ['#f87171','#fb923c','#fbbf24','#34d399','#38bdf8','#818cf8','#e879f9','#a78bfa'];
const randColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const LoginScreen = () => {
  const [username, setUsername]   = useState('');
  const [color, setColor]         = useState(randColor());
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const { setCurrentUser }        = useCosmosStore();

  const handleEnter = async (e) => {
    e.preventDefault();
    if (!username.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const user = await registerUser(username.trim());
      // Override avatar color with local pick
      user.avatarColor = color;
      setCurrentUser(user);
      socket.connect();
      socket.once('connect', () => {
        socket.emit('user:join', {
          userId:      user.userId,
          username:    user.username,
          avatarColor: user.avatarColor,
          position:    user.position,
        });
      });
    } catch (err) {
      setError(err.message || 'Cannot connect. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const initials = username.slice(0, 2).toUpperCase() || '?';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: '#f0ebe1' }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(180,140,90,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,140,90,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center w-full max-w-sm mx-4 float"
        style={{
          background: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Top color band */}
        <div
          className="w-full h-2"
          style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)' }}
        />

        <div className="px-8 pt-8 pb-10 w-full">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              ✦
            </div>
            <h1 className="text-xl font-bold text-gray-800">Virtual Cosmos</h1>
            <p className="text-sm text-gray-400 mt-1 text-center">
              Move close to others to start chatting
            </p>
          </div>

          <form onSubmit={handleEnter} className="flex flex-col gap-5">
            {/* Avatar preview + color picker */}
            <div className="flex items-center gap-4">
              {/* Live avatar preview */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                style={{ background: color, boxShadow: `0 4px 14px ${color}55` }}
              >
                {initials}
              </div>

              {/* Color swatches */}
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: c,
                      outline: c === color ? `2.5px solid #374151` : 'none',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Username input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Display name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                maxLength={30}
                minLength={2}
                autoFocus
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800 placeholder-gray-400 outline-none transition-colors"
                style={{
                  borderColor: username ? '#6366f1' : '#e5e7eb',
                  background: '#fafafa',
                  boxShadow: username ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                }}
              />
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!username.trim() || loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{
                background: (!username.trim() || loading)
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: (!username.trim() || loading)
                  ? 'none'
                  : '0 4px 14px rgba(99,102,241,0.35)',
              }}
            >
              {loading ? 'Entering...' : 'Enter the Cosmos →'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Open multiple tabs to test proximity chat
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
