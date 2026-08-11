"use client";

import { Suspense, createRef, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Spec {
  label: string;
  value: string;
}

interface TabImage {
  slug: string;
  label: string;
  price: string;
  year: string;
  description: string;
  src: string;
  // Plausible, period-appropriate spec sheet — invented, not claimed as
  // real branded numbers, same spirit as the rest of the copy (these are
  // AI-generated "inspired by" objects, not photos of specific real
  // products).
  specs: Spec[];
}

// Retro-future consumer tech, Y2K-era translucent plastic and chrome — each
// slide is a bold single-subject product shot so the pixel-mosaic reveal
// has something graphic to resolve into. Generic/archetypal on purpose (no
// named brands or models), since these are AI-generated "inspired by"
// objects rather than photos of specific real products.
const TABS: TabImage[] = [
  {
    slug: "bubble-computer",
    label: "Halo",
    price: "$1,299",
    year: "c. 1999",
    description:
      "Rounded, translucent, and built like it belonged on a spaceship rather than a desk. For a few years, computers were allowed to look like this, before beige boxes and black slabs took back over. Turning it on still felt like a small event, the fan spinning up and the screen slowly warming to life.",
    src: "/shatter-reveal/bubble-computer/bubble-computer.png",
    specs: [
      { label: "Processor", value: "233 MHz PowerPC-class" },
      { label: "Memory", value: "32 MB RAM" },
      { label: "Storage", value: "4 GB Hard Drive" },
      { label: "Display", value: "15\" Integrated CRT" },
      { label: "Weight", value: "17.6 lbs" },
      { label: "Ports", value: "2x USB, 1x Ethernet" },
    ],
  },
  {
    slug: "digital-camera",
    label: "Iris",
    price: "$349",
    year: "c. 1999",
    description:
      "A viewfinder to line up the shot, a lens that retracted flush into the body when powered off, and a screen on the back small enough that you still mostly trusted the viewfinder. Seeing the picture a second after you took it felt like magic at the time, even when the photo itself was barely two megapixels.",
    src: "/shatter-reveal/digital-camera/digital-camera.png",
    specs: [
      { label: "Resolution", value: "2.1 Megapixels" },
      { label: "Storage", value: "8 MB Internal Memory" },
      { label: "LCD Screen", value: "1.8\" Color Display" },
      { label: "Battery Life", value: "120 Shots" },
      { label: "Weight", value: "0.4 lbs" },
    ],
  },
  {
    slug: "flip-phone",
    label: "Pulse",
    price: "$149",
    year: "c. 2003",
    description:
      "A screen that hid itself when you weren't using it, and a satisfying snap to open it back up. Closing the phone was how you hung up, a small physical punctuation mark that tapping glass never quite replaced. Texting meant pressing the same key three times just to land on one letter.",
    src: "/shatter-reveal/flip-phone/flip-phone.png",
    specs: [
      { label: "Display", value: "Monochrome LCD, 5 Lines" },
      { label: "Talk Time", value: "3.5 Hours" },
      { label: "Standby Time", value: "150 Hours" },
      { label: "Weight", value: "3.2 oz" },
      { label: "Network", value: "Dual-Band GSM" },
    ],
  },
  {
    slug: "mp3-player",
    label: "Loop",
    price: "$299",
    year: "c. 2003",
    description:
      "A click wheel where your thumb did all the navigating, and a screen barely big enough to show what was playing. It fit a thousand songs in your pocket and made the CD player suddenly feel ancient, along with the scratched binder of discs you used to carry everywhere just in case.",
    src: "/shatter-reveal/mp3-player/mp3-player.png",
    specs: [
      { label: "Storage", value: "5 GB (1,000 Songs)" },
      { label: "Battery Life", value: "8 Hours" },
      { label: "Display", value: "2\" Monochrome LCD" },
      { label: "Weight", value: "6.5 oz" },
      { label: "Interface", value: "Click Wheel Navigation" },
    ],
  },
];

const SRC_W = 1024;
const SRC_H = 1024;

const COLS = 6;
const ROWS = 5;
const BLOCK_COUNT = COLS * ROWS;

const DISPLAY_W = 640;
const DISPLAY_H = Math.round((DISPLAY_W * SRC_H) / SRC_W);
const BLOCK_W = DISPLAY_W / COLS;
const BLOCK_H = DISPLAY_H / ROWS;

// Approximate total footprint of the fixed tab bar (its own height plus
// the bottom:40 gap below it) — the cube grid + caption are shifted up by
// half of this so they're centered in the space from the top of the
// screen down to the top of the tab bar, not centered in the full
// viewport (which would visually crowd them against the tab bar).
const TAB_BAR_RESERVE = 88;
// How far beyond the structure div's own DISPLAY_W x DISPLAY_H box the
// canvas extends on every side, so scattered blocks (up to ~680px from
// center) have room to render without being clipped, while the div itself
// still reports its real, small size to flexbox for layout purposes.
const CANVAS_OVERSCAN = 800;

// Real extruded geometry now (BoxGeometry), not a flat plane — CUBE_DEPTH is
// the reference thickness (at depthScale = 1) of each puzzle piece. Its
// side/back faces are lit MeshStandard materials, so the "which edge looks
// light vs dark" shading comes from an actual directional light hitting
// real geometry as it tumbles, rather than a hardcoded per-face bevel
// color. Close to BLOCK_W/BLOCK_H on purpose so a resting block reads as an
// actual cube, not a thin tile.
const CUBE_DEPTH = 70;
// Per-block depth is then scaled (mesh.scale.z) by a random factor in this
// range — a fixed trait per block, not tied to assembly progress, so even
// the fully resolved grid has some pieces sitting proud of others (a relief
// / pin-art look) instead of settling perfectly flush.
const DEPTH_SCALE_MIN = 0.45;
const DEPTH_SCALE_MAX = 2.1;

// The whole image is downsampled to this many columns before being scaled
// back up with nearest-neighbor — that's what gives the mosaic blockiness,
// independent of the COLS x ROWS puzzle-piece grid above.
const PIXEL_DENSITY = 36;

// Progress (0..1) for a tab's block-assembly is now driven directly by a
// real, pinned ScrollTrigger (see the per-tab "hero" section below) —
// scrubbing back up naturally re-scatters it for free, since it's a pure
// function of scroll position. HERO_PIN_DISTANCE is the scroll distance
// (px) that pin consumes before releasing into the tab's supporting-shots
// grid, which sits after it in normal document flow.
const HERO_PIN_DISTANCE = 600;
// The pinned hero's own on-screen height — a fixed pixel size now, not a
// vh percentage. A vh-based pin (e.g. "88vh") over-allocates on any
// viewport taller than the one it was eyeballed against, since it always
// claims that same fraction of the screen regardless of how much the
// canvas (DISPLAY_H, fixed at 640px) actually needs — which is exactly
// the excess scroll distance that made the text below it feel too far
// away. Sizing the pin to the canvas's own real requirement (its height
// plus a minimum headroom for the block-scatter effect, plus the tab bar
// clearance) removes that excess on any screen. SCATTER_HEADROOM is a
// floor, not the original ~85px the scatter distance was tuned against —
// going lower risks the top-of-screen clipping fixed earlier in this file.
const SCATTER_HEADROOM = 60;
const PIN_HEIGHT = DISPLAY_H + SCATTER_HEADROOM * 2 + TAB_BAR_RESERVE;
// Gap between the description and the spec chart.
const SECTION_GAP = 32;
// Gap between the pinned hero (title/price/buttons) and the
// description/specs block below it — deliberately smaller than
// SECTION_GAP, so the description/specs read as close to the title as
// possible while still keeping generous room between description and
// specs themselves.
const TITLE_TO_CONTENT_GAP = 16;
// Fraction of progress where the puzzle finishes assembling and the
// pixelation crossfade to the sharp image begins.
const ASSEMBLE_END = 0.7;

const SIDE_COLOR = "#D8D2C4";
const BACK_COLOR = "#B9B4AA";

// Two blocks whose scattered centers land within this radius of each other
// are treated as overlapping and pushed onto different Z layers. Has to be
// the block's worst-case bounding-SPHERE radius, not just its flat-face
// diagonal — blocks rotate on all three axes and depthScale can make one
// up to 2.1x thicker than CUBE_DEPTH, so a thick block seen edge-on can
// present a far bigger silhouette than its flat footprint suggests. Using
// only the flat diagonal here was the bug: it missed exactly those
// rotated/thick cases, which is what was visibly clipping through
// neighbors even at full rest.
const OVERLAP_RADIUS = Math.sqrt(
  (BLOCK_W / 2) ** 2 + (BLOCK_H / 2) ** 2 + ((CUBE_DEPTH * DEPTH_SCALE_MAX) / 2) ** 2
);
// Gap between Z layers. Has to be derived from OVERLAP_RADIUS, not just
// cube thickness — two blocks land in conflicting layers whenever their XY
// distance drops below 2x OVERLAP_RADIUS, and the *worst* case for that is
// near-identical XY position (distance ~0), where Z separation is the only
// thing keeping their bounding spheres apart. A step smaller than
// 2x OVERLAP_RADIUS was the bug: it looked like a generous gap but wasn't
// actually enough to guarantee separation in that worst case, which is
// exactly what kept clipping in the densest part of the flight.
const Z_LAYER_STEP = OVERLAP_RADIUS * 2.3;

interface Scatter {
  dx: number;
  dy: number;
  dz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  depthScale: number;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// A block's resting grid position — shared by makeScatter (to sample the
// flight path) and Scene's useFrame (to render it), so the two can never
// drift out of sync.
function getHome(i: number): [number, number] {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return [(col - (COLS - 1) / 2) * BLOCK_W, ((ROWS - 1) / 2 - row) * BLOCK_H];
}

// How many points along each block's flight (mix = 1 fully scattered -> 0
// fully assembled) to sample when checking for overlaps.
const PATH_SAMPLES = 14;

// The pinned stage only has ~85-130px of real vertical headroom above/below
// the resting grid before hitting the visible edge of the browser window —
// nothing a CSS box can fix, since that boundary IS the viewport. Horizontal
// has far more room (a typical viewport is much wider than the grid is
// tall). So scatter is elliptical, not circular: dist still drives a
// dramatic horizontal spread, but VERTICAL_SQUEEZE keeps the vertical
// component within what's actually visible, instead of blocks routinely
// flying off past the top/bottom of the screen mid-animation.
const VERTICAL_SQUEEZE = 0.16;

function makeScatter(): Scatter[] {
  const offsets: { dx: number; dy: number }[] = [];
  for (let i = 0; i < BLOCK_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 260 + Math.random() * 420;
    offsets.push({ dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist * VERTICAL_SQUEEZE });
  }

  // Each block travels from its own scattered position toward its own
  // (different) grid slot — not toward a shared center — so two blocks
  // that don't overlap at full scatter, and obviously don't overlap once
  // both are resting in their own grid cell, can still cross paths and
  // overlap somewhere in between. Checking only the endpoints (as an
  // earlier version of this did) misses exactly that case, which is what
  // was still visibly clipping. Sampling several points along the path and
  // unioning every conflict found is what actually catches it.
  const conflicts: Set<number>[] = Array.from({ length: BLOCK_COUNT }, () => new Set<number>());
  for (let s = 0; s <= PATH_SAMPLES; s++) {
    const mix = 1 - s / PATH_SAMPLES;
    const pts = offsets.map((o, i) => {
      const [homeX, homeY] = getHome(i);
      return { x: homeX + o.dx * mix, y: homeY + o.dy * mix };
    });
    for (let i = 0; i < BLOCK_COUNT; i++) {
      for (let j = i + 1; j < BLOCK_COUNT; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < OVERLAP_RADIUS * 2) {
          conflicts[i].add(j);
          conflicts[j].add(i);
        }
      }
    }
  }

  // Greedy layer assignment: each block takes the lowest Z layer not
  // already used by an earlier block it conflicts with anywhere along the
  // path — blocks that never come close to anything stay near layer 0, so
  // only genuinely overlapping clusters get pushed apart in Z.
  const layers: number[] = new Array(BLOCK_COUNT).fill(0);
  for (let i = 0; i < BLOCK_COUNT; i++) {
    const used = new Set<number>();
    for (const j of conflicts[i]) {
      if (j < i) used.add(layers[j]);
    }
    let layer = 0;
    while (used.has(layer)) layer++;
    layers[i] = layer;
  }

  return offsets.map((p, i) => ({
    dx: p.dx,
    dy: p.dy,
    dz: layers[i] * Z_LAYER_STEP + Math.random() * 12,
    rotX: (Math.random() - 0.5) * 140,
    rotY: (Math.random() - 0.5) * 140,
    rotZ: (Math.random() - 0.5) * 280,
    depthScale: DEPTH_SCALE_MIN + Math.random() * (DEPTH_SCALE_MAX - DEPTH_SCALE_MIN),
  }));
}

// Downsample-then-upscale-with-nearest-neighbor is the mosaic trick — a
// canvas drawn small automatically averages each cell, then scaling it back
// up without smoothing turns those averaged cells into visible blocks.
function pixelateCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const small = document.createElement("canvas");
  small.width = PIXEL_DENSITY;
  small.height = Math.round((PIXEL_DENSITY * SRC_H) / SRC_W);
  const sctx = small.getContext("2d");
  if (sctx) sctx.drawImage(img, 0, 0, small.width, small.height);

  const big = document.createElement("canvas");
  big.width = DISPLAY_W;
  big.height = DISPLAY_H;
  const bctx = big.getContext("2d");
  if (bctx) {
    bctx.imageSmoothingEnabled = false;
    bctx.drawImage(small, 0, 0, big.width, big.height);
  }
  return big;
}

