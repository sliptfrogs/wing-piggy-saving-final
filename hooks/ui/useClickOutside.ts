'use client';

import { useEffect, RefObject } from 'react';

/**
 * Hook that triggers a callback when a click occurs outside the referenced element.
 *
 * @param ref - React ref object pointing to the element to watch.
 * @param handler - Callback to run when a click outside the element is detected.
 *
 * @example
 * const modalRef = useRef<HTMLDivElement>(null);
 * useClickOutside(modalRef, () => setIsOpen(false));
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if the ref isn't set or if the click is inside the element
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    // Add event listeners
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Clean up on unmount
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
