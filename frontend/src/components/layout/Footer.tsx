'use client';

import React, { useState } from 'react';
import { Heart, Copy, Check } from 'lucide-react';
import { DONATION_LTC_ADDRESS, APP_NAME, APP_VERSION } from '@/lib/constants';

export const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(DONATION_LTC_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <footer className="w-full border-t border-white/5 bg-bg-subtle/50 text-xs text-cream-muted py-12 mt-20 select-none">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-cream text-base tracking-wider">
              {APP_NAME}
            </span>
            <span className="text-[10px] bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 rounded-full font-mono">
              {APP_VERSION}
            </span>
          </div>
          <p className="text-cream-darker text-[11px]">
            Privacy-first, zero-registration synchronized theater for everyone.
          </p>
        </div>

        {/* Support LTC Donation */}
        <div className="flex flex-col items-center md:items-end gap-1.5">
          <div className="flex items-center gap-1.5 text-cream-muted text-xs">
            <Heart size={13} className="text-crimson fill-crimson" />
            <span>Support Open Source Relay Infrastructure:</span>
          </div>
          <div
            onClick={copyAddress}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card border border-white/10 hover:border-gold/40 text-cream cursor-pointer transition-colors group"
            title="Click to copy LTC address"
          >
            <span className="text-[10px] font-mono text-gold truncate max-w-[220px] sm:max-w-[280px]">
              {DONATION_LTC_ADDRESS}
            </span>
            <button className="text-cream-muted group-hover:text-gold transition-colors">
              {copied ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
