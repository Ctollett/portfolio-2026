'use client';

import { notFound, useParams } from 'next/navigation';
import { writingItems } from '@/lib/writing';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { NavBar } from '@/components/NavBar';
import InteractionConcept from '@/content/writing/interaction-concept';

const contentMap: Record<string, React.ComponentType> = {
  'interaction-concept': InteractionConcept,
};

export default function WritingArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const item = writingItems.find(w => w.slug === slug);
  const Content = contentMap[slug];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1080);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!item || !Content) notFound();

  return (
    <div style={{ background: '#F4F2ED', minHeight: '100vh' }}>

      <NavBar blur />

      <article style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: `${isMobile ? 110 : 140}px 32px 96px`,
      }}>

        {/* Mobile back button */}
        {isMobile && (
          <Link href="/writing" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: "'MDUIXS', sans-serif",
            fontSize: 13,
            letterSpacing: '0.1em',
            color: '#888884',
            textDecoration: 'none',
            marginBottom: 32,
            minHeight: 44,
            paddingRight: 16,
          }}>
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="butt">
              <path d="M8 1 L2 8 L8 15" />
            </svg>
            Writing
          </Link>
        )}

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{
            fontFamily: "'MDUIXS', sans-serif",
            fontSize: 9,
            letterSpacing: '0.14em',
            color: '#888884',
            margin: '0 0 12px',
          }}>
            {item.year} · {item.month}
          </p>
          <h1 style={{
            fontFamily: "'Canela', serif",
            fontSize: isMobile ? 28 : 36,
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#1A1A18',
            margin: 0,
            lineHeight: 1.15,
          }}>
            {item.title}
          </h1>
        </div>

        <Content />

      </article>
    </div>
  );
}
