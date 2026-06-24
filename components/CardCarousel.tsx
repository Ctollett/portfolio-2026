"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import type { RefObject } from "react";
import type * as THREE from "three";

export interface CarouselCard {
  src: string;
  video?: string;
  slug?: string;
  label: string;
  title: string;
  body?: string;
}

const CARD_W = 480;
const CARD_H = 288;
const CARD_STEP = 308;
const PADDING = 2;
const LOOPS        = 500;
const SHADOW_BLEED = 32;

const SHADOW_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CONTACT_SHADOW_FRAG = /* glsl */`
  uniform float uOpacity;
  uniform float uLightIntensity;
  varying vec2 vUv;

  float roundedBoxSDF(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(${CARD_W + SHADOW_BLEED * 2}.0, ${CARD_H + SHADOW_BLEED * 2}.0);
    vec2 b = vec2(${CARD_W / 2}.0, ${CARD_H / 2}.0);
    // Falloff tightens as light intensifies — starts very soft, crisps up in light
    float falloff = mix(20.0, 4.0, uLightIntensity);
    float d = roundedBoxSDF(p, b, 14.0);
    float shadow = 1.0 - smoothstep(0.0, falloff, max(d, 0.0));
    // Concentrate shadow at bottom edge; fade toward top of card
    float bottomBias = clamp((${CARD_H / 2}.0 - p.y) / ${CARD_H}.0, 0.0, 1.0);
    float strength = mix(0.05, 0.13, uLightIntensity);
    gl_FragColor = vec4(0.0, 0.0, 0.0, shadow * bottomBias * uOpacity * strength);
  }
`;

const SHADOW_FRAG = /* glsl */`
  uniform float uOpacity;
  uniform float uLightIntensity;
  varying vec2 vUv;

  float roundedBoxSDF(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    // Mesh is centered at the card's bottom edge, so p.y=0 = bottom of card.
    // Use a thin horizontal bar SDF — shadow only bleeds outward from the bottom edge.
    vec2 p = (vUv - 0.5) * vec2(${CARD_W + SHADOW_BLEED * 2}.0, ${CARD_H + SHADOW_BLEED * 2}.0);
    float d = roundedBoxSDF(p, vec2(${CARD_W / 2 - 8}.0, 1.0), 8.0);
    float falloff = mix(24.0, 6.0, uLightIntensity);
    float shadow = 1.0 - smoothstep(0.0, falloff, max(d, 0.0));
    float strength = mix(0.0, 0.32, uLightIntensity);
    gl_FragColor = vec4(0.0, 0.0, 0.0, shadow * uOpacity * strength);
  }
`;

const OVERLAY_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const OVERLAY_FRAG = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;

  float hash(vec2 p) {
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p.yx + 19.19);
    return fract((p.x + p.y) * p.x);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    v += noise(p)        * 0.5;
    v += noise(p * 2.1)  * 0.25;
    v += noise(p * 4.3)  * 0.125;
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float edgeMask   = pow(abs(uv.y * 2.0 - 1.0), 4.0);
    float cornerMask = pow(abs(uv.x * 2.0 - 1.0), 5.0) * pow(abs(uv.y * 2.0 - 1.0), 1.5);
    float mask  = clamp(edgeMask + cornerMask * 0.4, 0.0, 1.0);
    vec2  glassUv = uv * vec2(6.0, 3.5);
    float glass = fbm(glassUv);
    glass = smoothstep(0.25, 0.75, glass);
    float alpha = glass * mask * 0.12;
    gl_FragColor = vec4(vec3(glass), alpha);
  }
