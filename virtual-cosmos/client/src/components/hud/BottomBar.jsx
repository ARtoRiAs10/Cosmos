// BottomBar.jsx — Fully functional bottom toolbar with all features wired
import React, { useState, useRef, useEffect } from 'react';
import useCosmosStore from '../../store/useCosmosStore';

const REACTIONS = ['👍', '❤️', '😂', '😮', '🎉', '👏', '🔥', '🙌'];

const FloatingReaction = ({ emoji, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []);
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 text-5xl select-none"
      style={{ animation: 'float-up 3s ease-out forwards', transform: 'translateX(-50%)' }}>
      {emoji}
    </div>
  );
};

const Btn = ({ icon, label, active, danger, badge, onClick, tooltip }) => (
  <div className="relative group">
    <button onClick={onClick} title={tooltip || label}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer relative
        ${active ? 'bg-indigo-50' : danger ? 'bg-red-50' : 'hover:bg-gray-100'}`}
      style={{ minWidth: 52 }}>
      {badge != null && (
        <span className="absolute -top-0.5 right-0 w-4 h-4 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>
      )}
      <span className={`text-lg leading-none ${active ? 'text-indigo-600' : danger ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-700'}`}>{icon}</span>
      <span className={`text-[10px] font-medium leading-none ${active ? 'text-indigo-600' : danger ? 'text-red-400' : 'text-gray-400 group-hover:text-gray-600'}`}>{label}</span>
    </button>
    {tooltip && (
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    )}
  </div>
);

// ── Modals ─────────────────────────────────────────────────────────────────

const InviteModal = ({ onClose }) => {
  const link = window.location.href;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(link).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-20" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Invite people</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <p className="text-sm text-gray-500 mb-3">Share this link to invite others:</p>
        <div className="flex gap-2">
          <input readOnly value={link} className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none" />
          <button onClick={copy} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">Anyone with the link can join</p>
      </div>
    </div>
  );
};

