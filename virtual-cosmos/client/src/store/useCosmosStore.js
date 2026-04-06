// src/store/useCosmosStore.js
import { create } from 'zustand';

const useCosmosStore = create((set, get) => ({
  // ─── Auth / Identity ──────────────────────────────────────────────────
  currentUser: null,
  isRegistered: false,
  setCurrentUser: (user) => set({ currentUser: user, isRegistered: true }),

  // ─── Players ──────────────────────────────────────────────────────────
  players: [],
  setPlayers: (players) => set({ players }),
  updateMyPosition: (position) =>
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, position } : state.currentUser,
    })),

  // ─── Proximity / Chat Rooms ───────────────────────────────────────────
  activeRooms: {},
  addRoom: (roomId, users) =>
    set((state) => ({ activeRooms: { ...state.activeRooms, [roomId]: { roomId, users } } })),
  removeRoom: (roomId) =>
    set((state) => {
      const { [roomId]: _, ...rest } = state.activeRooms;
      const next = { activeRooms: rest };
      if (get().activeChatRoomId === roomId) { next.activeChatRoomId = null; next.messages = {}; }
      return next;
    }),
  removeAllRoomsForUser: (userId) =>
    set((state) => {
      const next = {};
      for (const [id, room] of Object.entries(state.activeRooms)) {
        if (!room.users.some((u) => u.userId === userId)) next[id] = room;
      }
      return { activeRooms: next };
    }),

  // ─── Chat ─────────────────────────────────────────────────────────────
  activeChatRoomId: null,
  messages: {},
  openChat: (roomId) => set({ activeChatRoomId: roomId }),
  closeChat: () => set({ activeChatRoomId: null }),
  addMessage: (roomId, message) =>
    set((state) => ({
      messages: { ...state.messages, [roomId]: [...(state.messages[roomId] || []), message] },
    })),
  setHistory: (roomId, messages) =>
    set((state) => ({ messages: { ...state.messages, [roomId]: messages } })),

  // ─── Connection Status ────────────────────────────────────────────────
  socketConnected: false,
  setSocketConnected: (v) => set({ socketConnected: v }),

  // ─── Media Controls ───────────────────────────────────────────────────
  micEnabled: true,
  cameraEnabled: false,
  screenSharing: false,
  handRaised: false,
  currentReaction: null,
  isRecording: false,
  homePosition: null,

  toggleMic: () => set((s) => ({ micEnabled: !s.micEnabled })),
  toggleCamera: () => set((s) => ({ cameraEnabled: !s.cameraEnabled })),
  toggleScreenShare: () => set((s) => ({ screenSharing: !s.screenSharing })),
  toggleHand: () => set((s) => ({ handRaised: !s.handRaised })),
  setReaction: (r) => { set({ currentReaction: r }); setTimeout(() => set({ currentReaction: null }), 3000); },
  toggleRecording: () => set((s) => ({ isRecording: !s.isRecording })),
  setHomePosition: (pos) => set({ homePosition: pos }),

  // ─── UI Panels ────────────────────────────────────────────────────────
  showInviteModal: false,
  showShareModal: false,
  showAppsPanel: false,
  showSettings: false,
  showWhiteboard: false,
  showAmbientSound: false,

  setShowInviteModal: (v) => set({ showInviteModal: v }),
  setShowShareModal: (v) => set({ showShareModal: v }),
  setShowAppsPanel: (v) => set({ showAppsPanel: v }),
  setShowSettings: (v) => set({ showSettings: v }),
  setShowWhiteboard: (v) => set({ showWhiteboard: v }),
  setShowAmbientSound: (v) => set({ showAmbientSound: v }),
}));

export default useCosmosStore;
