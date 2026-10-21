'use client';

import React, { useState } from 'react';
import { Film, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateOverlayProps {
  onAddMedia: (url: string) => void;
}

export const EmptyStateOverlay: React.FC<EmptyStateOverlayProps> = ({ onAddMedia }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAddMedia(url.trim());
    setUrl('');
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-bg/95 via-bg/90 to-bg border border-gold/15 rounded-xl backdrop-blur-md select-none">
      <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-4 shadow-[0_0_30px_rgba(242,193,46,0.15)]">
        <Film size={32} />
      </div>

      <h2 className="text-2xl font-bold font-display text-cream tracking-wide mb-2">
        NO MEDIA IN SCREENING QUEUE
      </h2>
      <p className="text-sm text-cream-muted max-w-md text-center mb-6 leading-relaxed">
        Paste any YouTube, Vimeo, direct MP4/WebM, HLS stream, or Google Drive link below to broadcast to everyone in the theater.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-lg flex gap-2">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste video source URL..."
          className="flex-1 bg-bg-card border border-gold/30 rounded-xl px-4 py-3 text-sm text-cream placeholder-cream-darker focus:border-gold focus:ring-1 focus:ring-gold/50 outline-none transition-all shadow-inner"
        />
        <Button type="submit" variant="gold" size="lg" className="whitespace-nowrap">
          <Plus size={18} />
          Load & Sync
        </Button>
      </form>
    </div>
  );
};
