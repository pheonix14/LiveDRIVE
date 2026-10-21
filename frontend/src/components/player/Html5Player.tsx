'use client';

import React, { useEffect, useRef } from 'react';

// Declare Hls global for dynamic script loading
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Hls?: any;
  }
}

interface Html5PlayerProps {
  url: string;
  isHls?: boolean;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onEnded: () => void;
  onDurationChange: (duration: number) => void;
  videoRefOut?: (el: HTMLVideoElement | null) => void;
}

export const Html5Player: React.FC<Html5PlayerProps> = ({
  url,
  isHls = false,
  isPlaying,
  currentTime,
  volume,
  isMuted,
  playbackRate,
  onTimeUpdate,
  onPlayStateChange,
  onEnded,
  onDurationChange,
  videoRefOut,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    if (videoRefOut) {
      videoRefOut(videoRef.current);
    }
  }, [videoRefOut]);

  // Load HLS stream if applicable
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    if (isHls || url.includes('.m3u8')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari/iOS)
        video.src = url;
      } else {
        // Load HLS.js via CDN dynamically if not present
        const initHls = () => {
          if (window.Hls && window.Hls.isSupported()) {
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }
            const hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
          } else {
            video.src = url;
          }
        };

        if (window.Hls) {
          initHls();
        } else {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
          script.async = true;
          script.onload = initHls;
          document.body.appendChild(script);
        }
      }
    } else {
      video.src = url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url, isHls]);

  // Handle Play / Pause sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && video.paused) {
      video.play().catch(() => {
        // Autoplay policy fallback: mute and retry
        video.muted = true;
        video.play().catch(console.warn);
      });
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying]);

  // Handle volume & mute
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  // Handle playback rate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  // Seek sync (only if drift > 1.5s)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const diff = Math.abs(video.currentTime - currentTime);
    if (diff > 1.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain bg-black"
      playsInline
      onTimeUpdate={() => {
        const v = videoRef.current;
        if (v) {
          onTimeUpdate(v.currentTime, v.duration || 0);
        }
      }}
      onDurationChange={() => {
        const v = videoRef.current;
        if (v && v.duration) {
          onDurationChange(v.duration);
        }
      }}
      onPlay={() => onPlayStateChange(true)}
      onPause={() => onPlayStateChange(false)}
      onEnded={onEnded}
    />
  );
};
