"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { morph } from "getruun";
import ThemeToggle from "@/components/ThemeToggle";

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

const HAMBURGER = "M3 6 L15 6 M3 12 L21 12 M3 18 L15 18";
const CLOSE_X   = "M18 6 L6 18 M6 6 L18 18 M12 12 L12 12";
const SPRING    = { stiffness: 280, damping: 22, mass: 1 };

// Single chevron with degenerate second subpath at the apex.
// On hover the apex expands into the second chevron.
const CHEVRON_SINGLE = "M3 2 L9 8 L3 14 M9 8 L9 8";
const CHEVRON_DOUBLE = "M1 2 L7 8 L1 14 M7 2 L13 8 L7 14";

const Logo = ({ onClick }: { onClick?: () => void }) => (
  <Link href="/" onClick={onClick} style={{ display: "flex", textDecoration: "none", pointerEvents: "auto" }}>
    <svg width="28" height="20" viewBox="0 0 29 21" fill="none" stroke="#1A1A18" strokeWidth="1.1" strokeMiterlimit="10">
      <path d="M8.47189 9.49798H0.5C0.5 9.49798 0.817269 1.26634 9.5 0.5V8.86104C9.5 8.86104 9.32329 9.4353 8.47189 9.5V9.49798Z"/>
      <path d="M8.47189 11.5H0.5C0.5 11.5 0.817269 19.7342 9.5 20.5V12.1378C9.5 12.1378 9.32329 11.563 8.47189 11.5Z"/>
      <path d="M16 20.5C18.4853 20.5 20.5 18.4853 20.5 16C20.5 13.5147 18.4853 11.5 16 11.5C13.5147 11.5 11.5 13.5147 11.5 16C11.5 18.4853 13.5147 20.5 16 20.5Z"/>
      <path d="M17.5964 0.5H14.4036C12.8 0.5 11.5 1.79996 11.5 3.40355V6.59645C11.5 8.20003 12.8 9.5 14.4036 9.5H17.5964C19.2 9.5 20.5 8.20003 20.5 6.59645V3.40355C20.5 1.79996 19.2 0.5 17.5964 0.5Z"/>
    </svg>
  </Link>
);

const ease = [0.25, 0.1, 0.25, 1] as const;

interface NavBarProps {
  animDelay?: number;
  fixed?: boolean;
  blur?: boolean;
  onThemeToggle?: () => void;
}

