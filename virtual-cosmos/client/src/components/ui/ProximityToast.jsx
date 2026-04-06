// ProximityToast.jsx — Subtle top-center notification
import React, { useEffect, useState, useRef } from 'react';
import useCosmosStore from '../../store/useCosmosStore';

const ProximityToast = () => {
  const { activeRooms, currentUser } = useCosmosStore();
  const [toast, setToast] = useState(null);
  const prevRef = useRef({});
  const timerRef = useRef(null);

  useEffect(() => {
    const prev = prevRef.current;
    const curr = activeRooms;

    for (const [id, room] of Object.entries(curr)) {
      if (!prev[id]) {
        const other = room.users.find((u) => u.userId !== currentUser?.userId);
        if (other) {
          clearTimeout(timerRef.current);
          setToast({ type: 'connected', name: other.username });
          timerRef.current = setTimeout(() => setToast(null), 3500);
        }
      }
    }
    for (const id of Object.keys(prev)) {
      if (!curr[id]) {
        clearTimeout(timerRef.current);
        setToast({ type: 'gone' });
        timerRef.current = setTimeout(() => setToast(null), 2500);
      }
    }
    prevRef.current = curr;
  }, [activeRooms, currentUser]);

  if (!toast) return null;

  return (
    <div className="absolute top-4 left-1/2 z-50 toast-enter" style={{ transform: 'translateX(-50%)' }}>
      <div
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium shadow-toast"
        style={{
          background: '#ffffff',
          border: `1.5px solid ${toast.type === 'connected' ? '#22c55e' : '#f59e0b'}`,
          color: toast.type === 'connected' ? '#15803d' : '#92400e',
        }}
      >
        <span>{toast.type === 'connected' ? '💬' : '👋'}</span>
        <span>
          {toast.type === 'connected'
            ? `Chat connected with @${toast.name}`
            : 'Moved out of range — chat closed'}
        </span>
      </div>
    </div>
  );
};

export default ProximityToast;
