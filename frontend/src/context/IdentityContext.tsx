'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserIdentity } from '@/types/chat';
import { generateAnonymousIdentity, getOrSetStoredIdentity, saveIdentity } from '@/lib/nameGenerator';

interface IdentityContextType {
  identity: UserIdentity;
  regenerateIdentity: () => void;
  updateColor: (color: string) => void;
  updateUsername: (username: string) => void;
}

const IdentityContext = createContext<IdentityContextType | null>(null);

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = useState<UserIdentity>({
    username: 'Anonymous',
    color: '#F2C12E',
    userId: 'init_user',
  });

  useEffect(() => {
    const loaded = getOrSetStoredIdentity();
    setIdentity(loaded);
  }, []);

  const regenerateIdentity = () => {
    const newId = generateAnonymousIdentity();
    setIdentity(newId);
    saveIdentity(newId);
  };

  const updateColor = (color: string) => {
    const updated = { ...identity, color };
    setIdentity(updated);
    saveIdentity(updated);
  };

  const updateUsername = (username: string) => {
    const trimmed = username.trim();
    if (!trimmed) return;
    const updated = { ...identity, username: trimmed };
    setIdentity(updated);
    saveIdentity(updated);
  };

  return (
    <IdentityContext.Provider
      value={{
        identity,
        regenerateIdentity,
        updateColor,
        updateUsername,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export const useIdentity = () => {
  const ctx = useContext(IdentityContext);
  if (!ctx) {
    throw new Error('useIdentity must be used within an IdentityProvider');
  }
  return ctx;
};
