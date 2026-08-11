"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// --- Color sampling ---
// Drawing a source image into a tiny (density x density) canvas forces the
// browser to downscale it, and downscaling IS averaging — each output
// pixel already represents the mean color of the source region it covers.
// That gives us both a representative color *and* a position (the cell's
// coordinate) for free, without writing a manual box-blur/averaging pass
// ourselves. The grid position is what makes this a "mesh" rather than a
// flat palette — a sample from the photo's top-left corner stays in the
// gradient's top-left, etc.
interface Sample {
  x: number; // 0..1, normalized position within the photo
  y: number;
  r: number;
  g: number;
  b: number;
}

function sampleColors(img: HTMLImageElement, density: number): Sample[] {
  const canvas = document.createElement("canvas");
  canvas.width = density;
  canvas.height = density;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, density, density);
  const { data } = ctx.getImageData(0, 0, density, density);

  const samples: Sample[] = [];
  for (let y = 0; y < density; y++) {
    for (let x = 0; x < density; x++) {
      const i = (y * density + x) * 4;
      samples.push({
        x: (x + 0.5) / density,
        y: (y + 0.5) / density,
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
      });
    }
  }
  return samples;
}

// --- Gradient rendering ---
// Each sample becomes a radial gradient, opaque at its own color in the
// center and fading to transparent at the edge — stacking them with
// normal alpha compositing is what makes overlapping samples blend into
// each other rather than just occluding, and the canvas-level blur is
// what turns a grid of soft circles into a continuous mesh.
function renderGradient(
  canvas: HTMLCanvasElement,
  samples: Sample[],
  blur: number,
  saturation: number,
  brightness: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const radius = Math.max(w, h) * 0.62;

  ctx.clearRect(0, 0, w, h);
  ctx.filter = `blur(${blur}px) saturate(${saturation}) brightness(${brightness})`;
  ctx.globalAlpha = 0.85;

  for (const s of samples) {
    const cx = s.x * w;
    const cy = s.y * h;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgb(${s.r}, ${s.g}, ${s.b})`);
    grad.addColorStop(1, `rgba(${s.r}, ${s.g}, ${s.b}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.filter = "none";
  ctx.globalAlpha = 1;
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 9,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--nav-muted)",
};

const HANDLE_SIZE = 16;
const HALF_HANDLE = HANDLE_SIZE / 2;
const TRACK_WIDTH = 140;

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [active, setActive] = useState(false);

  const commit = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const { left, width } = track.getBoundingClientRect();
      const t = Math.max(0, Math.min(1, (clientX - left) / width));
      const raw = min + t * (max - min);
      const stepped = Math.round(raw / step) * step;
      onChange(Math.min(max, Math.max(min, stepped)));
    },
    [min, max, step, onChange]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setActive(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    commit(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    commit(e.clientX);
  };

  const onPointerUp = () => {
    isDraggingRef.current = false;
    setActive(false);
  };

  const normalized = (value - min) / (max - min);
  const displayValue = step < 1 ? value.toFixed(2) : String(Math.round(value));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div style={{ display: "grid" }}>
        <span style={{ ...LABEL_STYLE, gridArea: "1/1", opacity: active ? 0 : 1 }}>{label}</span>
        <span
          style={{
            ...LABEL_STYLE,
            gridArea: "1/1",
            color: "var(--text-primary)",
            opacity: active ? 1 : 0,
          }}
        >
          {displayValue}
        </span>
      </div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          cursor: "pointer",
          position: "relative",
          width: TRACK_WIDTH,
          height: 2,
          borderRadius: 999,
          background: "var(--nav-faint)",
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: 2,
            borderRadius: 999,
            background: "var(--text-primary)",
            width: normalized * TRACK_WIDTH,
          }}
        />
        <motion.div
          transition={{ type: "spring", stiffness: 200, damping: 35 }}
          animate={{ width: active ? 24 : 16, height: active ? 24 : 16 }}
          style={{
            position: "absolute",
            top: "50%",
            left: normalized * TRACK_WIDTH - HALF_HANDLE,
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "1px solid var(--text-primary)",
            background: "transparent",
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--text-primary)" }} />
        </motion.div>
      </div>
    </div>
  );
}

export default function PhotoGradient() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [density, setDensity] = useState(6);
  const [blur, setBlur] = useState(70);
  const [saturation, setSaturation] = useState(1.3);
  const [brightness, setBrightness] = useState(1.0);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const redraw = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !img.complete) return;
    const samples = sampleColors(img, density);
    renderGradient(canvas, samples, blur, saturation, brightness);
  }, [density, blur, saturation, brightness]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function handleImageLoad() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    // Match the gradient canvas's internal resolution to the photo panel's
    // displayed size (at device pixel ratio) so the export is sharp.
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    redraw();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "gradient.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        padding: "96px 48px 48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 32,
          width: "fit-content",
        }}
      >
        <h1
          style={{
            fontFamily: "'MDUIXS', sans-serif",
            fontSize: 14,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-primary)",
            margin: 0,
            width: "100%",
            textAlign: "left",
          }}
        >
          Photo to Gradient
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 16,
            width: "100%",
          }}
        >
          {/* Photo panel — also the dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !imageSrc && fileInputRef.current?.click()}
            style={{
              position: "relative",
              flex: 1,
              aspectRatio: "1 / 1",
              borderRadius: 16,
              border: `1px dashed ${dragging ? "var(--text-primary)" : "var(--nav-faint)"}`,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: imageSrc ? "default" : "pointer",
              background: imageSrc ? "transparent" : "var(--frosted-bg)",
            }}
          >
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={imageSrc}
                alt=""
                onLoad={handleImageLoad}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <p style={{ ...LABEL_STYLE, textAlign: "center", padding: 24 }}>
                Drop a photo here, or click to browse
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
              style={{ display: "none" }}
            />
          </div>

          {/* Gradient panel */}
          <div
            style={{
              flex: 1,
              aspectRatio: "1 / 1",
              borderRadius: 16,
              overflow: "hidden",
              background: "var(--frosted-bg)",
            }}
          >
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            width: "100%",
            paddingTop: 24,
            borderTop: "1px solid var(--nav-faint)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              alignItems: "flex-end",
              gap: 32,
            }}
          >
            <Slider label="Density" value={density} min={2} max={12} step={1} onChange={setDensity} />
            <Slider label="Blur" value={blur} min={10} max={140} step={2} onChange={setBlur} />
            <Slider label="Saturation" value={saturation} min={0.4} max={2.2} step={0.05} onChange={setSaturation} />
            <Slider label="Brightness" value={brightness} min={0.5} max={1.6} step={0.05} onChange={setBrightness} />
          </div>

          <button
            onClick={handleDownload}
            disabled={!imageSrc}
            style={{
              ...LABEL_STYLE,
              alignSelf: "flex-start",
              padding: "12px 20px",
              borderRadius: 999,
              border: "1px solid var(--text-primary)",
              background: "transparent",
              color: "var(--text-primary)",
              cursor: imageSrc ? "pointer" : "not-allowed",
              opacity: imageSrc ? 1 : 0.4,
              whiteSpace: "nowrap",
            }}
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
