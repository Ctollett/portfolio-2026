"use client";

import { WritingSection } from "@/components";
import { NavBar } from "@/components/NavBar";

export default function WritingPage() {
  return (
    <div style={{ background: "#F4F2ED", minHeight: "100vh" }}>

      <NavBar blur />

      {/* Writing list */}
      <main style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
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
