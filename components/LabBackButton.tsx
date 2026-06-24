"use client";

import { useRef } from "react";
import Link from "next/link";
import { morph } from "getruun";

const SPRING         = { stiffness: 320, damping: 22, mass: 1 };
const CHEVRON        = "M15 18 L9 12 L15 6 M15 18 L9 12 L15 6";
const CHEVRONS_LEFT  = "M11 17 L6 12 L11 7 M18 17 L13 12 L18 7";

export function LabBackButton() {
  const pathRef = useRef<SVGPathElement>(null);

  return (
    <Link
      href="/lab"
      onMouseEnter={() => morph(pathRef.current!, CHEVRONS_LEFT, SPRING)}
      onMouseLeave={() => morph(pathRef.current!, CHEVRON, SPRING)}
      style={{
        position: "fixed",
        top: 32,
        left: 32,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path ref={pathRef} d={CHEVRON} />
      </svg>
      <span style={{
        fontFamily: "'MDUIXS', sans-serif",
        fontSize: 12,
        letterSpacing: "0.08em",
        color: "inherit",
      }}>
        Lab
      </span>
    </Link>
  );
}
