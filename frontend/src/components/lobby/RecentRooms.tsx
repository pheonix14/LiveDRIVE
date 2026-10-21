'use client';

import React, { useEffect, useState } from 'react';
import { History, ArrowRight, Trash2, Film } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';

export interface RecentRoom {
  code: string;
  title: string;
  genre: string;
  lastVisited: number;
}

interface RecentRoomsProps {
  onJoinRoom: (code: string) => void;
}

export const RecentRooms: React.FC<RecentRoomsProps> = ({ onJoinRoom }) => {
  const [rooms, setRooms] = useState<RecentRoom[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('livedrive_recent_rooms');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRooms(parsed);
        }
      }
    } catch {
      //
    }
  }, []);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('livedrive_recent_rooms');
      setRooms([]);
    } catch {
      //
    }
  };

  const handleRemove = (code: string) => {
    const updated = rooms.filter((r) => r.code !== code);
    setRooms(updated);
    try {
      localStorage.setItem('livedrive_recent_rooms', JSON.stringify(updated));
    } catch {
      //
    }
  };

  if (rooms.length === 0) {
    return null; // Do not render anything if no real history exists
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 select-none">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History size={16} className="text-gold" />
          <h2 className="text-xl font-bold font-display text-cream tracking-wide">
            RECENT SCREENINGS
          </h2>
        </div>
        <button
          onClick={handleClearHistory}
          className="text-xs text-cream-darker hover:text-crimson flex items-center gap-1 transition-colors"
        >
          <Trash2 size={13} />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div
            key={room.code}
            onClick={() => onJoinRoom(room.code)}
            className="group relative bg-bg-card/70 border border-white/5 hover:border-gold/40 rounded-xl p-4 flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold/80 bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                  {room.genre || 'Lounge'}
                </span>
                <h3 className="text-sm font-bold font-display text-cream group-hover:text-gold transition-colors mt-1.5 truncate">
                  {room.title}
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(room.code);
                }}
                className="opacity-0 group-hover:opacity-100 text-cream-darker hover:text-crimson p-1 transition-opacity"
                title="Remove from history"
              >
                ✕
              </button>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-cream-muted">
              <span className="font-mono text-gold font-bold">#{room.code}</span>
              <span className="text-[11px] text-cream-darker">
                {formatRelativeTime(room.lastVisited)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
