'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/lobby/HeroSection';
import { RecentRooms } from '@/components/lobby/RecentRooms';
import { HowItWorks } from '@/components/lobby/HowItWorks';
import { CreateRoomModal } from '@/components/room/CreateRoomModal';
import { ScreeningRoom } from '@/components/room/ScreeningRoom';
import { BackendSelectorModal } from '@/components/room/BackendSelectorModal';
import { RoomSettings } from '@/types/room';
import { MediaItem } from '@/types/playlist';
import { parseMediaUrl } from '@/lib/urlParser';

interface ActiveRoomSession {
  code: string;
  title: string;
  genre: string;
  settings: RoomSettings;
  initialItems: MediaItem[];
  createdAt: number;
}

export default function Home() {
  const [activeSession, setActiveSession] = useState<ActiveRoomSession | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);

  // Check URL query param for direct room link (e.g. ?room=ROOMCODE)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');

    if (roomParam) {
      handleJoinByCode(roomParam.toUpperCase());
    }
  }, []);

  const saveRecentRoom = (code: string, title: string, genre: string) => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('livedrive_recent_rooms');
      let rooms: Array<{ code: string; title: string; genre: string; lastVisited: number }> = [];
      if (stored) {
        rooms = JSON.parse(stored);
      }
      rooms = rooms.filter((r) => r.code !== code);
      rooms.unshift({
        code,
        title,
        genre,
        lastVisited: Date.now(),
      });
      // Keep last 6
      localStorage.setItem('livedrive_recent_rooms', JSON.stringify(rooms.slice(0, 6)));
    } catch {
      //
    }
  };

  const handleJoinByCode = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    const title = `Screening Theater #${cleanCode}`;
    const genre = 'Live Sync';

    const session: ActiveRoomSession = {
      code: cleanCode,
      title,
      genre,
      settings: {
        lifetime: '3hours',
        selfDestruct: false,
        selfDestructCountdown: 60,
      },
      initialItems: [],
      createdAt: Date.now(),
    };

    saveRecentRoom(cleanCode, title, genre);
    setActiveSession(session);

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `?room=${cleanCode}`);
    }
  };

  const handleCreateRoom = (data: {
    title: string;
    genre: string;
    initialUrl?: string;
    settings: RoomSettings;
  }) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const initialItems: MediaItem[] = [];

    if (data.initialUrl) {
      const parsed = parseMediaUrl(data.initialUrl);
      initialItems.push({
        id: `media_${Date.now()}`,
        url: parsed.directUrl,
        title: data.title,
        sourceType: parsed.sourceType,
        addedAt: Date.now(),
      });
    }

    const session: ActiveRoomSession = {
      code,
      title: data.title,
      genre: data.genre,
      settings: data.settings,
      initialItems,
      createdAt: Date.now(),
    };

    saveRecentRoom(code, data.title, data.genre);
    setActiveSession(session);

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `?room=${code}`);
    }
  };

  const handleExitRoom = () => {
    setActiveSession(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Navbar
        onCreateRoomClick={() => setIsCreateModalOpen(true)}
        onHomeClick={handleExitRoom}
        onOpenBackendSelector={() => setIsBackendModalOpen(true)}
        roomCode={activeSession?.code}
      />

      <main className="flex-1 flex flex-col">
        {activeSession ? (
          <ScreeningRoom
            roomCode={activeSession.code}
            title={activeSession.title}
            genre={activeSession.genre}
            initialItems={activeSession.initialItems}
            settings={activeSession.settings}
            createdAt={activeSession.createdAt}
            onExitRoom={handleExitRoom}
          />
        ) : (
          <>
            <HeroSection
              onCreateRoomClick={() => setIsCreateModalOpen(true)}
              onJoinRoom={handleJoinByCode}
            />
            <RecentRooms onJoinRoom={handleJoinByCode} />
            <HowItWorks />
          </>
        )}
      </main>

      <Footer />

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />

      <BackendSelectorModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </div>
  );
}
