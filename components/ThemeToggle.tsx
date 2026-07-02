'use client';

import { useEffect, useRef } from 'react';
import { m, useAnimationControls } from 'framer-motion';

export default function ThemeToggle({ onToggle }: { onToggle?: () => void }) {
  const upperFillControls = useAnimationControls();
  const upperEdgeControls = useAnimationControls();
  const lowerFillControls = useAnimationControls();
  const lowerEdgeControls = useAnimationControls();
  const pupilControls     = useAnimationControls();
  const mountedRef        = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const upperOpen   = { fill: "M 1.75 24.64 A 29.25 22.89 0 0 1 60.25 24.64 A 29.25 12.59 0 0 0 1.75 24.64 Z", edge: "M 1.75 24.42 A 29.25 12.59 0 0 1 60.25 24.42" };
  const upperClosed = { fill: "M 1.75 24.64 A 29.25 22.89 0 0 1 60.25 24.64 A 29.25 1 0 0 0 1.75 24.64 Z",    edge: "M 1.75 24.64 A 29.25 1 0 0 1 60.25 24.64" };
  const lowerOpen   = { fill: "M 1.75 24.64 A 29.25 22.89 0 0 0 60.25 24.64 A 29.25 12.59 0 0 1 1.75 24.64 Z", edge: "M 1.75 24.42 A 29.25 12.59 0 0 0 60.25 24.42" };
  const lowerClosed = { fill: "M 1.75 24.64 A 29.25 22.89 0 0 0 60.25 24.64 A 29.25 1 0 0 1 1.75 24.64 Z",    edge: "M 1.75 24.64 A 29.25 1 0 0 0 60.25 24.64" };

  const singleBlink = async (duration: number, ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1]) => {
    await Promise.all([
      upperFillControls.start({ d: [upperOpen.fill, upperClosed.fill, upperOpen.fill], transition: { duration, ease } }),
      upperEdgeControls.start({ d: [upperOpen.edge, upperClosed.edge, upperOpen.edge], transition: { duration, ease } }),
      lowerFillControls.start({ d: [lowerOpen.fill, lowerClosed.fill, lowerOpen.fill], transition: { duration, ease } }),
      lowerEdgeControls.start({ d: [lowerOpen.edge, lowerClosed.edge, lowerOpen.edge], transition: { duration, ease } }),
    ]);
  };

  const handleClick = async () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('ct-theme', next); } catch (_) {}
    onToggle?.();

    const snappy:   [number, number, number, number] = [0.4, 0, 0.2, 1];
    const weighted: [number, number, number, number] = [0.34, 1.2, 0.64, 1];
    const gentle:   [number, number, number, number] = [0.25, 0.1, 0.25, 1];

    if (!mountedRef.current) return;
    pupilControls.start({ scale: [1, 0.7, 0.95, 0.82, 0.88], transition: { duration: 0.3, times: [0, 0.15, 0.4, 0.7, 1], ease: "easeOut" } });
    await singleBlink(0.2, snappy);
    await singleBlink(0.16, snappy);

    if (!mountedRef.current) return;
    pupilControls.start({ scale: [0.88, 0.95, 0.92], transition: { duration: 0.25, times: [0, 0.5, 1], ease: gentle } });
    await new Promise(r => setTimeout(r, 180));
    if (!mountedRef.current) return;
    await singleBlink(0.3, weighted);

    if (!mountedRef.current) return;
    pupilControls.start({ scale: [0.92, 1.02, 0.98], transition: { duration: 0.35, times: [0, 0.6, 1], ease: gentle } });
    await new Promise(r => setTimeout(r, 350));

    if (!mountedRef.current) return;
    pupilControls.start({ scale: [0.98, 1.01, 1], transition: { duration: 0.4, times: [0, 0.7, 1], ease: gentle } });
    await singleBlink(0.35, gentle);
  };

  return (
    <button
      onClick={handleClick}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", pointerEvents: "auto", display: "flex", alignItems: "center" }}
    >
      <svg width="16" height="12" viewBox="-3 0 68 49.28" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="eyeClip">
            <ellipse cx="31" cy="24.64" rx="29.25" ry="22.89" />
          </clipPath>
        </defs>

        <ellipse cx="31" cy="24.64" rx="29.25" ry="22.89" fill="none" stroke="#C0582A" strokeWidth="5" strokeMiterlimit="10" />

        <g style={{ transformOrigin: 'center' }}>
          <m.ellipse
            cx="30.82" cy="24.44" rx="16.08" ry="12.58"
            fill="#C0582A" stroke="#C0582A" strokeWidth="3.5" strokeMiterlimit="10"
            animate={pupilControls}
            style={{ transformOrigin: '30.82px 24.44px', transformBox: 'fill-box' }}
          />
        </g>

        <g clipPath="url(#eyeClip)">
          <m.path fill="var(--color-bg)" stroke="none" animate={upperFillControls} initial={{ d: upperOpen.fill }} />
          <m.path fill="none" stroke="#C0582A" strokeWidth="3.5" strokeLinecap="round" animate={upperEdgeControls} initial={{ d: upperOpen.edge }} />
          <m.path fill="var(--color-bg)" stroke="none" animate={lowerFillControls} initial={{ d: lowerOpen.fill }} />
          <m.path fill="none" stroke="#C0582A" strokeWidth="3.5" strokeLinecap="round" animate={lowerEdgeControls} initial={{ d: lowerOpen.edge }} />
        </g>
      </svg>
    </button>
  );
}
