"use client";

import { useEffect, useRef } from "react";
import GrainOverlay from "@/components/GrainOverlay";

const BG      = "#D4D6D2";
const STROKE  = "#8EA888";
const STROKE2 = "#8EA888";

export default function WasmPreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let raf: number;
    let start: number | null = null;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function drawWave(
      ctx: CanvasRenderingContext2D,
      W: number,
      centerY: number,
      amp: number,
      beta: number,
      ratio: number,
      phaseOffset: number,
      alpha: number,
      lineWidth: number,
    ) {
      ctx.beginPath();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = STROKE2;
      ctx.lineWidth   = lineWidth;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";

      const pad     = W * 0.08;
      const waveW   = W - pad * 2;
      const samples = Math.floor(waveW);

      for (let i = 0; i <= samples; i++) {
        const x        = pad + i;
        const norm     = i / samples;
        const carrier  = norm * Math.PI * 2 * 2.5 + phaseOffset;
        const mod      = norm * Math.PI * 2 * ratio + phaseOffset * 0.7;
        const y        = centerY - amp * Math.sin(carrier + beta * Math.sin(mod));
        if (i === 0) ctx.moveTo(x, y);
        else         ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function draw(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;

      // 8-second loop
      const loop    = (elapsed % 8000) / 8000;
      const beta    = 1.8 + 2.2 * Math.sin(loop * Math.PI * 2);
      const ratio   = 3.5 + 0.5 * Math.sin(loop * Math.PI * 4);
      const phase   = elapsed * 0.0006;

      const W  = canvas.width;
      const H  = canvas.height;
      const cy = H * 0.56;
      const amp = H * 0.16;

      // Background
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Faint axis line
      ctx.beginPath();
      ctx.strokeStyle = "#D8D4CC";
      ctx.lineWidth   = 0.5;
      ctx.globalAlpha = 0.6;
      ctx.moveTo(W * 0.08, cy);
      ctx.lineTo(W * 0.92, cy);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Ghost trail (slightly behind in phase)
      drawWave(ctx, W, cy, amp * 0.6, beta * 0.7, ratio, phase - 0.18, 0.12, 1.0);

      // Main waveform
      ctx.strokeStyle = STROKE;
      drawWave(ctx, W, cy, amp, beta, ratio, phase, 1.0, 1.5);

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: BG,
    }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0 }}
      />

      {/* Text */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        paddingBottom: "28vh",
      }}>
        <p style={{
          fontFamily: "'MDUIXS', sans-serif",
          fontSize: 9,
          letterSpacing: "0.28em",
          color: "#888884",
          margin: "0 0 10px",
          textTransform: "uppercase",
        }}>
          Audio Processing
        </p>
        <h1 style={{
          fontFamily: "'Canela', serif",
          fontSize: 36,
          fontStyle: "italic",
          fontWeight: 300,
          color: "#1A1A18",
          margin: 0,
          lineHeight: 1,
          letterSpacing: "-0.01em",
        }}>
          WASM DSP Engine
        </h1>
      </div>

      <GrainOverlay />
    </div>
  );
}
