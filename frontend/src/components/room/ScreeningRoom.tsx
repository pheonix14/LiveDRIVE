'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RoomSettings } from '@/types/room';
import { MediaItem } from '@/types/playlist';
import { ChatMessage } from '@/types/chat';
import { SyncPayload } from '@/types/sync';
import { usePlaylist } from '@/hooks/usePlaylist';
import { useSyncSocket } from '@/hooks/useSyncSocket';
import { useRoomTimer } from '@/hooks/useRoomTimer';
import { useIdentity } from '@/context/IdentityContext';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { PlaylistDrawer } from '@/components/playlist/PlaylistDrawer';
import { ChatDrawer } from '@/components/chat/ChatDrawer';
import { ChatNotificationToast } from '@/components/chat/ChatNotificationToast';
import { RoomHeader } from './RoomHeader';
import { RoomSettingsModal } from './RoomSettingsModal';
import { SelfDestructBanner } from './SelfDestructBanner';
import { BackendSelectorModal } from './BackendSelectorModal';
import { BackendConfig, getStoredBackendConfig } from '@/lib/backendConfig';

interface ScreeningRoomProps {
  roomCode: string;
  title: string;
  genre?: string;
  initialItems?: MediaItem[];
  settings: RoomSettings;
  createdAt?: number;
  onExitRoom: () => void;
}

