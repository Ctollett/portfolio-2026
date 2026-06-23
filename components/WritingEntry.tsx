'use client';
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

export default function WritingEntry({ slug, year, month, excerpt, isOtherHovered, onHoverStart, onHoverEnd }: WritingEntryProps) {
  const inner = (
    <m.article
      className="flex flex-row gap-3 text-sm w-full tracking-normal font-sans"
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      animate={{ color: isOtherHovered ? '#BABABA' : '#000000' }}
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
