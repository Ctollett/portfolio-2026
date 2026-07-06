'use client'

import { useRef, useEffect, useState } from 'react'

type Point = [number, number]

// Actual Lucide play path (24×24 → 100×100, ×4.1667)
const PLAY_PATH_D =
  'M20.833 20.833 a8.333 8.333 0 0 1 12.533 -7.2 l49.988 29.158 a8.333 8.333 0 0 1 0.0125 14.408 l-50 29.167 A8.333 8.333 0 0 1 20.833 79.167 Z'

// Lucide pause bars expressed as full path strings (rect + rx=4.167, scaled to 100-space)
const PAUSE_R_PATH_D =
  'M62.5 12.5 L75 12.5 A4.167 4.167 0 0 1 79.167 16.667 L79.167 83.333 A4.167 4.167 0 0 1 75 87.5 L62.5 87.5 A4.167 4.167 0 0 1 58.333 83.333 L58.333 16.667 A4.167 4.167 0 0 1 62.5 12.5 Z'
const PAUSE_L_PATH_D =
  'M25 12.5 L37.5 12.5 A4.167 4.167 0 0 1 41.667 16.667 L41.667 83.333 A4.167 4.167 0 0 1 37.5 87.5 L25 87.5 A4.167 4.167 0 0 1 20.833 83.333 L20.833 16.667 A4.167 4.167 0 0 1 25 12.5 Z'

const N_PTS = 64

// Sample N evenly-spaced points from an SVG path string via getPointAtLength.
// Appends a hidden SVG to the DOM so the browser can do the geometry.
function samplePath(d: string, n: number): Point[] {
  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg') as SVGSVGElement
  const path = document.createElementNS(ns, 'path') as SVGPathElement
  svg.style.cssText = 'position:fixed;opacity:0;pointer-events:none;top:0;left:0;width:100px;height:100px'
  svg.setAttribute('viewBox', '0 0 100 100')
  path.setAttribute('d', d)
  svg.appendChild(path)
  document.body.appendChild(svg)
  const len = path.getTotalLength()
  const pts = Array.from({ length: n }, (_, i): Point => {
    const p = path.getPointAtLength((i / n) * len)
    return [p.x, p.y]
  })
  document.body.removeChild(svg)
  return pts
}

function polyToPath(pts: Point[]): string {
  const [f, ...rest] = pts
  return `M ${f![0]} ${f![1]} ` + rest.map(([x, y]) => `L ${x} ${y}`).join(' ') + ' Z'
}

function lerpPts(a: Point[], b: Point[], t: number): Point[] {
  return a.map(([ax, ay], i) => [ax + (b[i]![0] - ax) * t, ay + (b[i]![1] - ay) * t])
}

function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Same Lucide markup fed to ruun for the spring side
const PLAY_SVG  = `<svg viewBox="0 0 100 100"><path d="${PLAY_PATH_D}" fill="#1A1A18"/></svg>`
const PAUSE_SVG = '<svg viewBox="0 0 100 100"><rect x="58.333" y="12.5" width="20.833" height="75" rx="4.167" fill="#1A1A18"/><rect x="20.833" y="12.5" width="20.833" height="75" rx="4.167" fill="#1A1A18"/></svg>'

const TWEEN_MS = 600
const GAP_MS   = 500
const SVG_SIZE = 110

