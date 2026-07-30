"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import Lenis from "lenis";
import * as THREE from "three";
import { morph } from "getruun";

const SEE_MORE_SPRING = { stiffness: 320, damping: 22, mass: 1 };
const CHEVRON_RIGHT = "M9 18 L15 12 L9 6 M9 18 L15 12 L9 6";
const ARROW_RIGHT = "M4 12 L12 12 L20 12 M15 7 L20 12 L15 17";

// location = common name, city = Latin name, year = bloom season — reusing
// the same three label fields the arc's title/subtitle rendering expects.
const ITEMS = [
  { src: "/arc-gallery/peony.jpg",      location: "Peony",       city: "Paeonia lactiflora",  year: "Late spring" },
  { src: "/arc-gallery/poppy.jpg",      location: "Poppy",       city: "Papaver rhoeas",      year: "Early summer" },
  { src: "/arc-gallery/dahlia.jpg",     location: "Dahlia",      city: "Dahlia pinnata",      year: "Late summer" },
  { src: "/arc-gallery/foxglove.jpg",   location: "Foxglove",    city: "Digitalis purpurea",  year: "Early summer" },
  { src: "/arc-gallery/Iris.jpg",       location: "Iris",        city: "Iris germanica",      year: "Mid spring" },
  { src: "/arc-gallery/ranunculus.jpg", location: "Ranunculus",  city: "Ranunculus asiaticus", year: "Early spring" },
  { src: "/arc-gallery/anenome.jpg",    location: "Anemone",     city: "Anemone coronaria",   year: "Mid spring" },
  { src: "/arc-gallery/blue.jpg",       location: "Delphinium",  city: "Delphinium elatum",   year: "Midsummer" },
];

const N = ITEMS.length;
const ANGLE_STEP = (Math.PI * 2) / N;

const ARC_RADIUS = 550;
const LABEL_OFFSET = 300;   // how far left of true screen-center the focused orb sits — label owns the center
const BASE_SIZE = 110;      // orb diameter at rest
const FOCUS_SCALE = 2.7;    // multiplier applied to BASE_SIZE at dead-center
const FOCUS_SPAN_DEG = 32;  // within this many degrees of center, scale ramps up
// Underdamped spring on the focus scale — gives it a slow, weighty pop past
// full size before settling, instead of a plain ease that can never overshoot.
const SCALE_SPRING_K = 45;
const SCALE_SPRING_DAMPING = 7.5;
const EDGE_SHRINK_START = 70;
const EDGE_SHRINK_END = 120;
const FADE_START = 85;
const FADE_END = 130;
const LABEL_FADE_START = 6;
const LABEL_FADE_END = 16;

const SECTION_PX = 420;     // scroll px per one item-step (one ANGLE_STEP of rotation)
const LOOPS = 200;          // repeats of the full ring — deep enough scroll range to feel infinite
const SNAP_STRENGTH = 0.9;  // 0 = linear scroll, 1 = fully flat/stuck at dead-center
const LOCK_SMOOTH = 0.16;   // per-frame ease toward the snapped target — lower is smoother/laggier

// Bubble-like squash/stretch — each orb's screen-space velocity drives a
// target elongation along its direction of travel; an underdamped spring
// chases that target, so it overshoots and jiggles back to round when
// scrolling stops instead of snapping straight to a circle.
const STRETCH_VELOCITY_SCALE = 0.00012; // target stretch per px/s of velocity
const MAX_STRETCH = 0.2;
const STRETCH_SPRING_K = 90;
const STRETCH_SPRING_DAMPING = 9;

const BG_COLOR = "#EFEAE0";

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

