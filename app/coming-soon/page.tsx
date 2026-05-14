"use client";

import { useEffect, useRef, useState } from "react";

const EMAIL = "hello@coltontollett.dev";

const VERT = /* glsl */`
  void main() { gl_Position = vec4(position, 1.0); }
`;

const GRAIN_FRAG = /* glsl */`
  uniform float uTime;
  uniform vec2  uResolution;

  float rand(vec2 p, float seed) {
    return fract(sin(dot(vec3(p, seed), vec3(12.9898, 4.1414, 78.233))) * 43758.5453);
  }

  void main() {
    vec2  pxR   = floor(gl_FragCoord.xy / 2.8);
    vec2  pxG   = floor(gl_FragCoord.xy / 1.6);
    vec2  pxB   = floor(gl_FragCoord.xy / 1.0);
    float frame = floor(uTime * 8.0);
    float luma  = rand(pxG, frame) * 0.03;
    float r     = mix(luma, rand(pxR, frame * 1.7 + 13.3), 0.94) * 0.12;
    float g     = mix(luma, rand(pxG, frame * 2.3 + 7.1),  0.86) * 0.10;
    float b     = mix(luma, rand(pxB, frame * 3.1 + 29.7), 0.70) * 0.06;
    float a     = rand(pxG, frame * 0.211) * 0.03 + 0.01;
    gl_FragColor = vec4(r, g, b, a);
  }
`;
const RING_DEFAULT = 14;
const RING_HOVER   = 32;

export default function ComingSoon() {
  const [emailCopied, setEmailCopied] = useState(false);
  const cursorRef    = useRef<HTMLDivElement>(null);
  const ringRef      = useRef<HTMLDivElement>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const canvas = grainCanvasRef.current;
    if (!canvas) return;
    let rafId: number;

    async function init() {
      const THREE = await import("three");
      let W = window.innerWidth;
      let H = window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ canvas: canvas!, antialias: false, alpha: true });
      renderer.setSize(W, H, false); // false = don't override CSS dimensions
      renderer.setClearColor(0x000000, 0);

      const scene    = new THREE.Scene();
      const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const material = new THREE.ShaderMaterial({
        vertexShader:   VERT,
        fragmentShader: GRAIN_FRAG,
        transparent:    true,
        uniforms: {
          uTime:       { value: 0 },
          uResolution: { value: new THREE.Vector2(W, H) },
        },
      });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

      function raf() {
        material.uniforms.uTime.value += 0.016;
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      const onResize = () => {
        W = window.innerWidth;
        H = window.innerHeight;
        renderer.setSize(W, H, false);
        material.uniforms.uResolution.value.set(W, H);
      };
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(rafId);
        renderer.dispose();
        window.removeEventListener("resize", onResize);
      };
    }

    let cleanup: (() => void) | undefined;
    init().then(fn => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, []);

  const expandRing  = () => {
    if (ringRef.current) {
      ringRef.current.style.width  = `${RING_HOVER}px`;
      ringRef.current.style.height = `${RING_HOVER}px`;
    }
  };
  const collapseRing = () => {
    if (ringRef.current) {
      ringRef.current.style.width  = `${RING_DEFAULT}px`;
      ringRef.current.style.height = `${RING_DEFAULT}px`;
    }
  };

  const linkStyle = {
    fontFamily: "'PP Neue Montreal', sans-serif",
    fontSize: 12,
    color: "#555559",
    textDecoration: "none",
    letterSpacing: "0.02em",
    cursor: "none",
    transition: "color 0.15s ease",
  } as const;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 24px",
      cursor: "none",
      position: "relative",
      zIndex: 2,
      overflow: "hidden",
    }}>
      {/* Logo */}
      <svg width="29" height="21" viewBox="0 0 29 21" fill="none" style={{ marginBottom: 32 }}>
        <path d="M8.47189 9.49798H0.5C0.5 9.49798 0.817269 1.26634 9.5 0.5V8.86104C9.5 8.86104 9.32329 9.4353 8.47189 9.5V9.49798Z" stroke="#000000" strokeMiterlimit="10"/>
        <path d="M8.47189 11.5H0.5C0.5 11.5 0.817269 19.7342 9.5 20.5V12.1378C9.5 12.1378 9.32329 11.563 8.47189 11.5Z" stroke="#000000" strokeMiterlimit="10"/>
        <path d="M16 20.5C18.4853 20.5 20.5 18.4853 20.5 16C20.5 13.5147 18.4853 11.5 16 11.5C13.5147 11.5 11.5 13.5147 11.5 16C11.5 18.4853 13.5147 20.5 16 20.5Z" stroke="#000000" strokeMiterlimit="10"/>
        <path d="M17.5964 0.5H14.4036C12.8 0.5 11.5 1.79996 11.5 3.40355V6.59645C11.5 8.20003 12.8 9.5 14.4036 9.5H17.5964C19.2 9.5 20.5 8.20003 20.5 6.59645V3.40355C20.5 1.79996 19.2 0.5 17.5964 0.5Z" stroke="#000000" strokeMiterlimit="10"/>
      </svg>

      {/* Title */}
      <h1 style={{
        fontFamily: "'Canela', serif",
        fontSize: "clamp(36px, 6vw, 60px)",
        fontWeight: 300,
        color: "#8B1F1F",
        letterSpacing: "-0.02em",
        lineHeight: 1,
        margin: "0 0 40px",
        textAlign: "center",
      }}>
        Coming soon.
      </h1>

      {/* Description */}
      <p style={{
        fontFamily: "'MDUIXS', sans-serif",
        fontSize: "clamp(8px, 2vw, 11px)",
        lineHeight: 1.5,
        color: "#555559",
        letterSpacing: 0,
        width: "min(560px, 100%)",
        textAlign: "center",
        margin: "0 0 24px",
      }}>
        Thank you for visiting the <span style={{ color: "#8B1F1F" }}>design engineering portfolio of Colton Tollett</span>.<br />Please check back as new work, writing and experiments will be posted very soon.<br />Feel free to reach out for any inquiries.
      </p>

      {/* Links */}
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <button
          onClick={() => {
            navigator.clipboard.writeText(EMAIL);
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 2000);
          }}
          onMouseEnter={e => { if (!emailCopied) { e.currentTarget.style.color = "#8B1F1F"; } expandRing(); }}
          onMouseLeave={e => { e.currentTarget.style.color = emailCopied ? "#BABABA" : "#555559"; collapseRing(); }}
          style={{
            ...linkStyle,
            color: emailCopied ? "#BABABA" : "#555559",
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          {emailCopied ? "Copied" : EMAIL}
        </button>

        {[
          { label: "X",        href: "https://x.com/colton__tollett" },
          { label: "LinkedIn", href: "https://www.linkedin.com/in/colton-tollett-050127137/" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={linkStyle}
            onMouseEnter={e => { e.currentTarget.style.color = "#8B1F1F"; expandRing(); }}
            onMouseLeave={e => { e.currentTarget.style.color = "#555559"; collapseRing(); }}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Film grain — behind content, blends with html/body background */}
      <canvas ref={grainCanvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 1, mixBlendMode: "overlay" }} />

      {/* Cursor */}
      <div ref={cursorRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 100 }}>
        <div ref={ringRef} style={{
          position: "absolute",
          width: RING_DEFAULT,
          height: RING_DEFAULT,
          borderRadius: "50%",
          border: "1.5px solid rgba(0,0,0,0.5)",
          transform: "translate(-50%, -50%)",
          transition: "width 0.2s ease, height 0.2s ease",
        }} />
      </div>
    </div>
  );
}
