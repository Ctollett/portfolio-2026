"use client";

import { m } from "framer-motion";
import { ResumeButton } from "@/components/ResumeButton";
import { NavBar } from "@/components/NavBar";

const SOCIALS = [
  { label: "X",        href: "https://x.com/colton__tollett" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/colton-tollett-050127137/" },
  { label: "GitHub",   href: "https://github.com/coltontollett" },
];

export default function AboutPage() {
  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>

      <NavBar blur />

      <main style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 32px",
      }}>
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ display: "flex", flexDirection: "column", maxWidth: 480, width: "100%" }}
        >

          {/* Photo */}
          <div style={{ width: 110, height: 138, borderRadius: 8, overflow: "hidden", marginBottom: 24, flexShrink: 0 }}>
            <img
              src="/about/profile.jpg"
              alt="Colton Tollett"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block", transform: "scale(1.4)", transformOrigin: "center center" }}
            />
          </div>

          {/* Name + title */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 9, letterSpacing: "0.14em", color: "var(--nav-muted)", margin: "0 0 8px" }}>
              Design Engineer
            </p>
            <h1 style={{ fontFamily: "'Canela', serif", fontSize: 28, fontWeight: 300, fontStyle: "italic", color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>
              Colton Tollett
            </h1>
          </div>

          {/* Bio */}
          <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 13, fontWeight: 400, lineHeight: 1.85, color: "var(--text-body)", margin: "0 0 32px" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>

          {/* Open for work + Resume */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <m.div
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: "#3D9A52", flexShrink: 0 }}
            />
            <span style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 9, letterSpacing: "0.14em", color: "#3D9A52" }}>
              Open for work
            </span>
            <ResumeButton />
          </div>

          {/* Featured */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 9, letterSpacing: "0.14em", color: "var(--nav-muted)", margin: "0 0 8px" }}>
              Featured in
            </p>
            <div style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "center" }}>
              <a
                href="https://www.musicradar.com/music-tech/plugins/the-biggest-driver-right-now-is-people-wanting-everything-fast-predicting-the-future-evolution-of-plugin-design"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 10, letterSpacing: "0.12em", color: "var(--text-primary)", textDecoration: "none" }}
              >
                MusicRadar
              </a>
              <span style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 10, letterSpacing: "0.12em", color: "var(--text-primary)" }}>
                BestDesignsOnX
              </span>
            </div>
          </div>

          {/* Connect */}
          <div>
            <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 9, letterSpacing: "0.14em", color: "var(--nav-muted)", margin: "0 0 8px" }}>
              Connect
            </p>
            <div style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "center" }}>
              {SOCIALS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 10, letterSpacing: "0.12em", color: "var(--text-primary)", textDecoration: "none" }}
                >
                  {label}
                </a>
              ))}
              <a
                href="mailto:hello@coltontollett.dev"
                style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 10, letterSpacing: "0.08em", color: "var(--text-primary)", textDecoration: "none" }}
              >
                hello@coltontollett.dev
              </a>
            </div>
          </div>

        </m.div>
      </main>

    </div>
  );
}
