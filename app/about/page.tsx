"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { ResumeButton } from "@/components/ResumeButton";

const NAV_ITEMS = [
  { label: "Work",    href: "/" },
  { label: "Lab",     href: "/lab" },
  { label: "Writing", href: "/writing" },
  { label: "About",   href: "/about" },
];

const SOCIALS = [
  { label: "X",        href: "https://x.com/colton__tollett" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/colton-tollett-050127137/" },
  { label: "GitHub",   href: "https://github.com/coltontollett" },
];

export default function AboutPage() {
  const pathname = usePathname();

  return (
    <div style={{ background: "#F4F2ED", minHeight: "100vh" }}>

      {/* Top bar */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "32px 32px",
        zIndex: 10,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(244, 242, 237, 0.7)",
      }}>
        <Link href="/" style={{ display: "flex", textDecoration: "none" }}>
          <svg width="28" height="20" viewBox="0 0 29 21" fill="none">
            <path d="M8.47189 9.49798H0.5C0.5 9.49798 0.817269 1.26634 9.5 0.5V8.86104C9.5 8.86104 9.32329 9.4353 8.47189 9.5V9.49798Z" stroke="#000000" strokeMiterlimit="10"/>
            <path d="M8.47189 11.5H0.5C0.5 11.5 0.817269 19.7342 9.5 20.5V12.1378C9.5 12.1378 9.32329 11.563 8.47189 11.5Z" stroke="#000000" strokeMiterlimit="10"/>
            <path d="M16 20.5C18.4853 20.5 20.5 18.4853 20.5 16C20.5 13.5147 18.4853 11.5 16 11.5C13.5147 11.5 11.5 13.5147 11.5 16C11.5 18.4853 13.5147 20.5 16 20.5Z" stroke="#000000" strokeMiterlimit="10"/>
            <path d="M17.5964 0.5H14.4036C12.8 0.5 11.5 1.79996 11.5 3.40355V6.59645C11.5 8.20003 12.8 9.5 14.4036 9.5H17.5964C19.2 9.5 20.5 8.20003 20.5 6.59645V3.40355C20.5 1.79996 19.2 0.5 17.5964 0.5Z" stroke="#000000" strokeMiterlimit="10"/>
          </svg>
        </Link>

        <nav style={{ display: "flex", flexDirection: "row", gap: 16 }}>
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
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content */}
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
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 480,
            width: "100%",
          }}
        >

          {/* Photo */}
          <img
            src="/about/profile.jpg"
            alt="Colton Tollett"
            style={{
              width: 110,
              height: 138,
              objectFit: "cover",
              display: "block",
              borderRadius: 8,
              marginBottom: 24,
            }}
          />

          {/* Name + title */}
          <div style={{ marginBottom: 32 }}>
            <p style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 9,
              letterSpacing: "0.14em",
              color: "#888884",
              margin: "0 0 8px",
            }}>
              Design Engineer
            </p>
            <h1 style={{
              fontFamily: "'Canela', serif",
              fontSize: 28,
              fontWeight: 300,
              fontStyle: "italic",
              color: "#1A1A18",
              margin: 0,
              lineHeight: 1.1,
            }}>
              Colton Tollett
            </h1>
          </div>

          {/* Bio */}
          <p style={{
            fontFamily: "'MDUIXS', sans-serif",
            fontSize: 13,
            fontWeight: 400,
            lineHeight: 1.85,
            color: "#555559",
            margin: "0 0 32px",
          }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>

          {/* Open for work + Resume */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}>
            <m.div
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#3D9A52",
                flexShrink: 0,
              }}
            />
            <span style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 9,
              letterSpacing: "0.14em",
              color: "#3D9A52",
            }}>
              Open for work
            </span>
            <ResumeButton />
          </div>

          {/* Featured */}
          <div style={{ marginBottom: 32 }}>
            <p style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 9,
              letterSpacing: "0.14em",
              color: "#888884",
              margin: "0 0 8px",
            }}>
              Featured in
            </p>
            <div style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "center" }}>
              <a
                href="https://www.musicradar.com/music-tech/plugins/the-biggest-driver-right-now-is-people-wanting-everything-fast-predicting-the-future-evolution-of-plugin-design"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'MDUIXS', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "#1A1A18",
                  textDecoration: "none",
                }}
              >
                MusicRadar
              </a>
              <span style={{
                fontFamily: "'MDUIXS', sans-serif",
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "#1A1A18",
              }}>
                BestDesignsOnX
              </span>
            </div>
          </div>

          {/* Connect */}
          <div>
            <p style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 9,
              letterSpacing: "0.14em",
              color: "#888884",
              margin: "0 0 8px",
            }}>
              Connect
            </p>
            <div style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "center" }}>
              {SOCIALS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'MDUIXS', sans-serif",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    color: "#1A1A18",
                    textDecoration: "none",
                  }}
                >
                  {label}
                </a>
              ))}
              <a
                href="mailto:hello@coltontollett.dev"
                style={{
                  fontFamily: "'MDUIXS', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  color: "#1A1A18",
                  textDecoration: "none",
                }}
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
