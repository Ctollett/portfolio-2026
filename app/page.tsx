"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { CardCarousel } from "@/components/CardCarousel";
import type { CarouselCard } from "@/components/CardCarousel";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollCue from "@/components/ScrollCue";

const WORK_CARDS: CarouselCard[] = [
  { src: "/images/lab/fm-synth.svg",  video: "/videos/tx-84.mp4", slug: "tx-84",           label: "2024", title: "TX-84",           body: "Browser-Based Spatial Operator FM Synth" },
  { src: "/images/lab/svg-morph.svg", video: "/videos/ruun.mp4",  slug: "ruun",             label: "2026", title: "Ruun",            body: "SVG Spring Morph Library" },
  { src: "/images/lab/wasm-dsp.svg",  video: "/videos/WASM.mp4",  slug: "wasm-dsp-engine",  label: "2025", title: "WASM DSP Engine", body: "Real-Time FM Synthesis in WebAssembly" },
];

const NAV_ITEMS = [
  { label: "Work",    href: "/" },
  { label: "Lab",     href: "/lab" },
  { label: "Writing", href: "/writing" },
  { label: "About",   href: "/about" },
];

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [dark, setDark] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div ref={pageRef} style={{ background: dark ? "#111110" : "#F4F2ED" }}>

      {/* Fixed shell — column: top bar + body */}
      <div style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 1,
        pointerEvents: "none",
      }}>

        {/* Top bar — logo left, nav right */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "32px 32px",
        }}>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <svg width="28" height="20" viewBox="0 0 29 21" fill="none">
              <path d="M8.47189 9.49798H0.5C0.5 9.49798 0.817269 1.26634 9.5 0.5V8.86104C9.5 8.86104 9.32329 9.4353 8.47189 9.5V9.49798Z" stroke="#000000" strokeMiterlimit="10"/>
              <path d="M8.47189 11.5H0.5C0.5 11.5 0.817269 19.7342 9.5 20.5V12.1378C9.5 12.1378 9.32329 11.563 8.47189 11.5Z" stroke="#000000" strokeMiterlimit="10"/>
              <path d="M16 20.5C18.4853 20.5 20.5 18.4853 20.5 16C20.5 13.5147 18.4853 11.5 16 11.5C13.5147 11.5 11.5 13.5147 11.5 16C11.5 18.4853 13.5147 20.5 16 20.5Z" stroke="#000000" strokeMiterlimit="10"/>
              <path d="M17.5964 0.5H14.4036C12.8 0.5 11.5 1.79996 11.5 3.40355V6.59645C11.5 8.20003 12.8 9.5 14.4036 9.5H17.5964C19.2 9.5 20.5 8.20003 20.5 6.59645V3.40355C20.5 1.79996 19.2 0.5 17.5964 0.5Z" stroke="#000000" strokeMiterlimit="10"/>
            </svg>
          </m.div>

          <m.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.95, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ display: "flex", flexDirection: "row", gap: 16 }}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  fontFamily: "'MDUIXS', sans-serif",
                  fontSize: 12,
                  fontWeight: 400,
                  letterSpacing: "0.14em",
                  color: pathname === item.href ? "#1A1A18" : "#888884",
                  textDecoration: "none",
                  pointerEvents: "auto",
                }}
              >
                {item.label}
              </Link>
            ))}
          </m.nav>
        </div>

        {/* Body — carousel centered, bio bottom-left, copyright bottom-right */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
        }}>

          {/* Left column: name + copyright at bottom */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              width: 360,
              display: "flex",
              flexDirection: "column",
              padding: "0 32px 32px",
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
                color: "#555559",
                letterSpacing: "0.02em",
              }}>
                © Colton Tollett 2026
              </p>
              <ThemeToggle onToggle={() => setDark(d => !d)} />
            </div>
          </m.div>

          {/* Middle column: carousel */}
          <div style={{ flex: 1, position: "relative" }}>
            <CardCarousel cards={WORK_CARDS} scrollRef={pageRef} />
          </div>

          {/* Right column: social links + email pinned to bottom */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              width: 360,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "0 32px 32px",
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
                            color: "#555559",
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
                  color: "#555559",
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
    </div>
  );
}
