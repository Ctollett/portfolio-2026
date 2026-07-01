'use client'

import { useRef, useEffect } from 'react'

const PANELS = [
  { label: 'Pure',     depth: 0,   ratio: 2   },
  { label: 'Bell',     depth: 2.5, ratio: 2   },
  { label: 'Metallic', depth: 5.5, ratio: 3.1 },
]

const CYCLES = 2

export function FMWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let af: number
    let phase = 0

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const panelW = W / PANELS.length
      const LABEL_H = 22
      const waveTop = LABEL_H
      const waveH = H - LABEL_H - 4
      const mid = waveTop + waveH / 2
      const amp = waveH * 0.40

      PANELS.forEach(({ label, depth, ratio }, i) => {
        const x0 = i * panelW
        const cx = x0 + panelW / 2

        // Label
        ctx.fillStyle = 'rgba(26,26,24,0.38)'
        ctx.font = `11px -apple-system, 'Helvetica Neue', sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(label.toUpperCase(), cx, 14)

        // Clip to wave area for this panel
        ctx.save()
        ctx.beginPath()
        ctx.rect(x0, waveTop, panelW, waveH)
        ctx.clip()

        ctx.beginPath()
        const N = Math.floor(panelW) * 4
        for (let j = 0; j <= N; j++) {
          const t = j / N
          const carrierP = t * Math.PI * 2 * CYCLES + phase
          const modP = carrierP * ratio
          const y = mid - amp * Math.sin(carrierP + depth * Math.sin(modP))
          const x = x0 + t * panelW
          if (j === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.strokeStyle = '#1A1A18'
        ctx.lineWidth = 1.5
        ctx.lineJoin = 'round'
        ctx.stroke()
        ctx.restore()
      })

      // Dividers drawn last so they sit on top
      for (let i = 1; i < PANELS.length; i++) {
        const x = i * panelW
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.strokeStyle = 'rgba(26,26,24,0.07)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      phase += 0.008
      af = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(af)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '0 0 20px' }}>
      <div style={{ background: 'rgba(26,26,24,0.04)', borderRadius: 10, padding: '16px 20px 12px', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={900}
          height={110}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
      <span style={{
        fontFamily: "'MDUIXS', sans-serif",
        fontSize: 10,
        color: '#888884',
        letterSpacing: '0.08em',
        paddingLeft: 4,
      }}>
        Phase Modulation — carrier at 1× with modulator at 2×
      </span>
    </div>
  )
}
