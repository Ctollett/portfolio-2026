"use client";

import Link from "next/link";

const LOGO_PATHS = [
  "M8.47189 9.49798H0.5C0.5 9.49798 0.817269 1.26634 9.5 0.5V8.86104C9.5 8.86104 9.32329 9.4353 8.47189 9.5V9.49798Z",
  "M8.47189 11.5H0.5C0.5 11.5 0.817269 19.7342 9.5 20.5V12.1378C9.5 12.1378 9.32329 11.563 8.47189 11.5Z",
  "M16 20.5C18.4853 20.5 20.5 18.4853 20.5 16C20.5 13.5147 18.4853 11.5 16 11.5C13.5147 11.5 11.5 13.5147 11.5 16C11.5 18.4853 13.5147 20.5 16 20.5Z",
  "M17.5964 0.5H14.4036C12.8 0.5 11.5 1.79996 11.5 3.40355V6.59645C11.5 8.20003 12.8 9.5 14.4036 9.5H17.5964C19.2 9.5 20.5 8.20003 20.5 6.59645V3.40355C20.5 1.79996 19.2 0.5 17.5964 0.5Z",
];

const EXPERIENCE = [
  {
    company: "Choctaw Casino & Resorts",
    title:   "UI/Digital Designer",
    period:  "2019 – Present",
    bullets: [
      "Designed UI for Choctaw BETs and Choctaw Sports apps in Figma, owning the full design-to-handoff pipeline and collaborating directly with third-party development teams.",
      "Delivered promotional websites, marketing landing pages, and a casino-wide email campaign redesign, working closely with web development teams to translate designs into production.",
      "Produced visual compositions and promotional material in Photoshop for major casino events and brand partnerships including Texas Rangers, Dallas Stars, Slipknot, and Lamb of God.",
    ],
  },
  {
    company: "SmartPath",
    title:   "UX/UI Product Designer (Contract)",
    period:  "Oct 2024 – Jun 2025",
    bullets: [
      "Partnered directly with the co-founder to redesign the financial learning experience, conducting competitive analysis and heuristic evaluations to inform new video workflows, a playlist feature, and a personalized homepage.",
      "Shipped high-fidelity screens in Figma with component structures and annotations set up for developer handoff, working directly with engineering teams to deliver the complete redesign to over 1 million users at enterprise partners including Home Depot and Allstate Insurance.",
    ],
  },
];

const SKILLS: Record<string, string[]> = {
  "Design":      ["Figma", "FigJam", "Figma MCP", "Framer", "Adobe Creative Suite"],
  "Engineering": ["React", "TypeScript", "Next.js", "Rust", "WebAssembly", "Three.js", "WebGL", "GSAP", "Framer Motion", "Tailwind", "Lenis", "Vercel", "Vite", "Webpack", "Claude Code"],
};

const PROJECTS = [
  {
    name:        "TX-04",
    description: "Browser-Based Spatial Operator FM Synthesizer",
    url:         "tx-04.com",
    bullets: [
      "Created a spatial FM synthesizer where routing is drawn by hand on a physics canvas, proximity maps to modulation depth via exponential decay, and drawn connections resolve to FM algorithms in real time using Jaccard similarity matching.",
      "Built a rendering system of DOM nodes, a persistent SVG layer, and dedicated rAF loops writing directly through refs, keeping React out of all position, physics, and waveform updates to eliminate frame drops during live interaction.",
    ],
  },
  {
    name:        "Ruun",
    description: "SVG Spring Morph Library",
    url:         "getruun.com",
    bullets: [
      "Published Ruun, an open-source SVG morphing library where each path coordinate springs independently toward its target, producing natural overshoot and organic settle instead of deterministic easing curves.",
      "Engineered the path normalization pipeline to convert arbitrary SVG commands to absolute cubic bezier segments, resample to equal point counts by arc length, and run a best-fit rotation pass that prevents closed shapes from spinning rather than morphing.",
    ],
  },
  {
    name:        "WASM DSP Engine",
    description: "Real-Time FM Synthesis in WebAssembly",
    url:         "github.com/Ctollett/TX-04",
    bullets: [
      "Wrote a polyphonic FM synthesis engine in Rust compiled to WebAssembly, running inside an AudioWorkletProcessor on the audio thread; JavaScript GC and JIT variance caused audible glitches at the 2.9ms processing budget and WASM eliminated that unpredictability.",
      "Implemented true Phase Modulation over Frequency Modulation, applying the phase offset at compute time to make the engine sample-rate independent and reproduce the harmonic character of the DX7.",
    ],
  },
];

