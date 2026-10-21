import { MediaItem } from './playlist';

export type SyncActionType =
  | 'play'
  | 'pause'
  | 'seek'
  | 'change_video'
  | 'sync_state'
  | 'chat_message'
  | 'playlist_update'
  | 'user_join'
  | 'user_leave'
  | 'heartbeat';

export interface SyncPayload {
  type: SyncActionType;
  senderId: string;
  senderName?: string;
  senderColor?: string;
  timestamp: number;
  position?: number;
  isPlaying?: boolean;
  videoUrl?: string;
  activeItem?: MediaItem;
  playlist?: MediaItem[];
  currentIndex?: number;
  messageText?: string;
  roomLifetime?: string;
  roomSelfDestruct?: boolean;
  hostId?: string;
}
