// App.jsx — Root layout with all panels, minimap, and video preview
import React from 'react';
import useCosmosStore from './store/useCosmosStore';
import useSocket from './hooks/useSocket';
import LoginScreen from './components/ui/LoginScreen';
import CosmosCanvas from './components/canvas/CosmosCanvas';
import ChatPanel from './components/chat/ChatPanel';
import HUD from './components/hud/HUD';
import TopBar from './components/hud/TopBar';
import BottomBar from './components/hud/BottomBar';
import ProximityToast from './components/ui/ProximityToast';
import MiniMap from './components/minimap/MiniMap';
import VideoPreviewModal from './components/modals/VideoPreviewModal';
import AmbientSoundPanel from './components/modals/AmbientSoundPanel';
import SettingsPanel from './components/modals/SettingsPanel';
import WhiteboardPanel from './components/modals/WhiteboardPanel';

const SocketBridge = () => { useSocket(); return null; };

const RecordingBadge = () => (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg pointer-events-none"
    style={{ boxShadow: '0 0 0 4px rgba(239,68,68,0.25)' }}>
    <span className="w-2 h-2 bg-white rounded-full inline-block rec-pulse" />
    REC
  </div>
);

const App = () => {
  const isRegistered = useCosmosStore((s) => s.isRegistered);
  const activeChatRoomId = useCosmosStore((s) => s.activeChatRoomId);
  const isRecording = useCosmosStore((s) => s.isRecording);
  const showAmbientSound = useCosmosStore((s) => s.showAmbientSound);
  const setShowAmbientSound = useCosmosStore((s) => s.setShowAmbientSound);
  const showSettings = useCosmosStore((s) => s.showSettings);
  const setShowSettings = useCosmosStore((s) => s.setShowSettings);
  const showWhiteboard = useCosmosStore((s) => s.showWhiteboard);
  const setShowWhiteboard = useCosmosStore((s) => s.setShowWhiteboard);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <SocketBridge />
      {!isRegistered && <LoginScreen />}
      {isRegistered && (
        <>
          <TopBar />
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <CosmosCanvas />
              <HUD />
              <ProximityToast />
              {isRecording && <RecordingBadge />}
              {/* Draggable video tile */}
              <VideoPreviewModal />
              {/* Live mini-map bottom-right */}
              <MiniMap />
            </div>
            {activeChatRoomId && <ChatPanel />}
          </div>
          <BottomBar />

          {/* Global modals */}
          {showAmbientSound && <AmbientSoundPanel onClose={() => setShowAmbientSound(false)} />}
          {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
          {showWhiteboard && <WhiteboardPanel onClose={() => setShowWhiteboard(false)} />}
        </>
      )}
    </div>
  );
};

export default App;
