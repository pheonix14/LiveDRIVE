'use client';

import { useState, useEffect } from 'react';
import { RoomSettings } from '@/types/room';

interface UseRoomTimerProps {
  createdAt: number;
  settings: RoomSettings;
  onRoomExpired?: () => void;
  onSelfDestructTriggered?: () => void;
}

export function useRoomTimer({
  createdAt,
  settings,
  onRoomExpired,
  onSelfDestructTriggered,
}: UseRoomTimerProps) {
  const [msRemaining, setMsRemaining] = useState<number>(0);
  const [isSelfDestructArmed, setIsSelfDestructArmed] = useState<boolean>(settings.selfDestruct);
  const [destructCountdown, setDestructCountdown] = useState<number>(settings.selfDestructCountdown || 60);

  // Compute lifetime in milliseconds
  useEffect(() => {
    let durationMs = 60 * 60 * 1000; // 1 hour
    if (settings.lifetime === '3hours') durationMs = 3 * 60 * 60 * 1000;
    if (settings.lifetime === '24hours') durationMs = 24 * 60 * 60 * 1000;
    if (settings.lifetime === 'permanent') durationMs = Infinity;

    const expiresAt = createdAt + durationMs;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = expiresAt - now;

      if (durationMs !== Infinity && remaining <= 0) {
        setMsRemaining(0);
        clearInterval(interval);
        if (onRoomExpired) onRoomExpired();
      } else {
        setMsRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, settings.lifetime, onRoomExpired]);

  // Self destruct timer
  useEffect(() => {
    if (!isSelfDestructArmed) return;

    const interval = setInterval(() => {
      setDestructCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onSelfDestructTriggered) onSelfDestructTriggered();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSelfDestructArmed, onSelfDestructTriggered]);

  const armSelfDestruct = (seconds: number = 60) => {
    setDestructCountdown(seconds);
    setIsSelfDestructArmed(true);
  };

  const disarmSelfDestruct = () => {
    setIsSelfDestructArmed(false);
  };

  return {
    msRemaining,
    isPermanent: settings.lifetime === 'permanent',
    isSelfDestructArmed,
    destructCountdown,
    armSelfDestruct,
    disarmSelfDestruct,
  };
}
