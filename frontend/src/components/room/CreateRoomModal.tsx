'use client';

import React, { useState } from 'react';
import { Film, Clock, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoomSettings } from '@/types/room';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (data: {
    title: string;
    genre: string;
    initialUrl?: string;
    settings: RoomSettings;
  }) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
}) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Movie Night');
  const [initialUrl, setInitialUrl] = useState('');
  const [lifetime, setLifetime] = useState<RoomSettings['lifetime']>('3hours');
  const [selfDestruct, setSelfDestruct] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateRoom({
      title: title.trim(),
      genre,
      initialUrl: initialUrl.trim() || undefined,
      settings: {
        lifetime,
        selfDestruct,
        selfDestructCountdown: 60,
      },
    });

    onClose();
  };

  const sampleGenres = ['Movie Night', 'Anime', 'Sci-Fi', 'Horror', 'Music Videos', 'Gaming'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Screening Theater">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-muted mb-1.5">
            Theater Room Title *
          </label>
          <Input
            required
            placeholder="e.g. Blade Runner 2049 Watchalong"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Genre Tags */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-muted mb-1.5">
            Category / Mood
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {sampleGenres.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGenre(g)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                  genre === g
                    ? 'bg-gold text-bg font-bold border-gold shadow-[0_0_10px_rgba(242,193,46,0.3)]'
                    : 'bg-white/5 text-cream-muted border-white/5 hover:border-gold/20 hover:text-cream'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <Input
            placeholder="Or type custom genre..."
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
        </div>

        {/* Initial Video URL */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-muted mb-1.5 flex items-center gap-1.5">
            <Film size={14} className="text-gold" />
            Initial Video URL (Optional)
          </label>
          <Input
            type="url"
            placeholder="Paste YouTube, Vimeo, MP4, HLS link..."
            value={initialUrl}
            onChange={(e) => setInitialUrl(e.target.value)}
          />
        </div>

        {/* Lifetime Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-muted mb-1.5 flex items-center gap-1.5">
            <Clock size={14} className="text-gold" />
            Room Lifetime
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['1hour', '3hours', '24hours'] as const).map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setLifetime(opt)}
                className={`text-xs py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                  lifetime === opt
                    ? 'bg-gold/15 text-gold border-gold'
                    : 'bg-white/5 text-cream-muted border-white/5 hover:bg-white/10 hover:text-cream'
                }`}
              >
                {opt === '1hour' ? '1 Hour' : opt === '3hours' ? '3 Hours' : '24 Hours'}
              </button>
            ))}
          </div>
        </div>

        {/* Self-Destruct checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="createSelfDestruct"
            checked={selfDestruct}
            onChange={(e) => setSelfDestruct(e.target.checked)}
            className="w-4 h-4 rounded accent-crimson bg-bg-card border-white/10 cursor-pointer"
          />
          <label
            htmlFor="createSelfDestruct"
            className="text-xs text-cream-muted cursor-pointer select-none"
          >
            Arm self-destruct upon host exit
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
          <Button type="button" variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gold" disabled={!title.trim()}>
            <Sparkles size={16} />
            Launch Theater
          </Button>
        </div>
      </form>
    </Modal>
  );
};
