'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ListVideo,
  MessageSquare,
  Gauge,
} from 'lucide-react';
import { Slider } from '@/components/ui/Slider';
import { formatTimecode } from '@/lib/formatters';

interface PlayerHudProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isQueueOpen: boolean;
  isChatOpen: boolean;
  queueCount: number;
  unreadChatCount: number;
  onPlayToggle: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onMuteToggle: () => void;
  onRateChange: (rate: number) => void;
  onFullscreenToggle: () => void;
  onToggleQueue: () => void;
  onToggleChat: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export const PlayerHud: React.FC<PlayerHudProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  isFullscreen,
  isQueueOpen,
  isChatOpen,
  queueCount,
  unreadChatCount,
  onPlayToggle,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onRateChange,
  onFullscreenToggle,
  onToggleQueue,
  onToggleChat,
  onPrev,
  onNext,
  canPrev,
  canNext,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [localSeekTime, setLocalSeekTime] = useState(currentTime);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = () => {
    setIsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setShowSpeedMenu(false);
      }, 3500);
    }
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isPlaying]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalSeekTime(val);
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    onSeek(localSeekTime);
  };

  const displayTime = isSeeking ? localSeekTime : currentTime;
  const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
      className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-300 flex flex-col justify-between p-4 bg-gradient-to-t from-black/85 via-transparent to-black/40 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Top Header Controls (Quick Badges & Actions) */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Top Bar indicators if needed */}
        </div>

        <div className="flex items-center gap-2">
          {/* Playlist Button */}
          <button
            onClick={onToggleQueue}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all border ${
              isQueueOpen
                ? 'bg-gold text-bg border-gold shadow-[0_0_12px_rgba(242,193,46,0.4)]'
                : 'bg-black/60 text-cream border-white/10 hover:border-gold/40 hover:text-gold'
            }`}
          >
            <ListVideo size={15} />
            <span>Queue</span>
            {queueCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isQueueOpen ? 'bg-bg text-gold' : 'bg-gold/20 text-gold'
              }`}>
                {queueCount}
              </span>
            )}
          </button>

          {/* Chat Button */}
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all border ${
              isChatOpen
                ? 'bg-gold text-bg border-gold shadow-[0_0_12px_rgba(242,193,46,0.4)]'
                : 'bg-black/60 text-cream border-white/10 hover:border-gold/40 hover:text-gold'
            }`}
          >
            <MessageSquare size={15} />
            <span>Chat</span>
            {unreadChatCount > 0 && !isChatOpen && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-crimson text-white animate-pulse">
                {unreadChatCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <div className="flex items-center justify-center pointer-events-auto">
          <button
            onClick={onPlayToggle}
            className="w-18 h-18 md:w-20 md:h-20 rounded-full bg-gold/90 text-bg flex items-center justify-center shadow-[0_0_40px_rgba(242,193,46,0.6)] hover:scale-110 active:scale-95 transition-all pl-1 cursor-pointer"
          >
            <Play size={36} fill="currentColor" />
          </button>
        </div>
      )}

      {/* Bottom HUD Bar */}
      <div className="space-y-2 pointer-events-auto bg-bg-card/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
        {/* Progress Seeker */}
        <div className="w-full">
          <Slider
            min={0}
            max={duration || 100}
            step={0.5}
            value={displayTime}
            onChange={handleSeekChange}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
          />
        </div>

        {/* HUD Controls Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Controls: Play/Pause, Prev, Next, Volume, Timecode */}
          <div className="flex items-center gap-3">
            {/* Prev */}
            <button
              onClick={onPrev}
              disabled={!canPrev}
              className="text-cream hover:text-gold disabled:opacity-30 disabled:hover:text-cream transition-colors p-1"
            >
              <SkipBack size={18} />
            </button>

            {/* Play / Pause */}
            <button
              onClick={onPlayToggle}
              className="text-gold hover:text-gold-hover p-1 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              disabled={!canNext}
              className="text-cream hover:text-gold disabled:opacity-30 disabled:hover:text-cream transition-colors p-1"
            >
              <SkipForward size={18} />
            </button>

            {/* Volume & Mute */}
            <div className="flex items-center gap-2 group">
              <button
                onClick={onMuteToggle}
                className="text-cream hover:text-gold transition-colors p-1"
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div className="w-16 hidden sm:block">
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Timecode */}
            <div className="text-xs font-mono text-cream-muted select-none">
              <span className="text-cream font-medium">{formatTimecode(displayTime)}</span>
              <span className="mx-1 text-cream-darker">/</span>
              <span>{formatTimecode(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 text-xs font-medium text-cream-muted hover:text-gold px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Gauge size={14} />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-bg-elevated border border-white/10 rounded-lg p-1.5 shadow-xl flex flex-col gap-1 min-w-[70px]">
                  {rates.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onRateChange(r);
                        setShowSpeedMenu(false);
                      }}
                      className={`text-xs px-2 py-1 rounded text-center transition-colors ${
                        playbackRate === r
                          ? 'bg-gold text-bg font-bold'
                          : 'text-cream hover:bg-white/10'
                      }`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={onFullscreenToggle}
              className="text-cream hover:text-gold transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
