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
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: gentle },
} as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: smooth },
} as const;

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
