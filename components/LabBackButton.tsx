"use client";

import Link from "next/link";

export function LabBackButton() {
  return (
    <Link
      href="/lab"
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
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M5 12l7-7M5 12l7 7" />
      </svg>
      <span style={{
        fontFamily: "'MDUIXS', sans-serif",
        fontSize: 10,
        letterSpacing: "0.14em",
        color: "inherit",
      }}>
        Lab
      </span>
    </Link>
  );
}
