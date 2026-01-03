
import React, { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useLocation } from 'wouter';
import { swipeableRoutes } from '@/lib/data';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableRouterProps {
  children: React.ReactNode;
}

export default function SwipeableRouter({ children }: SwipeableRouterProps) {
  const [location, setLocation] = useLocation();
  const [swipeState, setSwipeState] = useState<{ delta: number; isSwiping: boolean }>({ delta: 0, isSwiping: false });

  const currentIndex = swipeableRoutes.indexOf(location);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex !== -1 && currentIndex < swipeableRoutes.length - 1;

  const navigate = (direction: 'next' | 'prev') => {
    if (direction === 'next' && canGoNext) {
      setLocation(swipeableRoutes[currentIndex + 1]);
    } else if (direction === 'prev' && canGoPrev) {
      setLocation(swipeableRoutes[currentIndex - 1]);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeState({ delta: 0, isSwiping: false });
      navigate('next');
    },
    onSwipedRight: () => {
      setSwipeState({ delta: 0, isSwiping: false });
      navigate('prev');
    },
    onSwiping: (e) => {
      setSwipeState({ delta: e.deltaX, isSwiping: true });
    },
    onSwiped: () => {
      setSwipeState({ delta: 0, isSwiping: false });
    },
    preventScrollOnSwipe: false,
    trackMouse: true
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        navigate('next');
      } else if (event.key === 'ArrowLeft') {
        navigate('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [location, currentIndex, canGoNext, canGoPrev]);

  // Visual feedback logic
  const showPrevArrow = swipeState.isSwiping && swipeState.delta > 0 && canGoPrev;
  const showNextArrow = swipeState.isSwiping && swipeState.delta < 0 && canGoNext;

  const arrowOpacity = Math.min(Math.abs(swipeState.delta) / 100, 1);
  const arrowScale = 0.5 + Math.min(Math.abs(swipeState.delta) / 200, 0.5);

  return (
    <div {...handlers} className="relative min-h-screen">
      {children}

      {/* Pull Indicator Overlay */}
      {(showPrevArrow || showNextArrow) && (
        <div className="fixed inset-y-0 z-50 flex items-center pointer-events-none px-4"
          style={{
            left: showPrevArrow ? 0 : 'auto',
            right: showNextArrow ? 0 : 'auto',
          }}>
          <div
            className="bg-background/80 backdrop-blur-sm rounded-full p-3 shadow-lg border border-border transition-all duration-75 ease-out"
            style={{
              opacity: arrowOpacity,
              transform: `scale(${arrowScale}) translateX(${showPrevArrow ? Math.min(swipeState.delta / 5, 20) : 0}px) translateX(${showNextArrow ? Math.max(swipeState.delta / 5, -20) : 0}px)`
            }}
          >
            {showPrevArrow && <ChevronLeft className="w-8 h-8 text-primary" />}
            {showNextArrow && <ChevronRight className="w-8 h-8 text-primary" />}
          </div>
        </div>
      )}
    </div>
  );
}