export const ScreeningRoom: React.FC<ScreeningRoomProps> = ({
  roomCode,
  title,
  initialItems = [],
  settings: initialSettings,
  createdAt = Date.now(),
  onExitRoom,
}) => {
  const { identity } = useIdentity();
  const [settings, setSettings] = useState<RoomSettings>(initialSettings);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [latestUnreadMessage, setLatestUnreadMessage] = useState<ChatMessage | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [backendConfig, setBackendConfig] = useState<BackendConfig>(getStoredBackendConfig());
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);

  // Prevent broadcast echoes
  const isSyncingFromRemoteRef = useRef<boolean>(false);

  // Playlist management
  const {
    items,
    currentIndex,
    currentItem,
    loopMode,
    isShuffle,
    addItem,
    removeItem,
    reorder,
    playIndex,
    playNext,
    playPrev,
    toggleLoop,
    toggleShuffle,
    clearPlaylist,
    setPlaylist,
  } = usePlaylist({
    initialItems,
    onQueueChanged: (newItems, newIdx) => {
      if (!isSyncingFromRemoteRef.current) {
        broadcast({
          type: 'playlist_update',
          playlist: newItems,
          currentIndex: newIdx,
        });
      }
    },
  });

  // Handle incoming synchronization events
  const handlePayloadReceived = useCallback(
    (payload: SyncPayload) => {
      isSyncingFromRemoteRef.current = true;

      switch (payload.type) {
        case 'play':
          if (payload.position !== undefined) setCurrentTime(payload.position);
          setIsPlaying(true);
          break;

        case 'pause':
          if (payload.position !== undefined) setCurrentTime(payload.position);
          setIsPlaying(false);
          break;

        case 'seek':
          if (payload.position !== undefined) {
            setCurrentTime(payload.position);
          }
          break;

        case 'change_video':
          if (payload.currentIndex !== undefined) {
            playIndex(payload.currentIndex);
          }
          break;

        case 'playlist_update':
          if (payload.playlist) {
            setPlaylist(payload.playlist, payload.currentIndex ?? 0);
          }
          break;

        case 'chat_message':
          if (payload.messageText && payload.senderName) {
            const newMsg: ChatMessage = {
              id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              senderId: payload.senderId,
              senderName: payload.senderName,
              senderColor: payload.senderColor || '#F2C12E',
              text: payload.messageText,
              timestamp: payload.timestamp,
            };
            setChatMessages((prev) => [...prev, newMsg]);

            if (!isChatOpen) {
              setUnreadChatCount((prev) => prev + 1);
              setLatestUnreadMessage(newMsg);
            }
          }
          break;

        case 'user_join':
          if (payload.senderName) {
            const joinMsg: ChatMessage = {
              id: `sys_${Date.now()}`,
              senderId: 'system',
              senderName: 'System',
              senderColor: '#5DCAA5',
              text: `${payload.senderName} entered the screening room`,
              timestamp: Date.now(),
              isSystem: true,
            };
            setChatMessages((prev) => [...prev, joinMsg]);
          }
          break;

        default:
          break;
      }

      setTimeout(() => {
        isSyncingFromRemoteRef.current = false;
      }, 300);
    },
    [isChatOpen, playIndex, setPlaylist]
  );

  // Sync Socket hook (handles WebSocket + multi-tab BroadcastChannel)
  const { connected, syncMethod, peerCount, broadcast } = useSyncSocket({
    roomCode,
    signalingUrl: settings.signalingUrl,
    backendConfig,
    onPayloadReceived: handlePayloadReceived,
  });

  // Room Timers & Self-Destruct
  const {
    msRemaining,
    isPermanent,
    isSelfDestructArmed,
    destructCountdown,
    armSelfDestruct,
    disarmSelfDestruct,
  } = useRoomTimer({
    createdAt,
    settings,
    onRoomExpired: () => {
      alert('This screening room session has reached its lifetime limit and is now closed.');
      onExitRoom();
    },
    onSelfDestructTriggered: () => {
      alert('Self-destruct sequence reached 0. Room obliterated.');
      onExitRoom();
    },
  });

  // Clear unread count when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setUnreadChatCount(0);
      setLatestUnreadMessage(null);
    }
  }, [isChatOpen]);

  // Outgoing Play / Pause Toggle
  const handlePlayToggle = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    broadcast({
      type: nextState ? 'play' : 'pause',
      position: currentTime,
      isPlaying: nextState,
    });
  };

  // Outgoing Seek
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    broadcast({
      type: 'seek',
      position: seconds,
      isPlaying,
    });
  };

  // Video Ended -> Autoplay next in queue
  const handleEnded = () => {
    const hasNext = playNext();
    if (hasNext) {
      setIsPlaying(true);
      setCurrentTime(0);
      broadcast({
        type: 'change_video',
        currentIndex: currentIndex + 1,
        position: 0,
        isPlaying: true,
      });
    } else {
      setIsPlaying(false);
      broadcast({
        type: 'pause',
        position: 0,
        isPlaying: false,
      });
    }
  };

  // Next / Prev video navigation
  const handlePrev = () => {
    playPrev();
    broadcast({
      type: 'change_video',
      currentIndex: Math.max(0, currentIndex - 1),
      position: 0,
      isPlaying: true,
    });
  };

  const handleNext = () => {
    playNext();
    broadcast({
      type: 'change_video',
      currentIndex: Math.min(items.length - 1, currentIndex + 1),
      position: 0,
      isPlaying: true,
    });
  };

  // Send Chat message
  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: identity.userId,
      senderName: identity.username,
      senderColor: identity.color,
      text,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, newMsg]);

    broadcast({
      type: 'chat_message',
      messageText: text,
      senderName: identity.username,
      senderColor: identity.color,
    });
  };

  // Add media to queue
  const handleAddMedia = async (url: string, customTitle?: string) => {
    const newItem = await addItem(url, customTitle);
    if (items.length === 0) {
      setIsPlaying(true);
      setCurrentTime(0);
    }
    return newItem;
  };

  return (
    <div className="w-full flex flex-col relative min-h-[calc(100vh-4rem)]">
      {/* 1. Self Destruct Warning */}
      {isSelfDestructArmed && <SelfDestructBanner countdown={destructCountdown} />}

      <div className="max-w-7xl mx-auto px-4 w-full flex-1 flex flex-col py-2">
        {/* 2. Room Header */}
        <RoomHeader
          title={title}
          roomCode={roomCode}
          memberCount={peerCount}
          syncMethod={syncMethod}
          msRemaining={msRemaining}
          isPermanent={isPermanent}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenBackendSelector={() => setIsBackendModalOpen(true)}
        />

        {/* 3. Main Screening Area */}
        <div className="w-full my-2">
          <VideoPlayer
            currentItem={currentItem}
            isPlaying={isPlaying}
            currentTime={currentTime}
            isQueueOpen={isQueueOpen}
            isChatOpen={isChatOpen}
            queueCount={items.length}
            unreadChatCount={unreadChatCount}
            canPrev={currentIndex > 0}
            canNext={currentIndex < items.length - 1}
            onPlayToggle={handlePlayToggle}
            onSeek={handleSeek}
            onEnded={handleEnded}
            onPrev={handlePrev}
            onNext={handleNext}
            onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
            onAddMedia={handleAddMedia}
            onTimeUpdate={(curr) => {
              setCurrentTime(curr);
            }}
          />
        </div>
      </div>

      {/* 4. Queue Drawer */}
      <PlaylistDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        items={items}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        loopMode={loopMode}
        isShuffle={isShuffle}
        onPlayIndex={(idx) => {
          playIndex(idx);
          broadcast({
            type: 'change_video',
            currentIndex: idx,
            position: 0,
            isPlaying: true,
          });
        }}
        onRemoveItem={removeItem}
        onReorder={reorder}
        onToggleLoop={toggleLoop}
        onToggleShuffle={toggleShuffle}
        onClear={clearPlaylist}
        onAddItem={handleAddMedia}
      />

      {/* 5. Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        currentUserId={identity.userId}
        onSendMessage={handleSendMessage}
      />

      {/* 6. Unread Chat Notification Toast */}
      {!isChatOpen && latestUnreadMessage && (
        <ChatNotificationToast
          message={latestUnreadMessage}
          onClick={() => {
            setIsChatOpen(true);
            setLatestUnreadMessage(null);
          }}
          onDismiss={() => setLatestUnreadMessage(null)}
        />
      )}

      {/* 7. Settings Modal */}
      <RoomSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        isSelfDestructArmed={isSelfDestructArmed}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onArmSelfDestruct={armSelfDestruct}
        onDisarmSelfDestruct={disarmSelfDestruct}
      />

      {/* 8. Backend Selector Modal */}
      <BackendSelectorModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        roomCode={roomCode}
        onConfigChanged={(newCfg) => setBackendConfig(newCfg)}
      />
    </div>
  );
};
