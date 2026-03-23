'use client';

import { useSyncExternalStore } from 'react';

/**
 * Hook that returns whether the given media query matches.
 * Uses useSyncExternalStore to subscribe to browser media changes.
 * Handles server-side rendering by returning false on the server.
 *
 * @param query - A CSS media query string, e.g., '(min-width: 768px)'
 * @returns boolean – true if the query matches, false otherwise (or on server)
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onStoreChange: () => void) => {
    if (typeof window === 'undefined') {
      return () => {};
    }
    const mediaQueryList = window.matchMedia(query);
    mediaQueryList.addEventListener('change', onStoreChange);
    return () => mediaQueryList.removeEventListener('change', onStoreChange);
  };

  const getSnapshot = () => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
