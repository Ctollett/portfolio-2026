'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import type * as THREE from 'three';
import type { LabItem } from '@/lib/lab';

// ── Grid ───────────────────────────────────────────────────────────────────────
const CARD     = 2.4;
const GAP      = 2.4;
const STRIDE   = CARD + GAP;
const GRID_N   = 15;
const HALF_N   = Math.floor(GRID_N / 2);
const SEGMENTS = 24;

// ── Depth ──────────────────────────────────────────────────────────────────────
const CAM_Z   = 10;
const MAX_Z   =  4.2;
const MIN_Z   = -8.0;
const DEPTH_R = 13.0;

// ── Physics ────────────────────────────────────────────────────────────────────
const LERP  = 0.09;
const DECAY = 0.88;
const FOV   = 55;

// ── Squish ─────────────────────────────────────────────────────────────────────
const SQUISH_DEPTH    = 5.5;
const SQUISH_R        = 6.5;
const SQUISH_LERP_IN  = 0.16;
const SQUISH_LERP_OUT = 0.04;

const BG_HEX = 0xF4F2ED;
const BG_CSS = `#${BG_HEX.toString(16).padStart(6, '0')}`;

// Card visual height in vh — used for snap-label positioning

function labKey(i: number, j: number, count: number): number {
  // Linear hash: differences in all 8 directions are non-zero mod count (works for prime counts)
  // Horizontal: +3, Vertical: +7, Diagonals: +10 / -4 — all non-zero mod 11
  return ((i * 3 + j * 7) % count + count) % count;
}

const VERT = /* glsl */`
  varying vec2 vUv;
  uniform vec2  pressWorld;
  uniform float squishAmt;

  void main() {
    vUv = uv;
    vec2  wp   = (modelMatrix * vec4(position, 1.0)).xy;
    float dist = length(wp - pressWorld);
    float t    = dist / ${SQUISH_R.toFixed(1)};
    float disp = -${SQUISH_DEPTH.toFixed(1)} * squishAmt * exp(-t * t * 0.5);
    gl_Position = projectionMatrix * modelViewMatrix *
                  vec4(position.xy, position.z + disp, 1.0);
  }
`;

const FRAG = /* glsl */`
  varying vec2 vUv;
  uniform sampler2D map;
  uniform float radius;
  uniform vec3  bgColor;
  uniform float depthFactor;
  uniform float aspect;
  uniform float hasImage;
  uniform float visibility;

  void main() {
    vec2 uv = vUv;
    if (aspect > 1.0) {
      uv.x = (aspect - 1.0) / (2.0 * aspect) + vUv.x / aspect;
    } else if (aspect < 1.0) {
      uv.y = (1.0 - aspect) / 2.0 + vUv.y * aspect;
    }

    vec2  q     = abs(vUv - 0.5) - (0.5 - radius);
    float d     = length(max(q, 0.0)) - radius;
    float fw    = fwidth(d);
    float alpha = 1.0 - smoothstep(-fw, fw, d);
    if (alpha < 0.01) discard;

    vec3 img   = hasImage > 0.5
      ? texture2D(map, uv).rgb
      : vec3(0.83, 0.80, 0.77);
    vec3 color = mix(img, bgColor, depthFactor * 0.72);

    // Thin border ring on inside edge
    float borderW  = fw * 2.0;
    float notRing  = 1.0 - smoothstep(-borderW - fw, -borderW + fw, d);
    float border   = alpha * (1.0 - notRing);
    color = mix(color, vec3(0.62, 0.60, 0.57), border * 0.6);

    gl_FragColor = vec4(mix(bgColor, color, alpha * visibility), 1.0);
  }
`;

interface SnappedInfo {
  slug:   string;
  title:  string;
  number: string;
  date:   string;
}

