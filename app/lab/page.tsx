"use client";

import { useState } from 'react';
import { getLabItems } from '@/lib/lab';
import LabInfiniteCanvas from '@/components/LabInfiniteCanvas';
import { LabListView } from '@/components/LabListView';
import { NavBar } from '@/components/NavBar';

export default function LabPage() {
  const labs = getLabItems();
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: view === 'list' ? 'auto' : 'hidden', background: '#F4F2ED' }}>

      <NavBar blur />

      {/* View toggle — bottom right */}
      <div style={{
        position: 'fixed',
        bottom: 28,
        right: 32,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        {(['grid', 'list'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: view === v ? '#1A1A18' : '#888884',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'grid'
        ? <LabInfiniteCanvas labs={labs} />
        : <LabListView labs={labs} />
      }
    </main>
  );
}