interface TabTextures {
  sharp: THREE.Texture;
  pixel: THREE.Texture;
}

// Ordered (Bayer 4x4) dither + posterize — reused on both the custom front
// shader and injected into the standard side/back materials via
// onBeforeCompile, so every face gets the same limited-color-precision,
// visibly-banded look instead of a smooth modern gradient. Written as
// integer comparisons rather than array indexing since dynamic array
// indexing in a fragment shader isn't reliably supported across GPUs/
// drivers in WebGL1/ES — this is the portable way to do it.
const DITHER_GLSL = /* glsl */`
  float bayerDither4x4(vec2 fragCoord) {
    int x = int(mod(fragCoord.x, 4.0));
    int y = int(mod(fragCoord.y, 4.0));
    int index = x + y * 4;
    if (index == 0) return 0.0 / 16.0;
    if (index == 1) return 8.0 / 16.0;
    if (index == 2) return 2.0 / 16.0;
    if (index == 3) return 10.0 / 16.0;
    if (index == 4) return 12.0 / 16.0;
    if (index == 5) return 4.0 / 16.0;
    if (index == 6) return 14.0 / 16.0;
    if (index == 7) return 6.0 / 16.0;
    if (index == 8) return 3.0 / 16.0;
    if (index == 9) return 11.0 / 16.0;
    if (index == 10) return 1.0 / 16.0;
    if (index == 11) return 9.0 / 16.0;
    if (index == 12) return 15.0 / 16.0;
    if (index == 13) return 7.0 / 16.0;
    if (index == 14) return 13.0 / 16.0;
    return 5.0 / 16.0;
  }

  vec3 posterizeDither(vec3 color, vec2 fragCoord, float levels) {
    float d = bayerDither4x4(fragCoord) - 0.5;
    vec3 c = color + d / levels;
    return floor(c * levels + 0.5) / levels;
  }
`;

