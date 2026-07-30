"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Term {
  label: string;
  def: string;
}

const TERMS: Record<string, Term> = {
  kerning:  { label: "Kerning",  def: "The space adjusted between two specific characters." },
  leading:  { label: "Leading",  def: "Vertical space between successive lines of type." },
  tracking: { label: "Tracking", def: "Uniform spacing applied evenly across a range of text." },
  baseline: { label: "Baseline", def: "The invisible line where the base of each character sits." },
  xheight:  { label: "x-height", def: "The height of lowercase letters, excluding ascenders and descenders." },
};

const TEXT_MAX_WIDTH = 210;  // px, definition text wraps once it would exceed this width
const TOOLTIP_MIN_W = 160;   // px, floor so very short definitions don't produce a cramped tooltip
const TOOLTIP_MIN_H = 90;    // px
const PAD_X = 18;
const PAD_Y = 20;            // even top/bottom text spacing — the icon floats independently and doesn't affect it
const TOOLTIP_RADIUS = 18;
const GAP = 16;              // space between the cursor and the tooltip's top edge
const MAX_STAGGER = 0.55;    // seconds, total sweep duration across the diagonal, entrance only
const EXIT_STAGGER = 0.16;   // seconds, total sweep duration on the way out — much quicker than the entrance
const WAVE_JITTER = 0.08;    // seconds, small per-piece randomness so the sweep isn't robotic
const CELL_DURATION = 0.18;
const EXIT_CELL_DURATION = 0.09;
const CELL_OVERLAP = 1;      // px each cell is expanded by, so shared edges hide sub-pixel seams
const CELL_RADIUS = 4;       // px, rounds each pixel piece's corners
const STAGGER_EASE_POWER = 0.45; // <1 packs delays tighter near the end of the sweep, so it starts slow and snaps at the finish
const CENTER_MAX_PIECE = 24; // px, allowed piece size near the tooltip's center — kept small
const EDGE_MAX_PIECE = 74;   // px, allowed piece size near the outer edge — allowed to grow large
const MIN_PIECE = 14;        // px, floor below which a piece won't be split further

interface PixelRect { x: number; y: number; w: number; h: number }

// The allowed max piece size grows with distance from the tooltip's
// center, so pieces are forced small in the middle and can grow large
// toward the edges. Both the effective distance and the final threshold
// are jittered, so the pattern varies each time rather than forming
// perfect concentric rings while still following the same overall trend.
function allowedMaxSize(cx: number, cy: number, boxW: number, boxH: number): number {
  const centerX = boxW / 2;
  const centerY = boxH / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
  const rawD = Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2) / maxDist; // 0 = center, 1 = edge
  const d = Math.min(1, Math.max(0, rawD + (Math.random() - 0.5) * 0.35));
  const base = CENTER_MAX_PIECE + d * (EDGE_MAX_PIECE - CENTER_MAX_PIECE);
  return base * (0.75 + Math.random() * 0.5);
}

// Recursively splits the tooltip rect into irregular, variably-sized pieces
// (rather than a uniform grid) so the reveal reads as scattered digital
// static resolving into a shape instead of a grid animating in. A piece
// larger than its local allowed max (see allowedMaxSize) is always split
// further, so size grows smoothly from small at the center to large at
// the edges instead of being uniformly random.
function subdivide(x: number, y: number, w: number, h: number, depth: number, out: PixelRect[], boxW: number, boxH: number) {
  const maxAllowed = allowedMaxSize(x + w / 2, y + h / 2, boxW, boxH);
  const tooBig = w > maxAllowed || h > maxAllowed;
  const tooSmallToSplit = w < MIN_PIECE * 2 || h < MIN_PIECE * 2 || depth >= 12;
  const shouldStop = !tooBig && (tooSmallToSplit || Math.random() < 0.18);
  if (shouldStop) {
    out.push({ x, y, w, h });
    return;
  }
  const splitVertical = w >= h;
  if (splitVertical) {
    const splitX = w * (0.35 + Math.random() * 0.3);
    subdivide(x, y, splitX, h, depth + 1, out, boxW, boxH);
    subdivide(x + splitX, y, w - splitX, h, depth + 1, out, boxW, boxH);
  } else {
    const splitY = h * (0.35 + Math.random() * 0.3);
    subdivide(x, y, w, splitY, depth + 1, out, boxW, boxH);
    subdivide(x, y + splitY, w, h - splitY, depth + 1, out, boxW, boxH);
  }
}

