"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const IMAGES = [
  {
    src: "/framed-gallery/statue-face-1.png",
    title: "Marble Face I",
    description: "Weathered bust, extreme detail",
    meta: "REC ● 00:11:48",
  },
  {
    src: "/framed-gallery/statue-face-2.png",
    title: "Marble Face II",
    description: "Fractured bust, low light",
    meta: "REC ● 00:26:33",
  },
  {
    src: "/framed-gallery/statue-hall.png",
    title: "Statuary Hall",
    description: "Sculpture corridor, unsteady pass",
    meta: "REC ● 00:44:15",
  },
  {
    src: "/framed-gallery/statue-corridor-1.png",
    title: "Gallery Row",
    description: "Figures along a marble corridor",
    meta: "REC ● 00:52:02",
  },
  {
    src: "/framed-gallery/statue-face-3.png",
    title: "Marble Face III",
    description: "Split light, corroded surface",
    meta: "REC ● 01:03:41",
  },
  {
    src: "/framed-gallery/statue-face-4.png",
    title: "Marble Face IV",
    description: "Cracked stone, extreme detail",
    meta: "REC ● 01:14:59",
  },
  {
    src: "/framed-gallery/statue-bust-1.png",
    title: "Fixed Gaze",
    description: "Bust, signal breaking up",
    meta: "REC ● 01:22:16",
  },
  {
    src: "/framed-gallery/statue-profile-1.png",
    title: "Profile Study",
    description: "Weathered head, dim interior",
    meta: "REC ● 01:35:04",
  },
  {
    src: "/framed-gallery/statue-feet.png",
    title: "Pedestal Detail",
    description: "Inscribed base, low frame",
    meta: "REC ● 01:41:27",
  },
  {
    src: "/framed-gallery/statue-silhouette-1.png",
    title: "Doorway I",
    description: "Backlit figure, signal tear",
    meta: "REC ● 01:52:38",
  },
  {
    src: "/framed-gallery/statue-silhouette-2.png",
    title: "Doorway II",
    description: "Backlit figure, wet floor reflection",
    meta: "REC ● 02:03:50",
  },
  {
    src: "/framed-gallery/statue-silhouette-3.png",
    title: "Doorway III",
    description: "Backlit figure, motion smear",
    meta: "REC ● 02:14:22",
  },
  {
    src: "/framed-gallery/statue-reflection-1.png",
    title: "Standing Water",
    description: "Figure and reflection, corridor end",
    meta: "REC ● 02:25:09",
  },
  {
    src: "/framed-gallery/statue-reflection-2.png",
    title: "Gallery Floor",
    description: "Figure reflected, dim room",
    meta: "REC ● 02:33:47",
  },
  {
    src: "/framed-gallery/statue-seated.png",
    title: "Seated Figure",
    description: "Seated bust, glitching light",
    meta: "REC ● 02:44:12",
  },
  {
    src: "/framed-gallery/statue-lowangle-1.png",
    title: "Looking Up I",
    description: "Low angle, arms raised, overexposed",
    meta: "REC ● 02:52:30",
  },
  {
    src: "/framed-gallery/statue-lowangle-2.png",
    title: "Looking Up II",
    description: "Low angle face, domed ceiling",
    meta: "REC ● 03:01:18",
  },
  {
    src: "/framed-gallery/statue-row-1.png",
    title: "Four Faces",
    description: "Row of busts, color bleed",
    meta: "REC ● 03:12:44",
  },
  {
    src: "/framed-gallery/statue-row-2.png",
    title: "Two Profiles",
    description: "Facing busts, motion streak",
    meta: "REC ● 03:20:56",
  },
  {
    src: "/framed-gallery/statue-row-3.png",
    title: "Receding Line",
    description: "Busts in profile, warm and cool split",
    meta: "REC ● 03:31:09",
  },
  {
    src: "/framed-gallery/statue-face-5.png",
    title: "Marble Face V",
    description: "Close detail, heavy grain",
    meta: "REC ● 03:42:25",
  },
];

const ITEM_W = 340;
const ITEM_H = 340;
const ITEM_RADIUS = 18;
const GAP = 70;
const ROW_GAP = 110;          // taller than GAP on purpose — leaves room below the frame for
                               // the metadata label before row 2's cards start