// How many visible color steps per channel — low on purpose for obvious
// banding (a period-correct render wouldn't have smooth 8-bit gradients).
const POSTERIZE_LEVELS = 7.0;

// Bakes the same posterize/dither into a standard lit material (side/back
// faces) by patching its compiled shader — <dithering_fragment> is three's
// own (normally opt-in, banding-*prevention*) chunk, always present in the
// template regardless of the material's `dithering` flag, which makes it a
// reliable injection point right after the lit color is finalized.
function withPosterizeDither<T extends THREE.Material>(material: T): T {
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader =
      DITHER_GLSL +
      shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `gl_FragColor.rgb = posterizeDither(gl_FragColor.rgb, gl_FragCoord.xy, ${POSTERIZE_LEVELS.toFixed(1)});`
      );
  };
  return material;
}

const frontVertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Each block's front face samples the same two full-image textures (sharp +
// pixelated), just at a different UV slice — cheaper than loading 30
// separate per-block textures, and mirrors the CSS background-position
// slicing technique this replaced.
const frontFragmentShader =
  DITHER_GLSL +
  /* glsl */`
  uniform sampler2D uSharpMap;
  uniform sampler2D uPixelMap;
  uniform vec2 uUvOffset;
  uniform vec2 uUvRepeat;
  uniform float uResolve;
  varying vec2 vUv;

  void main() {
    vec2 uv = uUvOffset + vUv * uUvRepeat;
    vec3 pixelColor = texture2D(uPixelMap, uv).rgb;
    vec3 sharpColor = texture2D(uSharpMap, uv).rgb;
    vec3 color = mix(pixelColor, sharpColor, uResolve);
    // Posterize/dither is part of the mosaic's period-correct look, not
    // something the finished photo should carry — fade it out as uResolve
    // approaches 1 so the fully assembled image reads clean, not banded.
    vec3 dithered = posterizeDither(color, gl_FragCoord.xy, ${POSTERIZE_LEVELS.toFixed(1)});
    gl_FragColor = vec4(mix(dithered, color, uResolve), 1.0);
  }
`;

