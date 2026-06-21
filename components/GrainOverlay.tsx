'use client';
import { useEffect, useRef } from 'react';

export default function GrainOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SIZE = 256;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/></filter><rect width="${SIZE}" height="${SIZE}" filter="url(#n)"/></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx || !ref.current) return;
      ctx.drawImage(img, 0, 0);
      ref.current.style.backgroundImage = `url(${canvas.toDataURL()})`;
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.09,
      }}
    />
  );
}
