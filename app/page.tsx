"use client";

import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { CardCarousel } from "@/components/CardCarousel";
import type { CarouselCard } from "@/components/CardCarousel";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollCue from "@/components/ScrollCue";
import { NavBar } from "@/components/NavBar";
import { IntroScreen } from "@/components/IntroScreen";

const WORK_CARDS: CarouselCard[] = [
  { src: "/images/lab/fm-synth.svg",  video: "/videos/tx-04.mp4", slug: "tx-04",           label: "2024", title: "TX-04",           body: "Browser-Based Spatial Operator FM Synth" },
  { src: "/images/lab/svg-morph.svg", video: "/videos/ruun.mp4",  slug: "ruun",             label: "2026", title: "Ruun",            body: "SVG Spring Morph Library" },
  { src: "/images/lab/wasm-dsp.svg",  video: "/videos/WASM.mp4",  slug: "wasm-dsp-engine",  label: "2025", title: "WASM DSP Engine", body: "Real-Time FM Synthesis in WebAssembly" },
];

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(1280);

  const [shouldShowIntro, setShouldShowIntro] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const showIntro = shouldShowIntro && !introDone;

  useEffect(() => {
    if (!sessionStorage.getItem('site-active')) {
      setShouldShowIntro(true);
    }
  }, []);

  const handleIntroDone = () => {
    sessionStorage.setItem('site-active', '1');
    setIntroDone(true);
  };

  useEffect(() => {
    setVw(window.innerWidth);
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const colW = vw < 1080 ? 0 : vw < 1400 ? Math.round((vw - 480) / 2 * 0.7) : 360;

  return (
    <div ref={pageRef} style={{ background: 'var(--color-bg)' }}>
      {showIntro && <IntroScreen onDone={handleIntroDone} />}

      <NavBar animDelay={0.4} />

      {/* Fixed shell — body only, carousel centered, bio bottom-left, copyright bottom-right */}
      <div style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "row",
        zIndex: 1,
        pointerEvents: "none",
      }}>

          {/* Left column: name + copyright at bottom */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showIntro ? 0 : 1 }}
            transition={{ duration: 0.4, delay: showIntro ? 0 : 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              width: colW,
              flexShrink: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              padding: colW > 0 ? "0 32px 32px" : 0,
            }}
          >
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <ScrollCue totalCards={WORK_CARDS.length} />
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 24 }}>
              <p style={{
                margin: 0,
                fontFamily: "'MDUIXS', sans-serif",
                fontSize: 8,
                color: "var(--nav-muted)",
                letterSpacing: "0.02em",
              }}>
                © Colton Tollett 2026
              </p>
              <ThemeToggle />
            </div>
          </m.div>

          {/* Middle column: carousel */}
          <div style={{ flex: 1, position: "relative" }}>
            <CardCarousel cards={WORK_CARDS} scrollRef={pageRef} ready={!showIntro} />
          </div>

          {/* Right column: social links + email pinned to bottom */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showIntro ? 0 : 1 }}
            transition={{ duration: 0.4, delay: showIntro ? 0 : 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              width: colW,
              flexShrink: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: colW > 0 ? "0 32px 32px" : 0,
            }}
          >
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "flex-end", gap: 24 }}>

              {/* Social links stack */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { label: "X",        href: "https://x.com/colton__tollett" },
                  { label: "LinkedIn", href: "https://www.linkedin.com/in/colton-tollett-050127137/" },
                  { label: "GitHub",   href: "https://github.com/coltontollett" },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'MDUIXS', sans-serif",
                      fontSize: 8,
                      fontWeight: 400,
                      letterSpacing: "0.14em",
                      color: "var(--nav-muted)",
                      textDecoration: "none",
                      lineHeight: 2,
                      pointerEvents: "auto",
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>

              {/* Email — right edge aligns with nav */}
              <a
                href="mailto:hello@coltontollett.dev"
                style={{
                  fontFamily: "'MDUIXS', sans-serif",
                  fontSize: 8,
                  fontWeight: 400,
                  letterSpacing: "0.08em",
                  color: "var(--nav-muted)",
                  textDecoration: "none",
                  lineHeight: 2,
                  pointerEvents: "auto",
                }}
              >
                hello@coltontollett.dev
              </a>

            </div>
          </m.div>

      </div>
    </div>
  );
}
