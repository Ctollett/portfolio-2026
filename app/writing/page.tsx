"use client";

import { useState, useEffect } from "react";
import { WritingSection } from "@/components";
import { NavBar } from "@/components/NavBar";

export default function WritingPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1080);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>

      <NavBar blur />

      {/* Writing list */}
      <main style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "0 28px" : "0 24px",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 628 }}>
          <WritingSection />
          <p style={{
            fontFamily: "'MDUIXS', sans-serif",
            fontSize: 9,
            letterSpacing: "0.14em",
            color: "#888884",
            margin: "24px 0 0",
          }}>
            More content coming soon
          </p>
        </div>
      </main>

    </div>
  );
}
