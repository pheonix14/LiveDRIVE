import { UserIdentity } from '@/types/chat';

const ADJECTIVES = [
  'Cyber',
  'Neon',
  'Midnight',
  'Cinema',
  'Velvet',
  'Solar',
  'Echo',
  'Phantom',
  'Retro',
  'Quantum',
  'Vivid',
  'Cosmic',
  'Shadow',
  'Hyper',
  'Glitch',
];

const NOUNS = [
  'Reel',
  'Spectator',
  'Projection',
  'Nomad',
  'Wave',
  'Spark',
  'Vanguard',
  'Cinephile',
  'Drifter',
  'Lens',
  'Aura',
  'Voyager',
  'Pulse',
  'Watcher',
];

const ACCENT_COLORS = [
  '#F2C12E', // Cyber Gold
  '#5DCAA5', // Mint Synced
  '#E63946', // Neon Crimson
  '#38BDF8', // Cyan
  '#A78BFA', // Electric Violet
  '#F472B6', // Sakura Pink
  '#FB923C', // Amber Orange
  '#4ADE80', // Emerald Green
];

const STORAGE_KEY = 'livedrive_identity';

export function generateAnonymousIdentity(): UserIdentity {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  const color = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
  const userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    username: `${adj}${noun}_${num}`,
    color,
    userId,
  };
}

export function getOrSetStoredIdentity(): UserIdentity {
  if (typeof window === 'undefined') {
    return { username: 'Anonymous_000', color: '#F2C12E', userId: 'temp_user' };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.username && parsed.color && parsed.userId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read identity from localStorage', e);
  }

  const newIdentity = generateAnonymousIdentity();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIdentity));
  } catch (e) {
    // Ignore storage failure
  }
  return newIdentity;
}

export function saveIdentity(identity: UserIdentity): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch (e) {
    console.warn('Could not save identity to localStorage', e);
  }
}
