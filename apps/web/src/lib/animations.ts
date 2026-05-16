/**
 * Centralized animation presets for consistent motion throughout the app
 * Single source of truth for all Framer Motion variants
 */

import { circInOut } from 'framer-motion';

// ─── Fade Animations ──────────────────────────────────────────────────────────

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

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, duration: 0.8, stiffness: 100 },
  },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", duration: 0.8, stiffness: 100 },
  },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", duration: 0.8, stiffness: 100 },
  },
};

// ─── Scale Animations ─────────────────────────────────────────────────────────

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", duration: 0.6, stiffness: 100 },
  },
};

// ─── Slide Animations ─────────────────────────────────────────────────────────

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

// ─── Container & Item Animations ──────────────────────────────────────────────

export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
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

// ─── Hover Animations ─────────────────────────────────────────────────────────

export const hoverScale = {
  whileHover: { scale: 1.05, transition: { duration: 0.3 } },
  whileTap: { scale: 0.95 },
};

export const hoverLift = {
  whileHover: {
    y: -5,
    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
    transition: { duration: 0.3 },
  },
};

// ─── Page Transitions ─────────────────────────────────────────────────────────

export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.5 } },
};
