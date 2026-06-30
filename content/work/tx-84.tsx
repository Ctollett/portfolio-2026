import React from 'react'
import type { Section } from '@/components/WorkTOC'
import { VideoWithSound } from '@/components/VideoWithSound'
import { OperatorPanelGrid } from '@/components/OperatorPanelGrid'
import { GlobalPanelGrid } from '@/components/GlobalPanelGrid'

export const sections: Section[] = [
  { id: 'overview',              label: 'Overview' },
  { id: 'the-canvas',            label: 'The Canvas' },
  { id: 'reading-your-drawing',  label: 'Reading Your Drawing' },
  { id: 'distance-as-depth',     label: 'Distance as Depth' },
  { id: 'the-operator-panel',    label: 'The Operator Panel' },
  { id: 'the-global-panel',      label: 'The Global Panel' },
  { id: 'the-engine',            label: 'The Engine' },
  { id: 'aesthetic-direction',   label: 'Aesthetic Direction' },
]

const prose: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 14,
  lineHeight: 1.85,
  color: '#555559',
  margin: '0 0 20px',
  textWrap: 'pretty',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 8,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#888884',
  margin: '0 0 16px',
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 20,
  letterSpacing: '0.04em',
  color: '#1A1A18',
  margin: '0 0 24px',
  lineHeight: 1.3,
}

const divider: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid rgba(26,26,24,0.08)',
  margin: '0 0 64px',
}

// ── Diagram components ───────────────────────────────────────────────────────

const OP_COLORS: string[] = ['#2B5FD9', '#D94F2B', '#3B9E8E', '#E8C840']
const OP_LABELS: string[] = ['C', 'A', 'B1', 'B2']

const ALGO_EDGES: [number, number][][] = [
  [[1,0],[3,2],[2,0]],
  [[1,0],[3,2]],
  [[1,0],[1,3],[1,2]],
  [[3,2],[2,1],[1,0]],
  [[2,3],[2,1],[3,1],[1,0]],
  [[1,0],[1,2],[3,0],[3,2]],
  [[1,0],[3,2]],
  [[1,0]],
]

function getPos(W: number, H: number, R: number): { x: number; y: number }[] {
  const p = R + Math.round(W * 0.08)
  return [
    { x: W / 2,  y: H - p },
    { x: W / 2,  y: p },
    { x: p,       y: H / 2 },
    { x: W - p,  y: H / 2 },
  ]
}

function Arrow({
  src, dst, positions, R, opacity = 1,
}: {
  src: number
  dst: number
  positions: { x: number; y: number }[]
  R: number
  opacity?: number
}) {
  const s = positions[src], d = positions[dst]
  const dx = d.x - s.x, dy = d.y - s.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 1) return null
  const nx = dx / dist, ny = dy / dist
  const px = -ny, py = nx
  const A = R * 0.45
  const x1 = s.x + nx * (R + 1)
  const y1 = s.y + ny * (R + 1)
  const tipX = d.x - nx * R
  const tipY = d.y - ny * R
  const x2 = tipX - nx * A
  const y2 = tipY - ny * A
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={OP_COLORS[src]} strokeWidth={Math.max(1, R * 0.11)} />
      <polygon
        points={`${tipX},${tipY} ${x2 + px * A * 0.5},${y2 + py * A * 0.5} ${x2 - px * A * 0.5},${y2 - py * A * 0.5}`}
        fill={OP_COLORS[src]}
      />
    </g>
  )
}

function AlgoCanvas({
  VW, VH, R, active, dim = [], showLabels = true,
}: {
  VW: number
  VH: number
  R: number
  active: [number, number][]
  dim?: [number, number][]
  showLabels?: boolean
}) {
  const pos = getPos(VW, VH, R)
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      style={{ width: '100%', display: 'block', background: '#1C1A18' }}
    >
      {dim.map(([s, d], i) => (
        <Arrow key={`d${i}`} src={s} dst={d} positions={pos} R={R} opacity={0.18} />
      ))}
      {active.map(([s, d], i) => (
        <Arrow key={`a${i}`} src={s} dst={d} positions={pos} R={R} />
      ))}
      {pos.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={R} fill="none"
            stroke={OP_COLORS[i]} strokeWidth={Math.max(1, R * 0.11)} />
          {showLabels && (
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              fill={OP_COLORS[i]} fontSize={R * 0.65} fontFamily="monospace" letterSpacing="0.08em">
              {OP_LABELS[i]}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

function EdgeLabel({ src, dst, dim = false }: { src: number; dst: number; dim?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      opacity: dim ? 0.28 : 1,
    }}>
      <span style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 13, letterSpacing: '0.1em', color: OP_COLORS[src] }}>
        {OP_LABELS[src]}
      </span>
      <span style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 11, color: 'rgba(26,26,24,0.22)' }}>→</span>
      <span style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 13, letterSpacing: '0.1em', color: OP_COLORS[dst] }}>
        {OP_LABELS[dst]}
      </span>
    </span>
  )
}

