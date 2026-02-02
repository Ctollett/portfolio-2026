'use client';
import { m } from 'framer-motion'
import ProjectEntry from "./ProjectEntry";
import { projects } from '@/lib/projects'
import { fadeInstant, fadeUpWithDelay } from '@/lib/motion'
import { useAnimation } from '@/lib/animationContext';
import { useState } from 'react';


export default function ProjectSection() {
 const {hasAnimated, setHasAnimated} = useAnimation()
 const [hoverId, setHoverId] = useState<number | null>(null)
  return <m.section
        variants={hasAnimated ? fadeInstant : fadeUpWithDelay(0.4)}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
        onAnimationComplete={() => {
          setHasAnimated(true)
        }}
      
>

      <h2 className="text-base font-sans text-primary font-medium">Projects</h2>
      {projects.map((p) => (
        <ProjectEntry 
        key={p.id} 
        title={p.title} 
        description={p.description} 
        isOtherHovered={hoverId !== null && hoverId !== p.id}
        onHoverStart={() => setHoverId(p.id)}
        onHoverEnd={() => setHoverId(null)}
        
        />
      ))}
  </m.section>;
}
