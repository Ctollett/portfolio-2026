'use client'

import { useRef, useEffect } from 'react'

const MORPH = { stiffness: 160, damping: 20, mass: 1.1 }

// SVG attr strings for SVG-string parsing (hyphenated, not camelCase)
const SA  = `stroke="#1A1A18" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"`
const SA2 = `stroke="#1A1A18" stroke-width="2" stroke-linecap="round" fill="none"`
const SM  = `stroke="#888884" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"`

const ICON_MORPHS: { from: string; to: string }[] = [
  // Waveform — flat line → sine wave
  {
    from: `<svg viewBox="0 0 24 24"><path d="M2,12 L22,12" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M2,12 C5,4 9,4 12,12 C15,20 19,20 22,12" ${SA}/></svg>`,
  },
  // Ratio — two equal lines → different lengths at different heights
  {
    from: `<svg viewBox="0 0 24 24"><path d="M3,12 L21,12" ${SA}/><path d="M3,12 L21,12" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M3,8 L21,8" ${SA}/><path d="M3,16 L12,16" ${SA}/></svg>`,
  },
  // Level — three equal short bars → ascending bars
  {
    from: `<svg viewBox="0 0 24 24"><path d="M5,20 L5,18" ${SA2}/><path d="M12,20 L12,18" ${SA2}/><path d="M19,20 L19,18" ${SA2}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M5,20 L5,14" ${SA2}/><path d="M12,20 L12,9" ${SA2}/><path d="M19,20 L19,3" ${SA2}/></svg>`,
  },
  // Feedback — flat line → arc + arrowhead
  {
    from: `<svg viewBox="0 0 24 24"><path d="M4,12 L20,12" ${SA}/><path d="M4,12 L4,12 L4,12" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M12,4 A8,8,0,1,1,4,12" ${SA}/><path d="M1,15 L4,12 L7,15" ${SA}/></svg>`,
  },
  // Detune — center dots → vertical line with arrowheads
  {
    from: `<svg viewBox="0 0 24 24"><path d="M12,12 L12,12" ${SA}/><path d="M12,12 L12,12 L12,12" ${SA}/><path d="M12,12 L12,12 L12,12" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M12,3 L12,21" ${SA}/><path d="M9,7 L12,4 L15,7" ${SA}/><path d="M9,17 L12,20 L15,17" ${SA}/></svg>`,
  },
  // Harmonicity — four equal small bars → descending harmonic series
  {
    from: `<svg viewBox="0 0 24 24"><path d="M4,20 L4,18" ${SA}/><path d="M9,20 L9,18" ${SA}/><path d="M14,20 L14,18" ${SA}/><path d="M19,20 L19,18" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M4,20 L4,6" ${SA}/><path d="M9,20 L9,11" ${SA}/><path d="M14,20 L14,14" ${SA}/><path d="M19,20 L19,17" ${SA}/></svg>`,
  },
  // Mod Envelope — flat baseline → attack/decay/end shape
  {
    from: `<svg viewBox="0 0 24 24"><path d="M2,19 L22,19" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M2,19 L8,5 L15,13 L22,13" ${SA}/></svg>`,
  },
]

const WAVE_MORPHS: { label: string; from: string; to: string }[] = [
  {
    label: 'Sine',
    from: `<svg viewBox="0 0 34 14"><path d="M1,7 L33,7" ${SM}/></svg>`,
    to:   `<svg viewBox="0 0 34 14"><path d="M1,7 C5,1 11,1 17,7 C23,13 29,13 33,7" ${SM}/></svg>`,
  },
  {
    label: 'Square',
    from: `<svg viewBox="0 0 34 14"><path d="M1,7 L33,7" ${SM}/></svg>`,
    to:   `<svg viewBox="0 0 34 14"><path d="M1,2 H11 V12 H23 V2 H33" ${SM}/></svg>`,
  },
  {
    label: 'Saw',
    from: `<svg viewBox="0 0 34 14"><path d="M1,7 L33,7" ${SM}/></svg>`,
    to:   `<svg viewBox="0 0 34 14"><path d="M1,12 L17,2 V12 L33,2" ${SM}/></svg>`,
  },
  {
    label: 'Triangle',
    from: `<svg viewBox="0 0 34 14"><path d="M1,7 L33,7" ${SM}/></svg>`,
    to:   `<svg viewBox="0 0 34 14"><path d="M1,12 L9,2 L17,12 L25,2 L33,12" ${SM}/></svg>`,
  },
]

