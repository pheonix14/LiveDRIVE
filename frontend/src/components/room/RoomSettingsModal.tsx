'use client';

import React, { useState } from 'react';
import { ShieldAlert, Server, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoomSettings } from '@/types/room';

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RoomSettings;
  isSelfDestructArmed: boolean;
  onUpdateSettings: (newSettings: Partial<RoomSettings>) => void;
  onArmSelfDestruct: (seconds: number) => void;
  onDisarmSelfDestruct: () => void;
}

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  isSelfDestructArmed,
  onUpdateSettings,
  onArmSelfDestruct,
  onDisarmSelfDestruct,
}) => {
  const [signalingUrl, setSignalingUrl] = useState(settings.signalingUrl || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ signalingUrl: signalingUrl.trim() || undefined });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Screening Room Settings">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Custom Signaling Relay */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-muted mb-1.5 flex items-center gap-1.5">
            <Server size={14} className="text-gold" />
            Signaling Relay URL
          </label>
          <Input
            placeholder="ws://localhost:8765/room (leave empty for auto public fallback)"
            value={signalingUrl}
            onChange={(e) => setSignalingUrl(e.target.value)}
          />
          <p className="text-[11px] text-cream-darker mt-1">
            Connect to custom local Python relay (`server.py`) or public SocketsBay mesh.
          </p>
        </div>

        {/* Self-Destruct Control */}
        <div className="p-3.5 rounded-xl border border-crimson/30 bg-crimson/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-crimson" />
              <span className="text-xs font-bold uppercase text-crimson">Self-Destruct Sequence</span>
            </div>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                isSelfDestructArmed ? 'bg-crimson text-white' : 'bg-white/5 text-cream-darker'
              }`}
            >
              {isSelfDestructArmed ? 'Armed' : 'Disarmed'}
            </span>
          </div>
          <p className="text-[11px] text-cream-muted mb-3 leading-relaxed">
            Arming self-destruct starts a 60-second synchronized countdown after which the room session is permanently closed.
          </p>
          {isSelfDestructArmed ? (
            <Button
              type="button"
              variant="subtle"
              size="sm"
              onClick={onDisarmSelfDestruct}
              className="w-full text-xs"
            >
              Disarm Sequence
            </Button>
          ) : (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onArmSelfDestruct(60)}
              className="w-full text-xs"
            >
              Arm Self-Destruct (60s)
            </Button>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gold">
            {isSaved ? <Check size={16} /> : 'Save Settings'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