function makePixelRects(w: number, h: number): PixelRect[] {
  const out: PixelRect[] = [];
  subdivide(0, 0, w, h, 0, out, w, h);
  return out;
}

interface Pixel {
  rect: PixelRect;
  enterDelay: number;
  exitDelay: number;
}

// Radial sweep: entrance starts at the tooltip's center and expands
// outward, exit shrinks back in from the outer edges toward the center,
// so pieces leave in the opposite order they arrived. STAGGER_EASE_POWER
// bends the delay curve so pieces are spread further apart in time near
// the start (slow) and packed closer together near the end (fast, with a
// snap as the last few resolve almost together).
function makePixels(w: number, h: number): Pixel[] {
  const centerX = w / 2;
  const centerY = h / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  return makePixelRects(w, h).map((rect) => {
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const d = Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2) / maxDist; // 0 = center, 1 = outer edge
    const jitter = (Math.random() - 0.5) * WAVE_JITTER;
    return {
      rect,
      enterDelay: Math.max(0, Math.pow(d, STAGGER_EASE_POWER) * MAX_STAGGER + jitter),
      exitDelay: Math.max(0, Math.pow(1 - d, STAGGER_EASE_POWER) * EXIT_STAGGER + jitter * (EXIT_STAGGER / MAX_STAGGER)),
    };
  });
}

// A seed pixel that multiplies out to four and collapses back, on a loop —
// a small ambient echo of the tooltip's own pixel-piece reveal.
const PULSE_STAGE_TIMES = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];
const PULSE_COUNTS = [1, 2, 3, 4, 3, 2, 1];

function PixelPulse() {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 10 }} aria-hidden>
      {[1, 2, 3, 4].map((threshold, i) => (
        <motion.span
          key={i}
          animate={{ opacity: PULSE_COUNTS.map((c) => (c >= threshold ? 1 : 0)) }}
          transition={{
            duration: 1.8,
            times: PULSE_STAGE_TIMES,
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 0.4,
            ease: "easeInOut",
          }}
          style={{
            width: 6,
            height: 6,
            borderRadius: 2,
            background: "#4552D6",
          }}
        />
      ))}
    </div>
  );
}

// Plain text runs blur while any tooltip is open — a "surrounding text"
// blur used to focus attention on the active term and its tooltip.
function BlurText({ blurred, children }: { blurred: boolean; children: React.ReactNode }) {
  return (
    <span style={{ filter: blurred ? "blur(4px)" : "none", transition: "filter 0.25s ease" }}>
      {children}
    </span>
  );
}

function Term({ id, activeId, children }: { id: keyof typeof TERMS; activeId: keyof typeof TERMS | null; children: React.ReactNode }) {
  // The active term itself stays sharp — only the other terms and the
  // surrounding prose blur. This has to live on the Term's own filter
  // rather than the paragraph's, since a child can't opt out of a filter
  // applied to an ancestor.
  const blurred = activeId !== null && activeId !== id;
  return (
    <span
      data-term={id}
      style={{
        color: "#4552D6",
        fontWeight: 400,
        textDecoration: "underline",
        textUnderlineOffset: 3,
        textDecorationColor: "rgba(69,82,214,0.4)",
        textDecorationStyle: "dotted",
        cursor: "pointer",
        filter: blurred ? "blur(4px)" : "none",
        transition: "filter 0.25s ease",
      }}
    >
      {children}
    </span>
  );
}