export function TweenVsSpring() {
  const bar1Ref        = useRef<SVGPathElement>(null)
  const bar2Ref        = useRef<SVGPathElement>(null)
  const springSvgRef   = useRef<SVGSVGElement>(null)
  const springInitRef  = useRef(false)
  const tweenStateRef  = useRef<'play' | 'pause'>('play')
  const springStateRef = useRef<'play' | 'pause'>('play')
  const rafRef         = useRef<number | null>(null)
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playingRef     = useRef(false)
  const stepRef        = useRef(0)

  const playPtsRef  = useRef<Point[] | null>(null)
  const pauseRRef   = useRef<Point[] | null>(null)
  const pauseLRef   = useRef<Point[] | null>(null)

  const [activeSide, setActiveSide] = useState<'tween' | 'spring' | null>(null)

  useEffect(() => {
    // Sample the actual Lucide paths into interpolatable point arrays
    playPtsRef.current = samplePath(PLAY_PATH_D, N_PTS)
    pauseRRef.current  = samplePath(PAUSE_R_PATH_D, N_PTS)
    pauseLRef.current  = samplePath(PAUSE_L_PATH_D, N_PTS)

    bar1Ref.current?.setAttribute('d', polyToPath(playPtsRef.current))
    bar2Ref.current?.setAttribute('d', '')  // hidden until morph starts

    import('getruun').then(({ initMorphSvg }) => {
      if (springSvgRef.current && !springInitRef.current) {
        initMorphSvg(springSvgRef.current, PLAY_SVG)
        springInitRef.current = true
      }
      playingRef.current = true
      runStep()
    })
    return () => {
      playingRef.current = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const runTween = (onDone: () => void) => {
    const b1 = bar1Ref.current
    const b2 = bar2Ref.current
    const play   = playPtsRef.current
    const pauseR = pauseRRef.current
    const pauseL = pauseLRef.current
    if (!b1 || !b2 || !play || !pauseR || !pauseL) { onDone(); return }
    const toPause = tweenStateRef.current === 'play'
    tweenStateRef.current = toPause ? 'pause' : 'play'
    const b1From = toPause ? play   : pauseR
    const b1To   = toPause ? pauseR : play
    const b2From = toPause ? play   : pauseL
    const b2To   = toPause ? pauseL : play
    // Activate bar2 at the start of every morph
    b2.setAttribute('d', polyToPath(b2From))
    const start = performance.now()
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / TWEEN_MS)
      const e = ease(t)
      b1.setAttribute('d', polyToPath(lerpPts(b1From, b1To, e)))
      b2.setAttribute('d', polyToPath(lerpPts(b2From, b2To, e)))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        // Back at play state: hide bar2 so only one path renders the icon
        if (!toPause) b2.setAttribute('d', '')
        onDone()
      }
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  const runSpring = (onDone: () => void) => {
    if (!springSvgRef.current || !springInitRef.current) { onDone(); return }
    const toPause = springStateRef.current === 'play'
    springStateRef.current = toPause ? 'pause' : 'play'
    import('getruun').then(({ morphSvg }) => {
      if (!springSvgRef.current) { onDone(); return }
      morphSvg(springSvgRef.current, toPause ? PAUSE_SVG : PLAY_SVG, { stiffness: 160, damping: 14, mass: 1 }, onDone)
    })
  }

  const runStep = () => {
    if (!playingRef.current) return
    const isTween = stepRef.current % 2 === 0
    setActiveSide(isTween ? 'tween' : 'spring')
    const advance = () => {
      stepRef.current += 1
      if (!playingRef.current) return
      timerRef.current = setTimeout(runStep, GAP_MS)
    }
    if (isTween) runTween(advance)
    else runSpring(advance)
  }

  const labelStyle = (side: 'tween' | 'spring'): React.CSSProperties => ({
    fontFamily: "'MDUIXS', sans-serif",
    fontSize: 9,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: activeSide === side ? '#1A1A18' : '#888884',
    margin: 0,
    transition: 'color 0.15s ease',
  })

  return (
    <div style={{
      borderRadius: 10,
      padding: '36px clamp(16px, 5vw, 32px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
      backgroundColor: '#F4F2ED',
      backgroundImage: [
        'linear-gradient(rgba(26,26,24,0.12) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(26,26,24,0.12) 1px, transparent 1px)',
      ].join(', '),
      backgroundSize: '22px 22px',
    }}>
      <div style={{ display: 'flex', gap: 'clamp(20px, 6vw, 48px)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={labelStyle('tween')}>Tween (ease, 600ms)</p>
          <svg viewBox="0 0 100 100" width={SVG_SIZE} height={SVG_SIZE}>
            <path ref={bar1Ref} fill="#1A1A18" />
            <path ref={bar2Ref} fill="#1A1A18" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={labelStyle('spring')}>Spring (ruun)</p>
          <svg ref={springSvgRef} viewBox="0 0 100 100" width={SVG_SIZE} height={SVG_SIZE} />
        </div>
      </div>
    </div>
  )
}