interface SceneProps {
  tab: TabImage;
  progressRef: React.RefObject<number>;
  textPanelRef: React.RefObject<HTMLDivElement | null>;
}

// One Scene per tab section now (not one shared scene swapping textures on
// tab change) — each instance owns a single, fixed image and its own
// scatter shape for the whole page's lifetime, so all the cross-tab
// scatter-blend/texture-swap machinery the single-scene version needed is
// gone. progressRef is fed directly by that tab's own pinned ScrollTrigger.
function Scene({ tab, progressRef, textPanelRef }: SceneProps) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const scatter = useMemo(() => makeScatter(), []);

  // Sharp edges on purpose — a chamfer was tried and reverted, since it
  // fights the blocky pixel-mosaic identity of the piece (rounded chips
  // read as a different, softer material than pixel-art blocks should).
  const boxGeo = useMemo(() => new THREE.BoxGeometry(BLOCK_W, BLOCK_H, CUBE_DEPTH), []);
  const sideMaterial = useMemo(
    () => withPosterizeDither(new THREE.MeshStandardMaterial({ color: SIDE_COLOR, roughness: 0.75, metalness: 0.04 })),
    []
  );
  const backMaterial = useMemo(
    () => withPosterizeDither(new THREE.MeshStandardMaterial({ color: BACK_COLOR, roughness: 0.75, metalness: 0.04 })),
    []
  );

  // One ShaderMaterial instance per block, created once — each carries its
  // own fixed UV slice (baked in at creation, since a block's grid position
  // never changes) plus a live uResolve uniform mutated every frame. Kept
  // in a ref alongside the useMemo array (frontMaterials is only ever read,
  // never mutated, in JSX below) — the lint rule guarding hook-value
  // immutability only allows mutation through a ref, matching the matRefs
  // pattern already used in framed-gallery.
  const frontMaterials = useMemo(() => {
    return Array.from({ length: BLOCK_COUNT }, (_, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      return new THREE.ShaderMaterial({
        vertexShader: frontVertexShader,
        fragmentShader: frontFragmentShader,
        uniforms: {
          uSharpMap: { value: null },
          uPixelMap: { value: null },
          uUvOffset: { value: new THREE.Vector2(col / COLS, (ROWS - 1 - row) / ROWS) },
          uUvRepeat: { value: new THREE.Vector2(1 / COLS, 1 / ROWS) },
          uResolve: { value: 0 },
        },
      });
    });
  }, []);
  const frontMaterialsRef = useRef(frontMaterials);

  // Load + pixelate this tab's image once, on mount, then bind it onto
  // every block's front material directly — no slug-keyed cache needed
  // since this Scene only ever shows one image.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const sharp = new THREE.Texture(img);
      sharp.needsUpdate = true;
      const pixel = new THREE.CanvasTexture(pixelateCanvas(img));
      const textures: TabTextures = { sharp, pixel };
      frontMaterialsRef.current.forEach((mat) => {
        mat.uniforms.uSharpMap.value = textures.sharp;
        mat.uniforms.uPixelMap.value = textures.pixel;
      });
    };
    img.src = tab.src;
    return () => {
      cancelled = true;
    };
  }, [tab.src]);

  useFrame(() => {
    const progress = progressRef.current;

    const t = easeOutCubic(Math.min(1, progress / ASSEMBLE_END));
    const resolve = Math.max(0, Math.min(1, (progress - ASSEMBLE_END) / (1 - ASSEMBLE_END)));
    const mix = 1 - t;
    // dx/dy/dz all shrink by the same `mix`, but each block's own size
    // doesn't shrink — so a Z-layer gap sized to prevent collisions at
    // mix=1 (full scatter) stops being enough as mix drops, since the
    // physical blocks stay full-size while the space between them shrinks.
    // zMix decays slower than mix (exponent < 1), keeping blocks at their
    // separated heights for most of the flight and only letting Z collapse
    // flush right at the end, by which point XY has already converged to
    // the true non-overlapping grid.
    const zMix = Math.pow(mix, 0.35);

    // Text panel fades in/out in lockstep with the image's own pixel ->
    // sharp resolve, via the same signal, not a separate timer — it should
    // read as part of the image coming into focus, not an unrelated UI
    // event happening near it.
    if (textPanelRef.current) textPanelRef.current.style.opacity = String(resolve);

    for (let i = 0; i < BLOCK_COUNT; i++) {
      const [homeX, homeY] = getHome(i);

      const s = scatter[i];
      const mesh = meshRefs.current[i];
      if (mesh) {
        mesh.position.set(homeX + s.dx * mix, homeY + s.dy * mix, s.dz * zMix);
        mesh.rotation.set(
          (s.rotX * mix * Math.PI) / 180,
          (s.rotY * mix * Math.PI) / 180,
          (s.rotZ * mix * Math.PI) / 180
        );
        mesh.scale.set(1, 1, s.depthScale);
      }

      frontMaterialsRef.current[i].uniforms.uResolve.value = resolve;
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      {/* Key light casts shadows — its shadow-camera frustum has to cover
          the full scatter radius (blocks can land up to ~680px from
          center) plus the deep Z range the overlap-avoidance layering can
          produce, or blocks outside that box silently drop their shadow.
          Deliberately low-res shadow map (paired with Canvas's "basic"
          shadow type) for hard, visibly blocky shadow edges instead of a
          soft penumbra — leaning into a rough/unpolished render-preview
          look rather than a physically-clean one. */}
      <directionalLight
        position={[-300, 400, 500]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-left={-900}
        shadow-camera-right={900}
        shadow-camera-top={900}
        shadow-camera-bottom={-900}
        shadow-camera-near={0.1}
        shadow-camera-far={6000}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[300, -200, 200]} intensity={0.35} />
      {Array.from({ length: BLOCK_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          geometry={boxGeo}
          material={[sideMaterial, sideMaterial, sideMaterial, sideMaterial, frontMaterials[i], backMaterial]}
          castShadow
          receiveShadow
        />
      ))}
    </>
  );
}

export default function ShatterReveal() {
  const [activeTab, setActiveTab] = useState(0);
  const [visible, setVisible] = useState<boolean[]>(() => TABS.map((_, i) => i === 0));

  const lenisRef = useRef<Lenis | null>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pinTargetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const specChartRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Per-tab arrays of the spec chart's own children (heading + each row) —
  // staggered as a group on scroll-in rather than the whole chart fading
  // in as one block, so the rows visibly settle in one after another.
  const specRowRefs = useRef<(HTMLElement | null)[][]>(TABS.map(() => []));
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Stable per-tab ref objects — created once, handed straight to each
  // Scene as progressRef/textPanelRef, and also attached to the DOM node
  // (heroTextRefs) so a single object serves both jobs.
  const progressRefs = useMemo(() => TABS.map(() => ({ current: 0 })), []);
  const heroTextRefs = useMemo(() => TABS.map(() => createRef<HTMLDivElement>()), []);

  // Lenis now smooths the real window/document scroll (no wrapper/content
  // scoping) — same wiring as compressed-gallery: ScrollTrigger.update on
  // every Lenis scroll tick, and gsap's own ticker drives lenis.raf so
  // ScrollTrigger and Lenis stay on one render loop instead of two
  // competing rAF callbacks.
  //
  // Each tab gets two ScrollTrigger instances:
  //  - a pin on its hero wrapper (Canvas + Year/Title/Description), whose
  //    progress (0..1) feeds that tab's Scene directly via progressRefs —
  //    scrubbing back up re-scatters it for free, since Scene's math is a
  //    pure function of progress.
  //  - a non-pinned one spanning the whole tab group (hero + spec chart)
  //    that toggles the tab-bar's active highlight and whether that tab's
  //    Canvas is even rendering (frameloop "always" vs "never"), so having
  //    4 real-time scenes mounted at once doesn't cost 4x the GPU time.
  //    The spec chart has its own separate fade/slide-in trigger, since
  //    plain text has no reveal mechanic of its own the way the hero's
  //    pixel-mosaic does.
  // A sentinel after the last tab's spec chart snaps scroll back to 0
  // when reached — the "loop back to tab 1" the user asked for, done as a
  // scroll-position wrap rather than repeating the DOM (and its WebGL
  // contexts) N times.
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.08, wheelMultiplier: 0.7 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    function tick(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const triggers: ScrollTrigger[] = [];

    TABS.forEach((_, i) => {
      const heroWrapper = heroWrapperRefs.current[i];
      const group = groupRefs.current[i];
      if (!heroWrapper || !group) return;

      triggers.push(
        ScrollTrigger.create({
          trigger: heroWrapper,
          pin: pinTargetRefs.current[i] ?? undefined,
          start: "top top",
          end: `+=${HERO_PIN_DISTANCE}`,
          scrub: 1,
          onUpdate: (self) => {
            progressRefs[i].current = self.progress;
          },
        })
      );

      // Deliberately wide range (any overlap with the viewport at all) —
      // this only gates frameloop, so a little overlap between adjacent
      // tabs while scrolling is harmless (worst case, two canvases render
      // briefly at once).
      triggers.push(
        ScrollTrigger.create({
          trigger: group,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            setVisible((prev) => {
              if (prev[i] === self.isActive) return prev;
              const next = [...prev];
              next[i] = self.isActive;
              return next;
            });
          },
        })
      );

      // Tab-bar highlight needs a mutually-exclusive range, not just "any
      // overlap" — adjacent tabs' "top bottom / bottom top" ranges overlap
      // right at their boundary, so both could independently report
      // isActive there and whichever's onToggle fires last would win,
      // occasionally leaving the wrong tab highlighted. Checking against
      // the viewport's own center instead guarantees at most one section
      // contains it at a time, since sections stack sequentially in the
      // document with no overlap.
      triggers.push(
        ScrollTrigger.create({
          trigger: group,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) setActiveTab(i);
          },
        })
      );

      const specChart = specChartRefs.current[i];
      if (specChart) {
        triggers.push(
          ScrollTrigger.create({
            trigger: specChart,
            start: "top 80%",
            onEnter: () => {
              const rows = specRowRefs.current[i]?.filter((el): el is HTMLElement => el !== null) ?? [];
              gsap.to(rows, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" });
            },
            onLeaveBack: () => {
              const rows = specRowRefs.current[i]?.filter((el): el is HTMLElement => el !== null) ?? [];
              gsap.to(rows, { opacity: 0, y: 12, duration: 0.3, ease: "power2.out" });
            },
          })
        );
      }
    });

    const sentinel = sentinelRef.current;
    if (sentinel) {
      triggers.push(
        ScrollTrigger.create({
          trigger: sentinel,
          start: "top bottom",
          onEnter: () => lenis.scrollTo(0, { immediate: true }),
        })
      );
    }

    return () => {
      gsap.ticker.remove(tick);
      triggers.forEach((t) => t.kill());
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [progressRefs]);

  function selectTab(index: number) {
    const target = groupRefs.current[index];
    if (target) lenisRef.current?.scrollTo(target, { offset: 0 });
  }

  return (
    <div style={{ background: "var(--color-bg)" }}>
      {TABS.map((tab, i) => (
        <div key={tab.slug} ref={(el) => { groupRefs.current[i] = el; }}>
          <div
            ref={(el) => { heroWrapperRefs.current[i] = el; }}
            style={{ position: "relative", height: `${PIN_HEIGHT + HERO_PIN_DISTANCE}px` }}
          >
            <div
              ref={(el) => { pinTargetRefs.current[i] = el; }}
              style={{ height: `${PIN_HEIGHT}px`, position: "relative", overflow: "hidden" }}
            >
              {/* The cube grid is dead-centered in the PIN_HEIGHT -
                  TAB_BAR_RESERVE region (== DISPLAY_H + 2*SCATTER_HEADROOM
                  exactly, by construction), giving it the same fixed,
                  minimum-necessary headroom in every direction regardless
                  of viewport size — no longer a flex sibling of any
                  caption text, since the caption now lives in normal
                  document flow below the pin instead of overlaid on it. */}
              <div
                style={{
                  position: "absolute",
                  inset:    0,
                  height:   `${PIN_HEIGHT - TAB_BAR_RESERVE}px`,
                }}
              >
                {/* The canvas itself still has to be much bigger than
                    DISPLAY_W x DISPLAY_H — scattered blocks fly up to
                    ~680px from center — but it's centered *on* the
                    structure div via the negative inset (CANVAS_OVERSCAN
                    on every side) and absolutely positioned within it, so
                    it can overflow that div's box for scattered blocks
                    without affecting the div's own declared size. Beyond
                    that, blocks scattering far enough still get clipped by
                    the literal edge of the browser window — no CSS box
                    inside the page can avoid that, it's just how much
                    headroom the viewport has to give. */}
                <div
                  style={{
                    position:  "absolute",
                    top:       "50%",
                    left:      "50%",
                    transform: "translate(-50%, -50%)",
                    width:     DISPLAY_W,
                    height:    DISPLAY_H,
                  }}
                >
                  {/* antialias off + dpr pinned to 1 (rather than
                      following the device's real pixel ratio) + "basic"
                      shadow type are all deliberate — leaning into a
                      rough, unpolished render-preview look instead of a
                      smooth modern one, to match the blocky pixel-mosaic
                      photo treatment. frameloop toggles off entirely when
                      this tab's group isn't near the viewport, so having
                      four of these mounted at once doesn't cost 4x the
                      GPU time of the old single-scene version. */}
                  <Canvas
                    shadows="basic"
                    orthographic
                    camera={{ position: [0, 0, 3000], zoom: 1, near: 0.1, far: 8000 }}
                    frameloop={visible[i] ? "always" : "never"}
                    style={{
                      position: "absolute",
                      top:      -CANVAS_OVERSCAN,
                      left:     -CANVAS_OVERSCAN,
                      width:    DISPLAY_W + CANVAS_OVERSCAN * 2,
                      height:   DISPLAY_H + CANVAS_OVERSCAN * 2,
                    }}
                    gl={{ antialias: false, alpha: true }}
                    dpr={1}
                  >
                    <Suspense fallback={null}>
                      <Scene tab={tab} progressRef={progressRefs[i]} textPanelRef={heroTextRefs[i]} />
                    </Suspense>
                  </Canvas>
                </div>

                {/* Title section — overlaid on the pinned canvas again
                    (not normal document flow), so it stays glued ~16px
                    below the image regardless of how long HERO_PIN_DISTANCE
                    is. Opacity is mutated imperatively by Scene every
                    frame (see progressRef/heroTextRefs), tied to the same
                    resolve value driving the image's own pixel -> sharp
                    crossfade, so text and image focus together and a long,
                    deliberate manual scrub doesn't push the title away
                    from the image it belongs to. */}
                <div
                  ref={heroTextRefs[i]}
                  style={{
                    position:      "absolute",
                    top:           `calc(50% + ${DISPLAY_H / 2 + 16}px)`,
                    left:          "50%",
                    transform:     "translateX(-50%)",
                    width:         DISPLAY_W,
                    textAlign:     "left",
                    opacity:       0,
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ display: "flex", width: DISPLAY_W, justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div>
                        <p
                          style={{
                            fontFamily:    "'MDUIXS', sans-serif",
                            fontSize:      8,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color:         "var(--nav-muted)",
                            margin:        0,
                          }}
                        >
                          {tab.year}
                        </p>
                      </div>
                      <div>
                        <h2
                          style={{
                            fontFamily: "'PP Editorial New', serif",
                            fontStyle:  "italic",
                            fontWeight: 400,
                            fontSize:   40,
                            lineHeight: "40px",
                            color:      "var(--text-primary)",
                            margin:     0,
                          }}
                        >
                          {tab.label}
                        </h2>
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: "'PP Neue Montreal', sans-serif",
                            fontSize:   16,
                            fontWeight: 500,
                            color:      "var(--text-primary)",
                            margin:     0,
                          }}
                        >
                          {tab.price}
                        </p>
                      </div>
                    </div>

                    <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div>
                        <p
                          style={{
                            fontFamily: "'PP Neue Montreal', sans-serif",
                            fontSize:   12,
                            color:      "var(--text-primary)",
                            margin:     0,
                          }}
                        >
                          In Stock
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: "'PP Neue Montreal', sans-serif",
                            fontSize:   12,
                            color:      "var(--text-body)",
                            margin:     0,
                          }}
                        >
                          Free Shipping · Arrives in 3–5 Days
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          style={{
                            flex:          1,
                            fontFamily:    "'MDUIXS', sans-serif",
                            fontSize:      8,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            padding:       "8px 16px",
                            borderRadius:  999,
                            border:        "none",
                            background:    "var(--text-primary)",
                            color:         "var(--color-bg)",
                            cursor:        "pointer",
                            pointerEvents: "auto",
                          }}
                        >
                          Buy Now
                        </button>
                        <button
                          aria-label="Add to bag"
                          style={{
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            flexShrink:     0,
                            padding:        8,
                            borderRadius:   999,
                            border:         "1px solid var(--nav-faint)",
                            background:     "transparent",
                            color:          "var(--text-primary)",
                            cursor:         "pointer",
                            pointerEvents:  "auto",
                          }}
                        >
                          <ShoppingBag size={12} strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description + spec chart — real document flow below the
              pinned hero (title/price/buttons stay overlaid on the canvas
              itself, see above). Fades/slides in on its own ScrollTrigger
              (see the effect above) since, unlike the hero's own text,
              plain document-flow text has no reveal mechanic of its own.
              Sits closer to the hero above it (TITLE_TO_CONTENT_GAP) than
              the gap between description and specs (SECTION_GAP) — the
              two are deliberately different now, not the same shared
              value, since "close to the title" and "generous space
              between description/specs" turned out to be two separate
              asks. */}
          <div
            style={{
              display:        "flex",
              justifyContent: "center",
              padding:        `${TITLE_TO_CONTENT_GAP}px 24px 128px`,
            }}
          >
            <div
              ref={(el) => { specChartRefs.current[i] = el; }}
              style={{ width: DISPLAY_W, maxWidth: "100%", display: "flex", flexDirection: "column", gap: SECTION_GAP }}
            >

              {/* Description — the rule lines span the full image width,
                  but the text column itself stays narrower (480px) and
                  left-aligned, reading as its own distinct block rather
                  than a lead-in to the spec chart below it. */}
              <div
                ref={(el) => { specRowRefs.current[i][0] = el; }}
                style={{ width: DISPLAY_W, maxWidth: "100%", opacity: 0, transform: "translateY(12px)" }}
              >
                <div style={{ height: 1, background: "var(--nav-faint)", marginBottom: 16 }} />
                <p
                  style={{
                    textAlign:  "left",
                    fontFamily: "'PP Neue Montreal', sans-serif",
                    fontSize:   12,
                    lineHeight: "20px",
                    color:      "var(--text-body)",
                    margin:     0,
                  }}
                >
                  {tab.description}
                </p>
                <div style={{ height: 1, background: "var(--nav-faint)", marginTop: 16 }} />
              </div>

              <div>
                <p
                  ref={(el) => { specRowRefs.current[i][1] = el; }}
                  style={{
                    fontFamily:    "'MDUIXS', sans-serif",
                    fontSize:      8,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color:         "var(--nav-muted)",
                    margin:        "0 0 8px",
                    opacity:       0,
                    transform:     "translateY(12px)",
                  }}
                >
                  Specifications
                </p>
                {tab.specs.map((spec, j) => (
                <div
                  key={spec.label}
                  ref={(el) => { specRowRefs.current[i][j + 2] = el; }}
                  style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    gap:            16,
                    padding:        "8px 0",
                    borderBottom:   j < tab.specs.length - 1 ? "1px solid var(--nav-faint)" : "none",
                    opacity:        0,
                    transform:      "translateY(12px)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'PP Neue Montreal', sans-serif",
                      fontSize:   12,
                      color:      "var(--text-body)",
                    }}
                  >
                    {spec.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'PP Neue Montreal', sans-serif",
                      fontSize:   12,
                      color:      "var(--text-primary)",
                      textAlign:  "right",
                    }}
                  >
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      ))}

      {/* Reached scrolling forward -> wrap back to tab 1 (see the
          sentinel ScrollTrigger above). */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Tab bar */}
      <div
        style={{
          position:       "fixed",
          bottom:         40,
          left:           "50%",
          transform:      "translateX(-50%)",
          display:        "flex",
          gap:            8,
          padding:        8,
          borderRadius:   999,
          background:     "var(--frosted-bg)",
          border:         "1px solid var(--nav-faint)",
        }}
      >
        {TABS.map((t, i) => (
          <button
            key={t.slug}
            onClick={() => selectTab(i)}
            style={{
              position:      "relative",
              fontFamily:    "'MDUIXS', sans-serif",
              fontSize:      8,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding:       "8px 16px",
              borderRadius:  999,
              border:        "none",
              background:    "transparent",
              color:         i === activeTab ? "var(--color-bg)" : "var(--nav-muted)",
              cursor:        "pointer",
              whiteSpace:    "nowrap",
              transition:    "color 0.25s ease",
            }}
          >
            {i === activeTab && (
              <motion.div
                layoutId="shatter-tab-highlight"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{
                  position:     "absolute",
                  inset:        0,
                  borderRadius: 999,
                  background:   "var(--text-primary)",
                  zIndex:       -1,
                }}
              />
            )}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
