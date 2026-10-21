'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SyncPayload } from '@/types/sync';
import { useIdentity } from '@/context/IdentityContext';
import {
  BackendConfig,
  getStoredBackendConfig,
  resolveWebSocketUrl,
} from '@/lib/backendConfig';

interface UseSyncSocketProps {
  roomCode: string;
  signalingUrl?: string;
  backendConfig?: BackendConfig;
  onPayloadReceived?: (payload: SyncPayload) => void;
}

export function useSyncSocket({
  roomCode,
  signalingUrl,
  backendConfig,
  onPayloadReceived,
}: UseSyncSocketProps) {
  const { identity } = useIdentity();
  const [connected, setConnected] = useState(false);
  const [syncMethod, setSyncMethod] = useState<'websocket' | 'broadcast_channel' | 'offline'>('offline');
  const [peerCount, setPeerCount] = useState(1);
  const [latency, setLatency] = useState<number>(0);

  const socketRef = useRef<WebSocket | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const callbackRef = useRef(onPayloadReceived);
  callbackRef.current = onPayloadReceived;

  // Track discovered peers
  const peersRef = useRef<Map<string, number>>(new Map());

  const handleIncomingPayload = useCallback(
    (payload: SyncPayload) => {
      // Ignore own messages
      if (payload.senderId === identity.userId) return;

      // Track peer active status
      if (payload.senderId) {
        peersRef.current.set(payload.senderId, Date.now());
        // Clean up stale peers > 15s
        const now = Date.now();
        peersRef.current.forEach((lastSeen, id) => {
          if (now - lastSeen > 15000) {
            peersRef.current.delete(id);
          }
        });
        setPeerCount(Math.max(1, peersRef.current.size + 1));
      }

      if (callbackRef.current) {
        callbackRef.current(payload);
      }
    },
    [identity.userId]
  );

  // Setup BroadcastChannel (multi-tab sync)
  useEffect(() => {
    if (typeof window === 'undefined' || !roomCode) return;

    try {
      const channelName = `livedrive_room_${roomCode.toLowerCase()}`;
      const bc = new BroadcastChannel(channelName);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        try {
          const payload: SyncPayload = event.data;
          handleIncomingPayload(payload);
        } catch (e) {
          console.error('Failed to parse broadcast payload', e);
        }
      };

      setSyncMethod((prev) => (prev === 'websocket' ? 'websocket' : 'broadcast_channel'));
      setConnected(true);

      return () => {
        bc.close();
        broadcastChannelRef.current = null;
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this browser', e);
    }
  }, [roomCode, handleIncomingPayload]);

  // Setup WebSocket Signaling
  useEffect(() => {
    if (typeof window === 'undefined' || !roomCode) return;

    const currentConfig = backendConfig || getStoredBackendConfig();
    const wsUrl = signalingUrl || resolveWebSocketUrl(currentConfig, roomCode);

    let isSubscribed = true;
    let ws: WebSocket | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;
    let pingStart = 0;

    const connect = () => {
      try {
        pingStart = Date.now();
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!isSubscribed) return;
          setLatency(Date.now() - pingStart);
          setConnected(true);
          setSyncMethod('websocket');

          // Announce presence
          const joinPayload: SyncPayload = {
            type: 'user_join',
            senderId: identity.userId,
            senderName: identity.username,
            senderColor: identity.color,
            timestamp: Date.now(),
          };
          ws?.send(JSON.stringify(joinPayload));
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data: SyncPayload = JSON.parse(event.data);
            handleIncomingPayload(data);
          } catch (e) {
            console.error('Failed to parse WS payload', e);
          }
        };

        ws.onerror = () => {
          if (broadcastChannelRef.current) {
            setSyncMethod('broadcast_channel');
          }
        };

        ws.onclose = () => {
          if (!isSubscribed) return;
          if (broadcastChannelRef.current) {
            setSyncMethod('broadcast_channel');
          } else {
            setConnected(false);
          }
          retryTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        console.warn('WebSocket connection error:', err);
      }
    };

    connect();

    // Heartbeat ping interval
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'heartbeat',
            senderId: identity.userId,
            senderName: identity.username,
            timestamp: Date.now(),
          })
        );
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'heartbeat',
          senderId: identity.userId,
          senderName: identity.username,
          timestamp: Date.now(),
        });
      }
    }, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(pingInterval);
      if (retryTimeout) clearTimeout(retryTimeout);
      if (ws) {
        ws.close();
        socketRef.current = null;
      }
    };
  }, [
    roomCode,
    signalingUrl,
    backendConfig,
    identity.userId,
    identity.username,
    identity.color,
    handleIncomingPayload,
  ]);

  const broadcast = useCallback(
    (partialPayload: Omit<SyncPayload, 'senderId' | 'timestamp'>) => {
      const fullPayload: SyncPayload = {
        ...partialPayload,
        senderId: identity.userId,
        senderName: identity.username,
        senderColor: identity.color,
        timestamp: Date.now(),
      };

      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage(fullPayload);
        } catch (e) {
          console.warn('BroadcastChannel send error:', e);
        }
      }

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify(fullPayload));
        } catch (e) {
          console.warn('WebSocket send error:', e);
        }
      }
    },
    [identity.userId, identity.username, identity.color]
  );

  return {
    connected,
    syncMethod,
    peerCount,
    latency,
    broadcast,
  };
}
