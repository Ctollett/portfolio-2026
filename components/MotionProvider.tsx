'use client';

import { useEffect } from 'react';
import { LazyMotion } from 'framer-motion';
import { motionFeatures } from '@/lib/motion';

export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Several pages (the home carousel) manage scroll position themselves.
    // Leaving the browser's default restoration on means it fights that on
    // back-navigation, causing a visible jump/flash before our own logic runs.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <LazyMotion features={motionFeatures}>
      {children}
    </LazyMotion>
  );
}
