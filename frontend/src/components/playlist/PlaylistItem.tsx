'use client';

import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { MediaItem } from '@/types/playlist';
import { Badge } from '@/components/ui/Badge';
import { EqualizerBars } from './EqualizerBars';

interface PlaylistItemProps {
  item: MediaItem;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
}

export const PlaylistItem: React.FC<PlaylistItemProps> = ({
  item,
  index,
  isActive,
  isPlaying,
  onPlay,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`group flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
        isActive
          ? 'bg-gold/10 border-gold/40 shadow-[0_0_15px_rgba(242,193,46,0.15)]'
          : 'bg-bg-card/60 border-white/5 hover:border-gold/20 hover:bg-bg-elevated'
      }`}
      onClick={onPlay}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {/* Drag Handle */}
        <div
          className="text-cream-darker group-hover:text-cream-muted cursor-grab active:cursor-grabbing p-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>

        {/* Index or Equalizer */}
        <div className="w-5 flex items-center justify-center">
          {isActive ? (
            <EqualizerBars isPlaying={isPlaying} />
          ) : (
            <span className="text-xs font-mono font-bold text-cream-darker">
              {(index + 1).toString().padStart(2, '0')}
            </span>
          )}
        </div>

        {/* Title and Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge sourceType={item.sourceType} />
            <span
              className={`text-xs font-medium truncate ${
                isActive ? 'text-gold font-semibold' : 'text-cream group-hover:text-cream'
              }`}
            >
              {item.title}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover:opacity-100 text-cream-muted hover:text-crimson p-1.5 rounded-lg hover:bg-white/5 transition-all"
        title="Remove from queue"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
