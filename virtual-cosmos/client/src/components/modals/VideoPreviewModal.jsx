// VideoPreviewModal.jsx — Camera preview in a floating draggable tile (like video call)
import React, { useRef, useEffect, useState } from 'react';
import useCosmosStore from '../../store/useCosmosStore';

const VideoPreviewModal = () => {
  const { cameraEnabled, toggleCamera, currentUser } = useCosmosStore();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [pos, setPos] = useState({ x: 16, y: 60 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  useEffect(() => {
    if (!cameraEnabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setError(null);
      } catch (e) {
        setError('Camera not available');
      }
    })();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [cameraEnabled]);

  const onMouseDown = (e) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onMouseMove = (e) => {
    if (!dragging || !dragStart.current) return;
    setPos({
      x: dragStart.current.ox + e.clientX - dragStart.current.mx,
      y: dragStart.current.oy + e.clientY - dragStart.current.my,
    });
  };
  const onMouseUp = () => setDragging(false);

  if (!cameraEnabled) return null;

  const initials = (currentUser?.username || '?').slice(0, 2).toUpperCase();
  const color = currentUser?.avatarColor || '#6366f1';

  return (
    <div
      className="absolute z-50 select-none"
      style={{ left: pos.x, top: pos.y, cursor: dragging ? 'grabbing' : 'grab' }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div
        onMouseDown={onMouseDown}
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: 200, border: '2px solid rgba(255,255,255,0.3)', background: '#111' }}>
        {/* Video or placeholder */}
        <div className="relative" style={{ width: 200, height: 150 }}>
          {error ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${color}cc, ${color}66)` }}>
              <div className="text-white text-2xl font-bold">{initials}</div>
              <div className="text-white/70 text-xs">{error}</div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
          {/* Name tag overlay */}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {currentUser?.username || 'You'}
          </div>
          {/* Close button */}
          <button
            onClick={toggleCamera}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors text-sm"
          >×</button>
        </div>
      </div>
    </div>
  );
};

export default VideoPreviewModal;
