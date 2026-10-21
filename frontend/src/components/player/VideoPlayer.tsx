'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MediaItem } from '@/types/playlist';
import { Html5Player } from './Html5Player';
import { YouTubePlayer } from './YouTubePlayer';
import { VimeoPlayer } from './VimeoPlayer';
import { PlayerHud } from './PlayerHud';
import { EmptyStateOverlay } from './EmptyStateOverlay';
import { parseMediaUrl } from '@/lib/urlParser';

interface VideoPlayerProps {
  currentItem: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  isQueueOpen: boolean;
  isChatOpen: boolean;
  queueCount: number;
  unreadChatCount: number;
  canPrev: boolean;
  canNext: boolean;
  onPlayToggle: () => void;
  onSeek: (seconds: number) => void;
  onEnded: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleQueue: () => void;
  onToggleChat: () => void;
  onAddMedia: (url: string) => void;
  onTimeUpdate?: (current: number, duration: number) => void;
  onDurationChange?: (duration: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentItem,
  isPlaying,
  currentTime,
  isQueueOpen,
  isChatOpen,
  queueCount,
  unreadChatCount,
  canPrev,
  canNext,
  onPlayToggle,
  onSeek,
  onEnded,
  onPrev,
  onNext,
  onToggleQueue,
  onToggleChat,
  onAddMedia,
  onTimeUpdate,
  onDurationChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.warn);
    } else {
      document.exitFullscreen().catch(console.warn);
    }
  }, []);

  const handleTimeUpdate = (curr: number, dur: number) => {
    if (dur && dur !== duration) {
      setDuration(dur);
      if (onDurationChange) onDurationChange(dur);
    }
    if (onTimeUpdate) {
      onTimeUpdate(curr, dur || duration);
    }
  };

  const parsed = currentItem ? parseMediaUrl(currentItem.url) : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gold/15 shadow-[0_10px_40px_rgba(0,0,0,0.8)] select-none group"
    >
      {/* 1. Empty State Overlay */}
      {!currentItem && <EmptyStateOverlay onAddMedia={onAddMedia} />}

      {/* 2. Active Video Player based on sourceType */}
      {currentItem && parsed && (
        <div className="w-full h-full relative">
          {parsed.sourceType === 'youtube' && parsed.videoId && (
            <YouTubePlayer
              videoId={parsed.videoId}
              isPlaying={isPlaying}
              currentTime={currentTime}
              volume={volume}
              isMuted={isMuted}
              playbackRate={playbackRate}
              onTimeUpdate={handleTimeUpdate}
              onPlayStateChange={(playing) => {
                if (playing !== isPlaying) onPlayToggle();
              }}
              onEnded={onEnded}
              onDurationChange={(d) => {
                setDuration(d);
                if (onDurationChange) onDurationChange(d);
              }}
            />
          )}

          {parsed.sourceType === 'vimeo' && parsed.videoId && (
            <VimeoPlayer
              videoId={parsed.videoId}
              isPlaying={isPlaying}
              currentTime={currentTime}
              volume={volume}
              isMuted={isMuted}
              playbackRate={playbackRate}
              onTimeUpdate={handleTimeUpdate}
              onPlayStateChange={(playing) => {
                if (playing !== isPlaying) onPlayToggle();
              }}
              onEnded={onEnded}
              onDurationChange={(d) => {
                setDuration(d);
                if (onDurationChange) onDurationChange(d);
              }}
            />
          )}

          {(parsed.sourceType === 'mp4' || parsed.sourceType === 'hls' || parsed.sourceType === 'unknown') && (
            <Html5Player
              url={parsed.directUrl}
              isHls={parsed.sourceType === 'hls'}
              isPlaying={isPlaying}
              currentTime={currentTime}
              volume={volume}
              isMuted={isMuted}
              playbackRate={playbackRate}
              onTimeUpdate={handleTimeUpdate}
              onPlayStateChange={(playing) => {
                if (playing !== isPlaying) onPlayToggle();
              }}
              onEnded={onEnded}
              onDurationChange={(d) => {
                setDuration(d);
                if (onDurationChange) onDurationChange(d);
              }}
            />
          )}

          {parsed.sourceType === 'drive' && (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <iframe
                src={parsed.directUrl}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      {/* 3. Player HUD Controls */}
      {currentItem && (
        <PlayerHud
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          playbackRate={playbackRate}
          isFullscreen={isFullscreen}
          isQueueOpen={isQueueOpen}
          isChatOpen={isChatOpen}
          queueCount={queueCount}
          unreadChatCount={unreadChatCount}
          onPlayToggle={onPlayToggle}
          onSeek={onSeek}
          onVolumeChange={setVolume}
          onMuteToggle={() => setIsMuted(!isMuted)}
          onRateChange={setPlaybackRate}
          onFullscreenToggle={toggleFullscreen}
          onToggleQueue={onToggleQueue}
          onToggleChat={onToggleChat}
          onPrev={onPrev}
          onNext={onNext}
          canPrev={canPrev}
          canNext={canNext}
        />
      )}
    </div>
  );
};
