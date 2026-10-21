'use client';

import React from 'react';
import { Film, Plus, Server } from 'lucide-react';
import { UserBadge } from './UserBadge';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  onCreateRoomClick?: () => void;
  onHomeClick?: () => void;
  onOpenBackendSelector?: () => void;
  roomCode?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onCreateRoomClick,
  onHomeClick,
  onOpenBackendSelector,
  roomCode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-bg/85 backdrop-blur-md border-b border-white/5 select-none">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onHomeClick}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(242,193,46,0.2)]">
            <Film size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-wider text-cream leading-none">
              LIVE<span className="text-gold">DRIVE</span>
            </span>
            <span className="text-[10px] tracking-widest text-cream-darker uppercase font-semibold">
              Theater V6
            </span>
          </div>
        </div>

        {/* Center Room Code if active */}
        {roomCode && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            <span className="text-cream-muted">Room:</span>
            <span className="font-mono font-bold text-gold">{roomCode}</span>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {onOpenBackendSelector && (
            <button
              onClick={onOpenBackendSelector}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-cream-muted hover:text-gold text-xs transition-colors"
              title="Configure Backend Relay (Render, Termux, Localhost)"
            >
              <Server size={14} />
              <span className="hidden md:inline">Relay</span>
            </button>
          )}

          <UserBadge />

          {onCreateRoomClick && (
            <Button variant="gold" size="sm" onClick={onCreateRoomClick}>
              <Plus size={15} />
              <span className="hidden sm:inline">Create Room</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
