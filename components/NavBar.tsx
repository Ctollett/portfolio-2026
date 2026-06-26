"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { morph } from "getruun";

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

// Three lines left-aligned, middle is longest — each as its own subpath
// so the morph maps line-by-line to the X diagonals
const HAMBURGER = "M3 6 L15 6 M3 12 L21 12 M3 18 L15 18";
// X encoded as 3 subpaths: two diagonals + degenerate center point
const CLOSE_X   = "M18 6 L6 18 M6 6 L18 18 M12 12 L12 12";
const SPRING    = { stiffness: 280, damping: 22, mass: 1 };

const Logo = ({ onClick }: { onClick?: () => void }) => (
  <Link href="/" onClick={onClick} style={{ display: "flex", textDecoration: "none", pointerEvents: "auto" }}>
    <svg width="28" height="20" viewBox="0 0 29 21" fill="none">
      <path d="M8.47189 9.49798H0.5C0.5 9.49798 0.817269 1.26634 9.5 0.5V8.86104C9.5 8.86104 9.32329 9.4353 8.47189 9.5V9.49798Z" stroke="#000000" strokeMiterlimit="10"/>
      <path d="M8.47189 11.5H0.5C0.5 11.5 0.817269 19.7342 9.5 20.5V12.1378C9.5 12.1378 9.32329 11.563 8.47189 11.5Z" stroke="#000000" strokeMiterlimit="10"/>
      <path d="M16 20.5C18.4853 20.5 20.5 18.4853 20.5 16C20.5 13.5147 18.4853 11.5 16 11.5C13.5147 11.5 11.5 13.5147 11.5 16C11.5 18.4853 13.5147 20.5 16 20.5Z" stroke="#000000" strokeMiterlimit="10"/>
      <path d="M17.5964 0.5H14.4036C12.8 0.5 11.5 1.79996 11.5 3.40355V6.59645C11.5 8.20003 12.8 9.5 14.4036 9.5H17.5964C19.2 9.5 20.5 8.20003 20.5 6.59645V3.40355C20.5 1.79996 19.2 0.5 17.5964 0.5Z" stroke="#000000" strokeMiterlimit="10"/>
    </svg>
  </Link>
);

const ease = [0.25, 0.1, 0.25, 1] as const;

interface NavBarProps {
  animDelay?: number;
  fixed?: boolean;
  blur?: boolean;
}

export function NavBar({ animDelay = 0.4, fixed = true, blur = false }: NavBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [vw, setVw] = useState(1280);
  const iconRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    setVw(window.innerWidth);
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Reset icon on route change
  useEffect(() => {
    setOpen(false);
    if (iconRef.current) morph(iconRef.current, HAMBURGER, SPRING);
  }, [pathname]);

  const isMobile = vw < 1080;

  const handleOpen = () => {
    setOpen(true);
    if (iconRef.current) morph(iconRef.current, CLOSE_X, SPRING);
  };

  const handleClose = () => {
    setOpen(false);
    if (iconRef.current) morph(iconRef.current, HAMBURGER, SPRING);
  };

  const barStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "32px",
    ...(fixed ? {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      ...(blur ? {
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(244, 242, 237, 0.8)",
      } : {}),
    } : {}),
  };

  return (
    <>
      {/* Top bar — logo always, desktop nav or nothing on mobile (button floats fixed) */}
      <div style={barStyle}>
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: animDelay, ease }}
          style={{ pointerEvents: "auto" }}
        >
          <Logo />
        </m.div>

        {!isMobile && (
          <m.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: animDelay, ease }}
            style={{ display: "flex", flexDirection: "row", gap: 16, pointerEvents: "auto" }}
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
                }}
              >
                {item.label}
              </Link>
            ))}
          </m.nav>
        )}
      </div>

      {/* Mobile toggle button — floats above overlay so morph is always visible */}
      {isMobile && (
        <m.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: animDelay, ease }}
          onClick={open ? handleClose : handleOpen}
          style={{
            position: "fixed",
            top: 28,
            right: 28,
            zIndex: 101,
            background: "none",
            border: "none",
            padding: 4,
            cursor: "pointer",
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1A1A18"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path ref={iconRef} d={HAMBURGER} />
          </svg>
        </m.button>
      )}

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            style={{
              position: "fixed",
              inset: 0,
              background: "#F4F2ED",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              padding: "32px",
              pointerEvents: "auto",
            }}
          >
            {/* Logo in overlay top row */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <Logo onClick={handleClose} />
            </div>

            {/* Nav links — centered vertically */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 4,
            }}>
              {NAV_ITEMS.map((item, i) => (
                <m.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35, delay: 0.06 * i + 0.05, ease }}
                >
                  <Link
                    href={item.href}
                    onClick={handleClose}
                    style={{
                      fontFamily: "'Canela', serif",
                      fontSize: 52,
                      fontStyle: "italic",
                      fontWeight: 300,
                      color: pathname === item.href ? "#1A1A18" : "#C9C6BF",
                      textDecoration: "none",
                      lineHeight: 1.15,
                      display: "block",
                    }}
                  >
                    {item.label}
                  </Link>
                </m.div>
              ))}
            </div>

            {/* Bottom: contact + socials */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <a
                href="mailto:hello@coltontollett.dev"
                style={{
                  fontFamily: "'MDUIXS', sans-serif",
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  color: "#888884",
                  textDecoration: "none",
                }}
              >
                hello@coltontollett.dev
              </a>
              <div style={{ display: "flex", gap: 16 }}>
                {SOCIALS.map(({ label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
                    fontFamily: "'MDUIXS', sans-serif",
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    color: "#888884",
                    textDecoration: "none",
                  }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