export default function LiquidTooltip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeElRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const [activeId, setActiveId] = useState<keyof typeof TERMS | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [tooltipSize, setTooltipSize] = useState({ w: TOOLTIP_MIN_W, h: TOOLTIP_MIN_H });

  function handleOver(e: React.MouseEvent) {
    const target = (e.target as HTMLElement).closest("[data-term]") as HTMLElement | null;
    if (!target || target === activeElRef.current) return;

    const id = target.dataset.term as keyof typeof TERMS;
    const cr = containerRef.current!.getBoundingClientRect();

    // Measure the definition text against the same font/padding the real
    // tooltip uses, so the box is sized to fit instead of a fixed constant.
    const measureEl = measureRef.current!;
    measureEl.style.whiteSpace = "nowrap";
    measureEl.style.width = "auto";
    measureEl.textContent = TERMS[id].def;
    const textWidth = Math.min(measureEl.scrollWidth, TEXT_MAX_WIDTH);
    measureEl.style.whiteSpace = "normal";
    measureEl.style.width = `${textWidth}px`;
    const textHeight = measureEl.scrollHeight;

    const w = Math.max(TOOLTIP_MIN_W, Math.ceil(textWidth) + PAD_X * 2);
    const h = Math.max(TOOLTIP_MIN_H, Math.ceil(textHeight) + PAD_Y * 2);

    activeElRef.current = target;
    setTooltipSize({ w, h });
    setAnchor({ x: e.clientX - cr.left - w / 2, y: e.clientY - cr.top + GAP });
    setPixels(makePixels(w, h));
    setActiveId(id);
  }

  function handleMove(e: React.MouseEvent) {
    // Keeps the tooltip tracking the cursor for as long as it's over the
    // currently active term.
    if (!activeElRef.current) return;
    const cr = containerRef.current!.getBoundingClientRect();
    setAnchor({ x: e.clientX - cr.left - tooltipSize.w / 2, y: e.clientY - cr.top + GAP });
  }

  function handleOut(e: React.MouseEvent) {
    const leavingTerm = (e.target as HTMLElement).closest("[data-term]");
    const enteringTerm = (e.relatedTarget as HTMLElement | null)?.closest?.("[data-term]");
    // Moving straight from one term to another is handled entirely by the
    // next handleOver call — bailing here avoids a null in-between state
    // that would interrupt the current tooltip's exit animation mid-flight.
    if (!leavingTerm || enteringTerm) return;

    activeElRef.current = null;
    setActiveId(null);
  }

  const radius = Math.min(TOOLTIP_RADIUS, tooltipSize.w / 2, tooltipSize.h / 2);

  return (
    <div style={{ minHeight: "100vh", background: "#F4EFE6", display: "flex", justifyContent: "center", padding: "160px 24px" }}>
      {/* Hidden measuring element — same font/line-height as the real
          tooltip text — used to size the tooltip to fit each definition. */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: "fixed",
          top: -9999,
          left: -9999,
          visibility: "hidden",
          pointerEvents: "none",
          fontFamily: "'PP Supply Mono', monospace",
          fontSize: 12.5,
          lineHeight: 1.5,
          letterSpacing: "0.01em",
          textWrap: "pretty",
        }}
      />

      <div
        ref={containerRef}
        onMouseOver={handleOver}
        onMouseMove={handleMove}
        onMouseOut={handleOut}
        style={{ position: "relative", maxWidth: 600 }}
      >
        <AnimatePresence>
          {activeId !== null && anchor && (
            <motion.div
              key={activeId}
              initial={{ scale: 0.92 }}
              animate={{ scale: 1, transition: { type: "spring", stiffness: 320, damping: 20 } }}
              exit={{ scale: 0.92, transition: { duration: 0.12 } }}
              style={{
                position: "absolute",
                left: anchor.x,
                top: anchor.y,
                width: tooltipSize.w,
                height: tooltipSize.h,
                transformOrigin: "center top",
                pointerEvents: "none",
              }}
            >
              {/* Irregular pixel pieces sweep in from the center outward
                  and leave by shrinking back in from the outer edges, so
                  the tooltip assembles and dissolves like static resolving
                  into a shape. Each piece is expanded by CELL_OVERLAP so
                  shared edges overlap slightly, which hides any sub-pixel
                  seam between adjacent pieces. */}
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: radius,
                overflow: "hidden",
              }}>
                {pixels.map(({ rect, enterDelay, exitDelay }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1, transition: { duration: CELL_DURATION, ease: "easeOut", delay: enterDelay } }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: EXIT_CELL_DURATION, ease: "easeIn", delay: exitDelay } }}
                    style={{
                      position: "absolute",
                      left: rect.x - CELL_OVERLAP,
                      top: rect.y - CELL_OVERLAP,
                      width: rect.w + CELL_OVERLAP * 2,
                      height: rect.h + CELL_OVERLAP * 2,
                      borderRadius: CELL_RADIUS,
                      background: "#4552D6",
                    }}
                  />
                ))}
              </div>

              {/* Card lift + rim light — kept as its own layer, separate
                  from the pixel pieces, so it only appears once the card
                  has mostly assembled rather than being visible from the
                  very first pixel. */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: CELL_DURATION, delay: MAX_STAGGER * 0.85 } }}
                exit={{ opacity: 0, transition: { duration: EXIT_CELL_DURATION * 0.5 } }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: radius,
                  pointerEvents: "none",
                  boxShadow: [
                    "0 10px 20px -12px rgba(0,0,0,0.22)",
                    "0 4px 8px -6px rgba(0,0,0,0.15)",
                    "inset 0 1px 0 rgba(255,255,255,0.4)",
                    "inset 0 0 0 1px rgba(255,255,255,0.14)",
                  ].join(", "),
                }}
              />

              {/* A small print registration mark — a nod to the editorial/
                  production-tool references throughout the definitions. */}
              <motion.svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: CELL_DURATION, delay: MAX_STAGGER } }}
                exit={{ opacity: 0, transition: { duration: EXIT_CELL_DURATION * 0.6 } }}
                style={{ position: "absolute", top: 12, right: 12 }}
              >
                <circle cx="6" cy="6" r="3.25" stroke="#FFFFFF" strokeWidth="0.75" strokeOpacity="0.85" />
                <line x1="6" y1="0" x2="6" y2="12" stroke="#FFFFFF" strokeWidth="0.75" strokeOpacity="0.85" />
                <line x1="0" y1="6" x2="12" y2="6" stroke="#FFFFFF" strokeWidth="0.75" strokeOpacity="0.85" />
              </motion.svg>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: CELL_DURATION, delay: MAX_STAGGER } }}
                exit={{ opacity: 0, transition: { duration: EXIT_CELL_DURATION * 0.6 } }}
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: `${PAD_Y}px ${PAD_X}px`,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{
                  fontFamily: "'PP Supply Mono', monospace",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  letterSpacing: "0.01em",
                  color: "#FFFFFF",
                  textWrap: "pretty",
                }}>
                  {TERMS[activeId].def}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <PixelPulse />

        <p style={{
          fontFamily: "'PP Supply Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#888884",
          margin: "0 0 28px",
        }}>
          Typography
        </p>

        <p style={{
          fontFamily: "'PP Supply Mono', monospace",
          fontWeight: 200,
          fontSize: 16,
          lineHeight: 1.85,
          color: "#4E4B47",
          textWrap: "pretty",
        }}>
          <BlurText blurred={activeId !== null}>
            Good typography is mostly invisible until it isn&rsquo;t. A page holds
            together because of a hundred small decisions nobody consciously reads:
            the </BlurText><Term id="kerning" activeId={activeId}>kerning</Term><BlurText blurred={activeId !== null}> between two letters that would
            otherwise collide, the </BlurText><Term id="leading" activeId={activeId}>leading</Term><BlurText blurred={activeId !== null}> that gives each
            line room to breathe, the </BlurText><Term id="tracking" activeId={activeId}>tracking</Term><BlurText blurred={activeId !== null}> that keeps
            a run of capitals from feeling{" "}cramped. Every letter sits on an{" "}invisible{" "}
</BlurText><Term id="baseline" activeId={activeId}>baseline</Term><BlurText blurred={activeId !== null}>, and the quiet relationship between
            that line and the </BlurText><Term id="xheight" activeId={activeId}>x-height</Term><BlurText blurred={activeId !== null}> above it is what
            makes a typeface feel calm or restless. None of this is meant to be
            noticed. It&rsquo;s meant to be trusted.
          </BlurText>
        </p>
      </div>
    </div>
  );
}
