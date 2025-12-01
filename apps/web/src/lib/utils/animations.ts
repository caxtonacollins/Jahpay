import { circInOut } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: circInOut }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: circInOut }
  }
};

export const slideIn = (direction: 'left' | 'right' | 'up' | 'down' = 'up') => {
  const directions = {
    left: { x: -100 },
    right: { x: 100 },
    up: { y: 100 },
    down: { y: -100 },
  };

  return {
    hidden: { ...directions[direction], opacity: 0 },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: circInOut }
    },
    exit: {
      ...directions[direction],
      opacity: 0,
      transition: { duration: 0.3, ease: circInOut }
    }
  };
};

export const staggerContainer = (staggerChildren: number = 0.1, delayChildren: number = 0.1) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: circInOut,
    },
  },
};

export const scaleIn = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: circInOut,
    },
  },
};

export const rotate = {
  hidden: { rotate: 0 },
  visible: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

// Hook for scroll animations
export const useScrollAnimation = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return [ref, isInView] as const;
};
