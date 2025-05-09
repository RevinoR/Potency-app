// components/ScrollDetection.jsx
import { useState, useEffect } from 'react';

const useScrollPosition = () => {
  const [scrollDirection, setScrollDirection] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const direction = currentY > lastY ? 'down' : 'up';

      if (direction !== scrollDirection && Math.abs(currentY - lastY) > 10) {
        setScrollDirection(direction);
      }

      setScrollY(currentY);
      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDirection]);

  const isBlurActive = scrollY > 100; // or your threshold

  return { scrollDirection, scrollY, isBlurActive };
};

export default useScrollPosition;
