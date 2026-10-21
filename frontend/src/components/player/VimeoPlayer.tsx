'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Vimeo?: any;
  }
}

interface VimeoPlayerProps {
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onEnded: () => void;
  onDurationChange: (duration: number) => void;
}

export const VimeoPlayer: React.FC<VimeoPlayerProps> = ({
  videoId,
  isPlaying,
  currentTime,
  volume,
  isMuted,
  playbackRate,
  onTimeUpdate,
  onPlayStateChange,
  onEnded,
  onDurationChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const isReadyRef = useRef<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;

    const initVimeo = () => {
      if (!window.Vimeo || !containerRef.current) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          //
        }
      }

      const player = new window.Vimeo.Player(containerRef.current, {
        id: videoId,
        autoplay: true,
        controls: false,
        responsive: true,
      });
      playerRef.current = player;

      player.ready().then(() => {
        if (!isSubscribed) return;
        isReadyRef.current = true;
        player.getDuration().then((dur: number) => {
          onDurationChange(dur);
        });
        if (isPlaying) player.play().catch(console.warn);
      });

      player.on('play', () => {
        if (isSubscribed) onPlayStateChange(true);
      });

      player.on('pause', () => {
        if (isSubscribed) onPlayStateChange(false);
      });

      player.on('ended', () => {
        if (isSubscribed) onEnded();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      player.on('timeupdate', (data: any) => {
        if (isSubscribed && data) {
          onTimeUpdate(data.seconds, data.duration);
        }
      });
    };

    if (window.Vimeo) {
      initVimeo();
    } else {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      script.onload = initVimeo;
      document.body.appendChild(script);
    }

    return () => {
      isSubscribed = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          //
        }
        playerRef.current = null;
      }
      isReadyRef.current = false;
    };
  }, [videoId]);

  // Sync play/pause
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !isReadyRef.current) return;
    if (isPlaying) p.play().catch(console.warn);
    else p.pause().catch(console.warn);
  }, [isPlaying]);

  // Sync seek
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !isReadyRef.current) return;
    p.getCurrentTime().then((current: number) => {
      if (Math.abs(current - currentTime) > 2) {
        p.setCurrentTime(currentTime).catch(console.warn);
      }
    });
  }, [currentTime]);

  // Sync volume & mute
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !isReadyRef.current) return;
    p.setVolume(isMuted ? 0 : volume).catch(console.warn);
  }, [volume, isMuted]);

  // Sync rate
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !isReadyRef.current) return;
    p.setPlaybackRate(playbackRate).catch(console.warn);
  }, [playbackRate]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
