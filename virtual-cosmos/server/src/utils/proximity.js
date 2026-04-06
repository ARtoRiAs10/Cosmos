// src/utils/proximity.js
// SRP: One job — compute Euclidean distance & check proximity.
// KISS: Simple math, no side effects, easily testable pure functions.
// DRY: All proximity checks go through these two functions.

/**
 * Euclidean distance between two 2D points.
 * @param {{ x: number, y: number }} a
 * @param {{ x: number, y: number }} b
 * @returns {number}
 */
const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

/**
 * Returns true if two positions are within the given radius.
 * @param {{ x: number, y: number }} posA
 * @param {{ x: number, y: number }} posB
 * @param {number} radius
 * @returns {boolean}
 */
const isWithinProximity = (posA, posB, radius) =>
  distance(posA, posB) < radius;

/**
 * Builds a deterministic room ID from two user IDs.
 * Sorting ensures "a_b" and "b_a" produce the same room.
 * DRY: One canonical place for room-ID generation.
 * @param {string} idA
 * @param {string} idB
 * @returns {string}
 */
const buildRoomId = (idA, idB) =>
  [idA, idB].sort().join('_');

module.exports = { distance, isWithinProximity, buildRoomId };
