import { useEffect, useRef } from 'react';

/**
 * Runs `onScroll` at most once per animation frame, on the leading edge —
 * unlike a debounce, the UI stays in sync with the scroll position instead
 * of snapping into place ~100ms after the user stops scrolling.
 */
export function useRafScroll(onScroll: () => void) {
  const ticking = useRef(false);
  const latest = useRef(onScroll);
  latest.current = onScroll;

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        latest.current();
        ticking.current = false;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}
