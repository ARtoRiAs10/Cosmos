// MiniMap.jsx — Live mini-map showing all players + rooms in bottom-right corner
import React, { useRef, useEffect } from 'react';
import useCosmosStore from '../../store/useCosmosStore';

const CANVAS_W = 1600;
const CANVAS_H = 1000;
const MAP_W = 180;
const MAP_H = 112;
const SX = MAP_W / CANVAS_W;
const SY = MAP_H / CANVAS_H;

const ROOMS = [
  { id: 'room1',  label: 'R1',     x: 860, y: 60,  w: 380, h: 300 },
  { id: 'room2',  label: 'R2',     x: 120, y: 60,  w: 380, h: 300 },
  { id: 'lounge', label: 'Lounge', x: 580, y: 520, w: 260, h: 200 },
];

const hex2rgb = (hex) => {
  const h = (hex || '#6366f1').replace('#', '');
  const n = parseInt(h, 16);
  return `rgb(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255})`;
};

const MiniMap = () => {
  const canvasRef = useRef(null);
  const { players, currentUser, homePosition } = useCosmosStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear
    ctx.clearRect(0, 0, MAP_W, MAP_H);

    // Floor bg
    ctx.fillStyle = '#d4b690';
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    // Rooms
    ROOMS.forEach((r) => {
      ctx.fillStyle = 'rgba(232,207,168,0.75)';
      ctx.strokeStyle = '#a8845c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(r.x * SX, r.y * SY, r.w * SX, r.h * SY, 2);
      ctx.fill();
      ctx.stroke();
      // Label
      ctx.fillStyle = '#7a5c38';
      ctx.font = 'bold 7px DM Sans, sans-serif';
      ctx.fillText(r.label, r.x * SX + 3, r.y * SY + 10);
    });

    // Home position star
    if (homePosition) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px sans-serif';
      ctx.fillText('⌂', homePosition.x * SX - 5, homePosition.y * SY + 4);
    }

    // All players
    players.forEach((p) => {
      if (!p.position) return;
      const isMe = p.userId === currentUser?.userId;
      const pos = isMe ? currentUser.position : p.position;

      ctx.beginPath();
      ctx.arc(pos.x * SX, pos.y * SY, isMe ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = p.avatarColor || '#6366f1';
      ctx.fill();
      ctx.strokeStyle = isMe ? '#fff' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = isMe ? 1.5 : 1;
      ctx.stroke();
    });

    // "You" label under player dot
    if (currentUser?.position) {
      ctx.fillStyle = '#374151';
      ctx.font = '6px DM Sans, sans-serif';
      ctx.fillText('you', currentUser.position.x * SX - 5, currentUser.position.y * SY + 11);
    }
  }, [players, currentUser, homePosition]);

  return (
    <div className="absolute bottom-4 right-4 z-40"
      style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)', borderRadius: 10, border: '1px solid rgba(0,0,0,0.10)', boxShadow: '0 4px 16px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
      <div className="px-2.5 py-1 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Map</span>
        <span className="ml-2 text-[10px] text-gray-400">{players.length} online</span>
      </div>
      <canvas ref={canvasRef} width={MAP_W} height={MAP_H} style={{ display: 'block' }} />
    </div>
  );
};

export default MiniMap;
