import { SourceType } from '@/types/playlist';

export interface ParsedMediaUrl {
  sourceType: SourceType;
  videoId?: string;
  directUrl: string;
  originalUrl: string;
}

export function parseMediaUrl(url: string): ParsedMediaUrl {
  const trimmed = url.trim();

  // 1. YouTube
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      sourceType: 'youtube',
      videoId: ytMatch[1],
      directUrl: `https://www.youtube.com/watch?v=${ytMatch[1]}`,
      originalUrl: trimmed,
    };
  }

  // 2. Vimeo
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      sourceType: 'vimeo',
      videoId: vimeoMatch[1],
      directUrl: `https://vimeo.com/${vimeoMatch[1]}`,
      originalUrl: trimmed,
    };
  }

  // 3. Google Drive
  const gDriveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/i);
  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return {
      sourceType: 'drive',
      videoId: fileId,
      directUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      originalUrl: trimmed,
    };
  }

  // 4. HLS Stream
  if (trimmed.includes('.m3u8')) {
    return {
      sourceType: 'hls',
      directUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  // 5. Direct Video
  const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.mkv'];
  if (videoExts.some(ext => trimmed.toLowerCase().includes(ext))) {
    return {
      sourceType: 'mp4',
      directUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  // Default fallback (e.g. direct stream or unknown)
  return {
    sourceType: 'unknown',
    directUrl: trimmed,
    originalUrl: trimmed,
  };
}

/**
 * Fetches oEmbed title client-side via noembed.com (CORS friendly)
 */
export async function fetchVideoTitle(url: string): Promise<string> {
  const parsed = parseMediaUrl(url);

  if (parsed.sourceType === 'youtube' || parsed.sourceType === 'vimeo') {
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(parsed.directUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          return data.title;
        }
      }
    } catch {
      // Fallback
    }
  }

  if (parsed.sourceType === 'youtube' && parsed.videoId) {
    return `YouTube Video [${parsed.videoId}]`;
  }
  if (parsed.sourceType === 'vimeo' && parsed.videoId) {
    return `Vimeo Stream [${parsed.videoId}]`;
  }
  if (parsed.sourceType === 'drive') {
    return 'Google Drive Video';
  }
  if (parsed.sourceType === 'hls') {
    return 'Live HLS Stream';
  }

  // Extract filename if possible
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      const last = parts[parts.length - 1];
      return decodeURIComponent(last);
    }
  } catch {
    //
  }

  return 'Watch Stream';
}
