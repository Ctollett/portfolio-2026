'use client';

import { domAnimation } from 'framer-motion';

// LazyMotion features - loads only DOM animations (smaller bundle)
export const motionFeatures = domAnimation;

// Smooth spring transition
export const smooth = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
} as const;

// Gentle ease for fades
export const gentle = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1],
} as const;

// Reusable variants
export const fadeInstant = {
  hidden: { opacity: 0, y: 8, filter: 'blur(2px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.2 }
  },
};


export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: smooth },
} as const;

export const fadeUpWithDelay = (delay: number) => ({
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      delay
    }
  },
});


export const fadeDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: smooth },
} as const;

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: smooth },
} as const;

// Stagger container - use with staggerChildren
export const stagger = (staggerTime = 0.1) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerTime,
    },
  },
});

// For hover/tap interactions
export const hover = {
  scale: 1.02,
  transition: smooth,
} as const;

export const tap = {
  scale: 0.98,
} as const;
