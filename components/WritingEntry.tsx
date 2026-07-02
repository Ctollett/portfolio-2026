'use client';
import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import Link from 'next/link';

interface WritingEntryProps {
  slug:           string;
  year:           string;
  month:          string;
  excerpt:        string;
  isOtherHovered: boolean;
  onHoverStart:   () => void;
  onHoverEnd:     () => void;
}

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export default function WritingEntry({ slug, year, month, excerpt, isOtherHovered, onHoverStart, onHoverEnd }: WritingEntryProps) {
  const dark = useIsDark();

  const activeColor = dark ? '#E8E5E1' : '#1A1A18';
  const fadedColor  = dark ? '#444441' : '#C0BDB6';

  const inner = (
    <m.article
      className="flex flex-row gap-3 text-sm w-full tracking-normal font-sans"
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      animate={{ color: isOtherHovered ? fadedColor : activeColor }}
      transition={{ duration: 0.2 }}
      style={{ cursor: slug ? 'pointer' : 'default' }}
    >
      <div className="flex flex-row gap-3">
        <h3>{year}</h3>
        <p>{month}</p>
      </div>
      <p>{excerpt}</p>
    </m.article>
  );

  if (!slug) return inner;

  return (
    <Link href={`/writing/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      {inner}
    </Link>
  );
}
