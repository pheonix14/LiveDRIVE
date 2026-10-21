import { MediaItem } from './playlist';

export interface RoomSettings {
  maxMembers?: number;
  lifetime: '1hour' | '3hours' | '24hours' | 'permanent';
  selfDestruct: boolean;
  selfDestructCountdown: number; // in seconds
  signalingUrl?: string;
}

export interface RoomMember {
  id: string;
  name: string;
  color: string;
  joinedAt: number;
  isHost: boolean;
}

export interface RoomState {
  code: string;
  title: string;
  genre?: string;
  hostId: string;
  hostName: string;
  settings: RoomSettings;
  createdAt: number;
  expiresAt: number;
  playlist: MediaItem[];
  currentIndex: number;
  currentPlaybackPos: number;
  isPlaying: boolean;
  members: RoomMember[];
}
