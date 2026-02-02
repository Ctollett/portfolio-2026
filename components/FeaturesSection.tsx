'use client';
import FeatureEntry from "./FeatureEntry";
import { features } from '@/lib/features'
import { m } from 'framer-motion'
import { fadeInstant, fadeUpWithDelay } from '@/lib/motion'
import { useAnimation } from '@/lib/animationContext';



export default function FeaturesSection() {
const {hasAnimated, setHasAnimated} = useAnimation()

  return <m.section 
          variants={hasAnimated ? fadeInstant : fadeUpWithDelay(0.6) }  
          initial="hidden" 
          animate="visible" 
          className="flex flex-col gap-3"
          onAnimationComplete={() => {
            setHasAnimated(true)
          }}
          
          
          >
        <h2 className="text-base font-sans text-primary font-medium">Notable Features</h2>
        {features.map((f) => (
          <FeatureEntry key={f.id} publication={f.publication} article={f.article} link={f.link}/>
        ))}
    </m.section>;
}
