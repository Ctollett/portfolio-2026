"use client";

import { useEffect, useRef } from "react";

const W     = 28;
const H     = 200;
const CX    = W / 2;
const R     = 9;
const ARM   = 11;
const TICK  = 3;
const SW    = 1.0;
const TOP_Y = R;
const BOT_Y = H - R;

function Mark() {
  return (
    <>
      <circle cx={CX} cy={0} r={R} fill="none" strokeWidth={SW} />
      <line x1={CX - ARM} y1={0}     x2={CX + ARM} y2={0}     strokeWidth={SW} />
      <line x1={CX - ARM} y1={-TICK} x2={CX - ARM} y2={TICK}  strokeWidth={SW} />
      <line x1={CX + ARM} y1={-TICK} x2={CX + ARM} y2={TICK}  strokeWidth={SW} />
    </>
  );
}

export default function ScrollCue({ totalCards }: { totalCards: number }) {
  const greyRef      = useRef<SVGGElement>(null);
  const terracottaRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const sectionH = Math.round(window.innerHeight * 0.7);

    let markY           = TOP_Y;
    let amplitude       = 0;
    let targetAmplitude = 0;
    let scroll          = window.scrollY;
    let rafId: number;

    function onScroll() { scroll = window.scrollY; }
    function onWheel(e: WheelEvent) {
      const delta = e.deltaMode === 0 ? e.deltaY : e.deltaY * 20;
      targetAmplitude = Math.min(1, Math.abs(delta) / 80);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel",  onWheel,  { passive: true });

    function tick() {
      amplitude       += (targetAmplitude - amplitude) * 0.07;
      targetAmplitude *= 0.88;

      const raw    = ((scroll / sectionH) % totalCards + totalCards) % totalCards;
      const active = Math.round(raw) % totalCards;
      const targetY = TOP_Y + (active / (totalCards - 1)) * (BOT_Y - TOP_Y);
      markY += (targetY - markY) * 0.1;

      const ty = `translate(0, ${markY.toFixed(2)})`;

      if (greyRef.current) {
        greyRef.current.setAttribute("transform", ty);
        greyRef.current.style.opacity = "0.55";
      }
      if (terracottaRef.current) {
        terracottaRef.current.setAttribute("transform", ty);
        terracottaRef.current.style.opacity = amplitude.toFixed(3);
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel",  onWheel);
    };
  }, [totalCards]);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="visible" style={{ display: "block" }}>
      {/* Track */}
      <line x1={CX} y1={0} x2={CX} y2={H} stroke="currentColor" strokeWidth={SW} opacity={0.2} />
      <line x1={CX - TICK} y1={0} x2={CX + TICK} y2={0} stroke="currentColor" strokeWidth={SW} opacity={0.2} />
      <line x1={CX - TICK} y1={H} x2={CX + TICK} y2={H} stroke="currentColor" strokeWidth={SW} opacity={0.2} />

      <g ref={greyRef} transform={`translate(0, ${TOP_Y})`} stroke="#888884" opacity={0.55} fill="none">
        <Mark />
      </g>
      <g ref={terracottaRef} transform={`translate(0, ${TOP_Y})`} stroke="#C0582A" opacity={0} fill="none">
        <Mark />
      </g>
    </svg>
  );
}
