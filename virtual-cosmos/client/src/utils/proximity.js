// src/utils/proximity.js
// Mirrors server-side proximity.js — the canonical math lives here.
// Why duplicate? Frontend uses it for visual radius rendering.
// In a TypeScript monorepo this would live in /shared and be imported by both.

export const PROXIMITY_RADIUS = 150; // Must match server config.proximityRadius

export const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

export const isWithinProximity = (posA, posB, radius = PROXIMITY_RADIUS) =>
  distance(posA, posB) < radius;

export const buildRoomId = (idA, idB) =>
  [idA, idB].sort().join('_');