export default function LabInfiniteCanvas({ labs }: { labs: LabItem[] }) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const router     = useRouter();
  const routerRef  = useRef(router);
  routerRef.current = router;
  const isMobile   = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  // Push camera back on mobile so more cards are visible
  const effectiveCamZ  = isMobile ? CAM_Z * 1.8 : CAM_Z;
  const effectiveCamZRef = useRef(effectiveCamZ);
  effectiveCamZRef.current = effectiveCamZ;
  const cardVh         = CARD / (2 * Math.tan((FOV / 2) * (Math.PI / 180)) * (effectiveCamZ - MAX_Z)) * 100;
  const halfCardVh     = cardVh / 2;

  const [snapped, setSnapped] = useState<SnappedInfo | null>(null);
  const snappedRef = useRef<SnappedInfo | null>(null);
  snappedRef.current = snapped;
  const labsRef = useRef(labs);
  labsRef.current = labs;

  const handleExpandRef = useRef<(() => void) | null>(null);

  const handleExpand = useCallback(() => {
    if (isMobile) return;
    const s = snappedRef.current;
    if (!s) return;
    router.push(`/lab/${s.slug}`);
  }, [router, isMobile]);

  handleExpandRef.current = handleExpand;

  useEffect(() => {
    let animId: number;
    let disposed = false;
    let doCleanup: (() => void) | null = null;

    import('three').then((THREE) => {
      if (disposed || !mountRef.current) return;

      const currentLabs = labsRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(BG_HEX);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mountRef.current.appendChild(renderer.domElement);

      const camZ   = effectiveCamZRef.current;
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 200);
      camera.position.set(0, 0, camZ);

      const fallbackData = new Uint8Array([0xD4, 0xCF, 0xC7, 0xFF]);
      const fallbackTex  = new THREE.DataTexture(fallbackData, 1, 1, THREE.RGBAFormat);
      fallbackTex.needsUpdate = true;

      const aspects = new Array(currentLabs.length).fill(1.0);
      const hasImg  = new Array(currentLabs.length).fill(0.0);
      const meshes: THREE.Mesh[][] = [];

      const videoEls: (HTMLVideoElement | null)[] = currentLabs.map((lab) => {
        if (!lab.previewVideo) return null;
        const v = document.createElement('video');
        v.src = lab.previewVideo;
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.crossOrigin = 'anonymous';
        v.preload = 'auto';
        v.play().catch(() => {});
        return v;
      });

      const textures = currentLabs.map((_lab, idx) => {
        const v = videoEls[idx];
        if (!v) return fallbackTex;
        const tex = new THREE.VideoTexture(v);
        tex.colorSpace = THREE.SRGBColorSpace;
        v.addEventListener('loadedmetadata', () => {
          if (!v.videoWidth || !v.videoHeight) return;
          aspects[idx] = v.videoWidth / v.videoHeight;
          hasImg[idx]  = 1.0;
          for (let si = 0; si < GRID_N; si++)
            for (let sj = 0; sj < GRID_N; sj++)
              if (meshes[si]?.[sj]?.userData.labKey === idx) {
                const u = (meshes[si][sj].material as THREE.ShaderMaterial).uniforms;
                u.aspect.value   = aspects[idx];
                u.hasImage.value = 1.0;
              }
        });
        return tex;
      });

      const cardGeo  = new THREE.PlaneGeometry(CARD, CARD, SEGMENTS, SEGMENTS);
      const bgColor  = new THREE.Color(BG_HEX);
      const pressVec = new THREE.Vector2(0, 0);

      for (let si = 0; si < GRID_N; si++) {
        meshes[si] = [];
        for (let sj = 0; sj < GRID_N; sj++) {
          const gi  = si - HALF_N;
          const gj  = sj - HALF_N;
          const key = labKey(gi, gj, currentLabs.length);
          const mat = new THREE.ShaderMaterial({
            uniforms: {
              map:         { value: textures[key] },
              radius:      { value: 0.07 },
              bgColor:     { value: bgColor },
              depthFactor: { value: 0.5 },
              aspect:      { value: aspects[key] },
              pressWorld:  { value: pressVec },
              squishAmt:   { value: 0 },
              hasImage:    { value: hasImg[key] },
              visibility:  { value: 1.0 },
            },
            vertexShader:   VERT,
            fragmentShader: FRAG,
          });
          const mesh = new THREE.Mesh(cardGeo, mat);
          mesh.frustumCulled = false;
          mesh.userData = { i: gi, j: gj, labKey: key };
          mesh.position.set(gi * STRIDE, gj * STRIDE, 0);
          scene.add(mesh);
          meshes[si].push(mesh);
        }
      }

      let camX = 0, camY = 0;
      let targetX = 0, targetY = 0;
      let isDragging = false;
      let lastPX = 0, lastPY = 0;
      let downPX = 0, downPY = 0;
      let vx = 0, vy = 0;
      let prevT = performance.now();
      let wheelTimer: ReturnType<typeof setTimeout> | null = null;
      let snapPending: number | null = null;
      let squishAmount = 0, squishTarget = 0;

      const worldScale = () => {
        const visH = 2 * Math.tan((FOV / 2) * (Math.PI / 180)) * camZ;
        return visH / window.innerHeight;
      };

      const snapToNearest = () => {
        const iNearest = Math.round(targetX / STRIDE);
        const jNearest = Math.round(targetY / STRIDE);
        targetX = iNearest * STRIDE;
        targetY = jNearest * STRIDE;
        vx = 0; vy = 0;
        const key = labKey(iNearest, jNearest, labsRef.current.length);
        snapPending = key;
        videoEls[key]?.play().catch(() => {});
      };

      const updatePressWorld = (ex: number, ey: number) => {
        const s = worldScale();
        pressVec.set(
          camX + (ex - window.innerWidth  / 2) * s,
          camY - (ey - window.innerHeight / 2) * s,
        );
      };

      const el = renderer.domElement;

      const onDown = (e: PointerEvent) => {
        el.setPointerCapture(e.pointerId);
        isDragging = true;
        lastPX = e.clientX; lastPY = e.clientY;
        downPX = e.clientX; downPY = e.clientY;
        vx = 0; vy = 0;
        prevT = performance.now();
        if (wheelTimer) clearTimeout(wheelTimer);
        videoEls.forEach(v => v?.pause());
        setSnapped(null);
        updatePressWorld(e.clientX, e.clientY);
        squishTarget = 1;
      };

      const onMove = (e: PointerEvent) => {
        if (!isDragging) return;
        const now = performance.now();
        const dt  = Math.max(now - prevT, 1);
        prevT = now;
        const s  = worldScale();
        const dx = -(e.clientX - lastPX) * s;
        const dy =  (e.clientY - lastPY) * s;
        lastPX = e.clientX; lastPY = e.clientY;
        targetX += dx; targetY += dy;
        vx = vx * 0.72 + (dx / dt) * 16 * 0.28;
        vy = vy * 0.72 + (dy / dt) * 16 * 0.28;
        updatePressWorld(e.clientX, e.clientY);
      };

      const onUp = (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        squishTarget = 0;
        const wasDrag = Math.hypot(e.clientX - downPX, e.clientY - downPY) > 6;
        if (!wasDrag && snappedRef.current) {
          handleExpandRef.current?.();
          return;
        }
        snapToNearest();
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const s = worldScale();
        targetX += e.deltaX * s;
        targetY -= e.deltaY * s;
        setSnapped(null);
        if (wheelTimer) clearTimeout(wheelTimer);
        wheelTimer = setTimeout(snapToNearest, 650);
      };

      el.addEventListener('pointerdown',   onDown);
      el.addEventListener('pointermove',   onMove);
      el.addEventListener('pointerup',     onUp);
      el.addEventListener('pointercancel', onUp);
      el.addEventListener('wheel', onWheel, { passive: false });

      const onResize = () => {
        const W = window.innerWidth, H = window.innerHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
      };
      window.addEventListener('resize', onResize);

      const animate = () => {
        animId = requestAnimationFrame(animate);

        if (!isDragging) {
          targetX += vx; targetY += vy;
          vx *= DECAY;   vy *= DECAY;
        }
        camX += (targetX - camX) * LERP;
        camY += (targetY - camY) * LERP;
        camera.position.set(camX, camY, camZ);

        const sl = squishTarget > squishAmount ? SQUISH_LERP_IN : SQUISH_LERP_OUT;
        squishAmount += (squishTarget - squishAmount) * sl;

        if (snapPending !== null &&
            Math.abs(targetX - camX) < 0.015 &&
            Math.abs(targetY - camY) < 0.015) {
          const lab = labsRef.current[snapPending];
          if (lab) {
            setSnapped({ slug: lab.slug, title: lab.title, number: lab.number, date: lab.date });
            routerRef.current.prefetch(`/lab/${lab.slug}`);
          }
          snapPending = null;
        }

        const iCenter = Math.round(camX / STRIDE);
        const jCenter = Math.round(camY / STRIDE);

        for (let si = 0; si < GRID_N; si++) {
          for (let sj = 0; sj < GRID_N; sj++) {
            const mesh = meshes[si][sj];
            const ti   = iCenter - HALF_N + si;
            const tj   = jCenter - HALF_N + sj;

            if (mesh.userData.i !== ti || mesh.userData.j !== tj) {
              mesh.userData.i = ti;
              mesh.userData.j = tj;
              const key = labKey(ti, tj, labsRef.current.length);
              if (mesh.userData.labKey !== key) {
                mesh.userData.labKey = key;
                const u = (mesh.material as THREE.ShaderMaterial).uniforms;
                u.map.value      = textures[key];
                u.aspect.value   = aspects[key];
                u.hasImage.value = hasImg[key];
              }
            }

            const wx = ti * STRIDE;
            const wy = tj * STRIDE;
            const depthDist  = Math.hypot(wx - camX, wy - camY);
            const depthZ     = MIN_Z + (MAX_Z - MIN_Z) *
              Math.exp(-(depthDist * depthDist) / (DEPTH_R * DEPTH_R));
            const depthFactor = Math.max(0, Math.min(1, (MAX_Z - depthZ) / (MAX_Z - MIN_Z)));
            const visibility  = 1.0;

            mesh.position.set(wx, wy, depthZ);
            const u = (mesh.material as THREE.ShaderMaterial).uniforms;
            u.squishAmt.value   = squishAmount;
            u.depthFactor.value = depthFactor;
            u.visibility.value  = visibility;
          }
        }

        renderer.render(scene, camera);
      };
      animate();

      doCleanup = () => {
        el.removeEventListener('pointerdown',   onDown);
        el.removeEventListener('pointermove',   onMove);
        el.removeEventListener('pointerup',     onUp);
        el.removeEventListener('pointercancel', onUp);
        el.removeEventListener('wheel', onWheel);
        window.removeEventListener('resize', onResize);
        if (wheelTimer) clearTimeout(wheelTimer);
        cancelAnimationFrame(animId);
        scene.clear();
        cardGeo.dispose();
        textures.forEach(t => { if (t !== fallbackTex) t.dispose(); });
        fallbackTex.dispose();
        renderer.dispose();
        videoEls.forEach(v => { if (v) { v.pause(); v.src = ''; } });
        if (mountRef.current?.contains(renderer.domElement))
          mountRef.current.removeChild(renderer.domElement);
      };
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      doCleanup?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div
          ref={mountRef}
          style={{
            width: '100vw',
            height: '100vh',
            background: BG_CSS,
            cursor: snapped && !isMobile ? 'pointer' : 'grab',
            userSelect: 'none',
          }}
        />
      </m.div>

      {/* Snap label */}
      <AnimatePresence mode="wait">
        {snapped && (
          <m.div
            key={snapped.slug}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 7 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={!isMobile ? handleExpand : undefined}
            style={{
              position: 'fixed',
              left: '50%',
              top: `calc(50% + ${halfCardVh}vh + 16px)`,
              x: '-50%',
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: isMobile ? 'default' : 'pointer',
            }}
          >
            <span style={{
              fontFamily: "'Canela', serif",
              fontSize: 22,
              fontStyle: 'italic',
              fontWeight: 300,
              color: '#1A1714',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              marginBottom: 7,
            }}>
              {snapped.title}
            </span>
            <div style={{ width: '100%', height: '0.5px', background: '#C8C0B2', marginBottom: 7 }} />
            <span style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 7.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#6B6359',
              whiteSpace: 'nowrap',
            }}>
              {isMobile
                ? 'View on desktop to explore'
                : `${snapped.number}  ·  ${snapped.date}`}
            </span>
          </m.div>
        )}
      </AnimatePresence>

      {/* Corner hint */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 24,
        fontFamily: "'MDUIXS', sans-serif",
        fontSize: 9,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#787470',
        lineHeight: 1.7,
        textAlign: 'right',
        pointerEvents: 'none',
      }}>
        Lab<br /><span style={{ opacity: 0.5 }}>Drag · Scroll</span>
      </div>
    </>
  );
}
