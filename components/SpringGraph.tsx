const W = 480
const H = 180
const PAD = { l: 40, r: 16, t: 20, b: 36 }
const PW = W - PAD.l - PAD.r
const PH = H - PAD.t - PAD.b

const T_MAX = 1400
const P_MIN = -0.25
const P_MAX = 1.4

function tx(t: number) { return PAD.l + (t / T_MAX) * PW }
function py(p: number) { return PAD.t + (1 - (p - P_MIN) / (P_MAX - P_MIN)) * PH }

function buildSpringPath(): string {
  const s = 200, d = 10, m = 1, dt = 1 / 60
  const frames = Math.ceil(T_MAX / 1000 * 60) + 1
  let pos = 0, vel = 0
  const pts = [`M ${tx(0).toFixed(1)} ${py(0).toFixed(1)}`]
  for (let i = 1; i < frames; i++) {
    const force = -s * (pos - 1) - d * vel
    vel += (force / m) * dt
    pos += vel * dt
    const t = Math.min((i / 60) * 1000, T_MAX)
    pts.push(`L ${tx(t).toFixed(1)} ${py(pos).toFixed(1)}`)
  }
  return pts.join(' ')
}

function buildTweenPath(): string {
  const DUR = 600, N = 80
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const u = i / N
    const t = u * DUR
    const p = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2
    pts.push(`${i === 0 ? 'M' : 'L'} ${tx(t).toFixed(1)} ${py(p).toFixed(1)}`)
  }
  pts.push(`L ${tx(T_MAX).toFixed(1)} ${py(1).toFixed(1)}`)
  return pts.join(' ')
}

const SPRING_D = buildSpringPath()
const TWEEN_D  = buildTweenPath()

const GRID_Y = [0, 0.5, 1]
const GRID_X = [400, 800, 1200]

export function SpringGraph() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: 'rgba(26,26,24,0.04)', borderRadius: 10, padding: '20px 20px 4px' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>

          {/* Horizontal grid lines */}
          {GRID_Y.map(p => (
            <line key={p}
              x1={PAD.l} y1={py(p)} x2={W - PAD.r} y2={py(p)}
              stroke="rgba(26,26,24,0.08)" strokeWidth="1"
              strokeDasharray={p === 1 ? '4 3' : undefined}
            />
          ))}

          {/* Vertical grid lines */}
          {GRID_X.map(t => (
            <line key={t}
              x1={tx(t)} y1={PAD.t} x2={tx(t)} y2={H - PAD.b}
              stroke="rgba(26,26,24,0.06)" strokeWidth="1"
            />
          ))}

          {/* Tween curve */}
          <path d={TWEEN_D} fill="none" stroke="#C0BDB7" strokeWidth="1.5" />

          {/* Spring curve */}
          <path d={SPRING_D} fill="none" stroke="#1A1A18" strokeWidth="1.5" />

          {/* Y-axis labels */}
          {GRID_Y.map(p => (
            <text key={p}
              x={PAD.l - 8} y={py(p) + 4}
              textAnchor="end"
              fontSize="10"
              fontFamily="'MDUIXS', sans-serif"
              fill="#888884"
            >
              {p === 0 ? '0' : p === 1 ? '1' : '0.5'}
            </text>
          ))}

          {/* X-axis labels */}
          {[0, ...GRID_X].map(t => (
            <text key={t}
              x={tx(t)} y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fontFamily="'MDUIXS', sans-serif"
              fill="#888884"
            >
              {t === 0 ? '0' : `${t}ms`}
            </text>
          ))}

        </svg>
      </div>

      {/* Caption */}
      <div style={{ display: 'flex', gap: 24, paddingLeft: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 2, background: '#1A1A18', borderRadius: 1 }} />
          <span style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 10, color: '#888884', letterSpacing: '0.08em' }}>
            Spring (ruun)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 2, background: '#C0BDB7', borderRadius: 1 }} />
          <span style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 10, color: '#888884', letterSpacing: '0.08em' }}>
            Tween (easeInOutCubic)
          </span>
        </div>
      </div>
    </div>
  )
}
