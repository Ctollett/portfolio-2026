"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { morph } from "getruun";

const SPRING = { stiffness: 280, damping: 22, mass: 1 };

const DOWNLOAD_D = "M12 3v11M7 10l5 5 5-5M5 20h14";
const CHECK_D    = "M4 12l5 5 11-11";

export function ResumeButton() {
  const pathRef   = useRef<SVGPathElement>(null);
  const [done, setDone] = useState(false);
  const resetRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (resetRef.current) clearTimeout(resetRef.current); }, []);

  const handleClick = useCallback(() => {
    if (done || !pathRef.current) return;
    setDone(true);
    morph(pathRef.current, CHECK_D, SPRING);

    resetRef.current = setTimeout(() => {
      if (pathRef.current) morph(pathRef.current, DOWNLOAD_D, SPRING);
      setDone(false);
    }, 2500);
  }, [done]);

  return (
    <a
      href="/ColtonTollett-Resume.pdf"
      download
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 20,
        border: "1px solid rgba(26,26,24,0.15)",
        fontFamily: "'MDUIXS', sans-serif",
        fontSize: 9,
        letterSpacing: "0.14em",
        color: "#1A1A18",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      Resume
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path ref={pathRef} d={DOWNLOAD_D} />
      </svg>
    </a>
  );
}
