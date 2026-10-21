'use client';

import { useState, useCallback, useMemo } from 'react';
import { LoopMode, MediaItem } from '@/types/playlist';
import { parseMediaUrl, fetchVideoTitle } from '@/lib/urlParser';

interface UsePlaylistOptions {
  initialItems?: MediaItem[];
  onQueueChanged?: (items: MediaItem[], newIndex: number) => void;
}

export function usePlaylist({ initialItems = [], onQueueChanged }: UsePlaylistOptions = {}) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  const currentItem = useMemo(() => {
    if (items.length === 0 || currentIndex < 0 || currentIndex >= items.length) {
      return null;
    }
    return items[currentIndex];
  }, [items, currentIndex]);

  const addItem = useCallback(
    async (url: string, customTitle?: string): Promise<MediaItem> => {
      const parsed = parseMediaUrl(url);
      const title = customTitle || (await fetchVideoTitle(url));
      const newItem: MediaItem = {
        id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        url: parsed.directUrl,
        title,
        sourceType: parsed.sourceType,
        addedAt: Date.now(),
      };

      setItems((prev) => {
        const next = [...prev, newItem];
        if (onQueueChanged) onQueueChanged(next, currentIndex);
        return next;
      });

      return newItem;
    },
    [currentIndex, onQueueChanged]
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const indexToRemove = prev.findIndex((i) => i.id === id);
        if (indexToRemove === -1) return prev;

        const next = prev.filter((i) => i.id !== id);
        let newIdx = currentIndex;

        if (indexToRemove < currentIndex) {
          newIdx = currentIndex - 1;
        } else if (indexToRemove === currentIndex) {
          newIdx = Math.min(currentIndex, Math.max(0, next.length - 1));
        }

        setCurrentIndex(newIdx);
        if (onQueueChanged) onQueueChanged(next, newIdx);
        return next;
      });
    },
    [currentIndex, onQueueChanged]
  );

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      setItems((prev) => {
        const result = Array.from(prev);
        const [removed] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, removed);

        // Adjust active index
        let newIdx = currentIndex;
        if (currentIndex === fromIndex) {
          newIdx = toIndex;
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
          newIdx = currentIndex - 1;
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
          newIdx = currentIndex + 1;
        }

        setCurrentIndex(newIdx);
        if (onQueueChanged) onQueueChanged(result, newIdx);
        return result;
      });
    },
    [currentIndex, onQueueChanged]
  );

  const playIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length) {
        setCurrentIndex(index);
        if (onQueueChanged) onQueueChanged(items, index);
      }
    },
    [items, onQueueChanged]
  );

  const playNext = useCallback((): boolean => {
    if (items.length === 0) return false;

    if (loopMode === 'one') {
      return true; // repeat current
    }

    if (isShuffle) {
      if (items.length > 1) {
        let randIdx = Math.floor(Math.random() * items.length);
        while (randIdx === currentIndex && items.length > 1) {
          randIdx = Math.floor(Math.random() * items.length);
        }
        setCurrentIndex(randIdx);
        if (onQueueChanged) onQueueChanged(items, randIdx);
        return true;
      }
      return false;
    }

    if (currentIndex + 1 < items.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (onQueueChanged) onQueueChanged(items, nextIdx);
      return true;
    }

    if (loopMode === 'all') {
      setCurrentIndex(0);
      if (onQueueChanged) onQueueChanged(items, 0);
      return true;
    }

    return false; // Reached end of queue
  }, [items, currentIndex, loopMode, isShuffle, onQueueChanged]);

  const playPrev = useCallback((): boolean => {
    if (items.length === 0) return false;

    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      if (onQueueChanged) onQueueChanged(items, prevIdx);
      return true;
    }

    if (loopMode === 'all' && items.length > 0) {
      const lastIdx = items.length - 1;
      setCurrentIndex(lastIdx);
      if (onQueueChanged) onQueueChanged(items, lastIdx);
      return true;
    }

    return false;
  }, [items, currentIndex, loopMode, onQueueChanged]);

  const toggleLoop = useCallback(() => {
    setLoopMode((prev) => {
      if (prev === 'none') return 'one';
      if (prev === 'one') return 'all';
      return 'none';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const clearPlaylist = useCallback(() => {
    setItems([]);
    setCurrentIndex(0);
    if (onQueueChanged) onQueueChanged([], 0);
  }, [onQueueChanged]);

  const setPlaylist = useCallback(
    (newItems: MediaItem[], newIndex: number = 0) => {
      setItems(newItems);
      setCurrentIndex(Math.max(0, Math.min(newIndex, newItems.length - 1)));
    },
    []
  );

  return {
    items,
    currentIndex,
    currentItem,
    loopMode,
    isShuffle,
    addItem,
    removeItem,
    reorder,
    playIndex,
    playNext,
    playPrev,
    toggleLoop,
    toggleShuffle,
    clearPlaylist,
    setPlaylist,
  };
}
