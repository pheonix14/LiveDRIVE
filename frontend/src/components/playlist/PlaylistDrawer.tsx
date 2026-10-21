'use client';

import React, { useState, useRef } from 'react';
import { X, Plus, Repeat, Shuffle, Trash2 } from 'lucide-react';
import { MediaItem, LoopMode } from '@/types/playlist';
import { PlaylistItem } from './PlaylistItem';
import { Button } from '@/components/ui/Button';
import { AddMediaModal } from './AddMediaModal';

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  currentIndex: number;
  isPlaying: boolean;
  loopMode: LoopMode;
  isShuffle: boolean;
  onPlayIndex: (index: number) => void;
  onRemoveItem: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
  onClear: () => void;
  onAddItem: (url: string, title?: string) => Promise<MediaItem>;
}

export const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currentIndex,
  isPlaying,
  loopMode,
  isShuffle,
  onPlayIndex,
  onRemoveItem,
  onReorder,
  onToggleLoop,
  onToggleShuffle,
  onClear,
  onAddItem,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const dragItemIndex = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (dragItemIndex.current !== null && dragItemIndex.current !== targetIndex) {
      onReorder(dragItemIndex.current, targetIndex);
    }
    dragItemIndex.current = null;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-bg-subtle/95 backdrop-blur-xl border-l border-bg-border z-50 flex flex-col shadow-2xl transition-transform animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold font-display text-cream tracking-wider">
              QUEUE ({items.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-cream-muted hover:text-cream p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar (Loop, Shuffle, Clear, Add) */}
        <div className="flex items-center justify-between p-3 border-b border-white/5 bg-bg-card/40">
          <div className="flex items-center gap-1.5">
            {/* Loop Button */}
            <button
              onClick={onToggleLoop}
              title={`Loop mode: ${loopMode}`}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                loopMode !== 'none'
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'text-cream-muted hover:text-cream hover:bg-white/5'
              }`}
            >
              <Repeat size={14} />
              <span className="text-[10px] uppercase font-bold">
                {loopMode === 'one' ? '1' : loopMode === 'all' ? 'All' : 'Off'}
              </span>
            </button>

            {/* Shuffle Button */}
            <button
              onClick={onToggleShuffle}
              title={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                isShuffle
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'text-cream-muted hover:text-cream hover:bg-white/5'
              }`}
            >
              <Shuffle size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="text-cream-muted hover:text-crimson p-1.5 rounded-lg text-xs hover:bg-white/5 transition-all flex items-center gap-1"
                title="Clear queue"
              >
                <Trash2 size={13} />
                <span className="text-[11px]">Clear</span>
              </button>
            )}

            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="py-1 px-2.5 text-xs"
            >
              <Plus size={14} />
              Add
            </Button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-cream-muted">
              <p className="text-sm font-medium mb-1">Queue is empty</p>
              <p className="text-xs text-cream-darker mb-4">
                Add media links or choose from public rooms.
              </p>
              <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={14} />
                Add First Media
              </Button>
            </div>
          ) : (
            items.map((item, index) => (
              <PlaylistItem
                key={item.id}
                item={item}
                index={index}
                isActive={index === currentIndex}
                isPlaying={isPlaying}
                onPlay={() => onPlayIndex(index)}
                onRemove={() => onRemoveItem(item.id)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))
          )}
        </div>
      </aside>

      <AddMediaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (url, title) => {
          await onAddItem(url, title);
        }}
      />
    </>
  );
};
