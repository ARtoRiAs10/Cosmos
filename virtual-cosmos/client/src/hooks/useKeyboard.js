// src/hooks/useKeyboard.js
// SRP: Tracks pressed keys. Returns a ref (not state) to avoid re-renders on every keypress.
// KISS: A simple Set<string> of currently pressed keys.
// Why ref not state? Canvas renders at 60fps via PixiJS ticker — we read
// the key state inside the ticker callback, no React re-render needed.

import { useEffect, useRef } from 'react';

const useKeyboard = () => {
  const keys = useRef(new Set());

  useEffect(() => {
    const onKeyDown = (e) => {
      // Prevent page scroll on arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keys.current.add(e.key.toLowerCase());
    };

    const onKeyUp = (e) => {
      keys.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return keys; // ref to the live Set
};

export default useKeyboard;
