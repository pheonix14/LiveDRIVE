import React from 'react';
import { SourceType } from '@/types/playlist';

interface BadgeProps {
  sourceType?: SourceType;
  children?: React.ReactNode;
  variant?: 'gold' | 'mint' | 'crimson' | 'muted';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  sourceType,
  children,
  variant,
  className = '',
}) => {
  if (sourceType) {
    const config: Record<SourceType, { label: string; color: string }> = {
      youtube: { label: 'YT', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
      vimeo: { label: 'VIMEO', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
      hls: { label: 'HLS', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      mp4: { label: 'MP4', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      drive: { label: 'DRIVE', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      unknown: { label: 'STREAM', color: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30' },
    };
    const c = config[sourceType] || config.unknown;
    return (
      <span
        className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded border uppercase ${c.color} ${className}`}
      >
        {c.label}
      </span>
    );
  }

  const variants = {
    gold: 'bg-gold/15 text-gold border-gold/30',
    mint: 'bg-mint/15 text-mint border-mint/30',
    crimson: 'bg-crimson/15 text-crimson border-crimson/30',
    muted: 'bg-white/5 text-cream-muted border-white/10',
  };

  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-flex items-center gap-1.5 ${
        variants[variant || 'gold']
      } ${className}`}
    >
      {children}
    </span>
  );
};
