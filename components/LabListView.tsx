"use client";

import Link from "next/link";
import { m } from "framer-motion";
import type { LabItem } from "@/lib/lab";

export function LabListView({ labs }: { labs: LabItem[] }) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      overflowY: "auto",
      paddingTop: 100,
      paddingBottom: 48,
      paddingLeft: 32,
      paddingRight: 32,
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {labs.map((lab, i) => (
          <m.div
            key={lab.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link
              href={`/lab/${lab.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 1fr 80px",
                  alignItems: "baseline",
                  gap: 24,
                  padding: "20px 0",
                  borderBottom: "1px solid rgba(26,26,24,0.08)",
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.5")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <span style={{
                  fontFamily: "'MDUIXS', sans-serif",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  color: "#888884",
                }}>
                  {lab.number}
                </span>

                <span style={{
                  fontFamily: "'MDUIXS', sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  color: "#1A1A18",
                }}>
                  {lab.title}
                </span>

                <span style={{
                  fontFamily: "'MDUIXS', sans-serif",
                  fontSize: 12,
                  color: "#888884",
                  lineHeight: 1.5,
                }}>
                  {lab.description}
                </span>

                <span style={{
                  fontFamily: "'MDUIXS', sans-serif",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  color: "#888884",
                  textAlign: "right",
                }}>
                  {lab.date.slice(0, 7).replace("-", ".")}
                </span>
              </div>
            </Link>
          </m.div>
        ))}
      </div>
    </div>
  );
}