function JaccardBreakdown() {
  const rowLabel: React.CSSProperties = {
    fontFamily: "'MDUIXS', sans-serif",
    fontSize: 8,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: '#AEABA4',
    margin: 0,
    whiteSpace: 'nowrap' as const,
  }

  const colLabel: React.CSSProperties = {
    fontFamily: "'MDUIXS', sans-serif",
    fontSize: 8,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: '#AEABA4',
    margin: '0 0 10px',
  }

  const colBody: React.CSSProperties = {
    fontFamily: "'MDUIXS', sans-serif",
    fontSize: 12,
    lineHeight: 1.75,
    color: '#555559',
    margin: 0,
  }

  const columns = [
    {
      label: '01 — Match',
      body: 'Your connections become a set of directed edges, scored against 8 algorithm definitions using Jaccard similarity — shared edges divided by total unique.',
    },
    {
      label: '02 — Route',
      body: 'The highest-scoring algorithm routes the engine in real time. If no exact match exists, the closest one wins and synthesis continues uninterrupted.',
    },
  ]

  return (
    <>
      {/* Score card */}
      <div style={{
        border: '1px solid rgba(26,26,24,0.1)',
        borderRadius: 8,
        padding: '22px 28px',
        margin: '0 0 16px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 0,
        alignItems: 'center',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          rowGap: 16,
          columnGap: 24,
          alignItems: 'center',
          paddingRight: 36,
        }}>
          <span style={rowLabel}>Your edges</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <EdgeLabel src={1} dst={0} />
            <EdgeLabel src={2} dst={0} />
          </div>
          <span style={rowLabel}>Algorithm 1</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <EdgeLabel src={1} dst={0} />
            <EdgeLabel src={2} dst={0} />
            <EdgeLabel src={3} dst={2} dim />
          </div>
        </div>

        <div style={{
          borderLeft: '1px solid rgba(26,26,24,0.1)',
          paddingLeft: 36,
          textAlign: 'right' as const,
        }}>
          <p style={{
            fontFamily: "'MDUIXS', sans-serif",
            fontSize: 30,
            letterSpacing: '0.02em',
            color: '#1A1A18',
            margin: '0 0 6px',
            lineHeight: 1,
          }}>
            0.67
          </p>
          <p style={{
            fontFamily: "'MDUIXS', sans-serif",
            fontSize: 8,
            letterSpacing: '0.14em',
            textTransform: 'uppercase' as const,
            color: '#AEABA4',
            margin: 0,
          }}>
            2 of 3 shared
          </p>
        </div>
      </div>

      {/* 4-column breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 0,
        margin: '0 0 32px',
      }}>
        {columns.map((col, i) => (
          <div key={i} style={{
            borderTop: '1px solid rgba(26,26,24,0.1)',
            paddingTop: 16,
            paddingRight: i < 3 ? 24 : 0,
            paddingLeft: i > 0 ? 24 : 0,
            borderLeft: i > 0 ? '1px solid rgba(26,26,24,0.1)' : 'none',
          }}>
            <p style={colLabel}>{col.label}</p>
            <p style={colBody}>{col.body}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function AlgorithmMatchDiagram() {
  const VW = 220, VH = 172, R = 14
  const mVW = 80, mVH = 62, mR = 10

  const diagramLabel: React.CSSProperties = {
    fontFamily: "'MDUIXS', sans-serif",
    fontSize: 8,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#888884',
    margin: '10px 0 0',
    textAlign: 'center',
  }

  const subLabel: React.CSSProperties = {
    fontFamily: "'MDUIXS', sans-serif",
    fontSize: 7,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#B8B5AE',
    margin: '3px 0 0',
    textAlign: 'center',
  }

  return (
    <div style={{
      background: '#E8E3D9',
      borderRadius: 12,
      padding: '28px 24px 20px',
      margin: '28px 0 32px',
    }}>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 12,
        alignItems: 'center',
        marginBottom: 20,
      }}>

        <div>
          <div style={{ borderRadius: 8, overflow: 'hidden' }}>
            <AlgoCanvas VW={VW} VH={VH} R={R} active={[[1,0],[2,0]]} />
          </div>
          <p style={diagramLabel}>Your drawing</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <svg width={28} height={10} viewBox="0 0 28 10" style={{ display: 'block' }}>
            <line x1={0} y1={5} x2={20} y2={5} stroke="#B0ADA6" strokeWidth={1} />
            <polygon points="20,2 27,5 20,8" fill="#B0ADA6" />
          </svg>
          <span style={{
            fontFamily: "'MDUIXS', sans-serif",
            fontSize: 7,
            color: '#B0ADA6',
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            whiteSpace: 'nowrap' as const,
          }}>
            matches to
          </span>
        </div>

        <div>
          <div style={{ borderRadius: 8, overflow: 'hidden' }}>
            <AlgoCanvas VW={VW} VH={VH} R={R} active={[[1,0],[2,0]]} dim={[[3,2]]} />
          </div>
          <p style={diagramLabel}>Algorithm 1</p>
          <p style={subLabel}>Jaccard score: 0.67</p>
        </div>

      </div>

      <div style={{
        borderTop: '1px solid rgba(26,26,24,0.08)',
        paddingTop: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: 6,
      }}>
        {ALGO_EDGES.map((edges, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: '100%',
              borderRadius: 6,
              overflow: 'hidden',
              border: i === 0 ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
              opacity: i === 0 ? 1 : 0.38,
            }}>
              <AlgoCanvas VW={mVW} VH={mVH} R={mR} active={edges} showLabels={false} />
            </div>
            <span style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 7,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: i === 0 ? '#888884' : '#555553',
            }}>
              A{i + 1}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}

function FormulaCallout() {
  const vars: [string, string][] = [
    ['depth', 'MIDI modulation depth sent to the engine, ranging 0–127'],
    ['dist',  'Distance between the two operators in canvas pixels'],
    ['350',   'Natural spring length — the same constant that governs the physics system'],
  ]

  return (
    <div style={{
      border: '1px solid rgba(26,26,24,0.1)',
      borderRadius: 8,
      padding: '32px 32px 28px',
      margin: '24px 0 0',
    }}>
      <p style={{
        fontFamily: "'MDUIXS', sans-serif",
        fontSize: 18,
        letterSpacing: '0.01em',
        color: '#1A1A18',
        margin: '0 0 28px',
        lineHeight: 1,
      }}>
        depth = 127 · e
        <sup style={{
          fontSize: 10,
          letterSpacing: '0.02em',
          verticalAlign: 'super',
          lineHeight: 0,
        }}>
          (−dist / 350)
        </sup>
      </p>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(26,26,24,0.08)', margin: '0 0 22px' }} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        rowGap: 12,
        columnGap: 28,
        alignItems: 'baseline',
      }}>
        {vars.map(([variable, desc], i) => (
          <React.Fragment key={i}>
            <span style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 11,
              letterSpacing: '0.1em',
              color: '#1A1A18',
            }}>
              {variable}
            </span>
            <span style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 11,
              lineHeight: 1.65,
              letterSpacing: '0.03em',
              color: '#888884',
            }}>
              {desc}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ── Main content ──────────────────────────────────────────────────────────────

export default function TX84Content() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>

      <section id="overview">
        <hr style={divider} />
        <p style={sectionLabel}>Overview</p>
        <h2 style={sectionTitle}>FM synthesis, made spatial.</h2>
        <p style={prose}>
          The TX-84 is a polyphonic FM synthesizer that runs entirely in the browser. FM synthesis is notoriously difficult to control intuitively and has a long history of sparking confusion and inaccessibility for both beginners and experienced musicians. In a typical FM interface, operators, ratios, and modulation depths are buried in a matrix of numbers that offer very little physical connection to the sound. The TX-84 explores what happens when FM synthesis becomes something you can see, touch, and play.
        </p>
      </section>

      <section id="the-canvas">
        <hr style={divider} />
        <p style={sectionLabel}>The Canvas</p>
        <h2 style={sectionTitle}>A routing system you draw by hand.</h2>
        <p style={prose}>
          The canvas is the core of TX-84. Four operator nodes sit in a default diamond arrangement on a 1200 by 720 pixel field. Each node has two interaction zones: drag from the center to reposition it, drag from the outer dashed ring to draw a connection to another operator. That connection establishes a modulator-carrier relationship. The routing structure of your patch is literally the shape you draw.
        </p>
        <img
          src="/images/work/tx-84/canvas.png"
          alt="TX-84 canvas showing four operator nodes in default diamond layout"
          style={{ width: '100%', borderRadius: 8, margin: '8px 0 20px' }}
        />
        <p style={prose}>
          The canvas is built as a rendering hybrid. Operator nodes are DOM elements, connection lines live in a persistent SVG layer above them, and performance-critical updates (drag position, ring deformation, waveform animation) bypass React entirely. These run in dedicated requestAnimationFrame loops that write directly to DOM attributes and styles through refs, keeping the reconciler out of anything time-sensitive. The spring physics that pulls connected operators when you drag one works the same way: force accumulates based on distance from a natural resting length, velocity is damped each frame, and the loop cancels itself as soon as all motion falls below a threshold.
        </p>
        <video
          src="/images/work/tx-84/canvas-connection.mov"
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', borderRadius: 8, margin: '8px 0 0', display: 'block' }}
        />
      </section>

      <section id="reading-your-drawing">
        <hr style={divider} />
        <p style={sectionLabel}>Reading Your Drawing</p>
        <h2 style={sectionTitle}>The system meets you where you are.</h2>
        <p style={prose}>
          Most FM synthesizers ask you to choose a routing algorithm from a numbered list. The TX-84 does the opposite. You draw connections freely, and the system determines which FM algorithm your drawing most closely resembles, then routes the synthesis engine accordingly. You never select an algorithm directly.
        </p>
        <AlgorithmMatchDiagram />
        <JaccardBreakdown />
        <p style={prose}>
          The matching runs on every connection change. Your drawn connections are treated as a set of directed edges, and that set is compared against the edge sets of 8 predefined FM algorithm definitions using Jaccard similarity, a measure of how much two sets overlap relative to their union. The algorithm with the highest score wins. If your drawing does not perfectly match any known topology, the closest one is still selected and synthesis continues. You are never blocked by an invalid state.
        </p>
        <p style={{ ...prose, color: '#1A1A18', fontWeight: 600 }}>
          The practical effect is that the algorithm layer becomes invisible. Routing structures emerge from gesture rather than selection.
        </p>
      </section>

      <section id="distance-as-depth">
        <hr style={divider} />
        <p style={sectionLabel}>Distance as Depth</p>
        <h2 style={sectionTitle}>Proximity is the control.</h2>
        <p style={prose}>
          Every connection on the canvas has a depth, measuring how strongly one operator modulates another. That depth is not set with a knob or a number. It is determined by the physical distance between the two connected operators on the canvas. Pull them closer and the modulation deepens. Push them apart and it fades. The space itself becomes the parameter.
        </p>
        <VideoWithSound
          src="/images/work/tx-84/spacial-example.mp4"
          style={{ margin: '8px 0 0' }}
        />
        <FormulaCallout />
        <p style={{ ...prose, margin: '20px 0 0' }}>
          The mapping uses exponential decay rather than linear scaling by design. At close range, small movements produce large changes in depth, giving you precise, responsive control where it matters most. As distance increases the curve flattens, so operators spread far apart fade gradually rather than dropping off sharply. The constant 350 is the natural resting length of the spring physics system, which means the point where modulation begins to feel distant is the same point where the canvas itself starts to pull back.
        </p>
      </section>

      <section id="the-operator-panel">
        <hr style={divider} />
        <p style={sectionLabel}>The Operator Panel</p>
        <h2 style={sectionTitle}>Sound design at the node level.</h2>
        <p style={prose}>
          Clicking any operator on the canvas opens its detail panel. Each operator has its own independent controls for waveform, tuning, and modulation behavior, set separately from the routing structure drawn on the canvas.
        </p>
        <video
          src="/images/work/tx-84/operator-controls.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', borderRadius: 8, margin: '8px 0 0', display: 'block' }}
        />
        <OperatorPanelGrid />
      </section>

      <section id="the-global-panel">
        <hr style={divider} />
        <p style={sectionLabel}>The Global Panel</p>
        <h2 style={sectionTitle}>Envelope, filter, and modulation.</h2>
        <p style={prose}>
          The global panel runs below the canvas and shapes the patch as a whole. Where the operator controls are per-voice, these apply to the full output: amplitude envelope, filter, effects chain, and two routable LFOs.
        </p>
        <video
          src="/images/work/tx-84/global-effects.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', borderRadius: 8, margin: '8px 0 0', display: 'block' }}
        />
        <GlobalPanelGrid />
      </section>

      <section id="the-engine">
        <hr style={divider} />
        <p style={sectionLabel}>The Engine</p>
        <h2 style={sectionTitle}>Built to run in real time.</h2>
        <p style={prose}>
          {/* YOUR TEXT — short paragraph, link to WASM DSP Engine case study */}
        </p>
      </section>

      <section id="aesthetic-direction">
        <hr style={divider} />
        <p style={sectionLabel}>Aesthetic Direction</p>
        <h2 style={sectionTitle}>Instrument, not plugin.</h2>
        <p style={prose}>
          {/* YOUR TEXT */}
        </p>
      </section>

    </div>
  )
}
