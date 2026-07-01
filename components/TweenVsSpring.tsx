'use client'

import { useRef, useEffect, useState } from 'react'

type Point = [number, number]

// Real Lucide play/pause paths, scaled from 24x24 viewBox → 100x100 grid
// (multiply every coordinate/radius by 100/24 ≈ 4.167)
const PLAY_D = 'M20.833 20.833 a8.333 8.333 0 0 1 12.533 -7.2 l49.988 29.158 a8.333 8.333 0 0 1 0.0125 14.408 l-50 29.167 A8.333 8.333 0 0 1 20.833 79.167 Z'

// Lucide pause: rect x=14,y=3,w=5,h=18,rx=1 and x=5,y=3,w=5,h=18,rx=1 — scaled
const RX = 4.167
const PAUSE_R = { x: 58.333, y: 12.5, w: 20.833, h: 75 } // right bar
const PAUSE_L = { x: 20.833, y: 12.5, w: 20.833, h: 75 } // left bar

function roundedRectD(x: number, y: number, w: number, h: number, r: number): string {
  return `M ${x+r} ${y} L ${x+w-r} ${y} A ${r} ${r} 0 0 1 ${x+w} ${y+r} L ${x+w} ${y+h-r} A ${r} ${r} 0 0 1 ${x+w-r} ${y+h} L ${x+r} ${y+h} A ${r} ${r} 0 0 1 ${x} ${y+h-r} L ${x} ${y+r} A ${r} ${r} 0 0 1 ${x+r} ${y} Z`
}

const SA = 'fill="#1A1A18"'

// Fed directly into ruun — rect tags are natively parsed, arcs converted to
// cubic Béziers internally, 1-path → 2-path topology handled via spring morph
const PLAY_SVG  = `<svg viewBox="0 0 100 100"><path d="${PLAY_D}" ${SA}/></svg>`
const PAUSE_SVG = `<svg viewBox="0 0 100 100"><rect x="${PAUSE_R.x}" y="${PAUSE_R.y}" width="${PAUSE_R.w}" height="${PAUSE_R.h}" rx="${RX}" ${SA}/><rect x="${PAUSE_L.x}" y="${PAUSE_L.y}" width="${PAUSE_L.w}" height="${PAUSE_L.h}" rx="${RX}" ${SA}/></svg>`

// Sample N evenly-spaced points along a path's arc length using the
// browser's native geometry API. Both bars start as the full play triangle
// (two identical overlapping filled shapes) and morph independently to their
// own pause rect — at the play state they read as one solid filled icon.
const N = 32

function samplePath(d: string): Point[] {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  el.setAttribute('d', d)
  const len = el.getTotalLength()
  const pts: Point[] = []
  for (let i = 0; i < N; i++) {
    const p = el.getPointAtLength((i / N) * len)
    pts.push([p.x, p.y])
  }
  return pts
}

function loopToPath(pts: Point[]): string {
  const [f, ...rest] = pts
  return `M ${f![0]} ${f![1]} ` + rest.map(([x, y]) => `L ${x} ${y}`).join(' ') + ' Z'
}

function lerp(a: Point[], b: Point[], t: number): Point[] {
  return a.map(([ax, ay], i) => {
    const [bx, by] = b[i]!
    return [ax + (bx - ax) * t, ay + (by - ay) * t]
  })
}

function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const TWEEN_DURATION = 600
const PAUSE_MS = 500
const GRID_STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90]

function Grid() {
  return (
    <g stroke="rgba(26,26,24,0.08)" strokeWidth="0.5">
      {GRID_STEPS.map(v => <line key={`v${v}`} x1={v} y1={0} x2={v} y2={100} />)}
      {GRID_STEPS.map(v => <line key={`h${v}`} x1={0} y1={v} x2={100} y2={v} />)}
    </g>
  )
}

type Icons = { play: Point[]; pauseR: Point[]; pauseL: Point[] }

export function TweenVsSpring() {
  const bar1Ref       = useRef<SVGPathElement>(null)
  const bar2Ref       = useRef<SVGPathElement>(null)
  const springSvgRef  = useRef<SVGSVGElement>(null)
  const springInitRef = useRef(false)
  const iconsRef      = useRef<Icons | null>(null)
  const tweenStateRef  = useRef<'play' | 'pause'>('play')
  const springStateRef = useRef<'play' | 'pause'>('play')
  const rafRef     = useRef<number | null>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playingRef = useRef(false)
  const stepRef    = useRef(0)

  const [activeSide, setActiveSide] = useState<'tween' | 'spring' | null>(null)

  useEffect(() => {
    const icons: Icons = {
      play:   samplePath(PLAY_D),
      pauseR: samplePath(roundedRectD(PAUSE_R.x, PAUSE_R.y, PAUSE_R.w, PAUSE_R.h, RX)),
      pauseL: samplePath(roundedRectD(PAUSE_L.x, PAUSE_L.y, PAUSE_L.w, PAUSE_L.h, RX)),
    }
    iconsRef.current = icons
    bar1Ref.current?.setAttribute('d', loopToPath(icons.play))
    bar2Ref.current?.setAttribute('d', loopToPath(icons.play))

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
    const icons = iconsRef.current
    const b1 = bar1Ref.current
    const b2 = bar2Ref.current
    if (!icons || !b1 || !b2) { onDone(); return }
    const toPause = tweenStateRef.current === 'play'
    tweenStateRef.current = toPause ? 'pause' : 'play'
    const b1From = toPause ? icons.play : icons.pauseR
    const b1To   = toPause ? icons.pauseR : icons.play
    const b2From = toPause ? icons.play : icons.pauseL
    const b2To   = toPause ? icons.pauseL : icons.play
    const start = performance.now()
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / TWEEN_DURATION)
      const e = ease(t)
      b1.setAttribute('d', loopToPath(lerp(b1From, b1To, e)))
      b2.setAttribute('d', loopToPath(lerp(b2From, b2To, e)))
      if (t < 1) rafRef.current = requestAnimationFrame(frame)
      else onDone()
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
      timerRef.current = setTimeout(runStep, PAUSE_MS)
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

  const box: React.CSSProperties = {
    background: '#F4F2ED',
    borderRadius: 8,
    width: 140,
    height: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const pathAttrs = { fill: '#1A1A18' }

  return (
    <div style={{
      background: 'rgba(26,26,24,0.05)',
      borderRadius: 10,
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
    }}>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={labelStyle('tween')}>Tween (ease, 600ms)</p>
          <div style={box}>
            <svg viewBox="0 0 100 100" width="120" height="120">
              <Grid />
              <path ref={bar1Ref} {...pathAttrs} />
              <path ref={bar2Ref} {...pathAttrs} />
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={labelStyle('spring')}>Spring (ruun)</p>
          <div style={box}>
            <svg ref={springSvgRef} viewBox="0 0 100 100" width="120" height="120">
              <Grid />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