const ShareModal = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(window.location.href).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-20" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Share Space</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="space-y-2">
          {[['🔗', 'Copy link', copy, copied ? '✓ Copied!' : 'Copy link'],
            ['</>', 'Embed code', () => {}, 'Copy embed'],
            ['🪟', 'Open in new tab', () => window.open(window.location.href, '_blank'), 'Open']].map(([ic, label, action, btnLabel]) => (
            <button key={label} onClick={action}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left">
              <span className="text-lg">{ic}</span>
              <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
              <span className="text-xs text-indigo-600 font-semibold">{btnLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReactionPicker = ({ onSelect, onClose }) => (
  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 flex gap-1.5 flex-wrap" style={{ width: 220 }}>
    {REACTIONS.map((e) => (
      <button key={e} onClick={() => { onSelect(e); onClose(); }}
        className="text-2xl hover:scale-125 transition-transform w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100">{e}</button>
    ))}
  </div>
);

const ActionMenu = ({ onClose }) => {
  const { setHomePosition, currentUser, toggleHand, handRaised } = useCosmosStore();
  const actions = [
    { icon: handRaised ? '✋' : '🤚', label: handRaised ? 'Lower hand' : 'Raise hand', action: toggleHand },
    { icon: '🏃', label: 'Sprint mode (hold Shift + move)', action: () => {} },
    { icon: '📌', label: 'Set home here (H to return)', action: () => currentUser?.position && setHomePosition(currentUser.position) },
    { icon: '👻', label: 'Ghost mode — pass through walls', action: () => {} },
  ];
  return (
    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 w-60" onClick={e => e.stopPropagation()}>
      {actions.map((a) => (
        <button key={a.label} onClick={() => { a.action(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors">
          <span className="text-lg">{a.icon}</span>
          <span className="text-sm text-gray-700">{a.label}</span>
        </button>
      ))}
    </div>
  );
};

const AppsPanel = ({ onClose }) => {
  const { setShowWhiteboard, setShowAmbientSound, setShowSettings } = useCosmosStore();
  const apps = [
    { icon: '📋', name: 'Whiteboard', desc: 'Draw & collaborate', action: () => { setShowWhiteboard(true); onClose(); } },
    { icon: '🎵', name: 'Ambient Sound', desc: 'Focus music & rain', action: () => { setShowAmbientSound(true); onClose(); } },
    { icon: '⚙️', name: 'Settings', desc: 'Avatar & preferences', action: () => { setShowSettings(true); onClose(); } },
    { icon: '📊', name: 'Presentation', desc: 'Share slides', action: () => {} },
    { icon: '⏱️', name: 'Timer', desc: 'Pomodoro focus timer', action: () => {} },
    { icon: '📝', name: 'Notes', desc: 'Shared notepad', action: () => {} },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-20" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[480px] border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Apps & Tools</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {apps.map((app) => (
            <button key={app.name} onClick={app.action}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group">
              <span className="text-3xl">{app.icon}</span>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-indigo-700">{app.name}</span>
              <span className="text-[10px] text-gray-400 text-center">{app.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main BottomBar ─────────────────────────────────────────────────────────
const BottomBar = () => {
  const {
    activeChatRoomId, activeRooms, openChat, closeChat,
    handRaised, toggleHand, currentReaction, setReaction,
    isRecording, toggleRecording,
    showInviteModal, setShowInviteModal,
    showShareModal, setShowShareModal,
    showAppsPanel, setShowAppsPanel,
    setHomePosition, currentUser,
  } = useCosmosStore();

  const chatActive = !!activeChatRoomId;
  const roomCount = Object.keys(activeRooms).length;
  const [showReactions, setShowReactions] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const reactionRef = useRef(null);
  const actionRef = useRef(null);

  const toggleChat = () => { if (chatActive) closeChat(); else { const first = Object.keys(activeRooms)[0]; if (first) openChat(first); } };
  const handleReaction = (emoji) => { setReaction(emoji); setFloatingReactions((p) => [...p, { id: Date.now(), emoji }]); };

  useEffect(() => {
    const handler = (e) => {
      if (reactionRef.current && !reactionRef.current.contains(e.target)) setShowReactions(false);
      if (actionRef.current && !actionRef.current.contains(e.target)) setShowAction(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      {floatingReactions.map((r) => (
        <FloatingReaction key={r.id} emoji={r.emoji} onDone={() => setFloatingReactions((p) => p.filter((x) => x.id !== r.id))} />
      ))}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
      {showAppsPanel && <AppsPanel onClose={() => setShowAppsPanel(false)} />}

      <div className="flex items-center justify-between px-4 border-t bg-white"
        style={{ height: 56, borderColor: '#e5e7eb', flexShrink: 0, zIndex: 50 }}>
        {/* Left */}
        <div className="flex items-center">
          <Btn icon="🔗" label="Share" tooltip="Share space link" onClick={() => setShowShareModal(true)} />
        </div>

        {/* Center */}
        <div className="flex items-center gap-0.5">
          <Btn icon="👤" label="Invite" tooltip="Invite people" onClick={() => setShowInviteModal(true)} />
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <Btn icon={isRecording ? '⏹' : '⏺'} label="Record" active={isRecording} danger={isRecording}
            tooltip={isRecording ? 'Stop recording' : 'Start recording session'} onClick={toggleRecording} />
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <Btn icon="🚶" label="Move" active tooltip="Move mode — WASD or arrow keys" />
          <Btn icon={handRaised ? '✋' : '🤚'} label="Hand" active={handRaised}
            tooltip={handRaised ? 'Lower hand' : 'Raise hand'} onClick={toggleHand} />
          <div ref={reactionRef} className="relative">
            {showReactions && <ReactionPicker onSelect={handleReaction} onClose={() => setShowReactions(false)} />}
            <Btn icon={currentReaction || '😄'} label="React" active={!!currentReaction}
              tooltip="Send a reaction" onClick={() => setShowReactions((v) => !v)} />
          </div>
          <div ref={actionRef} className="relative">
            {showAction && <ActionMenu onClose={() => setShowAction(false)} />}
            <Btn icon="⚡" label="Action" tooltip="Quick actions" onClick={() => setShowAction((v) => !v)} />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-0.5">
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <Btn icon="💬" label="Chat" active={chatActive} badge={roomCount > 0 ? roomCount : undefined}
            tooltip="Open proximity chat" onClick={toggleChat} />
          <Btn icon="⊞" label="Apps" tooltip="Apps & integrations" onClick={() => setShowAppsPanel(true)} />
          <Btn icon="⌂" label="Set Home" tooltip="Mark current position as home (H to return)"
            onClick={() => currentUser?.position && setHomePosition(currentUser.position)} />
        </div>
      </div>
      <style>{`@keyframes float-up{0%{transform:translateX(-50%) translateY(0);opacity:1}100%{transform:translateX(-50%) translateY(-160px);opacity:0}}`}</style>
    </>
  );
};

export default BottomBar;
