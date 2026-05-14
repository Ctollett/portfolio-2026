'use client';
import { useEffect } from 'react';
import { m } from 'framer-motion'
import { fadeUpWithDelay } from '@/lib/motion'
import { useAnimation } from '@/lib/animationContext';
import { useLabFocus } from '@/lib/labFocusContext';

export default function Header() {
const { hasAnimated, setHasAnimated } = useAnimation();
const { isLabFocused } = useLabFocus();

  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [hasAnimated, setHasAnimated]);
  return (
  <m.header
    variants={fadeUpWithDelay(0)}
    initial="hidden"
    animate={isLabFocused ? { opacity: 0, y: -20 } : "visible"}
    transition={{ duration: 0.3 }}
    style={{ pointerEvents: isLabFocused ? 'none' : 'auto' }}
  >
    <div className="flex flex-col gap-3">
      <div className="">
       <img src="/vectors/logo-group.svg" alt="Logo" />
      </div>
      <div className="font-display w-[424px] text-lg tracking-tight leading-snug">
        
  <m.span
      style={{ display: 'inline-block' }}
      animate={hasAnimated ? { color: '#0059FF', skewX: -8 } : { skewX: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
>
  Colton Tollett{' '}
</m.span>
   {' '}builds polished, technically complex interfaces—blending{' '}
  <m.span
      style={{ display: 'inline-block' }}
      animate={hasAnimated ? { color: '#0059FF', skewX: -8 } : { skewX: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
>
  design{' '}
</m.span> + <m.span
      style={{ display: 'inline-block' }}
      animate={hasAnimated ? { color: '#0059FF', skewX: -8 } : { skewX: 0 }}
      transition={{ duration: 0.3, delay: 0.7 }}
>
  engineering{' '}
</m.span>  to ship products that feel right.</div>
    </div>
  </m.header>
  );
}
