'use client';

export type BackendType = 'render' | 'termux' | 'localhost' | 'mesh' | 'custom';

export interface BackendConfig {
  type: BackendType;
  customUrl?: string;
}

const STORAGE_KEY = 'livedrive_backend_config';
export const DEFAULT_RENDER_URL = 'https://livedrive.onrender.com';
export const DEFAULT_SOCKETS_BAY_BASE = 'wss://socketsbay.com/wss/v2/1/livedrive-';

export function getStoredBackendConfig(): BackendConfig {
  if (typeof window === 'undefined') {
    return { type: 'mesh' };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.type) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read backend config from localStorage', e);
  }

  // Default detection:
  // If running on localhost or 127.0.0.1, default to localhost backend
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return { type: 'localhost' };
  }

  // On GitHub Pages or public web, default to Render Cloud Relay with fallback to SocketsBay
  return { type: 'render', customUrl: DEFAULT_RENDER_URL };
}

export function saveBackendConfig(config: BackendConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Could not save backend config to localStorage', e);
  }
}

/**
 * Resolves the full WebSocket signaling URL for a room code based on backend configuration.
 */
export function resolveWebSocketUrl(config: BackendConfig, roomCode: string): string {
  const room = roomCode.toLowerCase().trim();

  switch (config.type) {
    case 'render': {
      let url = config.customUrl?.trim() || DEFAULT_RENDER_URL;
      url = url.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      return `wss://${url}/ws/${room}`;
    }

    case 'localhost': {
      return `ws://localhost:8765/${room}`;
    }

    case 'termux': {
      let raw = config.customUrl?.trim() || '192.168.1.100:8765';
      if (raw.startsWith('wss://') || raw.startsWith('ws://')) {
        const clean = raw.replace(/\/+$/, '');
        return clean.includes('/ws/') ? `${clean}/${room}` : `${clean}/${room}`;
      }
      if (raw.includes('trycloudflare.com') || raw.includes('ngrok')) {
        const clean = raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
        return `wss://${clean}/ws/${room}`;
      }
      const clean = raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      return `ws://${clean}/${room}`;
    }

    case 'custom': {
      const raw = config.customUrl?.trim() || '';
      if (!raw) return `${DEFAULT_SOCKETS_BAY_BASE}${room}/`;
      if (raw.startsWith('ws://') || raw.startsWith('wss://')) {
        return raw.endsWith('/') ? `${raw}${room}` : `${raw}/${room}`;
      }
      const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const clean = raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      return `${protocol}//${clean}/${room}`;
    }

    case 'mesh':
    default:
      return `${DEFAULT_SOCKETS_BAY_BASE}${room}/`;
  }
}

/**
 * Actively pings a WebSocket URL to test connectivity and measure latency.
 */
export function testBackendConnection(
  wsUrl: string,
  timeoutMs: number = 4000
): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let socket: WebSocket | null = null;
    let timer: NodeJS.Timeout | null = null;

    try {
      socket = new WebSocket(wsUrl);

      timer = setTimeout(() => {
        if (socket) {
          socket.close();
        }
        resolve({
          success: false,
          latencyMs: timeoutMs,
          error: 'Connection timed out',
        });
      }, timeoutMs);

      socket.onopen = () => {
        const latency = Date.now() - startTime;
        if (timer) clearTimeout(timer);
        socket?.close();
        resolve({
          success: true,
          latencyMs: latency,
        });
      };

      socket.onerror = () => {
        if (timer) clearTimeout(timer);
        socket?.close();
        resolve({
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'Could not connect (Check URL, SSL, or Mixed Content)',
        });
      };
    } catch (err: unknown) {
      if (timer) clearTimeout(timer);
      resolve({
        success: false,
        latencyMs: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });
}
