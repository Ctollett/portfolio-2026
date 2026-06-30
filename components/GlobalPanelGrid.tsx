'use client'

import { useRef, useEffect } from 'react'

const MORPH = { stiffness: 160, damping: 20, mass: 1.1 }

const SA  = `stroke="#1A1A18" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"`
const SA2 = `stroke="#1A1A18" stroke-width="2" stroke-linecap="round" fill="none"`

const ICON_MORPHS: { from: string; to: string }[] = [
  // Amplitude Envelope — flat baseline → ADSR shape
  {
    from: `<svg viewBox="0 0 24 24"><path d="M2,20 L22,20" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M2,20 L6,4 L10,11 L16,11 L22,20" ${SA}/></svg>`,
  },
  // Filter — flat line → LP frequency response curve
  {
    from: `<svg viewBox="0 0 24 24"><path d="M2,12 L22,12" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M2,9 L13,9 C17,9 21,16 22,21" ${SA}/></svg>`,
  },
  // Filter Envelope — flat baseline → attack + end shape
  {
    from: `<svg viewBox="0 0 24 24"><path d="M2,20 L22,20" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M2,20 L9,5 L22,14" ${SA}/></svg>`,
  },
  // Delay — single center line → three offset echo lines
  {
    from: `<svg viewBox="0 0 24 24"><path d="M2,12 L22,12" ${SA2}/><path d="M2,12 L22,12" ${SA2}/><path d="M2,12 L22,12" ${SA2}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M2,8 L22,8" ${SA2}/><path d="M5,12 L22,12" ${SA2}/><path d="M8,16 L22,16" ${SA2}/></svg>`,
  },
  // Reverb — dots → two expanding right-opening arcs
  {
    from: `<svg viewBox="0 0 24 24"><path d="M10,12 A0.01,0.01,0,0,1,10,12.01" ${SA}/><path d="M7,12 A0.01,0.01,0,0,1,7,12.01" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M10,9 A4,4,0,0,1,10,15" ${SA}/><path d="M7,6 A8,7,0,0,1,7,18" ${SA}/></svg>`,
  },
  // Chorus — two flat lines → two offset sine waves
  {
    from: `<svg viewBox="0 0 24 24"><path d="M2,12 C5,12 9,12 12,12 C15,12 19,12 22,12" ${SA}/><path d="M2,12 C5,12 9,12 12,12 C15,12 19,12 22,12" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M2,9 C5,4 9,4 12,9 C15,14 19,14 22,9" ${SA}/><path d="M2,15 C5,10 9,10 12,15 C15,20 19,20 22,15" ${SA}/></svg>`,
  },
  // Bitcrush — flat line → stepped/quantized waveform
  {
    from: `<svg viewBox="0 0 24 24"><path d="M2,12 L22,12" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M2,12 L4,12 L4,6 L7,6 L7,15 L10,15 L10,8 L13,8 L13,16 L16,16 L16,9 L19,9 L19,12 L22,12" ${SA}/></svg>`,
  },
  // LFO — flat line + dot → sine wave + arrowhead
  {
    from: `<svg viewBox="0 0 24 24"><path d="M2,12 L20,12" ${SA}/><path d="M20,12 L20,12 L20,12" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M2,12 C5,5 8,5 11,12 C14,19 17,19 20,12" ${SA}/><path d="M20,12 L22,9 L22,15" ${SA}/></svg>`,
  },
]

const CARDS: {
  label: string
  body: string
  span?: boolean
}[] = [
  {
    label: 'Amplitude Envelope',
    body: 'Controls the loudness shape of every note. Attack sets how quickly the note reaches full volume. Decay brings it to the sustain level, which holds while the key is pressed. Release fades the note after the key is released.',
    span: true,
  },
  {
    label: 'Filter',
    body: 'A resonant filter with three mode types: low-pass, high-pass, and band-pass. Cutoff and resonance are set interactively on the filter display. Drive adds saturation before the filter stage; Mix blends the filtered signal against the dry output.',
  },
  {
    label: 'Filter Envelope',
    body: 'Applies a two-stage curve to the filter cutoff on each note. Env sets how strongly the envelope affects the cutoff. Attack controls how fast the filter opens. End sets the cutoff position after the envelope completes.',
  },
  {
    label: 'Delay',
    body: 'A feedback delay effect. Time sets the interval between echoes. Feedback controls how many repeats occur before the signal decays. Mix blends the dry signal with the delayed output.',
  },
  {
    label: 'Reverb',
    body: 'Simulates acoustic space by smearing the signal into a diffuse tail. Decay controls how long the reverb tail lasts. Damping softens the high-frequency content of the tail over time. Mix controls the wet/dry balance.',
  },
  {
    label: 'Chorus',
    body: 'Creates depth and movement by layering slightly detuned copies of the signal. Depth sets the intensity of pitch modulation. Speed controls the oscillation rate. Width spreads the effect across the stereo field.',
  },
  {
    label: 'Bitcrush',
    body: 'Reduces the bit depth and sample rate of the signal, introducing digital distortion and aliasing artifacts. At low settings it adds grit; higher settings push toward lo-fi and glitchy textures.',
  },
  {
    label: 'LFO 1 & 2',
    body: 'Two independent low-frequency oscillators that route to a single destination from a list spanning FM modulation, amplitude, and filter parameters. Each LFO has a waveform, speed, and depth. Mode controls trigger behavior — free-running, note-triggered, held, or single-cycle. Fade smooths the LFO in from silence at note start.',
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

export function GlobalPanelGrid() {
  const gridRef   = useRef<HTMLDivElement>(null)
  const iconRefs  = useRef<(SVGSVGElement | null)[]>(Array(ICON_MORPHS.length).fill(null))
  const triggered = useRef(false)

  useEffect(() => {
    import('getruun').then(({ initMorphSvg }) => {
      iconRefs.current.forEach((el, i) => {
        if (el) initMorphSvg(el, ICON_MORPHS[i].from)
      })
    })
  }, [])

  useEffect(() => {
    const el = gridRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return
        triggered.current = true

        // Row layout: [ADSR], [Filter, FilterEnv], [Delay, Reverb], [Chorus, Bitcrush], [LFO]
        const ICON_ROW  = [0, 1, 1, 2, 2, 3, 3, 4]
        const DELAY     = 300
        const ROW_DELAY = 150

        import('getruun').then(({ morphSvg }) => {
          iconRefs.current.forEach((svgEl, i) => {
            if (!svgEl) return
            setTimeout(() => morphSvg(svgEl, ICON_MORPHS[i].to, MORPH), DELAY + ICON_ROW[i] * ROW_DELAY)
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
        </div>
      ))}
    </div>
  )
}