const EDUCATION = [
  {
    school: "Georgia Institute of Technology",
    degree: "MS Computer Science",
    major:  "HCI Specialization",
    year:   "2024 – Present",
    gpa:    "4.0",
  },
  {
    school: "Southeastern Oklahoma\nState University",
    degree: "BS Computer Science",
    major:  "",
    year:   "2022 – 2024",
    gpa:    "4.0",
  },
  {
    school: "Southeastern Oklahoma\nState University",
    degree: "BA English",
    major:  "Minor in Communications",
    year:   "2014 – 2017",
    gpa:    "",
  },
];

const FEATURES = [
  {
    title:       "Predicting the future evolution of plugin design",
    publication: "MusicRadar",
    year:        "2025",
    url:         "https://www.musicradar.com/music-tech/plugins/the-biggest-driver-right-now-is-people-wanting-everything-fast-predicting-the-future-evolution-of-plugin-design",
  },
];

const CONTACT_LINKS = [
  {
    text: "coltontollett.dev",
    href: "https://coltontollett.dev",
    icon: (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <circle cx="6" cy="6" r="5"/>
        <ellipse cx="6" cy="6" rx="2.5" ry="5"/>
        <line x1="1" y1="6" x2="11" y2="6"/>
      </svg>
    ),
  },
  {
    text: "x.com/colton__tollett",
    href: "https://x.com/colton__tollett",
    icon: (
      <svg width="10" height="10" viewBox="0 0 11 11" fill="currentColor">
        <path d="M8.73.5h1.63L6.88 4.98 11 10.5H7.8L5.24 7.22 2.33 10.5H.7l3.73-4.77L.5.5h3.28l2.3 3.04L8.73.5zm-.57 8.99h.9L2.9 1.44H1.93l6.23 8.05z"/>
      </svg>
    ),
  },
  {
    text: "github.com/Ctollett",
    href: "https://github.com/Ctollett",
    icon: (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
        <path fillRule="evenodd" d="M6 .5A5.5 5.5 0 0 0 .5 6c0 2.43 1.57 4.49 3.74 5.22.27.05.37-.12.37-.26v-.95c-1.52.33-1.84-.73-1.84-.73-.25-.63-.61-.8-.61-.8-.5-.34.04-.33.04-.33.55.04.84.57.84.57.49.84 1.28.6 1.59.46.05-.36.19-.6.35-.74-1.21-.14-2.48-.61-2.48-2.7 0-.6.21-1.08.56-1.47-.06-.14-.25-.7.05-1.45 0 0 .46-.15 1.52.57A5.3 5.3 0 0 1 6 3.8c.47 0 .94.06 1.38.18 1.07-.72 1.53-.57 1.53-.57.3.75.11 1.31.05 1.45.35.39.56.88.56 1.47 0 2.1-1.28 2.56-2.49 2.7.19.17.37.5.37 1v1.5c0 .14.1.31.38.26A5.5 5.5 0 0 0 11.5 6 5.5 5.5 0 0 0 6 .5z"/>
      </svg>
    ),
  },
  {
    text: "linkedin.com/in/colton-tollett",
    href: "https://www.linkedin.com/in/colton-tollett-050127137/",
    icon: (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
        <path d="M2.5 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM1.5 4.5h2v6h-2v-6zm3 0h1.9v.82h.03c.27-.5.92-1.02 1.9-1.02 2.03 0 2.4 1.34 2.4 3.07V10.5h-2V7.73c0-.66-.01-1.52-.92-1.52-.93 0-1.07.73-1.07 1.47V10.5h-2v-6z"/>
      </svg>
    ),
  },
  {
    text: "hello@coltontollett.dev",
    href: "mailto:hello@coltontollett.dev",
    icon: (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="2.5" width="10" height="7" rx="1"/>
        <path d="M1 4l5 3.5 5-3.5"/>
      </svg>
    ),
  },
];

const sectionLabel: React.CSSProperties = {
  fontFamily:    "'MDUIXS', sans-serif",
  fontSize:      7,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color:         "#444441",
  margin:        "0 0 8px",
};

const rule: React.CSSProperties = {
  border:    "none",
  borderTop: "1px solid rgba(26,26,24,0.1)",
  margin:    "0 0 16px",
};