// ---- Glass ball shader ----
// Adapted from the parallax-lens biome orbs — same refraction/chromatic-
// aberration/rim-light core, with the FBO background-passthrough and
// behind-text shadow logic stripped out (nothing here to refract or shadow).
const vertexShader = /* glsl */`
  uniform vec2  uStretchDir;    // normalized direction of travel
  uniform float uStretchAmount; // 0 = circle, can overshoot negative on settle
  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec2 dir  = uStretchDir;
    vec2 perp = vec2(-dir.y, dir.x);
    float along  = dot(position.xy, dir);
    float across = dot(position.xy, perp);

    // Area-conserving squash/stretch: elongate along the travel direction,
    // compress across it by the inverse sqrt so the orb keeps its volume
    // instead of just ballooning.
    float stretchScale = 1.0 + uStretchAmount;
    float squashScale  = 1.0 / sqrt(max(stretchScale, 0.2));
    vec2 deformed = dir * along * stretchScale + perp * across * squashScale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(deformed, position.z, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform sampler2D photoMap;
  uniform float     uScroll;
  uniform vec3      uBgColor;
  uniform float     uOpacity;
  uniform float     uTexAspect;
  varying vec2 vUv;

  const float EDGE_W = 0.16;
  const float PI     = 3.14159265;

  float hash21(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    return fract(sin(dot(p, p + vec2(127.1, 311.7))) * 43758.5453);
  }

  // object-fit: cover, so portrait photos don't stretch into the circle's
  // square UV space
  vec2 cover(vec2 uv) {
    float scaleX = min(1.0, 1.0 / uTexAspect);
    float scaleY = min(1.0, uTexAspect);
    return vec2((uv.x - 0.5) * scaleX + 0.5, (uv.y - 0.5) * scaleY + 0.5);
  }

  void main() {
    vec2 p = vUv - 0.5;

    float d            = length(p) - 0.5;
    float distFromEdge = max(0.0, -d);
    float edgeFactor   = 1.0 - smoothstep(0.0, EDGE_W, distFromEdge);
    vec2  grad         = length(p) > 0.001 ? normalize(p) : vec2(0.0, 1.0);
    float ef2          = edgeFactor * edgeFactor;

    float t          = uScroll * 0.0055;
    float lightAngle = PI * 0.5 - t;
    vec2  lightDir   = vec2(cos(lightAngle), sin(lightAngle));
    float litFactor  = max(0.0, dot(grad, lightDir));

    float wx      = sin(vUv.y * PI * 2.0 + t * 1.10) * 0.028;
    float wy      = sin(vUv.x * PI * 2.0 + t * 0.90) * 0.028;
    vec2  warpVec = vec2(wx, wy) * (0.15 + ef2 * 0.85);

    float r2     = dot(p, p);
    float barrel = 1.0 / (1.0 + 2.20 * r2);
    vec2  pUv    = 0.5 - p * barrel + warpVec;
    pUv = clamp(pUv, 0.001, 0.999);

    float caStr  = 0.004 + ef2 * 0.011 + ef2 * litFactor * 0.008;
    float photoR = texture2D(photoMap, clamp(cover(pUv + lightDir * caStr), 0.001, 0.999)).r;
    float photoG = texture2D(photoMap, cover(pUv)).g;
    float photoB = texture2D(photoMap, clamp(cover(pUv - lightDir * caStr), 0.001, 0.999)).b;
    vec4  photo  = vec4(photoR, photoG, photoB, 1.0);

    vec4 color = mix(photo, vec4(uBgColor, 1.0), 0.16 + ef2 * 0.10);

    vec3 glassTint = vec3(0.93, 0.97, 1.00);
    color.rgb = mix(color.rgb, color.rgb * glassTint, edgeFactor * 0.30);
    color.rgb *= 1.0 - edgeFactor * 0.22;
    color.rgb += pow(edgeFactor * litFactor, 2.0) * 0.28;
    color.rgb += smoothstep(0.86, 1.0, edgeFactor) * 0.18;
    color.rgb += (1.0 - edgeFactor) * 0.04;

    float grainAmt = 0.018 + edgeFactor * 0.022;
    float grain    = (hash21(vUv * 780.0) * 2.0 - 1.0) * grainAmt;
    color.rgb     += grain;

    gl_FragColor = vec4(color.rgb, uOpacity);
  }
`;