const FRAME_PAD = 60;         // px, frame size beyond the item's own bounds
const FRAME_W = ITEM_W + FRAME_PAD;
const FRAME_H = ITEM_H + FRAME_PAD;
const CORNER_ARM = 30;        // px, length of each corner bracket's arms
const CORNER_RADIUS = 12;     // px, roundness of the bracket's own corner
const TICK_LENGTH = 10;       // px, small mark at the midpoint of each edge

// A single rounded-corner bracket: two straight arms joined by a quarter
// arc, rather than a full rectangle border — reads as a frame without the
// weight of a continuous line. sweep controls which way the arc bows.
function cornerPath(x: number, y: number, dx: 1 | -1, dy: 1 | -1, sweep: 0 | 1) {
  const v1 = `${x} ${y + CORNER_ARM * dy}`;
  const v2 = `${x} ${y + CORNER_RADIUS * dy}`;
  const h1 = `${x + CORNER_RADIUS * dx} ${y}`;
  const h2 = `${x + CORNER_ARM * dx} ${y}`;
  return `M ${v1} L ${v2} A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 ${sweep} ${h1} L ${h2}`;
}

// --- Grid ---
// The gallery is a grid, not a single filmstrip — every row can be
// dragged left/right independently, and (since there are only 3 rows)
// every column can be dragged up/down to cycle which row's image sits
// in that column, like grabbing a single layer of a puzzle and twisting
// just that layer while the rest holds still. The frame stays fixed
// over one cell (FRAME_ROW, FRAME_COL); whichever image gets maneuvered
// there is "in focus."
const ROWS = 3;
const COLS = 7;
const FRAME_ROW = 1;
const FRAME_COL = 3;
const CELLS = ROWS * COLS;

const SPACING = ITEM_W + GAP;       // horizontal distance between columns
const ROW_SPACING = ITEM_H + ROW_GAP; // vertical distance between rows
const ROW_LOOP_W = COLS * SPACING;   // a row is a closed loop of COLS slots — dragging past the
const COL_LOOP_H = ROWS * ROW_SPACING; // end has to wrap back around, same as a real cube layer,
                                        // rather than dragging the whole finite set of cards off
                                        // to one side and leaving empty space behind them

const EFFECT_DISTANCE = Math.min(SPACING, ROW_SPACING) * 1.1; // 2D distance at which the
                                                                // distortion reaches its max
const MIN_OPACITY = 0.4;                // the image itself never fully disappears

const BG_COLOR = "#F2ECDD";

const DRAG_MULTIPLIER = 1.4;
const WHEEL_MULTIPLIER = 1;
const LERP = 0.09;                   // how quickly the displayed offset catches up to the target

// Tracking tear: a horizontal band that scrolls down the card, shifting
// sampling sideways within it. Everything here (barrel curvature, this
// tear, chromatic aberration, phosphor tint, scanlines, grain) lives in
// one fragment shader now — this used to be a CSS/SVG-filter stack, but
// feImage reading a local SVG element as a displacement source turned
// out not to work at all in this browser (confirmed by isolating the
// exact same filter chain outside this file and finding zero visual
// effect regardless of scale). A shader just samples the texture
// directly — no feImage indirection, no silent failure mode.
const TRACK_SPEED_PX = 0.22;         // px/tick the tracking pattern scrolls down, at jitter = 1x
const TRACK_JITTER_SMOOTH = 0.045;   // low-pass factor easing the speed multiplier toward a new
                                      // random target each frame — a real tape doesn't scroll at
                                      // a perfectly constant rate, it wavers unevenly
const TRACK_JITTER_AMOUNT = 0.7;     // +/- fraction of speed the wobble can swing
const MAX_TRACK_SHIFT_PX = 24;       // px, peak horizontal displacement at full obscurity

