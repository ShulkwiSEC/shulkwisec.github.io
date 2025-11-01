
import React, { useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useLocation } from 'wouter';
import { swipeableRoutes } from '@/data/blogPosts';

interface SwipeableRouterProps {
  children: React.ReactNode;
}

export default function SwipeableRouter({ children }: SwipeableRouterProps) {
  const [location, setLocation] = useLocation();

  const navigate = (direction: 'next' | 'prev') => {
    const currentIndex = swipeableRoutes.indexOf(location);
    if (direction === 'next' && currentIndex < swipeableRoutes.length - 1) {
      setLocation(swipeableRoutes[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setLocation(swipeableRoutes[currentIndex - 1]);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => navigate('next'),
    onSwipedRight: () => navigate('prev'),
    preventScrollOnSwipe: true,
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
  }, [location]);

  return <div {...handlers}>{children}</div>;
}
