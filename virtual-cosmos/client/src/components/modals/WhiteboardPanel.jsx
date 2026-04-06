// WhiteboardPanel.jsx — Simple collaborative-style local canvas whiteboard
import React, { useRef, useEffect, useState, useCallback } from 'react';

const COLORS_BOARD = ['#1e293b','#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ec4899','#ffffff'];
const SIZES = [2, 5, 10, 18];

const WhiteboardPanel = ({ onClose }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const [color, setColor] = useState('#1e293b');
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState('pen'); // pen | eraser

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = useCallback((e) => {
    isDrawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#f8fafc' : color;
    ctx.lineWidth = tool === 'eraser' ? size * 4 : size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  }, [color, size, tool]);

  const stopDraw = () => { isDrawing.current = false; lastPos.current = null; };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = canvasRef.current.toDataURL('image/png');
    a.download = 'whiteboard.png';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '90vw', maxWidth: 800, height: '80vh' }}>
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="font-bold text-gray-700 mr-2">📋 Whiteboard</span>
          {/* Color swatches */}
          <div className="flex gap-1.5">
            {COLORS_BOARD.map(c => (
              <button key={c} onClick={() => { setColor(c); setTool('pen'); }}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125"
                style={{ background: c, borderColor: c === color && tool === 'pen' ? '#374151' : 'transparent' }} />
            ))}
          </div>
          <div className="w-px h-5 bg-gray-200" />
          {/* Brush sizes */}
          {SIZES.map(s => (
            <button key={s} onClick={() => setSize(s)}
              className={`rounded-full flex-shrink-0 transition-colors ${size === s ? 'bg-indigo-200' : 'hover:bg-gray-200'}`}
              style={{ width: Math.max(s * 1.5 + 8, 16), height: Math.max(s * 1.5 + 8, 16) }}>
              <div className="rounded-full bg-gray-700 mx-auto" style={{ width: s, height: s }} />
            </button>
          ))}
          <div className="w-px h-5 bg-gray-200" />
          {/* Eraser */}
          <button onClick={() => setTool(tool === 'eraser' ? 'pen' : 'eraser')}
            title="Eraser"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tool === 'eraser' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            ◻ Erase
          </button>
          <div className="flex-1" />
          <button onClick={download} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
            ↓ Save
          </button>
          <button onClick={clear} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
            ✕ Clear
          </button>
          <button onClick={onClose} className="ml-1 text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        {/* Canvas */}
        <div className="flex-1 overflow-hidden" style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}>
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            className="w-full h-full"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default WhiteboardPanel;