// The mesh is built larger than the card itself so the CRT glow (below)
// has room to bleed outward into the room before getting cut off at the
// plane's own edge.
const GLOW_MARGIN = 55;
const PLANE_W = ITEM_W + GLOW_MARGIN * 2;
const PLANE_H = ITEM_H + GLOW_MARGIN * 2;

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform sampler2D photoMap;
  uniform float uT;             // 0 = in focus, 1 = fully obscured
  uniform float uOpacity;
  uniform float uTexAspect;
  uniform float uTrackPhase;    // 0..1, band position down the card, scrolling
  varying vec2 vUv;

  const float ITEM_W = ${ITEM_W.toFixed(1)};
  const float ITEM_H = ${ITEM_H.toFixed(1)};
  const float RADIUS = ${ITEM_RADIUS.toFixed(1)};
  const float MAX_SHIFT_U = ${(MAX_TRACK_SHIFT_PX / ITEM_W).toFixed(5)};
  const float PLANE_SCALE = ${(PLANE_W / ITEM_W).toFixed(5)}; // mesh is larger than the card
                                                                // itself (see GLOW_MARGIN) — this
                                                                // rescales vUv back to card-local
                                                                // space so every other calculation
                                                                // below can stay unaware of it

  float hash21(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    return fract(sin(dot(p, p + vec2(127.1, 311.7))) * 43758.5453);
  }

  // object-fit: cover, so the source photo's own aspect ratio doesn't
  // stretch into the card's square UV space
  vec2 cover(vec2 uv) {
    float scaleX = min(1.0, 1.0 / uTexAspect);
    float scaleY = min(1.0, uTexAspect);
    return vec2((uv.x - 0.5) * scaleX + 0.5, (uv.y - 0.5) * scaleY + 0.5);
  }

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    // Rescaled from the enlarged plane back to card-local space (0.5 =
    // exactly the card's own edge) — everything below this line is
    // written as if the mesh were exactly ITEM_W x ITEM_H, same as
    // before GLOW_MARGIN was introduced.
    vec2 centered = (vUv - 0.5) * PLANE_SCALE;
    vec2 pxPos = centered * vec2(ITEM_W, ITEM_H);

    // --- Screen curvature (barrel distortion) — pushes sample points
    // outward from center, more so toward the edges and more so the
    // more obscured the card is.
    float r2 = dot(centered, centered);
    vec2 uv = 0.5 + centered * (1.0 + uT * 0.32 * r2);

    // --- Tracking tear — one or two soft lines traveling down the
    // screen. uv.y=0 is screen-bottom on this plane, so adding
    // uTrackPhase (rather than subtracting) is what makes the pattern
    // travel toward smaller uv.y over time — down the screen. Each line
    // is displaced sideways by a second, slower wave layered on top,
    // which is what gives it a liquid, organic wobble along its own
    // length rather than a flat sideways shove.
    float wavePos = (uv.y + uTrackPhase) * 5.0;
    float bandMask = pow(abs(sin(wavePos)), 4.0);
    // Low frequencies only — this is what keeps it a smooth, broad,
    // continuous curve rather than a tight mechanical zigzag. (A much
    // higher-frequency version of this existed earlier and reads as a
    // repeating sawtooth/herringbone texture instead of an analog wave.)
    // Three layers rather than two, still all low frequency, for a bit
    // more shape in the curve without reintroducing that busy texture.
    float squiggle = sin(uv.y * 7.0 + uTrackPhase * 12.0) * 0.5
                    + sin(uv.y * 2.6 - uTrackPhase * 5.5) * 0.4
                    + sin(uv.y * 13.0 + uTrackPhase * 18.0) * 0.25;
    // A little fine, flickering noise riding on top of the broad wave —
    // real tracking noise isn't a perfectly clean sine, it has texture —
    // kept small so it reads as grain on the curve, not its own pattern.
    float squiggleNoise = (hash21(vec2(uv.y * 300.0, uTrackPhase * 900.0)) - 0.5) * 0.12;
    uv.x += uT * MAX_SHIFT_U * bandMask * (squiggle + squiggleNoise);

    // --- Pixel-block glitches — rectangular blocks that flicker in and
    // out at a slow, irregular pace, like a real analog CRT briefly
    // losing sync on one patch of the screen. Block width varies per row
    // (some rows get short blocks, some get long ones) rather than a
    // single fixed grid, which reads as more organic. Two layers of
    // randomness: which blocks are eligible this "cycle" (held for a
    // while via blockCycle), and the flicker itself — a slower on/off
    // toggle re-rolled every so often, long intervals rather than a fast
    // strobe. Explicitly excluded from wherever the squiggle band is
    // active (awayFromBand) so the two effects stay visually distinct.
    float rowId = floor(pxPos.y / 14.0);
    float blockW = mix(24.0, 78.0, step(0.6, hash21(vec2(rowId, 99.0))));
    vec2 blockId = vec2(floor(pxPos.x / blockW), rowId);
    float awayFromBand = step(bandMask, 0.35);

    float blockCycle = floor(uTrackPhase * 9.0);
    float eligible = step(0.86, hash21(blockId + blockCycle * 13.0));

    float flickerFrame = floor(uTrackPhase * 70.0);
    float flicker = step(0.45, hash21(blockId + flickerFrame * 7.0));

    float blockActive = eligible * flicker * uT * awayFromBand;

    vec2 blockJitter = (vec2(hash21(blockId * 1.7 + 1.0), hash21(blockId * 2.3 + 2.0)) - 0.5) * 0.06;
    uv += blockJitter * blockActive;

    // A subtle brightness tick while a block is flickering on — enough
    // to read as "something changed here" without flashing.
    float blockShade = 1.0 + blockActive * 0.22;

    // --- Convergence error / chromatic aberration — worse near the
    // edges, like a real misaligned tube, not uniform across the image,
    // plus an extra color smear right in the tracking band itself (real
    // VHS mistracking shows rainbow color noise along the tear, not just
    // a positional shift).
    float edge = length(centered);
    float ca = (0.003 + edge * edge * 0.015) * (0.3 + uT * 0.85);
    ca += bandMask * uT * 0.028;
    vec2 uvR = cover(uv + vec2(ca, 0.0));
    vec2 uvG = cover(uv);
    vec2 uvB = cover(uv - vec2(ca * 1.4, 0.0));
    vec3 photo = vec3(
      texture2D(photoMap, clamp(uvR, 0.001, 0.999)).r,
      texture2D(photoMap, clamp(uvG, 0.001, 0.999)).g,
      texture2D(photoMap, clamp(uvB, 0.001, 0.999)).b
    );

    // --- Monochrome phosphor — desaturate toward grayscale, then tint
    // blue in proportion to luminance, reading as a glowing blue-white
    // CRT phosphor rather than a flat color wash.
    float lum = dot(photo, vec3(0.299, 0.587, 0.114));
    vec3 desat = mix(photo, vec3(lum), uT);
    vec3 phosphorBlue = vec3(80.0, 150.0, 255.0) / 255.0;
    vec3 color = mix(desat, phosphorBlue * lum * 1.4, uT * 0.85);

    // Let the ribbon/stutter strips' color fringe punch back through the
    // monochrome treatment — real tracking noise reads as colorful rainbow
    // static even on an otherwise degraded picture, and without this the
    // fringe (photo.rgb pulled apart by ca above) gets crushed right back
    // to gray by the desaturation mix just above, at exactly the uT range
    // where the warp is visible.
    vec3 fringe = photo - vec3(lum);
    color += fringe * bandMask * uT * 3.4;

    color *= blockShade;

    // --- Structural: scanlines, phosphor RGB mask, vignette, grain —
    // tube properties, always present, not tied to distance from focus,
    // except the scanlines' own curvature: bowed outward toward the
    // edges (following the same barrel-curved-tube logic as the image
    // warp above), scaled by uT so they're dead flat in focus and
    // visibly bent once obscured, like a real curved CRT surface.
    float scanBend = centered.x * centered.x * 26.0 * uT;
    float scanY = pxPos.y + scanBend + ITEM_H * 0.5;
    color *= mod(scanY, 3.0) < 1.0 ? 0.55 : 1.0;

    float maskX = mod(pxPos.x + ITEM_W * 0.5, 3.0);
    vec3 maskTint = maskX < 1.0 ? vec3(1.0, 0.45, 0.45) : (maskX < 2.0 ? vec3(0.45, 1.0, 0.6) : vec3(0.45, 0.6, 1.0));
    color = mix(color, color * maskTint, 0.07);

    float vig = smoothstep(0.42, 0.98, length(centered) * 2.0);
    color *= 1.0 - vig * 0.6;

    // Two octaves (fine + coarse) blended for a richer, less uniform
    // noise texture than a single hash, with the seed perturbed a little
    // by uTrackPhase each frame so the grain flickers/dances like real
    // film or video noise instead of sitting static. Weighted down in
    // pure blacks and whites and toward its full strength in midtones —
    // real photographic/video grain works this way, and a flat uniform
    // amount everywhere is what read as artificial rather than filmic.
    float grain1 = hash21(vUv * 900.0 + uTrackPhase * 4000.0) - 0.5;
    float grain2 = hash21(vUv * 260.0 - uTrackPhase * 2500.0) - 0.5;
    float grainLumWeight = 1.0 - abs(lum - 0.5) * 1.4;
    float grainAmt = (0.13 + uT * 0.11) * clamp(grainLumWeight, 0.35, 1.0);
    color += (grain1 * 0.7 + grain2 * 0.3) * grainAmt;

    float d = sdRoundBox(pxPos, vec2(ITEM_W, ITEM_H) * 0.5, RADIUS);
    float alpha = 1.0 - smoothstep(-1.0, 1.0, d);

    // CRT glow — light the tube throws into the room around it, off on
    // the in-focus card and a soft blue haze on obscured ones, matching
    // the phosphor tint above. GLOW_MARGIN gave the mesh room beyond the
    // card's own edge for this to render into before it'd otherwise be
    // clipped by the plane boundary.
    float distOutside = max(d, 0.0);
    float glow = exp(-distOutside * 0.045) * uT * 0.4;
    vec3 glowColor = vec3(90.0, 150.0, 255.0) / 255.0;
    vec3 finalColor = mix(glowColor, color, alpha);
    float finalAlpha = max(alpha, glow) * uOpacity;

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

