'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SelfDestructBannerProps {
  countdown: number;
}

export const SelfDestructBanner: React.FC<SelfDestructBannerProps> = ({ countdown }) => {
  return (
    <div className="w-full bg-crimson text-white px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider animate-pulse shadow-[0_0_20px_rgba(230,57,70,0.6)] z-40">
      <AlertTriangle size={18} className="shrink-0" />
      <span>
        SELF-DESTRUCT SEQUENCE ARMED — Room obliteration in{' '}
        <span className="font-mono underline text-sm">{countdown}s</span>
      </span>
    </div>
  );
};
