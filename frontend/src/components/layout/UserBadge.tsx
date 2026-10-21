'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Check, Edit2 } from 'lucide-react';
import { useIdentity } from '@/context/IdentityContext';

export const UserBadge: React.FC = () => {
  const { identity, regenerateIdentity, updateColor, updateUsername } = useIdentity();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const colors = [
    '#F2C12E', // Cyber Gold
    '#5DCAA5', // Mint Synced
    '#E63946', // Neon Crimson
    '#38BDF8', // Cyan
    '#A78BFA', // Violet
    '#F472B6', // Pink
    '#FB923C', // Orange
    '#4ADE80', // Emerald
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateUsername(nameInput.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setNameInput(identity.username);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 transition-all text-xs font-semibold text-cream"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
          style={{ backgroundColor: identity.color }}
        />
        <span>{identity.username}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-bg-card border border-bg-border rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <span className="text-xs font-bold text-cream uppercase tracking-wider">
              Your Persona
            </span>
            <button
              onClick={() => {
                regenerateIdentity();
                setNameInput('');
              }}
              title="Regenerate Anonymous Identity"
              className="text-cream-muted hover:text-gold p-1 rounded hover:bg-white/5 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Edit Nickname */}
          <div className="mb-3">
            {isEditing ? (
              <form onSubmit={handleSaveName} className="flex gap-1.5">
                <input
                  type="text"
                  maxLength={24}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-bg-subtle text-xs px-2.5 py-1.5 rounded border border-gold/40 text-cream outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-gold text-bg px-2 rounded font-bold hover:bg-gold-hover"
                >
                  <Check size={14} />
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between bg-bg-subtle/50 px-2.5 py-1.5 rounded-lg border border-white/5">
                <span className="text-xs font-medium text-cream">{identity.username}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-cream-muted hover:text-gold p-1"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Color palette */}
          <div>
            <span className="text-[10px] text-cream-darker uppercase tracking-wider block mb-2 font-semibold">
              Accent Color
            </span>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => updateColor(c)}
                  className={`h-7 rounded-lg transition-transform flex items-center justify-center ${
                    identity.color === c ? 'scale-110 ring-2 ring-white/50' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {identity.color === c && <Check size={12} className="text-black stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
