import React from 'react';

export const EqualizerBars: React.FC<{ isPlaying?: boolean }> = ({ isPlaying = true }) => {
  return (
    <div className="flex items-end gap-[2px] h-4 w-4 justify-center">
      <span
        className={`w-1 bg-gold rounded-full transition-all ${
          isPlaying ? 'animate-eq-1' : 'h-1.5'
        }`}
      />
      <span
        className={`w-1 bg-gold rounded-full transition-all ${
          isPlaying ? 'animate-eq-2' : 'h-3'
        }`}
      />
      <span
        className={`w-1 bg-gold rounded-full transition-all ${
          isPlaying ? 'animate-eq-3' : 'h-2'
        }`}
      />
    </div>
  );
};
