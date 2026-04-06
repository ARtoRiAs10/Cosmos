// src/hooks/useSocket.js
// SRP: Subscribes to socket events and routes payloads to the Zustand store.
// All socket.on / socket.off pairs are colocated here (no scattered listeners).
// OCP: Adding a new socket event = add one handler here, no other file changes.

import { useEffect } from 'react';
import socket from '../services/socket';
import useCosmosStore from '../store/useCosmosStore';

const useSocket = () => {
  const {
    setSocketConnected,
    setPlayers,
    addRoom,
    removeRoom,
    removeAllRoomsForUser,
    addMessage,
    setHistory,
    openChat,
    activeChatRoomId,
  } = useCosmosStore();

  useEffect(() => {
    // ── Connection lifecycle ───────────────────────────────────────────
    const onConnect = () => {
      console.log('[Socket] Connected:', socket.id);
      setSocketConnected(true);
    };

    const onDisconnect = () => {
      console.log('[Socket] Disconnected');
      setSocketConnected(false);
    };

    // ── Player state ───────────────────────────────────────────────────
    // Snapshot: full player list on join
    const onPlayersSnapshot = (players) => setPlayers(players);
    // Broadcast: incremental update after any move
    const onPlayersUpdate = (players) => setPlayers(players);

    // ── Proximity events ───────────────────────────────────────────────
    const onProximityConnected = ({ roomId, users }) => {
      addRoom(roomId, users);
      // Auto-open chat for the first proximity connection
      if (!activeChatRoomId) openChat(roomId);
      // Request chat history for this room
      socket.emit('chat:history', { roomId });
    };

    const onProximityDisconnected = ({ roomId }) => {
      removeRoom(roomId);
    };

    const onUserLeft = ({ userId }) => {
      removeAllRoomsForUser(userId);
    };

    // ── Chat messages ──────────────────────────────────────────────────
    const onChatMessage = (message) => {
      addMessage(message.roomId, message);
    };

    const onChatHistory = ({ roomId, messages }) => {
      setHistory(roomId, messages);
    };

    // ── Register listeners ─────────────────────────────────────────────
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('players:snapshot', onPlayersSnapshot);
    socket.on('players:update', onPlayersUpdate);
    socket.on('proximity:connected', onProximityConnected);
    socket.on('proximity:disconnected', onProximityDisconnected);
    socket.on('proximity:userLeft', onUserLeft);
    socket.on('chat:message', onChatMessage);
    socket.on('chat:history', onChatHistory);

    // ── Cleanup on unmount (prevents memory leaks & duplicate handlers) ─
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('players:snapshot', onPlayersSnapshot);
      socket.off('players:update', onPlayersUpdate);
      socket.off('proximity:connected', onProximityConnected);
      socket.off('proximity:disconnected', onProximityDisconnected);
      socket.off('proximity:userLeft', onUserLeft);
      socket.off('chat:message', onChatMessage);
      socket.off('chat:history', onChatHistory);
    };
  }, [
    setSocketConnected, setPlayers, addRoom, removeRoom,
    removeAllRoomsForUser, addMessage, setHistory, openChat, activeChatRoomId,
  ]);
};

export default useSocket;
