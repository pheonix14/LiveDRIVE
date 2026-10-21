'use client';

import React, { useState } from 'react';
import { Film, ArrowRight, Plus, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeroSectionProps {
  onCreateRoomClick: () => void;
  onJoinRoom: (code: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onCreateRoomClick,
  onJoinRoom,
}) => {
  const [code, setCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    onJoinRoom(code.trim().toUpperCase());
  };

  return (
    <section className="relative w-full py-16 md:py-24 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold mb-6 shadow-[0_0_20px_rgba(242,193,46,0.15)] animate-in fade-in duration-500">
        <Sparkles size={14} />
        <span>LiveDRIVE Theater v6.0</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-cream max-w-4xl leading-[1.05] mb-6">
        WATCH TOGETHER. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-cream">
          ANYWHERE, WITH ANYONE.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base md:text-lg text-cream-muted max-w-2xl mb-10 leading-relaxed font-body">
        The ultimate zero-friction, zero-registration watch theater. Stream YouTube, Vimeo, direct MP4, HLS streams, and Google Drive in real-time frame synchronization.
      </p>

      {/* Join & Create Forms */}
      <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3 mb-10">
        <form onSubmit={handleJoin} className="w-full flex gap-2">
          <input
            type="text"
            placeholder="ENTER ROOM CODE..."
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 bg-bg-card border border-white/15 focus:border-gold rounded-xl px-4 py-3 text-xs sm:text-sm font-mono tracking-widest text-cream placeholder-cream-darker uppercase outline-none transition-all shadow-inner"
          />
          <Button type="submit" variant="gold" size="md" disabled={!code.trim()}>
            Join <ArrowRight size={16} />
          </Button>
        </form>

        <Button
          variant="ghost"
          size="md"
          onClick={onCreateRoomClick}
          className="w-full sm:w-auto whitespace-nowrap py-3 px-4"
        >
          <Plus size={16} />
          Create Room
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-cream-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-gold" />
          <span>Zero Authentication</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-mint" />
          <span>Low-Latency Signaling</span>
        </div>
        <div className="flex items-center gap-2">
          <Film size={16} className="text-sky-400" />
          <span>Universal Video Formats</span>
        </div>
      </div>
    </section>
  );
};
