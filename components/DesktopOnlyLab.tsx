"use client";

import { useEffect, useState } from "react";

/**
 * Gates a lab's interactive content behind a desktop check. Labs that lean
 * on hover, scroll-lock, or precise pointer input don't have a meaningful
 * touch equivalent, so mobile visitors (whether from the /lab grid or a
 * direct shared link) see this message instead of a broken experience.
 */
export function DesktopOnlyLab({ title, children }: { title?: string; children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1080);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isMobile) return <>{children}</>;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-bg)",
      padding: 32,
      textAlign: "center",
    }}>
      <div style={{ maxWidth: 280 }}>
        {title && (
          <p style={{
            fontFamily: "'MDUIXS', sans-serif",
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--nav-muted)",
            margin: "0 0 12px",
          }}>
            {title}
          </p>
        )}
        <p style={{
          fontFamily: "'MDUIXS', sans-serif",
          fontSize: 13,
          lineHeight: 1.7,
          color: "var(--text-body)",
          margin: 0,
        }}>
          Built for desktop. It relies on mouse and scroll interactions that don&rsquo;t translate to touch, so please open this on a larger screen.
        </p>
      </div>
    </div>
  );
}
