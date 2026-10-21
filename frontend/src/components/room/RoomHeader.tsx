'use client';

import React, { useState } from 'react';
import { Copy, Check, Users, Settings, Clock, Radio } from 'lucide-react';
import { formatDurationRemaining } from '@/lib/formatters';

interface RoomHeaderProps {
  title: string;
  roomCode: string;
  memberCount: number;
  syncMethod: 'websocket' | 'broadcast_channel' | 'offline';
  msRemaining: number;
  isPermanent: boolean;
  onOpenSettings: () => void;
  onOpenBackendSelector?: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  title,
  roomCode,
  memberCount,
  syncMethod,
  msRemaining,
  isPermanent,
  onOpenSettings,
  onOpenBackendSelector,
}) => {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 select-none">
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-gold block mb-1">
          Screening Theater
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-cream tracking-wide">
          {title}
        </h1>
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        {/* Room Code Badge */}
        <button
          onClick={copyRoomCode}
          title="Click to copy invite code"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-xs font-mono font-bold transition-all active:scale-95 shadow-[0_0_10px_rgba(242,193,46,0.15)]"
        >
          <span>ROOM: {roomCode}</span>
          {copied ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
        </button>

        {/* Members Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-cream">
          <Users size={14} className="text-cream-muted" />
          <span>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>

        {/* Sync Status Pill / Backend Relay Button */}
        <button
          onClick={onOpenBackendSelector}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            syncMethod === 'websocket'
              ? 'bg-mint/10 text-mint border-mint/30 hover:bg-mint/20'
              : syncMethod === 'broadcast_channel'
              ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20'
              : 'bg-crimson/10 text-crimson border-crimson/30 hover:bg-crimson/20'
          }`}
          title="Click to switch or test backend relay (Render, Termux, Localhost, Mesh)"
        >
          <Radio size={13} className="animate-pulse" />
          <span className="capitalize">{syncMethod === 'broadcast_channel' ? 'Multi-Tab' : syncMethod} Relay</span>
        </button>

        {/* Expiry Pill */}
        {!isPermanent && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-cream-muted">
            <Clock size={13} />
            <span>{formatDurationRemaining(msRemaining)}</span>
          </div>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-cream hover:text-gold transition-colors"
          title="Room Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
};
