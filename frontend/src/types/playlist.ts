export type SourceType = 'youtube' | 'vimeo' | 'hls' | 'mp4' | 'drive' | 'unknown';

export type LoopMode = 'none' | 'one' | 'all';

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  sourceType: SourceType;
  duration?: number;
  addedBy?: string;
  addedAt?: number;
  thumbnail?: string;
}