export function NavBar({ animDelay = 0.4, fixed = true, blur = false, onThemeToggle }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [vw, setVw] = useState(1280);
  const [exitPhase, setExitPhase] = useState<"idle" | "exit-others" | "exit-chrome" | "exit-active">("idle");
  const [targetHref, setTargetHref] = useState<string | null>(null);
  const iconRef = useRef<SVGPathElement>(null);
  const chevronRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    setVw(window.innerWidth);
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Reset on route change
  useEffect(() => {
    setOpen(false);
    setExitPhase("idle");
    setTargetHref(null);
    if (iconRef.current) morph(iconRef.current, HAMBURGER, SPRING);
  }, [pathname]);

  const isMobile = vw < 1080;

  const handleOpen = () => {
    setOpen(true);
    if (iconRef.current) morph(iconRef.current, CLOSE_X, SPRING);
  };

  const handleClose = () => {
    setOpen(false);
    setExitPhase("idle");
    setTargetHref(null);
    if (iconRef.current) morph(iconRef.current, HAMBURGER, SPRING);
  };

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (exitPhase !== "idle") return;

    // Immediately snap clicked item to active style
    const idx = NAV_ITEMS.findIndex(item => item.href === href);
    if (idx !== -1) {
      const el = chevronRefs.current[idx];
      if (el) morph(el, CHEVRON_DOUBLE, SPRING);
    }

    setTargetHref(href);
    setExitPhase("exit-others"); // inactive links fade immediately on click

    // Phase 1 (700ms): inactive tabs fade
    setTimeout(() => {
      setExitPhase("exit-chrome"); // bottom + logo stagger out

      // Phase 2 (600ms): chrome elements stagger fade
      setTimeout(() => {
        setExitPhase("exit-active"); // active tab fades last

        // Phase 3 (550ms): active fades, then navigate
        setTimeout(() => {
          router.push(href);
          setTimeout(() => {
            setOpen(false);
            setTimeout(() => {
              setExitPhase("idle");
              setTargetHref(null);
            }, 700);
          }, 250);
        }, 550);
      }, 600);
    }, 700);
  };

  const barStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 24px",
    ...(fixed ? {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      ...(!isMobile && blur ? {
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
        {/* Mobile frosted veil — outer carries the mask, inner carries the blur.
            Keeping them on separate elements avoids the Safari mask+backdrop-filter bug. */}
        {isMobile && (
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: 130,
            overflow: "hidden",
            maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
            zIndex: -1,
            pointerEvents: "none",
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              backdropFilter: "blur(52px)",
              WebkitBackdropFilter: "blur(52px)",
              backgroundColor: "rgba(244, 242, 237, 0.78)",
            }} />
          </div>
        )}
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
          animate={{ opacity: exitPhase === "exit-chrome" || exitPhase === "exit-active" ? 0 : 1 }}
          transition={{ duration: 0.4, delay: exitPhase === "idle" ? animDelay : 0, ease }}
          onClick={open ? handleClose : handleOpen}
          style={{
            position: "fixed",
            top: 20,
            right: 24,
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
            exit={{ opacity: 0, transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] } }}
            transition={{ duration: 0.25, ease }}
            style={{
              position: "fixed",
              inset: 0,
              background: "#F4F2ED",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              padding: "18px 24px 32px",
              pointerEvents: "auto",
            }}
          >
            {/* Logo in overlay top row — fades last in the chrome stagger */}
            <m.div
              animate={{ opacity: exitPhase === "exit-chrome" || exitPhase === "exit-active" ? 0 : 1 }}
              transition={{ duration: 0.4, delay: 0, ease }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Logo onClick={handleClose} />
            </m.div>

            {/* Nav links — centered vertically, left edge at right edge of logo (24px padding + 28px SVG) */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 4,
              paddingLeft: 52,
            }}>
              {NAV_ITEMS.map((item, i) => (
                <m.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{
                    opacity: exitPhase === "idle"
                      ? 1
                      : targetHref === item.href && exitPhase !== "exit-active"
                        ? 1
                        : 0,
                    y: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: exitPhase === "idle" ? 0.35 : exitPhase === "exit-others" ? 0.6 : 0.5,
                    delay: exitPhase === "idle" ? 0.06 * i + 0.05 : 0,
                    ease,
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={handleNavClick(item.href)}
                    onMouseEnter={() => { const el = chevronRefs.current[i]; if (el && pathname !== item.href) morph(el, CHEVRON_DOUBLE, SPRING); }}
                    onMouseLeave={() => { const el = chevronRefs.current[i]; if (el && pathname !== item.href) morph(el, CHEVRON_SINGLE, SPRING); }}
                    style={{
                      fontFamily: "'MDUIXS', sans-serif",
                      fontSize: 20,
                      fontWeight: 400,
                      letterSpacing: "0.12em",
                      color: pathname === item.href || targetHref === item.href ? "#1A1A18" : "#C9C6BF",
                      textDecoration: "none",
                      lineHeight: 1.6,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {item.label}
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="butt">
                      <path ref={(el) => { chevronRefs.current[i] = el; }} d={pathname === item.href ? CHEVRON_DOUBLE : CHEVRON_SINGLE} />
                    </svg>
                  </Link>
                </m.div>
              ))}
            </div>

            {/* Bottom: contact + socials left, copyright + theme right */}
            <m.div
              animate={{ opacity: exitPhase === "exit-chrome" || exitPhase === "exit-active" ? 0 : 1 }}
              transition={{ duration: 0.4, delay: 0, ease }}
              style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}
            >
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

              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 16 }}>
                <p style={{
                  margin: 0,
                  fontFamily: "'MDUIXS', sans-serif",
                  fontSize: 8,
                  color: "#555559",
                  letterSpacing: "0.02em",
                }}>
                  © Colton Tollett 2026
                </p>
                <ThemeToggle onToggle={onThemeToggle} />
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
