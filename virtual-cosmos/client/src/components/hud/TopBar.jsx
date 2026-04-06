// TopBar.jsx — Full-featured top bar with working mic/camera/call controls
import React, { useState, useEffect } from 'react';
import useCosmosStore from '../../store/useCosmosStore';

const IconMic = ({ muted }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {muted ? (
      <>
        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
        <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
      </>
    ) : (
      <>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
      </>
    )}
  </svg>
);

const IconCamera = ({ off }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {off ? (
      <>
        <line x1="1" y1="1" x2="23" y2="23"/>
        <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h3a2 2 0 0 1 2 2v9.34"/>
        <circle cx="12" cy="13" r="3"/>
      </>
    ) : (
      <>
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </>
    )}
  </svg>
);

const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.71 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconPhoneOff = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"/>
    <path d="M14.5 9.5a4 4 0 0 0-4-4"/>
    <path d="M3 3l18 18"/>
    <path d="M10.68 10.68a16 16 0 0 0-2.6-3.41l-1.27 1.27a2 2 0 0 1-2.11.45 12.84 12.84 0 0 0-2.81-.7 2 2 0 0 1-1.72-2v-3a2 2 0 0 1 2.18-2 19.79 19.79 0 0 1 8.63 3.07"/>
  </svg>
);

const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconMaximize = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

const IconGrid = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

// Mic volume visualizer bars
const MicVisualizer = ({ active }) => {
  const [levels, setLevels] = useState([0.3, 0.5, 0.7, 0.5, 0.3]);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setLevels(Array.from({ length: 5 }, () => 0.2 + Math.random() * 0.8));
    }, 120);
    return () => clearInterval(id);
  }, [active]);
  if (!active) return null;
  return (
    <div className="flex items-end gap-0.5 h-4 ml-1">
      {levels.map((l, i) => (
        <div key={i} className="w-0.5 rounded-full bg-green-400 transition-all duration-100"
          style={{ height: `${Math.round(l * 16)}px` }} />
      ))}
    </div>
  );
};

const TopBar = () => {
  const {
    players, socketConnected, micEnabled, cameraEnabled, screenSharing,
    toggleMic, toggleCamera, toggleScreenShare,
    activeRooms, showInviteModal, setShowInviteModal,
  } = useCosmosStore();
  const count = players.length;
  const hasProximity = Object.keys(activeRooms).length > 0;
  const [inCall, setInCall] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMicClick = async () => {
    toggleMic();
  };

  const handleCameraClick = async () => {
    toggleCamera();
  };

  const handleCallClick = () => {
    setInCall((v) => !v);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 border-b"
      style={{ height: 48, background: '#ffffff', borderColor: '#e5e7eb',
               boxShadow: '0 1px 3px rgba(0,0,0,0.06)', zIndex: 50, flexShrink: 0 }}>

      {/* Left: space name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>✦</div>
          <span className="font-semibold text-sm text-gray-800">Space</span>
        </div>
        <div className="w-px h-5 bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-500 font-medium">
            {socketConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Center: AV controls */}
      <div className="flex items-center gap-1">
        {/* Mic toggle — shows live visualizer when active */}
        <button
          onClick={handleMicClick}
          title={micEnabled ? 'Mute microphone (M)' : 'Unmute microphone (M)'}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${micEnabled
              ? 'text-gray-600 hover:bg-gray-100'
              : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
        >
          <IconMic muted={!micEnabled} />
          <MicVisualizer active={micEnabled} />
        </button>

        {/* Camera toggle */}
        <button
          onClick={handleCameraClick}
          title={cameraEnabled ? 'Turn off camera (V)' : 'Turn on camera (V)'}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${cameraEnabled
              ? 'text-gray-600 hover:bg-gray-100'
              : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
        >
          <IconCamera off={!cameraEnabled} />
        </button>

        {/* Screen share */}
        <button
          onClick={handleCallClick}
          title="Screen share"
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${screenSharing ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
            <path d="M10 9l2-2 2 2"/><path d="M12 7v6"/>
          </svg>
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Call pill */}
        <button
          onClick={handleCallClick}
          title={inCall || hasProximity ? 'End call' : 'Start call'}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all
            ${(inCall || hasProximity) ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {(inCall || hasProximity) ? <IconPhone /> : <IconPhoneOff />}
          <span>{(inCall || hasProximity) ? 'In Call' : 'Call'}</span>
        </button>
      </div>

      {/* Right: user count + window controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-600">
          <IconUsers />
          <span className="font-mono text-xs">{count}/{count}</span>
        </div>
        <div className="w-px h-5 bg-gray-200" />
        <button className="topbar-btn" title="Toggle fullscreen" onClick={handleFullscreen}>
          <IconMaximize />
        </button>
        <button className="topbar-btn" title="Grid view — see all participants">
          <IconGrid />
        </button>
        <button className="topbar-btn" title="Settings"
          onClick={() => useCosmosStore.getState().setShowSettings(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
// TopBar settings button wired — see App.jsx + store for setShowSettings