const entryName: React.CSSProperties = {
  fontFamily:    "'MDUIXS', sans-serif",
  fontSize:      13,
  color:         "#1A1A18",
  letterSpacing: "0.01em",
};

const entryMeta: React.CSSProperties = {
  fontFamily:    "'MDUIXS', sans-serif",
  fontSize:      11,
  color:         "#555553",
  letterSpacing: "0.08em",
  flexShrink:    0,
  marginLeft:    8,
};

const entrySubtitle: React.CSSProperties = {
  fontFamily:    "'MDUIXS', sans-serif",
  fontSize:      8,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color:         "#C0582A",
  margin:        "0 0 6px",
};

const bulletText: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize:   11,
  lineHeight: 1.6,
  color:      "#2E2E2C",
  textWrap:   "pretty" as React.CSSProperties["textWrap"],
};

export default function ResumePage() {
  return (
    <>
      <style>{`
        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print { display: none !important; }
          .resume-shell {
            background: white !important;
            display: flex !important;
            justify-content: center !important;
            padding: 0 !important;
            min-height: unset !important;
          }
          .resume-paper {
            box-shadow: none !important;
            width: 8.5in !important;
            max-width: 8.5in !important;
            min-height: 11in !important;
            padding: 0.45in !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            zoom: 0.8 !important;
            margin: 0 auto !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          @page {
            size: 8.5in 11in;
            margin: 0;
          }
        }
      `}</style>

      {/* Top bar — hidden on print */}
      <div className="no-print" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px",
        background: "var(--color-bg)",
        borderBottom: "1px solid rgba(26,26,24,0.08)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
            <path d="M7 1L1 6L7 11" stroke="#555553" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 8, letterSpacing: "0.14em", color: "#555553" }}>Back</span>
        </Link>
        <button
          type="button"
          onClick={() => window.open("/ColtonTollett-Resume.pdf", "_blank")}
          style={{
            fontFamily:    "'MDUIXS', sans-serif",
            fontSize:      8,
            letterSpacing: "0.14em",
            color:         "#1A1A18",
            background:    "none",
            border:        "1px solid rgba(26,26,24,0.2)",
            borderRadius:  4,
            padding:       "8px 16px",
            cursor:        "pointer",
          }}
        >
          Download PDF
        </button>
      </div>

      {/* Shell */}
      <div className="resume-shell" style={{
        background:     "var(--color-bg)",
        minHeight:      "100vh",
        display:        "flex",
        justifyContent: "center",
        padding:        "80px 24px",
      }}>

        {/* Paper */}
        <div className="resume-paper" style={{
          background: "white",
          width:      "100%",
          maxWidth:   800,
          padding:    "48px 56px",
          boxShadow:  "0 2px 40px rgba(0,0,0,0.07)",
          alignSelf:  "flex-start",
        }}>

          {/* ── Header ───────────────────────────────────────────── */}
          <header style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>

              {/* Name block */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <svg
                  width="24" height="17" viewBox="0 0 29 21"
                  fill="none" stroke="#1A1A18" strokeWidth="1.1" strokeMiterlimit="10"
                  style={{ display: "block", marginBottom: 12 }}
                >
                  {LOGO_PATHS.map((d, i) => <path key={i} d={d} />)}
                </svg>
                <h1 style={{ fontFamily: "'Canela', serif", fontSize: 28, fontWeight: 300, fontStyle: "italic", color: "#C0582A", margin: "0 0 4px", lineHeight: 1 }}>
                  Colton Tollett
                </h1>
                <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2E2E2C", margin: "0 0 8px" }}>
                  Design Engineer
                </p>
                <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 11, lineHeight: 1.6, color: "#2E2E2C", margin: 0, maxWidth: 320, textWrap: "pretty" as React.CSSProperties["textWrap"] }}>
                  Design background, engineering depth. I focus on developer tools and interface systems, building from Figma to production across real-time browser experiences and creative tooling.
                </p>
              </div>

              {/* Contact links */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", alignSelf: "stretch" }}>
                {CONTACT_LINKS.map(({ text, href, icon }) => (
                  <a
                    key={text}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      fontFamily: "'MDUIXS', sans-serif", fontSize: 11,
                      letterSpacing: "0.04em", color: "#555553",
                      textDecoration: "underline",
                      textDecorationColor: "rgba(26,26,24,0.2)",
                      textUnderlineOffset: 3,
                      lineHeight: 1.6,
                    }}
                  >
                    {icon}
                    {text}
                  </a>
                ))}
              </div>

            </div>
            <hr style={{ border: "none", borderTop: "1px solid rgba(26,26,24,0.1)", margin: 0 }} />
          </header>

          {/* ── Two-column body ──────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 188px", gap: "0 36px", alignItems: "start" }}>

            {/* Left — Experience + Projects */}
            <div>

              <section>
                <p style={sectionLabel}>Experience</p>
                <hr style={rule} />

                {EXPERIENCE.map((job, i) => (
                  <div key={i} style={{ marginBottom: i < EXPERIENCE.length - 1 ? 20 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                      <span style={entryName}>{job.company}</span>
                      <span style={entryMeta}>{job.period}</span>
                    </div>
                    <p style={entrySubtitle}>{job.title}</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {job.bullets.map((b, j) => (
                        <li key={j} style={{ display: "flex", gap: 6, marginBottom: 2 }}>
                          <span style={{ ...bulletText, color: "rgba(26,26,24,0.85)", flexShrink: 0 }}>–</span>
                          <span style={bulletText}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              <section style={{ marginTop: 24 }}>
                <p style={sectionLabel}>Projects</p>
                <hr style={rule} />

                {PROJECTS.map((project, i) => (
                  <div key={i} style={{ marginBottom: i < PROJECTS.length - 1 ? 20 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                      <span style={entryName}>{project.name}</span>
                      <a href={`https://${project.url}`} target="_blank" rel="noopener noreferrer" style={{ ...entryMeta, fontSize: 11, textDecoration: "underline", textDecorationColor: "rgba(26,26,24,0.25)", textUnderlineOffset: 3 }}>{project.url}</a>
                    </div>
                    <p style={entrySubtitle}>{project.description}</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {project.bullets.map((b, j) => (
                        <li key={j} style={{ display: "flex", gap: 6, marginBottom: 2 }}>
                          <span style={{ ...bulletText, color: "rgba(26,26,24,0.85)", flexShrink: 0 }}>–</span>
                          <span style={bulletText}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

            </div>

            {/* Right — Skills + Education */}
            <div>

              <section style={{ marginBottom: 24 }}>
                <p style={sectionLabel}>Skills</p>
                <hr style={rule} />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {Object.entries(SKILLS).map(([category, items]) => (
                    <div key={category}>
                      <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 7, letterSpacing: "0.16em", textTransform: "uppercase", color: "#444441", margin: "0 0 4px" }}>
                        {category}
                      </p>
                      <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 11, color: "#2E2E2C", lineHeight: 1.6, margin: 0 }}>
                        {items.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p style={sectionLabel}>Education</p>
                <hr style={rule} />
                {EDUCATION.map((edu, i) => (
                  <div key={i} style={{ marginBottom: i < EDUCATION.length - 1 ? 12 : 0 }}>
                    <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 7, letterSpacing: "0.08em", color: "#444441", margin: "0 0 2px" }}>
                      {edu.year}
                    </p>
                    <p style={{ ...entryName, fontSize: 11, margin: "0 0 2px", whiteSpace: "pre-line" }}>{edu.school}</p>
                    <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 10, letterSpacing: "0.06em", color: "#555553", margin: "0 0 2px" }}>
                      {edu.degree}{edu.major ? `, ${edu.major}` : ""}
                    </p>
                    {edu.gpa && (
                      <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 10, letterSpacing: "0.06em", color: "#888884", margin: 0 }}>
                        GPA {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
              </section>

              <section style={{ marginTop: 24 }}>
                <p style={sectionLabel}>Features</p>
                <hr style={rule} />
                {FEATURES.map((item, i) => (
                  <div key={i} style={{ marginBottom: i < FEATURES.length - 1 ? 12 : 0 }}>
                    <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 7, letterSpacing: "0.08em", color: "#444441", margin: "0 0 2px" }}>
                      {item.year}
                    </p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...entryName, fontSize: 11, display: "block", margin: "0 0 2px", textDecoration: "underline", textDecorationColor: "rgba(26,26,24,0.25)", textUnderlineOffset: 3 }}
                    >
                      {item.title}
                    </a>
                    <p style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 10, letterSpacing: "0.06em", color: "#555553", margin: 0 }}>
                      {item.publication}
                    </p>
                  </div>
                ))}
              </section>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
