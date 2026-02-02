'use client';
import { m } from 'framer-motion'
import { fadeUpWithDelay } from '@/lib/motion'
import { useAnimation } from '@/lib/animationContext';

export default function Header() {
const { hasAnimated } = useAnimation();
  return (
  <m.header variants={fadeUpWithDelay(0)} initial="hidden" animate="visible">
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
