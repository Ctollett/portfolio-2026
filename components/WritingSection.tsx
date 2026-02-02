'use client';
import { m, number } from 'framer-motion'
import { fadeInstant } from '@/lib/motion'
import WritingEntry from "./WritingEntry";
import { writingItems } from "@/lib/writing";
import { useState } from 'react'

export default function WritingSection() {
  const [hoverId, setHoverId] = useState<number | null>(null)
  return (
    <m.section variants={fadeInstant} initial="hidden" animate="visible" className="flex flex-col gap-4">
      {writingItems.map((item) => (
        <WritingEntry 
        key={item.id} 
        year={item.year} 
        month={item.month} 
        excerpt={item.excerpt} 
        isOtherHovered={hoverId !== null && hoverId !== item.id}
        onHoverStart={() => setHoverId(item.id)}
        onHoverEnd={() => setHoverId(null)}
        
        />
      ))}
    </m.section>
  );
}
