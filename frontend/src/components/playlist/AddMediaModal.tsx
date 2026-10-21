'use client';

import React, { useState } from 'react';
import { Plus, Link2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, title?: string) => Promise<void>;
}

export const AddMediaModal: React.FC<AddMediaModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [url, setUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      await onAdd(url.trim(), customTitle.trim() || undefined);
      setUrl('');
      setCustomTitle('');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Media to Queue">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-muted mb-1.5">
            Video Source URL
          </label>
          <Input
            type="url"
            required
            icon={<Link2 size={16} />}
            placeholder="https://www.youtube.com/watch?v=... or MP4/HLS link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-[11px] text-cream-darker mt-1">
            Supports YouTube, Vimeo, direct MP4, HLS (.m3u8), and Google Drive.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-muted mb-1.5">
            Custom Title (Optional)
          </label>
          <Input
            placeholder="Leave empty to auto-resolve from source"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="subtle" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="gold" disabled={isLoading || !url.trim()}>
            <Plus size={16} />
            {isLoading ? 'Resolving...' : 'Add to Queue'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