const CARDS: {
  label: string
  body: string
  span?: boolean
  hasWaveRow?: boolean
}[] = [
  {
    label: 'Waveform',
    body: "Selects the oscillator type for this operator. Each waveform has a distinct harmonic content that determines the base character of the operator's output.",
    hasWaveRow: true,
  },
  {
    label: 'Ratio',
    body: 'Sets the frequency of this operator as a stepped multiple of the root pitch. Integer ratios produce harmonic relationships; stepped values keep the tuning musical at any root note.',
  },
  {
    label: 'Level',
    body: "Controls the operator's output amplitude. For carriers this sets the volume contribution. For modulators it scales the effective modulation depth into the carrier.",
  },
  {
    label: 'Feedback',
    body: "Feeds a portion of the operator's output back into its own input. Low values add subtle harmonic richness; higher values push the signal toward noise and distortion.",
  },
  {
    label: 'Detune',
    body: "Shifts the operator's pitch by up to ±100 cents. Small values add warmth through beating between operators. Larger values introduce deliberate pitch variation within the FM structure.",
  },
  {
    label: 'Harmonicity',
    body: 'Nudges the ratio off its integer value, introducing inharmonic content. Useful for bell-like and metallic textures that pure integer FM ratios cannot produce.',
  },
  {
    label: 'Modulation Envelope',
    body: "Shapes how the operator's modulation depth changes over time. Attack sets how long modulation takes to reach its peak. Decay brings it down. End sets the resting depth it settles at — controlling the FM tone's evolution independently from the amplitude envelope.",
    span: true,
  },
]

const cardLabel: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 8,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#AEABA4',
  margin: '14px 0 6px',
}
const cardBody: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 12,
  lineHeight: 1.72,
  letterSpacing: '0.02em',
  color: '#555559',
  margin: 0,
}
const waveLabelStyle: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 7,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#AEABA4',
  margin: '5px 0 0',
  textAlign: 'center',
}

export function OperatorPanelGrid() {
  const gridRef   = useRef<HTMLDivElement>(null)
  const iconRefs  = useRef<(SVGSVGElement | null)[]>(Array(ICON_MORPHS.length).fill(null))
  const waveRefs  = useRef<(SVGSVGElement | null)[]>(Array(WAVE_MORPHS.length).fill(null))
  const triggered = useRef(false)

  // Seed each SVG with its "from" state on mount
  useEffect(() => {
    import('getruun').then(({ initMorphSvg }) => {
      iconRefs.current.forEach((el, i) => {
        if (el) initMorphSvg(el, ICON_MORPHS[i].from)
      })
      waveRefs.current.forEach((el, i) => {
        if (el) initMorphSvg(el, WAVE_MORPHS[i].from)
      })
    })
  }, [])

  // Trigger morph when grid scrolls into view
  useEffect(() => {
    const el = gridRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return
        triggered.current = true

        // Row layout: [Waveform, Ratio], [Level, Feedback], [Detune, Harm], [Mod Env]
        const ICON_ROW  = [0, 0, 1, 1, 2, 2, 3]
        const DELAY     = 300
        const ROW_DELAY = 150

        import('getruun').then(({ morphSvg }) => {
          iconRefs.current.forEach((svgEl, i) => {
            if (!svgEl) return
            setTimeout(() => morphSvg(svgEl, ICON_MORPHS[i].to, MORPH), DELAY + ICON_ROW[i] * ROW_DELAY)
          })
          // Wave mini icons cascade slightly after their card (row 0)
          waveRefs.current.forEach((svgEl, i) => {
            if (!svgEl) return
            setTimeout(() => morphSvg(svgEl, WAVE_MORPHS[i].to, MORPH), DELAY + 80 + i * 50)
          })
        })
      },
      { rootMargin: '-35% 0px -35% 0px', threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={gridRef}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, margin: '24px 0 0' }}
    >
      {CARDS.map((card, i) => (
        <div
          key={i}
          style={{
            border: '1px solid rgba(26,26,24,0.1)',
            borderRadius: 8,
            padding: '20px 22px 24px',
            gridColumn: card.span ? '1 / -1' : undefined,
          }}
        >
          <svg
            ref={(el) => { iconRefs.current[i] = el }}
            width="22"
            height="22"
            viewBox="0 0 24 24"
          />
          <p style={cardLabel}>{card.label}</p>
          <p style={cardBody}>{card.body}</p>
          {card.hasWaveRow && (
            <div style={{ display: 'flex', marginTop: 18, justifyContent: 'space-between' }}>
              {WAVE_MORPHS.map(({ label }, wi) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <svg
                    ref={(el) => { waveRefs.current[wi] = el }}
                    width="34"
                    height="14"
                    viewBox="0 0 34 14"
                  />
                  <span style={waveLabelStyle}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