`;

const VERT = /* glsl */`
  varying vec2 vUv;
  uniform float uDistFromCenter;

  const float HW = ${CARD_W / 2}.0;
  const float HH = ${CARD_H / 2}.0;

  void main() {
    vUv = uv;
    float raw = smoothstep(0.6, 1.0, abs(uDistFromCenter));
    float lens = raw;
    vec2 n = position.xy / vec2(HW, HH);
    vec3 pos = position;
    float dir = sign(uDistFromCenter);
    float t = (n.y * dir + 1.0) * 0.5;
    float xFlare = 0.6 + t * t * 2.6;
    pos.x += sign(n.x + 0.0001) * lens * abs(n.x) * xFlare * HW;
    pos.y += dir * lens * t * t * HH * 1.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAG = /* glsl */`
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uDistFromCenter;
  uniform float uTexAspect;
  varying vec2 vUv;

  const float W = ${CARD_W}.0;
  const float H = ${CARD_H}.0;
  const float R = 12.0;

  vec2 cover(vec2 uv) {
    float cardAspect = W / H;
    float scaleX = min(1.0, cardAspect / uTexAspect);
    float scaleY = min(1.0, uTexAspect / cardAspect);
    return vec2((uv.x - 0.5) * scaleX + 0.5, (uv.y - 0.5) * scaleY + 0.5);
  }

  void main() {
    float raw = smoothstep(0.6, 1.0, abs(uDistFromCenter));
    float lens = raw;
    const float aspect = W / H;
    vec2 c = (vUv - 0.5) * vec2(aspect, 1.0);
    float r = length(c);
    float barrel = 1.0 + lens * 14.0 * r * r;
    vec2 lensUv = c / vec2(aspect, 1.0) * barrel + 0.5;
    float chroma = lens * 1.1;
    vec2 uvR = cover(c / vec2(aspect, 1.0) * (barrel + chroma) + 0.5);
    vec2 uvG = cover(lensUv);
    vec2 uvB = cover(c / vec2(aspect, 1.0) * (barrel - chroma) + 0.5);
    float rVal = texture2D(uTexture, uvR).r;
    float gVal = texture2D(uTexture, uvG).g;
    float bVal = texture2D(uTexture, uvB).b;
    vec2 hlPos = (vUv - 0.5) - vec2(0.0, 0.2);
    float highlight = (1.0 - smoothstep(0.0, 0.28, length(hlPos))) * lens * 1.0;
    vec2 px = vUv * vec2(W, H);
    vec2 nearest = clamp(px, vec2(R), vec2(W - R, H - R));
    float cornerAlpha = 1.0 - smoothstep(R - 1.0, R + 1.0, length(px - nearest));
    float alpha = cornerAlpha;
    vec3 color = vec3(rVal, gVal, bVal) + vec3(highlight);


    // Rim lighting — intensity driven by card's screen-Y position.
    float rimLight = smoothstep(-0.6, 0.4, uDistFromCenter);

    // Single unified soft rim using the rounded-rect SDF.
    // No zone branching — the SDF handles every edge and corner smoothly.
    vec2 sdfP = px - vec2(W * 0.5, H * 0.5);
    vec2 sdfQ = abs(sdfP) - vec2(W * 0.5 - R, H * 0.5 - R);
    float sdfD    = length(max(sdfQ, 0.0)) + min(max(sdfQ.x, sdfQ.y), 0.0) - R;
    float rimDist = max(-sdfD, 0.0);  // inward distance to nearest edge

    // Height fade: full at top, zero by halfway down the sides.
    float heightFade = smoothstep(H * 0.5, H, px.y);

    // Tight rim hug — shows card roundedness without spreading onto the face
    float rim = (1.0 - smoothstep(0.0, 3.0, rimDist)) * heightFade * 0.26 * rimLight;

    color = clamp(color + rim, 0.0, 1.0);

    // Subtle inner border — thin ring just inside the card edge
    float borderW     = 3.0;
    float borderAlpha = (1.0 - smoothstep(0.0, borderW, rimDist)) * cornerAlpha;
    color = mix(color, vec3(0.18, 0.18, 0.18), borderAlpha * 0.25);

    gl_FragColor = vec4(color, alpha * uOpacity);
  }
`;

export function CardCarousel({
  cards,
  scrollRef,
}: {
  cards: CarouselCard[];
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const router       = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const outerRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef    = useRef<HTMLSpanElement>(null);
  const yearRef     = useRef<HTMLSpanElement>(null);
  const descRef     = useRef<HTMLSpanElement>(null);
  const firstLoad   = typeof window !== 'undefined' && !sessionStorage.getItem('intro-played');

  const padded = useMemo(() => [
    ...cards.slice(-PADDING).map((c) => ({ ...c, ghost: true  })),
    ...cards.map((c)               => ({ ...c, ghost: false })),
    ...cards.slice(0, PADDING).map((c) => ({ ...c, ghost: true  })),
  ], [cards]);

  const cardsRef  = useRef(cards);
  const paddedRef = useRef(padded);
  cardsRef.current  = cards;
  paddedRef.current = padded;

  useEffect(() => {
    const cards  = cardsRef.current;
    const padded = paddedRef.current;

    const vh       = window.innerHeight;
    const cardStep = CARD_STEP;
    const sectionH = Math.round(vh * 0.7);
    const totalH   = cards.length * sectionH * LOOPS;
    const midScroll = Math.floor(LOOPS / 2) * cards.length * sectionH;

    if (scrollRef.current) scrollRef.current.style.minHeight = `${vh + totalH}px`;
    window.scrollTo(0, midScroll);

    async function init() {
      const [{ default: Lenis }, THREE] = await Promise.all([
        import("lenis"),
        import("three"),
      ]);

      // Guard: component may have unmounted while dynamic imports were in-flight
      if (unmounted) return () => {};

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(window.innerWidth, vh);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene  = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(
        -window.innerWidth / 2,
         window.innerWidth / 2,
         vh / 2,
        -vh / 2,
        0.1, 100
      );
      camera.position.z = 1;

      const loader      = new THREE.TextureLoader();
      const textures:   Record<string, THREE.Texture> = {};
      const texAspects: Record<string, number>        = {};
      const videoMap    = new Map<string, HTMLVideoElement>();

      const texKey = (c: typeof padded[0]) => c.video ?? c.src;

      // Image textures
      await Promise.all(
        [...new Set(padded.filter(c => !c.video).map(c => c.src))].map(
          (src) =>
            new Promise<void>((resolve) => {
              loader.load(src, (tex) => {
                tex.colorSpace = THREE.LinearSRGBColorSpace;
                tex.minFilter  = THREE.LinearFilter;
                tex.magFilter  = THREE.LinearFilter;
                textures[src]   = tex;
                texAspects[src] = tex.image.width / tex.image.height;
                resolve();
              });
            })
        )
      );

      // Video textures
      await Promise.all(
        [...new Set(padded.filter(c => !!c.video).map(c => c.video!))].map(
          (src) =>
            new Promise<void>((resolve) => {
              const vid = document.createElement("video");
              vid.src         = src;
              vid.muted       = true;
              vid.loop        = true;
              vid.playsInline = true;
              videoMap.set(src, vid);
              vid.addEventListener("loadedmetadata", () => {
                const tex = new THREE.VideoTexture(vid);
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.minFilter  = THREE.LinearFilter;
                tex.magFilter  = THREE.LinearFilter;
                textures[src]   = tex;
                texAspects[src] = vid.videoWidth / vid.videoHeight;
                resolve();
              }, { once: true });
              vid.load();
            })
        )
      );

      // Guard: component may have unmounted while textures were loading
      if (unmounted) {
        videoMap.forEach(v => { v.pause(); v.src = ""; v.load(); });
        renderer.dispose();
        return () => {};
      }

      const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H, 32, 32);

      const shadowGeometry = new THREE.PlaneGeometry(CARD_W + SHADOW_BLEED * 2, CARD_H + SHADOW_BLEED * 2);

      const contactMeshes = padded.map(() => {
        const mat = new THREE.ShaderMaterial({
          uniforms:       { uOpacity: { value: 0.0 }, uLightIntensity: { value: 0.0 } },
          vertexShader:   SHADOW_VERT,
          fragmentShader: CONTACT_SHADOW_FRAG,
          transparent:    true,
          depthTest:      false,
          depthWrite:     false,
        });
        const mesh = new THREE.Mesh(shadowGeometry, mat);
        mesh.renderOrder = 0;
        mesh.visible = false;
        scene.add(mesh);
        return mesh;
      });

      const shadowMeshes = padded.map(() => {
        const mat = new THREE.ShaderMaterial({
          uniforms:       { uOpacity: { value: 0.0 }, uLightIntensity: { value: 0.0 } },
          vertexShader:   SHADOW_VERT,
          fragmentShader: SHADOW_FRAG,
          transparent:    true,
          depthTest:      false,
          depthWrite:     false,
        });
        const mesh = new THREE.Mesh(shadowGeometry, mat);
        mesh.renderOrder = 0;
        mesh.visible = false;
        scene.add(mesh);
        return mesh;
      });

      const meshes = padded.map((card) => {
        const key = texKey(card);
        const mat = new THREE.ShaderMaterial({
          uniforms: {
            uTexture:        { value: textures[key] },
            uOpacity:        { value: 1.0 },
            uDistFromCenter: { value: 0.0 },
            uTexAspect:      { value: texAspects[key] ?? 1.0 },
          },
          vertexShader:   VERT,
          fragmentShader: FRAG,
          transparent:    true,
          depthWrite:     false,
        });
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.renderOrder = 1;
        mesh.visible = false;
        scene.add(mesh);
        return mesh;
      });

      const overlayMat = new THREE.ShaderMaterial({
        uniforms:       { uTime: { value: 0.0 } },
        vertexShader:   OVERLAY_VERT,
        fragmentShader: OVERLAY_FRAG,
        transparent:    true,
        depthTest:      false,
        depthWrite:     false,
      });
      const overlayMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(window.innerWidth, vh),
        overlayMat
      );
      overlayMesh.renderOrder = 999;
      scene.add(overlayMesh);

      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      let scroll     = 0;
      let lastActive = -1;
      let rafId: number;

      lenis.on("scroll", (e: { scroll: number }) => { scroll = e.scroll; });

      // Slot-machine spin: only on first session load
      const SNAP_LOOPS = 7;
      const snapOffset = (SNAP_LOOPS * cards.length + 2) * sectionH;
      const SNAP_DURATION = 3000;
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const isFirstLoad = !sessionStorage.getItem('intro-played');
      let snapStartTime = isFirstLoad ? -1 : -2; // -1 = waiting, -2 = skip

      if (isFirstLoad) {
        sessionStorage.setItem('intro-played', '1');
        window.scrollTo(0, midScroll + snapOffset);
        scroll = midScroll + snapOffset;
      } else {
        window.scrollTo(0, midScroll);
        scroll = midScroll;
      }

      function raf(t: number) {
        if (snapStartTime === -1) snapStartTime = t;

        const snapElapsed = t - snapStartTime;
        if (snapStartTime >= 0 && snapElapsed < SNAP_DURATION) {
          const progress = easeOutCubic(snapElapsed / SNAP_DURATION);
          const newPos = (midScroll + snapOffset) - snapOffset * progress;
          scroll = newPos;
          window.scrollTo(0, Math.round(newPos));
        } else if (snapStartTime >= 0) {
          // Spin done — sync Lenis and hand off
          snapStartTime = -2;
          scroll = midScroll;
          window.scrollTo(0, midScroll);
          lenis.scrollTo(midScroll, { immediate: true } as Parameters<typeof lenis.scrollTo>[1]);
        } else {
          lenis.raf(t);
        }

        overlayMat.uniforms.uTime.value = t * 0.001;

        const rawFloat  = ((scroll / sectionH) % cards.length + cards.length) % cards.length;
        const floatIndex = rawFloat + PADDING;
        const newActive  = Math.round(rawFloat) % cards.length;

        if (newActive !== lastActive) {
          lastActive = newActive;
          setActiveIdx(newActive);
          if (titleRef.current) titleRef.current.textContent = cards[newActive].title;
          if (yearRef.current)  yearRef.current.textContent  = cards[newActive].label;
          if (descRef.current)  descRef.current.textContent  = cards[newActive].body ?? "";

          // Play the active card's video, pause all others
          videoMap.forEach((vid, src) => {
            if (src === cards[newActive].video) {
              vid.play().catch(() => {});
            } else {
              vid.pause();
            }
          });
        }

        for (let i = 0; i < padded.length; i++) {
          const el = outerRefs.current[i];
          if (!el) continue;
          const dist   = Math.abs(i - floatIndex);
          const offset = (i - floatIndex) * cardStep;
          const s = 1 - Math.min(dist, 1) * 0.05;
          const o = Math.max(0, 1 - Math.min(dist, 2) * 0.3);
          el.style.transform = `translateY(${offset.toFixed(1)}px) scale(${s.toFixed(3)})`;
          el.style.opacity   = o.toFixed(3);
          el.style.zIndex    = String(Math.round(100 - dist * 10));
        }

        for (let i = 0; i < padded.length; i++) {
          const el = outerRefs.current[i];
          if (!el) continue;
          const dist = Math.abs(i - floatIndex);
          const rect = el.getBoundingClientRect();
          const cx   = rect.left + rect.width  / 2 - window.innerWidth / 2;
          const cy   = -(rect.top  + rect.height / 2 - vh / 2);
          const o    = Math.max(0, 1 - Math.min(dist, 2) * 0.3);
          const mesh = meshes[i];
          mesh.visible = true;
          mesh.position.set(cx, cy, 0);
          mesh.scale.set(rect.width / CARD_W, rect.height / CARD_H, 1);
          const u = (mesh.material as THREE.ShaderMaterial).uniforms;
          u.uOpacity.value        = o;
          u.uDistFromCenter.value = cy / (vh / 2);

          // Shadow vanishes as soon as distortion begins.
          const distFromCenter = cy / (vh / 2);
          const lensVal = Math.min(1, Math.max(0, (Math.abs(distFromCenter) - 0.6) / 0.4));
          const shadowFade = Math.max(0, 1 - lensVal * 6);

          // Bell curve peaking at centre (card aligned with text), quick rise and fall
          const rise = Math.min(1, Math.max(0, (distFromCenter + 0.25) / 0.25));
          const riseS = rise * rise * (3 - 2 * rise);
          const fall = Math.min(1, Math.max(0, (0.25 - distFromCenter) / 0.25));
          const fallS = fall * fall * (3 - 2 * fall);
          const rimLight = riseS * fallS;

          // Contact shadow disabled — the full-rect SDF created a card-shaped halo.
          contactMeshes[i].visible = false;

          // Single thin-bar drop shadow sitting just below the card's bottom edge.
          const shadow = shadowMeshes[i];
          shadow.visible = shadowFade > 0.01;
          shadow.position.set(cx, cy - rect.height / 2, -0.1);
          shadow.scale.set(rect.width / CARD_W, rect.height / CARD_H, 1);
          const su = (shadow.material as THREE.ShaderMaterial).uniforms;
          su.uOpacity.value        = o * shadowFade;
          su.uLightIntensity.value = rimLight;
        }

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
      setCanvasReady(true);
      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        videoMap.forEach(v => { v.pause(); v.src = ""; v.load(); });
        contactMeshes.forEach(m => m.material.dispose());
        shadowMeshes.forEach(m => m.material.dispose());
        shadowGeometry.dispose();
        renderer.dispose();
      };
    }

    let unmounted = false;
    let cleanup: (() => void) | undefined;
    init().then((fn) => {
      if (unmounted) {
        fn(); // init resolved after unmount — run cleanup immediately to kill RAF + reset scroll
      } else {
        cleanup = fn;
      }
    });
    return () => {
      unmounted = true;
      cleanup?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <m.canvas
        ref={canvasRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: canvasReady ? 1 : 0 }}
        transition={{ duration: firstLoad ? 0.15 : 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ position: "fixed", top: 0, left: 0, zIndex: 2, pointerEvents: "none" }}
      />

      {/* Title — sibling of canvas so zIndex works above WebGL */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: firstLoad ? 2.8 : 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: "fixed",
          top: "50%",
          left: 0,
          width: `calc(50vw - ${CARD_W / 2}px)`,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        <span ref={titleRef} style={{
          fontFamily: "'Canela', serif",
          fontSize: 40,
          fontStyle: "italic",
          fontWeight: 300,
          color: "#C0582A",
        }}>
          {cards[0].title}
        </span>
      </m.div>

      {/* Year + desc — sibling of canvas so zIndex works above WebGL */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: firstLoad ? 3.0 : 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: "fixed",
          top: "50%",
          left: `calc(50vw + ${CARD_W / 2}px)`,
          right: 0,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "baseline",
          gap: 12,
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        <span ref={yearRef} style={{
          fontFamily: "'MDUIXS', sans-serif",
          fontSize: 14,
          letterSpacing: "0.08em",
          color: "#555559",
          whiteSpace: "nowrap",
        }}>
          {cards[0].label}
        </span>
        <span ref={descRef} style={{
          fontFamily: "'MDUIXS', sans-serif",
          fontSize: 14,
          letterSpacing: "0.02em",
          color: "#9A9A9E",
          whiteSpace: "nowrap",
        }}>
          {cards[0].body ?? ""}
        </span>
      </m.div>

      {/* Center card click target */}
      {cards[activeIdx]?.slug && (
        <div
          onClick={() => router.push(`/work/${cards[activeIdx].slug}`)}
          style={{
            position: "fixed",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: CARD_W,
            height: CARD_H,
            zIndex: 10,
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        />
      )}

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: canvasReady ? 1 : 0 }}
        transition={{ duration: firstLoad ? 0.15 : 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: CARD_W,
          height: CARD_H,
          overflow: "visible",
        }}>
        {padded.map((_card, i) => {
          const initDist    = Math.abs(i - PADDING);
          const initScale   = 1 - Math.min(initDist, 1) * 0.05;
          const initOpacity = Math.max(0, 1 - Math.min(initDist, 2) * 0.3);
          const initOffset  = (i - PADDING) * CARD_STEP;

          return (
            <div
              key={i}
              ref={(el) => { outerRefs.current[i] = el; }}
              style={{
                position: "absolute",
                inset: 0,
                transform: `translateY(${initOffset}px) scale(${initScale})`,
                opacity: initOpacity,
                zIndex: Math.round(100 - initDist * 10),
                willChange: "transform, opacity",
              }}
            />
          );
        })}
      </m.div>
    </>
  );
}
