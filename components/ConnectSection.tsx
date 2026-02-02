'use client';
import { features } from '@/lib/features'
import { m } from 'framer-motion'
import { fadeInstant, fadeUpWithDelay } from '@/lib/motion'
import { useAnimation } from '@/lib/animationContext';
import { socials } from '@/lib/socials'




export default function ConnectSection() {
  const { hasAnimated, setHasAnimated} = useAnimation()
  return <m.section 
        variants={hasAnimated ? fadeInstant : fadeUpWithDelay(0.7)} 
        initial="hidden" 
        animate="visible" 
        className='flex flex-col gap-3'
        onAnimationComplete={() => {
          if (!hasAnimated) setHasAnimated(true);
        }}
        >


     <h2 className="text-base font-sans text-primary font-medium">Connect</h2>
     <div className='flex flex-row justify-between'>
     <div className='flex flex-row gap-4 text-sm text-primary'>
    {socials.map((s) => (
     <m.a whileHover="hover" initial="rest" className='flex gap-0' key={s.id} href={s.link}>{s.social}<m.p variants={{rest: {opacity: 0, y: 2}, hover: {opacity: 1, y:0}}}>↗</m.p></m.a>

    ))}
    </div>
   <p className='text-sm text-primary'><span className='text-accent'>{'\u00A9'} </span>2026</p>

    </div> 
  </m.section>;
}
