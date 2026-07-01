'use client'

import { useRef, useEffect, useState } from 'react'

const SA = `stroke="#1A1A18" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"`

// Preset playground — star ↔ circle makes spring overshoot immediately legible
const STAR   = `<svg viewBox="0 0 100 100"><path d="M50 5 L61 35 L93 36 L67 56 L77 86 L50 68 L24 86 L33 56 L7 36 L39 35 Z" fill="#1A1A18"/></svg>`
const CIRCLE = `<svg viewBox="0 0 100 100"><path d="M50 5 A45 45 0 0 1 95 50 A45 45 0 0 1 50 95 A45 45 0 0 1 5 50 A45 45 0 0 1 50 5 Z" fill="#1A1A18"/></svg>`

const PRESETS = [
  { name: 'gentle',  config: { stiffness: 120, damping: 20, mass: 1   } },
  { name: 'smooth',  config: { stiffness: 200, damping: 26, mass: 1   } },
  { name: 'stiff',   config: { stiffness: 400, damping: 28, mass: 1   } },
  { name: 'bouncy',  config: { stiffness: 280, damping: 12, mass: 1   } },
  { name: 'wobbly',  config: { stiffness: 120, damping: 8,  mass: 1.5 } },
] as const

// Icon pairs — each SVG string has one <path> element with matching subpath structure
const ICONS = [
  {
    from: `<svg viewBox="0 0 24 24"><path d="M12 5 L12 19 M5 12 L19 12" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M5 5 L19 19 M5 19 L19 5" ${SA}/></svg>`,
  },
  {
    from: `<svg viewBox="0 0 24 24"><path d="M3 12 L21 12 M15 6 L21 12 L15 18" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M4 20 L20 4 M13 4 L20 4 L20 11" ${SA}/></svg>`,
  },
  {
    from: `<svg viewBox="0 0 24 24"><path d="M20 12 A8 8 0 0 1 12 20 A8 8 0 0 1 4 12 A8 8 0 0 1 12 4 A8 8 0 0 1 20 12 Z" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M4 4 L20 4 L20 20 L4 20 Z" ${SA}/></svg>`,
  },
  {
    from: `<svg viewBox="0 0 24 24"><path d="M5 3 L19 12 L5 21 Z" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M5 5 L19 5 L19 19 L5 19 Z" ${SA}/></svg>`,
  },
  {
    from: `<svg viewBox="0 0 24 24"><path d="M4 12 L9 17 L20 6" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M4 12 L12 12 L20 12" ${SA}/></svg>`,
  },
  {
    from: `<svg viewBox="0 0 24 24"><path d="M12 20 L12 4 M6 10 L12 4 L18 10" ${SA}/></svg>`,
    to:   `<svg viewBox="0 0 24 24"><path d="M12 4 L12 20 M6 14 L12 20 L18 14" ${SA}/></svg>`,
  },
]

export function RuunDemo() {
  const presetSvgRef   = useRef<SVGSVGElement>(null)
  const presetInitRef  = useRef(false)
  const presetStateRef = useRef<'star' | 'circle'>('star')
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const iconRefs    = useRef<(SVGSVGElement | null)[]>(ICONS.map(() => null))
  const iconInitRef = useRef<boolean[]>(ICONS.map(() => false))
  const [toggled, setToggled] = useState<boolean[]>(ICONS.map(() => false))

  useEffect(() => {
    import('getruun').then(({ initMorphSvg }) => {
      if (presetSvgRef.current && !presetInitRef.current) {
        initMorphSvg(presetSvgRef.current, STAR)
        presetInitRef.current = true
      }
      ICONS.forEach((icon, i) => {
        const ref = iconRefs.current[i]
        if (ref && !iconInitRef.current[i]) {
          initMorphSvg(ref, icon.from)
          iconInitRef.current[i] = true
        }
      })
    })
  }, [])

  const handlePreset = (name: string, config: { stiffness: number; damping: number; mass: number }) => {
    if (!presetSvgRef.current || !presetInitRef.current) return
    const target = presetStateRef.current === 'star' ? CIRCLE : STAR
    presetStateRef.current = presetStateRef.current === 'star' ? 'circle' : 'star'
    setActivePreset(name)
    import('getruun').then(({ morphSvg }) => {
      if (presetSvgRef.current) morphSvg(presetSvgRef.current, target, config)
    })
  }

  const handleIcon = (i: number) => {
    const ref = iconRefs.current[i]
    if (!ref || !iconInitRef.current[i]) return
    const next = !toggled[i]
    setToggled(prev => { const c = [...prev]; c[i] = next; return c })
    import('getruun').then(({ morphSvg }) => {
      if (ref) morphSvg(ref, next ? ICONS[i]!.to : ICONS[i]!.from, { stiffness: 220, damping: 20, mass: 1 })
    })
  }

  const card: React.CSSProperties = {
    background: 'rgba(26,26,24,0.05)',
    borderRadius: 10,
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  }

  const cardLabel: React.CSSProperties = {
    fontFamily: "'MDUIXS', sans-serif",
    fontSize: 9,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: '#888884',
    margin: 0,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Preset playground */}
      <div style={{ ...card, alignItems: 'center' }}>
        <p style={{ ...cardLabel, alignSelf: 'flex-start' }}>Feel the presets</p>
        <div style={{
          background: '#F4F2ED',
          borderRadius: 8,
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg ref={presetSvgRef} viewBox="0 0 100 100" width="100" height="100" />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {PRESETS.map(({ name, config }) => {
            const active = activePreset === name
            return (
              <button
                key={name}
                onClick={() => handlePreset(name, config)}
                style={{
                  fontFamily: "'MDUIXS', sans-serif",
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  border: '1px solid',
                  borderColor: active ? '#1A1A18' : 'rgba(26,26,24,0.2)',
                  background: active ? '#1A1A18' : 'transparent',
                  color: active ? '#F4F2ED' : '#555559',
                  borderRadius: 99,
                  padding: '7px 14px',
                  cursor: 'pointer',
                }}
              >
                {name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Icon toggle grid */}
      <div style={card}>
        <p style={cardLabel}>Click to toggle</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {ICONS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleIcon(i)}
              style={{
                background: '#F4F2ED',
                border: '1px solid rgba(26,26,24,0.08)',
                borderRadius: 8,
                aspectRatio: '1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                ref={el => { iconRefs.current[i] = el }}
                viewBox="0 0 24 24"
                width="36"
                height="36"
              />
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
