// HUD.jsx — Enhanced floating overlay with keyboard shortcuts
import React, { useState, useEffect } from 'react';
import useCosmosStore from '../../store/useCosmosStore';

const Key = ({ k }) => (
  <kbd className="px-1.5 py-0.5 text-xs font-mono font-bold rounded"
    style={{ background: '#f3f4f6', border: '1px solid #d1d5db', color: '#374151', minWidth: 20, textAlign: 'center', display: 'inline-block' }}>
    {k}
  </kbd>
);

const HUD = () => {
  const [dismissed, setDismissed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { handRaised, toggleHand, micEnabled, toggleMic } = useCosmosStore();

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'm' || e.key === 'M') toggleMic();
      if (e.key === 'e' || e.key === 'E') toggleHand();
      if (e.key === '?') setShowShortcuts((v) => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleMic, toggleHand]);

  if (dismissed && !showShortcuts) return (
    <button onClick={() => setDismissed(false)}
      className="absolute bottom-4 left-4 z-40 text-xs text-gray-500 hover:text-gray-700 bg-white/70 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200">
      ? shortcuts
    </button>
  );

  return (
    <div className="absolute bottom-4 left-4 z-40 flex flex-col gap-2 pointer-events-none">
      {/* Movement hint */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm pointer-events-auto"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}>
        <div className="flex items-center gap-1">
          {['W','A','S','D'].map(k => <Key key={k} k={k} />)}
          <span className="text-gray-400 text-xs ml-1">move</span>
          <span className="mx-1 text-gray-300">·</span>
          <Key k="Shift" />
          <span className="text-gray-400 text-xs ml-1">dash</span>
          <span className="mx-1 text-gray-300">·</span>
          <Key k="H" />
          <span className="text-gray-400 text-xs ml-1">home</span>
        </div>
        <button onClick={() => setShowShortcuts((v) => !v)}
          className="ml-1 text-gray-400 hover:text-indigo-500 text-xs font-semibold px-1">
          ?
        </button>
        <button onClick={() => setDismissed(true)}
          className="text-gray-300 hover:text-gray-500 text-base leading-none">×</button>
      </div>

      {/* Shortcut cheatsheet */}
      {showShortcuts && (
        <div className="pointer-events-auto px-4 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 220 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700">Keyboard Shortcuts</span>
            <button onClick={() => setShowShortcuts(false)} className="text-gray-400 hover:text-gray-600 text-base">×</button>
          </div>
          {[
            [['W','A','S','D'], 'Move around'],
            [['Shift'], 'Dash / sprint'],
            [['H'], 'Teleport home'],
            [['M'], micEnabled ? 'Mute mic' : 'Unmute mic'],
            [['E'], handRaised ? 'Lower hand' : 'Raise hand'],
            [['?'], 'Toggle shortcuts'],
          ].map(([keys, label]) => (
            <div key={label} className="flex items-center justify-between py-1 gap-4">
              <div className="flex gap-1">{keys.map(k => <Key key={k} k={k} />)}</div>
              <span className="text-xs text-gray-500 text-right">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HUD;