// A pending row/column commit, queued by the outer component's pointer
// (or wheel) handling and consumed by the Scene on its next frame — the
// Scene owns the actual grid permutation and texture reassignment since
// that needs access to the loaded textures and per-cell materials,
// neither of which the outer DOM-event component has.
interface PendingCommit {
  mode: "row" | "col";
  index: number;
  steps: number;
}

interface LabelRefs {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  titleRef: React.RefObject<HTMLParagraphElement | null>;
  descriptionRef: React.RefObject<HTMLParagraphElement | null>;
  metaRef: React.RefObject<HTMLParagraphElement | null>;
}

interface SceneProps {
  rowTargetOffsetRef: React.RefObject<Float32Array>;
  colTargetOffsetRef: React.RefObject<Float32Array>;
  pendingCommitRef: React.RefObject<PendingCommit | null>;
  labelRefs: LabelRefs;
}

function Scene({ rowTargetOffsetRef, colTargetOffsetRef, pendingCommitRef, labelRefs }: SceneProps) {
  // Re-bound to plain locals ending in "Ref" — the lint rule guarding
  // against ref access during render only recognizes that pattern on a
  // simple identifier, not a property reached through a prop object.
  const { wrapperRef, titleRef, descriptionRef, metaRef } = labelRefs;

  const textures = useTexture(IMAGES.map((i) => i.src));
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const geo = useMemo(() => new THREE.PlaneGeometry(PLANE_W, PLANE_H), []);

  // grid[row][col] = index into IMAGES/textures currently occupying that
  // cell — the actual "puzzle state," permuted on each row/column commit.
  // Screen position for a cell is always its fixed grid slot (plus the
  // live drag offset for whichever row/column is actively being dragged)
  // — it's the image *identity* that moves between cells, not the cells
  // themselves.
  const grid = useRef<number[][]>(
    Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => (r * COLS + c) % IMAGES.length))
  );

  const rowCurrentOffset = useRef<Float32Array>(new Float32Array(ROWS));
  const colCurrentOffset = useRef<Float32Array>(new Float32Array(COLS));

  const trackPhase = useRef<Float32Array>(new Float32Array(CELLS));
  const trackSpeed = useRef<Float32Array>(new Float32Array(CELLS));
  const trackJitter = useRef<Float32Array>(new Float32Array(CELLS));
  const lastFocusedIdx = useRef(-1); // -1 forces the label to populate on the first frame

  const uniformsList = useMemo(() => {
    // Same formula the grid ref is seeded with below — computed directly
    // here rather than read from grid.current, since reading a ref's
    // value during render (which useMemo's callback counts as) isn't
    // allowed. They're guaranteed to agree at mount, since nothing can
    // commit a permutation before the first render has happened.
    return Array.from({ length: CELLS }, (_, idx) => {
      const texIdx = idx % IMAGES.length;
      const tex = textures[texIdx];
      const img = tex.image as HTMLImageElement | undefined;
      return {
        photoMap: { value: tex },
        uT: { value: 0 },
        uOpacity: { value: 1 },
        uTexAspect: { value: img ? img.width / img.height : 1 },
        uTrackPhase: { value: 0 }, // randomized per-cell in the mount effect below
      };
    });
  }, [textures]);

  useEffect(() => {
    for (let i = 0; i < CELLS; i++) {
      trackPhase.current[i] = Math.random();
      trackSpeed.current[i] = (TRACK_SPEED_PX / ITEM_H) * (0.6 + Math.random() * 0.8);
    }
  }, []);

  function syncCellTexture(r: number, c: number) {
    const mat = matRefs.current[r * COLS + c];
    if (!mat) return;
    const tex = textures[grid.current[r][c]];
    mat.uniforms.photoMap.value = tex;
    const img = tex.image as HTMLImageElement | undefined;
    mat.uniforms.uTexAspect.value = img ? img.width / img.height : 1;
  }

  useFrame(() => {
    // Consume a queued commit before easing this frame — rotates the
    // affected row or column's image assignments, reassigns each
    // affected cell's texture, then pulls the eased ("current") offset
    // back by the committed distance so nothing visually jumps: the
    // grid now already reflects the new arrangement at the drag's
    // snapped position, so the remaining current->target gap is just
    // the small residual between where the finger let go and the exact
    // snap point.
    const commit = pendingCommitRef.current;
    if (commit && commit.steps !== 0) {
      if (commit.mode === "row") {
        const row = grid.current[commit.index];
        const rotated = row.map((_, c) => row[((c - commit.steps) % COLS + COLS) % COLS]);
        grid.current[commit.index] = rotated;
        for (let c = 0; c < COLS; c++) syncCellTexture(commit.index, c);
        rowCurrentOffset.current[commit.index] -= commit.steps * SPACING;
      } else {
        const col = commit.index;
        const oldVals = grid.current.map((row) => row[col]);
        const rotated = oldVals.map((_, r) => oldVals[((r - commit.steps) % ROWS + ROWS) % ROWS]);
        for (let r = 0; r < ROWS; r++) grid.current[r][col] = rotated[r];
        for (let r = 0; r < ROWS; r++) syncCellTexture(r, col);
        colCurrentOffset.current[col] -= commit.steps * ROW_SPACING;
      }
    }
    if (commit) pendingCommitRef.current = null;

    // The label only needs to change when a commit actually swaps which
    // image sits in the frame cell — not every frame, and not during the
    // live drag itself (the frame's occupant, by definition, doesn't
    // change identity until a move is committed).
    const focusedIdx = grid.current[FRAME_ROW][FRAME_COL];
    if (focusedIdx !== lastFocusedIdx.current) {
      lastFocusedIdx.current = focusedIdx;
      const item = IMAGES[focusedIdx];
      if (titleRef.current) titleRef.current.textContent = item.title;
      if (descriptionRef.current) descriptionRef.current.textContent = item.description;
      if (metaRef.current) metaRef.current.textContent = item.meta;
    }

    for (let r = 0; r < ROWS; r++) {
      rowCurrentOffset.current[r] += (rowTargetOffsetRef.current[r] - rowCurrentOffset.current[r]) * LERP;
    }
    for (let c = 0; c < COLS; c++) {
      colCurrentOffset.current[c] += (colTargetOffsetRef.current[c] - colCurrentOffset.current[c]) * LERP;
    }

    // The label describes whatever's sitting *exactly* in the frame cell
    // — while the frame's own row or column is mid-drag, the content
    // actually under the frame is sliding past, so the (stale, not yet
    // committed) label shouldn't sit on top of it. Fades out based on how
    // far the frame's row/column is from resting at zero, and back in
    // once both settle.
    if (wrapperRef.current) {
      const unsettled = Math.max(
        Math.abs(rowCurrentOffset.current[FRAME_ROW]),
        Math.abs(colCurrentOffset.current[FRAME_COL])
      );
      const labelOpacity = 1 - Math.min(1, unsettled / 40);
      wrapperRef.current.style.opacity = String(labelOpacity);
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;

        let x = (c - FRAME_COL) * SPACING + rowCurrentOffset.current[r];
        x = ((x % ROW_LOOP_W) + ROW_LOOP_W) % ROW_LOOP_W;
        if (x > ROW_LOOP_W / 2) x -= ROW_LOOP_W;

        let yUp = (r - FRAME_ROW) * ROW_SPACING + colCurrentOffset.current[c];
        yUp = ((yUp % COL_LOOP_H) + COL_LOOP_H) % COL_LOOP_H;
        if (yUp > COL_LOOP_H / 2) yUp -= COL_LOOP_H;
        const y = -yUp;

        const dist = Math.hypot(x, y);
        const t = Math.min(1, dist / EFFECT_DISTANCE);
        const opacity = 1 - t * (1 - MIN_OPACITY);

        const mesh = meshRefs.current[idx];
        if (mesh) {
          mesh.position.x = x;
          mesh.position.y = y;
          mesh.renderOrder = Math.round(1000 - dist);
        }

        // A real tape doesn't scroll at a perfectly constant rate — ease
        // the speed multiplier toward a new random target each frame
        // (rather than snapping to it) so the tracking wavers unevenly,
        // sometimes faster, sometimes nearly stalling, instead of gliding
        // at one mechanical pace.
        const targetJitter = (Math.random() - 0.5) * 2;
        trackJitter.current[idx] += (targetJitter - trackJitter.current[idx]) * TRACK_JITTER_SMOOTH;
        const speedMul = 1 + trackJitter.current[idx] * TRACK_JITTER_AMOUNT;
        trackPhase.current[idx] = (trackPhase.current[idx] + trackSpeed.current[idx] * speedMul) % 1;

        const mat = matRefs.current[idx];
        if (mat) {
          mat.uniforms.uT.value = t;
          mat.uniforms.uOpacity.value = opacity;
          mat.uniforms.uTrackPhase.value = trackPhase.current[idx];
        }
      }
    }
  });

  return (
    <>
      {Array.from({ length: CELLS }, (_, idx) => (
        <mesh key={idx} ref={(el) => { meshRefs.current[idx] = el; }} geometry={geo}>
          <shaderMaterial
            ref={(el) => { matRefs.current[idx] = el as THREE.ShaderMaterial; }}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
            depthTest={false}
            depthWrite={false}
            uniforms={uniformsList[idx]}
          />
        </mesh>
      ))}
    </>
  );
}