interface SceneProps {
  scrollRef: React.RefObject<number>;
  midScrollRef: React.RefObject<number>;
  labelRef: React.RefObject<HTMLDivElement | null>;
  labelTitleRef: React.RefObject<HTMLParagraphElement | null>;
  labelSubRef: React.RefObject<HTMLParagraphElement | null>;
  lineRef: React.RefObject<HTMLDivElement | null>;
}

function Scene({ scrollRef, midScrollRef, labelRef, labelTitleRef, labelSubRef, lineRef }: SceneProps) {
  const { size } = useThree();
  const textures = useTexture(ITEMS.map((i) => i.src));
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const geo = useMemo(() => new THREE.CircleGeometry(BASE_SIZE / 2, 64), []);
  const displayAngleRef = useRef(0);
  const lineWidthRef = useRef(0);
  const scaleRefs = useRef<number[]>(new Array(N).fill(1));
  const scaleVelRefs = useRef<number[]>(new Array(N).fill(0));

  // Squash/stretch spring state, one per orb
  const prevXRef = useRef<number[]>(new Array(N).fill(0));
  const prevYRef = useRef<number[]>(new Array(N).fill(0));
  const stretchAmountRef = useRef<number[]>(new Array(N).fill(0));
  const stretchVelRef = useRef<number[]>(new Array(N).fill(0));
  const stretchDirRef = useRef<{ x: number; y: number }[]>(
    new Array(N).fill(null).map(() => ({ x: 1, y: 0 }))
  );

  const uniformsList = useMemo(() => textures.map((tex) => ({
    photoMap:      { value: tex },
    uScroll:       { value: 0 },
    uBgColor:      { value: new THREE.Color(BG_COLOR) },
    uOpacity:      { value: 1 },
    uStretchDir:   { value: new THREE.Vector2(1, 0) },
    uStretchAmount: { value: 0 },
    uTexAspect: { value: (() => {
      const img = tex.image as HTMLImageElement | undefined;
      return img ? img.width / img.height : 0.75;
    })() },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), [textures]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const vw = size.width;
    const vh = size.height;

    // Warp the linear scroll->index mapping so it dwells near each integer
    // index (dead-center focus) and moves quickly through the transition
    // zone in between — same total scroll distance per item, just uneven
    // pacing, which is what makes the centered orb feel "locked."
    const rawIndex = (scrollRef.current - midScrollRef.current) / SECTION_PX;
    const baseIndex = Math.round(rawIndex);
    const frac = rawIndex - baseIndex;
    const snappedFrac = frac - (SNAP_STRENGTH / (2 * Math.PI)) * Math.sin(2 * Math.PI * frac);
    const targetAngleOffset = (baseIndex + snappedFrac) * ANGLE_STEP;

    // Ease the rendered angle toward the snapped target instead of tracking
    // it rigidly — softens the speed change through the transition zone so
    // the lock doesn't feel like a hard whip between dwell points.
    displayAngleRef.current += (targetAngleOffset - displayAngleRef.current) * LOCK_SMOOTH;
    const angleOffset = displayAngleRef.current;

    // Pivot placed so the focus point (arcCenterX + ARC_RADIUS, at rel=0)
    // sits LABEL_OFFSET to the left of true horizontal center — the label
    // itself sits fixed at true center, so the orb reads as "to its left."
    const arcCenterX = vw / 2 - LABEL_OFFSET - ARC_RADIUS;

    let focusedIdx = 0;
    let minAbsDeg = Infinity;
    let focusedYpx = vh / 2;

    for (let i = 0; i < N; i++) {
      const angle = i * ANGLE_STEP + angleOffset;
      const rel = Math.atan2(Math.sin(angle), Math.cos(angle));
      const absDeg = (Math.abs(rel) * 180) / Math.PI;

      const xPx = arcCenterX + ARC_RADIUS * Math.cos(rel);
      const yPx = vh / 2 + ARC_RADIUS * Math.sin(rel);

      const focusLerp = smoothstep(0, FOCUS_SPAN_DEG, absDeg);
      const baseScale = FOCUS_SCALE - (FOCUS_SCALE - 1) * focusLerp;
      const edgeShrink = 1 - 0.4 * smoothstep(EDGE_SHRINK_START, EDGE_SHRINK_END, absDeg);
      const targetScale = baseScale * edgeShrink;
      const opacity = 1 - smoothstep(FADE_START, FADE_END, absDeg);

      // Ease toward the target scale instead of snapping to it — the grow
      // into focus should trail behind the angle a little, not track it
      // rigidly, for a slower and more elegant expansion.
      // Spring toward the target scale instead of a plain ease — lets it
      // overshoot past full size and settle back for a bouncy "pop."
      const scaleForce = SCALE_SPRING_K * (targetScale - scaleRefs.current[i]) - SCALE_SPRING_DAMPING * scaleVelRefs.current[i];
      scaleVelRefs.current[i] += scaleForce * dt;
      scaleRefs.current[i] += scaleVelRefs.current[i] * dt;
      const smoothedScale = scaleRefs.current[i];

      // Bubble squash/stretch: screen-space velocity sets the target
      // elongation, an underdamped spring chases it so the orb overshoots
      // and jiggles back to round rather than snapping straight there.
      const vx = dt > 0 ? (xPx - prevXRef.current[i]) / dt : 0;
      const vy = dt > 0 ? (yPx - prevYRef.current[i]) / dt : 0;
      prevXRef.current[i] = xPx;
      prevYRef.current[i] = yPx;
      const speed = Math.hypot(vx, vy);
      if (speed > 1) {
        stretchDirRef.current[i] = { x: vx / speed, y: -vy / speed };
      }
      const targetStretch = Math.min(MAX_STRETCH, speed * STRETCH_VELOCITY_SCALE);
      const stretchForce = STRETCH_SPRING_K * (targetStretch - stretchAmountRef.current[i]) - STRETCH_SPRING_DAMPING * stretchVelRef.current[i];
      stretchVelRef.current[i] += stretchForce * dt;
      stretchAmountRef.current[i] += stretchVelRef.current[i] * dt;

      const mesh = meshRefs.current[i];
      const mat = matRefs.current[i];
      if (mesh) {
        mesh.position.set(xPx - vw / 2, -(yPx - vh / 2), 0);
        mesh.scale.setScalar(smoothedScale);
        mesh.renderOrder = Math.round(1000 - absDeg);
      }
      if (mat) {
        mat.uniforms.uScroll.value = scrollRef.current;
        mat.uniforms.uOpacity.value = opacity;
        mat.uniforms.uStretchAmount.value = stretchAmountRef.current[i];
        (mat.uniforms.uStretchDir.value as THREE.Vector2).set(stretchDirRef.current[i].x, stretchDirRef.current[i].y);
      }

      if (absDeg < minAbsDeg) {
        minAbsDeg = absDeg;
        focusedIdx = i;
        focusedYpx = yPx;
      }
    }

    const label = labelRef.current;
    if (label) {
      const labelOpacity = 1 - smoothstep(LABEL_FADE_START, LABEL_FADE_END, minAbsDeg);
      // Fixed at true horizontal center — the orb sits to its left, not the other way around.
      label.style.opacity = labelOpacity.toFixed(3);
      label.style.transform = `translate(${(vw / 2).toFixed(1)}px, ${focusedYpx.toFixed(1)}px) translate(-50%, -50%)`;
      if (labelOpacity < 0.05) {
        const item = ITEMS[focusedIdx];
        if (labelTitleRef.current) labelTitleRef.current.textContent = item.location;
        if (labelSubRef.current) labelSubRef.current.textContent = `${item.city} · ${item.year}`;
      }
      // Line waits until the title/subtitle are basically fully shown, then
      // grows to halfway on its own gentler pace — a distinct second beat
      // after the text reveal, not something that tracks it 1:1.
      const lineTarget = labelOpacity > 0.85 ? 50 : 0;
      lineWidthRef.current += (lineTarget - lineWidthRef.current) * 0.08;
      if (lineRef.current) lineRef.current.style.width = `${lineWidthRef.current.toFixed(2)}%`;
    }
  });

  return (
    <>
      {ITEMS.map((_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }} geometry={geo}>
          <shaderMaterial
            ref={(el) => { matRefs.current[i] = el as THREE.ShaderMaterial; }}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
            depthTest={false}
            depthWrite={false}
            uniforms={uniformsList[i]}
          />
        </mesh>
      ))}
    </>
  );
}

