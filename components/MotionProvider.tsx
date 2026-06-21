'use client';

import { LazyMotion } from 'framer-motion';
import { motionFeatures } from '@/lib/motion';

export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LazyMotion features={motionFeatures}>
      {children}
    </LazyMotion>
  );
}
