// AmbientSoundPanel.jsx — Web Audio API ambient sounds (lofi, rain, cafe, whitenoise)
import React, { useState, useRef, useEffect } from 'react';

const SOUNDS = [
  { id: 'lofi',       label: 'Lo-Fi',       icon: '🎵', freq: 220,  type: 'sine',     detune: 0   },
  { id: 'rain',       label: 'Rain',        icon: '🌧️', freq: 80,   type: 'sawtooth', detune: 200 },
  { id: 'cafe',       label: 'Café',        icon: '☕', freq: 440,  type: 'sine',     detune: 700 },
  { id: 'whitenoise', label: 'Focus',       icon: '🌊', freq: null, type: 'noise',    detune: 0   },
];

const useAmbient = () => {
  const ctxRef = useRef(null);
  const nodesRef = useRef({});

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  };

  const play = (sound, volume) => {
    stop(sound.id);
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.08, ctx.currentTime);
    gainNode.connect(ctx.destination);

    let src;
    if (sound.type === 'noise') {
      const bufLen = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
    } else {
      src = ctx.createOscillator();
      src.type = sound.type;
      src.frequency.setValueAtTime(sound.freq, ctx.currentTime);
      src.detune.setValueAtTime(sound.detune, ctx.currentTime);
    }
    src.connect(gainNode);
    src.start();
    nodesRef.current[sound.id] = { src, gain: gainNode };
  };

  const stop = (id) => {
    const node = nodesRef.current[id];
    if (node) {
      try { node.src.stop(); } catch (_) {}
      node.gain.disconnect();
      delete nodesRef.current[id];
    }
  };

  const setVolume = (id, vol) => {
    const node = nodesRef.current[id];
    if (node) node.gain.gain.setTargetAtTime(vol * 0.08, getCtx().currentTime, 0.1);
  };

  useEffect(() => () => Object.keys(nodesRef.current).forEach(stop), []);
  return { play, stop, setVolume };
};

const AmbientSoundPanel = ({ onClose }) => {
  const [active, setActive] = useState({});
  const [volumes, setVolumes] = useState(() => Object.fromEntries(SOUNDS.map(s => [s.id, 0.6])));
  const { play, stop, setVolume } = useAmbient();

  const toggle = (sound) => {
    if (active[sound.id]) {
      stop(sound.id);
      setActive((a) => { const n = { ...a }; delete n[sound.id]; return n; });
    } else {
      play(sound, volumes[sound.id]);
      setActive((a) => ({ ...a, [sound.id]: true }));
    }
  };

  const changeVol = (sound, vol) => {
    setVolumes((v) => ({ ...v, [sound.id]: vol }));
    if (active[sound.id]) setVolume(sound.id, vol);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-20" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-5 w-80 border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-800">Ambient Sounds</h3>
            <p className="text-xs text-gray-400">Mix sounds for your focus session</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="space-y-3">
          {SOUNDS.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <button
                onClick={() => toggle(s)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all flex-shrink-0
                  ${active[s.id] ? 'bg-indigo-100 ring-2 ring-indigo-400 ring-offset-1' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {s.icon}
              </button>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{s.label}</span>
                  {active[s.id] && <span className="text-[10px] text-indigo-500 font-semibold">PLAYING</span>}
                </div>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={volumes[s.id]}
                  onChange={(e) => changeVol(s, parseFloat(e.target.value))}
                  disabled={!active[s.id]}
                  className="w-full h-1.5 accent-indigo-500 disabled:opacity-30"
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-4">Sounds only play for you locally</p>
      </div>
    </div>
  );
};

export default AmbientSoundPanel;
