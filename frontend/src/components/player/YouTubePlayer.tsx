'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YouTubePlayerProps {
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

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
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
  const containerId = useRef(`yt_player_${Math.random().toString(36).substring(2, 9)}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const isReadyRef = useRef<boolean>(false);
  const internalStateChangeRef = useRef<boolean>(false);

  // Initialize YT API
  useEffect(() => {
    let tickerInterval: NodeJS.Timeout | null = null;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          //
        }
      }

      playerRef.current = new window.YT.Player(containerId.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            isReadyRef.current = true;
            const p = playerRef.current;
            if (p) {
              if (p.getDuration) onDurationChange(p.getDuration());
              if (isPlaying) p.playVideo();
              else p.pauseVideo();
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (event: any) => {
            const YT = window.YT;
            if (!YT) return;

            if (event.data === YT.PlayerState.PLAYING) {
              if (!internalStateChangeRef.current) {
                onPlayStateChange(true);
              }
            } else if (event.data === YT.PlayerState.PAUSED) {
              if (!internalStateChangeRef.current) {
                onPlayStateChange(false);
              }
            } else if (event.data === YT.PlayerState.ENDED) {
              onEnded();
            }
          },
        },
      });

      // Polling time updates
      tickerInterval = setInterval(() => {
        const p = playerRef.current;
        if (p && isReadyRef.current && p.getCurrentTime && p.getDuration) {
          try {
            const cur = p.getCurrentTime();
            const dur = p.getDuration();
            onTimeUpdate(cur, dur);
          } catch {
            //
          }
        }
      }, 500);
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        setupPlayer();
      };

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    }

    return () => {
      if (tickerInterval) clearInterval(tickerInterval);
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

    internalStateChangeRef.current = true;
    if (isPlaying) {
      p.playVideo();
    } else {
      p.pauseVideo();
    }
    setTimeout(() => {
      internalStateChangeRef.current = false;
    }, 250);
  }, [isPlaying]);

  // Sync seek
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !isReadyRef.current || !p.getCurrentTime) return;
    try {
      const current = p.getCurrentTime();
      if (Math.abs(current - currentTime) > 2) {
        p.seekTo(currentTime, true);
      }
    } catch {
      //
    }
  }, [currentTime]);

  // Sync volume / mute
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !isReadyRef.current) return;
    try {
      if (isMuted) {
        p.mute();
      } else {
        p.unMute();
        p.setVolume(Math.round(volume * 100));
      }
    } catch {
      //
    }
  }, [volume, isMuted]);

  // Sync rate
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !isReadyRef.current || !p.setPlaybackRate) return;
    try {
      p.setPlaybackRate(playbackRate);
    } catch {
      //
    }
  }, [playbackRate]);

  return (
    <div className="w-full h-full relative pointer-events-none">
      <div id={containerId.current} className="w-full h-full pointer-events-auto" />
    </div>
  );
};
