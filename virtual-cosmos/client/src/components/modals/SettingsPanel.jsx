// SettingsPanel.jsx — User preferences and avatar customization
import React, { useState } from 'react';
import useCosmosStore from '../../store/useCosmosStore';

const COLORS = ['#f87171','#fb923c','#fbbf24','#34d399','#38bdf8','#818cf8','#e879f9','#a78bfa','#06b6d4','#10b981'];
const SPEEDS = [{ label: 'Slow', v: 1.5 }, { label: 'Normal', v: 3 }, { label: 'Fast', v: 5 }, { label: 'Zoom', v: 8 }];

const SettingsPanel = ({ onClose }) => {
  const { currentUser, setCurrentUser } = useCosmosStore();
  const [color, setColor] = useState(currentUser?.avatarColor || '#6366f1');
  const [name, setName] = useState(currentUser?.username || '');
  const [speed, setSpeed] = useState(3);
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, avatarColor: color, username: name || currentUser.username });
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); }, 1500);
  };

  const initials = name.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header gradient */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)' }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800 text-lg">Settings</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>

          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ background: color, boxShadow: `0 4px 14px ${color}66` }}>
              {initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700">{name || 'Your Name'}</div>
              <div className="text-xs text-gray-400 mt-0.5">Avatar preview</div>
            </div>
          </div>

          {/* Display name */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Display Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={30}
              className="w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 outline-none transition-all"
              style={{ borderColor: '#e5e7eb', background: '#fafafa' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Avatar color */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Avatar Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex-shrink-0"
                  style={{ background: c, outline: c === color ? '2.5px solid #374151' : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>

          {/* Movement speed */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Movement Speed</label>
            <div className="flex gap-2">
              {SPEEDS.map(s => (
                <button key={s.v} onClick={() => setSpeed(s.v)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors
                    ${speed === s.v ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={save}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all
              ${saved ? 'bg-green-500 text-white' : 'text-white hover:opacity-90'}`}
            style={saved ? {} : { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
