import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      if (scrollY !== lastScrollY) {
        setScrollDirection(direction);
      }
      setLastScrollY(scrollY);
    };

    window.addEventListener('scroll', updateScrollDirection);
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, [lastScrollY]);

  return scrollDirection;
}
