"use client";

import { useState, useEffect } from 'react';
import { getLabItems } from '@/lib/lab';
import LabInfiniteCanvas from '@/components/LabInfiniteCanvas';
import { LabListView } from '@/components/LabListView';
import { NavBar } from '@/components/NavBar';

export default function LabPage() {
  const labs = getLabItems();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1080);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: view === 'list' ? 'auto' : 'hidden', background: 'var(--color-bg)' }}>

      <NavBar blur />

      {/* Mobile disclaimer */}
      {isMobile && (
        <p style={{
          position: 'fixed',
          top: 132,
          left: 28,
          zIndex: 11,
          margin: 0,
          fontFamily: "'MDUIXS', sans-serif",
          fontSize: 9,
          letterSpacing: '0.1em',
          color: '#888884',
          pointerEvents: 'none',
        }}>
          Built for desktop — scroll to browse
        </p>
      )}

      {/* View toggle — bottom right, desktop only */}
      {!isMobile && <div style={{
        position: 'fixed',
        bottom: 28,
        right: 32,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'var(--frosted-bg)',
        borderRadius: 8,
        padding: '6px 12px',
      }}>
          <button
            onClick={() => setView('grid')}
            aria-label="Grid view"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: view === 'grid' ? 'var(--nav-fg)' : 'var(--nav-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="0" y="0" width="6" height="6" rx="1" />
              <rect x="8" y="0" width="6" height="6" rx="1" />
              <rect x="0" y="8" width="6" height="6" rx="1" />
              <rect x="8" y="8" width="6" height="6" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setView('list')}
            aria-label="List view"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: view === 'list' ? 'var(--nav-fg)' : 'var(--nav-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="0" y1="2.5"  x2="14" y2="2.5"  />
              <line x1="0" y1="7"    x2="14" y2="7"    />
              <line x1="0" y1="11.5" x2="14" y2="11.5" />
            </svg>
          </button>
      </div>}

      {view === 'grid'
        ? <LabInfiniteCanvas labs={labs} />
        : <LabListView labs={labs} />
      }
    </main>
  );
}
