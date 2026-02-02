'use client';
import { m } from 'framer-motion'



interface ProjectEntryProps {
  title: string;
  description: string;
  isOtherHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export default function ProjectEntry({title, description, isOtherHovered, onHoverStart, onHoverEnd}: ProjectEntryProps) {
  return <m.article  className="flex flex-col gap-2 text-sm tracking-normal"
  onHoverStart={onHoverStart}
  style={{ cursor: 'pointer' }}
  onHoverEnd={onHoverEnd}
  animate={{ color: isOtherHovered ? '#BABABA' : '#000000' }}
  transition={{ duration: 0.2 }}>
       
    <h3>{title}</h3>
    <p>{description}</p>
  </m.article>;
}
