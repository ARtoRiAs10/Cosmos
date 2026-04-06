// src/hooks/useMovement.js — Movement with dash (Shift) support and home teleport (H)
import { useRef, useCallback } from 'react';
import socket from '../services/socket';
import useCosmosStore from '../store/useCosmosStore';

const SPEED = 3;
const DASH_MULTIPLIER = 2.5;
const EMIT_INTERVAL = 50;
const CANVAS_W = 1600;
const CANVAS_H = 1000;
const AVATAR_RADIUS = 24;

const useMovement = (keysRef) => {
  const lastEmitRef = useRef(0);
  const { currentUser, updateMyPosition, homePosition } = useCosmosStore();

  const tick = useCallback(() => {
    if (!currentUser) return;

    const keys = keysRef.current;
    let { x, y } = currentUser.position;
    let moved = false;

    // Dash mode with Shift
    const speed = (keys.has('shift')) ? SPEED * DASH_MULTIPLIER : SPEED;

    // H key = teleport to home
    if (keys.has('h') && homePosition) {
      x = homePosition.x;
      y = homePosition.y;
      moved = true;
      keys.delete('h'); // single-press
    } else {
      if (keys.has('w') || keys.has('arrowup'))    { y -= speed; moved = true; }
      if (keys.has('s') || keys.has('arrowdown'))  { y += speed; moved = true; }
      if (keys.has('a') || keys.has('arrowleft'))  { x -= speed; moved = true; }
      if (keys.has('d') || keys.has('arrowright')) { x += speed; moved = true; }
    }

    if (!moved) return;

    x = Math.max(AVATAR_RADIUS, Math.min(CANVAS_W - AVATAR_RADIUS, x));
    y = Math.max(AVATAR_RADIUS, Math.min(CANVAS_H - AVATAR_RADIUS, y));

    const position = { x, y };
    updateMyPosition(position);

    const now = Date.now();
    if (now - lastEmitRef.current >= EMIT_INTERVAL) {
      socket.emit('user:move', { userId: currentUser.userId, position });
      lastEmitRef.current = now;
    }
  }, [currentUser, keysRef, updateMyPosition, homePosition]);

  return { tick };
};

export default useMovement;