export default function ArcGallery() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const labelTitleRef = useRef<HTMLParagraphElement>(null);
  const labelSubRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGPathElement>(null);
  const scrollRef = useRef(0);
  const midScrollRef = useRef(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const vh = window.innerHeight;
    const totalScroll = SECTION_PX * N * LOOPS;
    const midScroll = totalScroll / 2;
    content.style.height = `${vh + totalScroll}px`;
    scrollRef.current = midScroll;
    midScrollRef.current = midScroll;
    wrapper.scrollTop = midScroll;

    const lenis = new Lenis({ wrapper, content, smoothWheel: true, lerp: 0.08, wheelMultiplier: 0.7 });
    lenis.on("scroll", ({ scroll }: { scroll: number }) => {
      scrollRef.current = scroll;
    });

    let rafId: number;
    function raf(t: number) {
      lenis.raf(t);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflowY: "scroll",
        overflowX: "hidden",
        scrollbarWidth: "none",
        background: BG_COLOR,
      }}
    >
      <div ref={contentRef}>
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          <Canvas
            orthographic
            camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 1000 }}
            style={{ position: "absolute", inset: 0 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <Suspense fallback={null}>
              <Scene
                scrollRef={scrollRef}
                midScrollRef={midScrollRef}
                labelRef={labelRef}
                labelTitleRef={labelTitleRef}
                labelSubRef={labelSubRef}
                lineRef={lineRef}
              />
            </Suspense>
          </Canvas>

          <div
            ref={labelRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              textAlign: "left",
              pointerEvents: "none",
            }}
          >
            <p ref={labelTitleRef} style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 20,
              letterSpacing: "0.02em",
              color: "#1A1714",
              margin: "0 0 4px",
              whiteSpace: "nowrap",
            }} />
            <p ref={labelSubRef} style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 12,
              letterSpacing: "0.08em",
              color: "#8A8479",
              margin: "0 0 12px",
              whiteSpace: "nowrap",
            }} />
            <div ref={lineRef} style={{ width: 0, height: 1, background: "rgba(26,23,20,0.16)", margin: "0 0 12px" }} />
            <button
              onMouseEnter={() => chevronRef.current && morph(chevronRef.current, ARROW_RIGHT, SEE_MORE_SPRING)}
              onMouseLeave={() => chevronRef.current && morph(chevronRef.current, CHEVRON_RIGHT, SEE_MORE_SPRING)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                paddingTop: 8,
                paddingRight: 12,
                paddingBottom: 8,
                paddingLeft: 0,
                cursor: "pointer",
                pointerEvents: "auto",
              }}
            >
              <span style={{
                fontFamily: "'MDUIXS', sans-serif",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                lineHeight: 1,
                color: "#8A8479",
              }}>
                Explore
              </span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8A8479"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path ref={chevronRef} d={CHEVRON_RIGHT} />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
