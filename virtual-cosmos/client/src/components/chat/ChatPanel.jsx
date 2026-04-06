// ChatPanel.jsx — Right-side chat panel matching cosmos.video exactly
// Full-height panel with header, history section, message area, input bar
import React, { useState, useRef, useEffect } from 'react';
import socket from '../../services/socket';
import useCosmosStore from '../../store/useCosmosStore';

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const EmojiIcon = () => <span className="text-base">😊</span>;
const AttachIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);

const ChatPanel = () => {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const {
    currentUser, activeChatRoomId, activeRooms,
    messages, closeChat, openChat,
  } = useCosmosStore();

  const roomMessages = messages[activeChatRoomId] || [];
  const activeRoom   = activeRooms[activeChatRoomId];
  const allRooms     = Object.values(activeRooms);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length]);

  if (allRooms.length === 0 || !activeChatRoomId) return null;

  const getRoomPartner = (room) => {
    if (!room) return 'Chat';
    const other = room.users.find((u) => u.userId !== currentUser?.userId);
    return other?.username || 'Chat';
  };

  const send = () => {
    const text = input.trim();
    if (!text || !activeChatRoomId || !currentUser) return;
    socket.emit('chat:send', {
      roomId: activeChatRoomId,
      senderId: currentUser.userId,
      senderName: currentUser.username,
      text,
    });
    setInput('');
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const partnerName = getRoomPartner(activeRoom);

  return (
    <div
      className="flex flex-col bg-white border-l"
      style={{
        width: 300,
        borderColor: '#e5e7eb',
        flexShrink: 0,
        height: '100%',
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#e5e7eb', background: '#fafafa' }}
      >
        <div>
          <div className="font-semibold text-sm text-gray-800">Chat</div>
          <div className="text-xs text-gray-400">with @{partnerName}</div>
        </div>
        <button onClick={closeChat} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
          <CloseIcon />
        </button>
      </div>

      {/* ── Room tabs ────────────────────────────────────────── */}
      {allRooms.length > 1 && (
        <div className="flex border-b overflow-x-auto" style={{ borderColor: '#e5e7eb' }}>
          {allRooms.map((room) => {
            const isActive = room.roomId === activeChatRoomId;
            return (
              <button
                key={room.roomId}
                onClick={() => openChat(room.roomId)}
                className={`px-4 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? 'border-cosmos-blue text-cosmos-blue' : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                @{getRoomPartner(room)}
              </button>
            );
          })}
        </div>
      )}

      {/* ── History intro ────────────────────────────────────── */}
      {roomMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-6 gap-3">
          {/* Avatar of partner */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-avatar"
            style={{ background: activeRoom?.users?.find(u => u.userId !== currentUser?.userId)?.avatarColor || '#6366f1' }}
          >
            {partnerName.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700">
              This is the beginning of your chat history with{' '}
              <span className="text-cosmos-blue">@{partnerName}</span>.
            </div>
            <div className="text-xs text-gray-400 mt-1">Send messages, attachments, links, emojis, and more.</div>
          </div>
        </div>
      )}

      {/* ── Messages ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {roomMessages.map((msg, i) => {
          const isMe = msg.senderId === currentUser?.userId;
          const showName = !isMe && (i === 0 || roomMessages[i-1]?.senderId !== msg.senderId);
          return (
            <div key={msg._id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-0.5`}>
              {showName && (
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ background: '#6b7280' }}
                  >
                    {msg.senderName?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{msg.senderName}</span>
                </div>
              )}
              <div className={isMe ? 'chat-bubble-me' : 'chat-bubble-other'}>
                {msg.text}
              </div>
              <span className="text-gray-400 text-[10px] px-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ────────────────────────────────────────── */}
      <div className="border-t px-3 py-2.5" style={{ borderColor: '#e5e7eb' }}>
        {/* Text input row */}
        <div className="flex items-center gap-2 mb-2">
          <input
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            placeholder={`Message the group`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            maxLength={500}
            autoFocus
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="text-cosmos-blue hover:text-blue-600 disabled:opacity-30 transition-colors"
          >
            <SendIcon />
          </button>
        </div>

        {/* Toolbar icons matching cosmos.video */}
        <div className="flex items-center gap-3 text-gray-400">
          <button className="hover:text-gray-600 transition-colors"><EmojiIcon /></button>
          <button className="hover:text-gray-600 transition-colors"><AttachIcon /></button>
          <button className="hover:text-gray-600 transition-colors text-sm font-bold leading-none">⊡</button>
          <button className="hover:text-gray-600 transition-colors text-sm font-bold leading-none italic">I</button>
          <button className="hover:text-gray-600 transition-colors text-sm font-bold leading-none">S̶</button>
          <button className="hover:text-gray-600 transition-colors text-xs font-mono leading-none">{"</>"}</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
