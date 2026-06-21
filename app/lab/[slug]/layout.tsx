'use client';

import Link from 'next/link';

export default function LabSlugLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {children}

      <Link
        href="/lab"
        style={{
          position: 'fixed',
          top: 24,
          left: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(244,242,237,0.88)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '0.5px solid rgba(0,0,0,0.10)',
          borderRadius: 100,
          padding: '6px 14px 6px 10px',
          fontFamily: "'MDUIXS', sans-serif",
          fontSize: 9,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#1A1A18',
          textDecoration: 'none',
          zIndex: 100,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M6 2L3 5L6 8" stroke="#1A1A18" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </Link>
    </div>
  );
}
