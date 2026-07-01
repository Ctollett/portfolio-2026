const W = 480
const H = 108
const BAR_Y = 40
const BAR_H = 20
const PAD_X = 20
const PW = W - PAD_X * 2

const ZONES = [
  { label: 'Immediate',   range: '< 10ms',    fill: '#1A1A18',              flex: 2 },
  { label: 'Perceptible', range: '10 – 30ms',  fill: 'rgba(26,26,24,0.35)', flex: 3 },
  { label: 'Disruptive',  range: '> 30ms',     fill: 'rgba(26,26,24,0.12)', flex: 5 },
]

const totalFlex = ZONES.reduce((s, z) => s + z.flex, 0)

export function LatencyScale() {
  let cx = PAD_X
  const segs = ZONES.map(z => {
    const w = (z.flex / totalFlex) * PW
    const seg = { ...z, x: cx, w }
    cx += w
    return seg
  })

  // ~2.9ms is 29% into the first zone (which represents 0–10ms)
  const markerX = PAD_X + (2.9 / 10) * segs[0].w

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '0 0 20px' }}>
      <div style={{ background: 'rgba(26,26,24,0.04)', borderRadius: 10, padding: '20px 20px 16px' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          <defs>
            <clipPath id="latency-bar-clip">
              <rect x={PAD_X} y={BAR_Y} width={PW} height={BAR_H} rx={3} />
            </clipPath>
          </defs>

          {/* Zone labels above bar */}
          {segs.map(seg => (
            <text key={seg.label}
              x={seg.x + seg.w / 2} y={BAR_Y - 12}
              textAnchor="middle"
              fontSize="9"
              fontFamily="'MDUIXS', sans-serif"
              letterSpacing="0.14em"
              fill="#888884"
            >
              {seg.label.toUpperCase()}
            </text>
          ))}

          {/* Zone bars */}
          <g clipPath="url(#latency-bar-clip)">
            {segs.map(seg => (
              <rect key={seg.label}
                x={seg.x} y={BAR_Y} width={seg.w} height={BAR_H}
                fill={seg.fill}
              />
            ))}
          </g>

          {/* Zone dividers */}
          {segs.slice(1).map(seg => (
            <line key={seg.label}
              x1={seg.x} y1={BAR_Y} x2={seg.x} y2={BAR_Y + BAR_H}
              stroke="rgba(255,255,255,0.15)" strokeWidth="1"
            />
          ))}

          {/* Engine marker */}
          <line
            x1={markerX} y1={BAR_Y}
            x2={markerX} y2={BAR_Y + BAR_H}
            stroke="rgba(255,255,255,0.75)" strokeWidth="1.5"
          />

          {/* Range labels below bar */}
          {segs.map(seg => (
            <text key={`r-${seg.label}`}
              x={seg.x + seg.w / 2} y={BAR_Y + BAR_H + 16}
              textAnchor="middle"
              fontSize="10"
              fontFamily="'MDUIXS', sans-serif"
              fill="#888884"
            >
              {seg.range}
            </text>
          ))}

          {/* Engine label below marker */}
          <text
            x={markerX} y={BAR_Y + BAR_H + 32}
            textAnchor="middle"
            fontSize="9"
            fontFamily="'MDUIXS', sans-serif"
            letterSpacing="0.08em"
            fill="rgba(26,26,24,0.45)"
          >
            ~2.9ms
          </text>
        </svg>
      </div>

      {/* Caption */}
      <span style={{
        fontFamily: "'MDUIXS', sans-serif",
        fontSize: 10,
        color: '#888884',
        letterSpacing: '0.08em',
        paddingLeft: 4,
      }}>
        128 samples at 44.1kHz
      </span>
    </div>
  )
}
