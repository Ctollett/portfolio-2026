'use client';
import { m } from 'framer-motion'

interface WritingEntryProps {
  year: string;
  month: string;
  excerpt: string;
  isOtherHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;

}

export default function WritingEntry({ year, month, excerpt, isOtherHovered, onHoverStart, onHoverEnd }: WritingEntryProps) {
  return (
    <m.article 
    className="flex flex-row gap-3 text-sm w-full tracking-normal font-sans" 
    onHoverStart={onHoverStart}
    onHoverEnd={onHoverEnd}
      animate={{ color: isOtherHovered ? '#BABABA' : '#000000' }}
  transition={{ duration: 0.2 }}
  style={{ cursor: 'pointer' }}
  >
    
                  
                  
        
      <div className="flex flex-row gap-3">
        <h3>{year}</h3>
        <p>{month}</p>
      </div>
      <p>{excerpt}</p>
    </m.article>
  );
}
