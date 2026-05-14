'use client';
import { m } from 'framer-motion'
import { useEffect } from 'react'
import { fadeInstant } from '@/lib/motion'
import LabEntry from "./LabEntry";
import { LabItem } from "@/lib/lab";
import { useLabFocus } from '@/lib/labFocusContext';

interface LabSectionProps {
  labs: LabItem[]
}

export default function LabSection({ labs }: LabSectionProps) {
  const { focusedId, handleFocus, handleUnfocus } = useLabFocus();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusedId !== null) {
        handleUnfocus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedId, handleUnfocus]);

  return (
    <m.section variants={fadeInstant} initial="hidden" animate="visible" className="flex flex-col gap-8 overflow-visible pb-48">
      {labs.map((item, index) => (
        <LabEntry
          key={item.id}
          number={item.number}
          title={item.title}
          description={item.description}
          date={item.date}
          slug={item.slug}
          iframeUrl={item.iframeUrl}
          codeUrl={item.codeUrl}
          previewVideo={item.previewVideo}
          posterImage={item.posterImage}
          index={index}
          isFocused={focusedId === item.id}
          isOtherFocused={focusedId !== null && focusedId !== item.id}
          focusedIndex={focusedId !== null ? labs.findIndex(l => l.id === focusedId) : null}
          currentIndex={index}
          onFocus={() => handleFocus(item.id)}
          onUnfocus={handleUnfocus}
        />
      ))}
    </m.section>
  );
}