function clampInt(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export default function FramedGallery() {
  const containerRef = useRef<HTMLDivElement>(null);

  const rowTargetOffset = useRef<Float32Array>(new Float32Array(ROWS));
  const colTargetOffset = useRef<Float32Array>(new Float32Array(COLS));
  const pendingCommit = useRef<PendingCommit | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);

  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragCandidateRow = useRef(FRAME_ROW);
  const dragCandidateCol = useRef(FRAME_COL);
  const activeDrag = useRef<{ mode: "row" | "col"; index: number } | null>(null);
  const wheelSettleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Snaps whichever row/column is active to the nearest whole step and
    // queues the permutation commit the Scene will pick up next frame —
    // shared by drag-release and wheel-settle so both paths land on a
    // clean grid state instead of stopping mid-slide.
    function settle(mode: "row" | "col", index: number) {
      const offsetRef = mode === "row" ? rowTargetOffset : colTargetOffset;
      const spacing = mode === "row" ? SPACING : ROW_SPACING;
      const steps = Math.round(offsetRef.current[index] / spacing);
      pendingCommit.current = { mode, index, steps };
      offsetRef.current[index] = 0;
    }

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      rowTargetOffset.current[FRAME_ROW] += delta * WHEEL_MULTIPLIER;

      if (wheelSettleTimer.current) clearTimeout(wheelSettleTimer.current);
      wheelSettleTimer.current = setTimeout(() => settle("row", FRAME_ROW), 160);
    }

    function handlePointerDown(e: PointerEvent) {
      dragging.current = true;
      activeDrag.current = null;
      dragStart.current = { x: e.clientX, y: e.clientY };
      // Only meaningful if every row/column is currently at rest (offset
      // 0), which holds as long as a new drag never starts mid-commit —
      // one active drag at a time, same as a real puzzle: finish twisting
      // one layer before grabbing the next.
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      dragCandidateRow.current = clampInt(Math.round((e.clientY - vh / 2) / ROW_SPACING) + FRAME_ROW, 0, ROWS - 1);
      dragCandidateCol.current = clampInt(Math.round((e.clientX - vw / 2) / SPACING) + FRAME_COL, 0, COLS - 1);
    }

    function handlePointerMove(e: PointerEvent) {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      if (!activeDrag.current) {
        // Small dead zone before committing to a direction, so a
        // slightly wobbly drag start doesn't lock the wrong axis.
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        activeDrag.current = Math.abs(dx) > Math.abs(dy)
          ? { mode: "row", index: dragCandidateRow.current }
          : { mode: "col", index: dragCandidateCol.current };
      }

      const { mode, index } = activeDrag.current;
      if (mode === "row") rowTargetOffset.current[index] = dx * DRAG_MULTIPLIER;
      else colTargetOffset.current[index] = dy * DRAG_MULTIPLIER;
    }

    function handlePointerUp() {
      if (!dragging.current) return;
      dragging.current = false;
      if (activeDrag.current) settle(activeDrag.current.mode, activeDrag.current.index);
      activeDrag.current = null;
    }

    const el = containerRef.current;
    el?.addEventListener("wheel", handleWheel, { passive: false });
    el?.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      el?.removeEventListener("wheel", handleWheel);
      el?.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      if (wheelSettleTimer.current) clearTimeout(wheelSettleTimer.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: BG_COLOR,
        cursor: "grab",
        touchAction: "none",
      }}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 1000 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene
            rowTargetOffsetRef={rowTargetOffset}
            colTargetOffsetRef={colTargetOffset}
            pendingCommitRef={pendingCommit}
            labelRefs={{ wrapperRef, titleRef, descriptionRef, metaRef }}
          />
        </Suspense>
      </Canvas>

      {/* The frame — a fixed, elegant marker for where an image is "in
          focus." Just the four corners, rounded, rather than a full
          border, plus a short tick at each edge's midpoint. It never
          moves; rows and columns move through it. */}
      <svg
        width={FRAME_W}
        height={FRAME_H}
        viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
        fill="none"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <g stroke="rgba(26,26,24,0.55)" strokeWidth={1.5} strokeLinecap="round">
          <path d={cornerPath(0, 0, 1, 1, 1)} />
          <path d={cornerPath(FRAME_W, 0, -1, 1, 0)} />
          <path d={cornerPath(FRAME_W, FRAME_H, -1, -1, 1)} />
          <path d={cornerPath(0, FRAME_H, 1, -1, 0)} />

          <line x1={FRAME_W / 2 - TICK_LENGTH / 2} y1={0} x2={FRAME_W / 2 + TICK_LENGTH / 2} y2={0} />
          <line x1={FRAME_W / 2 - TICK_LENGTH / 2} y1={FRAME_H} x2={FRAME_W / 2 + TICK_LENGTH / 2} y2={FRAME_H} />
          <line x1={0} y1={FRAME_H / 2 - TICK_LENGTH / 2} x2={0} y2={FRAME_H / 2 + TICK_LENGTH / 2} />
          <line x1={FRAME_W} y1={FRAME_H / 2 - TICK_LENGTH / 2} x2={FRAME_W} y2={FRAME_H / 2 + TICK_LENGTH / 2} />
        </g>
      </svg>

      {/* Caption for whichever image currently occupies the frame cell —
          updated imperatively by the Scene (see labelRefs) only when a
          committed move actually swaps the frame's occupant, not every
          frame. Deliberately all one monospace family at three sizes —
          this should read as metadata stamped on the recording, not as
          a title treatment competing with the image for attention. Title
          and description stack on the left; the tape-counter metadata
          sits on the right. Sits inside the frame, against the bottom
          edge of the image itself — light text with a shadow rather than
          dark ink, since it's overlapping a photo of unknown brightness
          rather than the cream background. Width matches the card
          exactly, with padding (not a narrower width) creating the even
          left/right inset — opacity is driven every frame by the Scene,
          fading out while the frame's row/column is mid-drag rather than
          sitting stale on top of content sliding through. */}
      <div
        ref={wrapperRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: ITEM_W,
          padding: "0 16px",
          boxSizing: "border-box",
          transform: `translate(-50%, calc(-50% + ${ITEM_H / 2 - 30}px))`,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <div>
          <p
            ref={titleRef}
            style={{
              fontFamily: "'PP Supply Mono', monospace",
              fontWeight: 400,
              fontSize: 10,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "#F4F2ED",
              textShadow: "0 1px 4px rgba(0,0,0,0.85)",
              margin: "0 0 3px",
              whiteSpace: "nowrap",
            }}
          />
          <p
            ref={descriptionRef}
            style={{
              fontFamily: "'PP Supply Mono', monospace",
              fontWeight: 200,
              fontSize: 9,
              color: "rgba(244,242,237,0.8)",
              textShadow: "0 1px 4px rgba(0,0,0,0.85)",
              margin: 0,
              whiteSpace: "nowrap",
            }}
          />
        </div>
        <p
          ref={metaRef}
          style={{
            fontFamily: "'PP Supply Mono', monospace",
            fontWeight: 400,
            fontSize: 8,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(244,242,237,0.65)",
            textShadow: "0 1px 4px rgba(0,0,0,0.85)",
            margin: 0,
            whiteSpace: "nowrap",
            textAlign: "right",
          }}
        />
      </div>
    </div>
  );
}
