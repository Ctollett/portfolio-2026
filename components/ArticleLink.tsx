'use client'

import { useRef, useEffect } from 'react'

const MORPH = { stiffness: 200, damping: 18, mass: 0.8 }

const SA = `stroke="#1A1A18" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"`

const FROM         = `<svg viewBox="0 0 16 16"><path d="M2,8 L13,8" ${SA}/><path d="M9,4 L13,8 L9,12" ${SA}/></svg>`
const TO           = `<svg viewBox="0 0 16 16"><path d="M4,13 L12,5" ${SA}/><path d="M7,5 L12,5 L12,10" ${SA}/></svg>`
const CHEVRON_FROM = `<svg viewBox="0 0 16 16"><path d="M6,4 L10,8" ${SA}/><path d="M10,8 L6,12" ${SA}/></svg>`
const CHEVRON_TO   = `<svg viewBox="0 0 16 16"><path d="M3,8 L13,8" ${SA}/><path d="M10,5 L13,8 L10,11" ${SA}/></svg>`

export function ArticleLink({ href, label = 'Read the article', variant = 'external' }: { href: string; label?: string; variant?: 'external' | 'chevron' }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const rest  = variant === 'chevron' ? CHEVRON_FROM : FROM
  const hover = variant === 'chevron' ? CHEVRON_TO   : TO

  useEffect(() => {
    import('getruun').then(({ initMorphSvg }) => {
      if (svgRef.current) initMorphSvg(svgRef.current, rest)
    })
  }, [])

  const handleEnter = () => {
    import('getruun').then(({ morphSvg }) => {
      if (svgRef.current) morphSvg(svgRef.current, hover, MORPH)
    })
  }

  const handleLeave = () => {
    import('getruun').then(({ morphSvg }) => {
      if (svgRef.current) morphSvg(svgRef.current, rest, MORPH)
    })
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "'MDUIXS', sans-serif",
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#1A1A18',
        textDecoration: 'none',
        marginTop: 6,
      }}
    >
      {label}
      <svg ref={svgRef} width="16" height="16" viewBox="0 0 16 16" />
    </a>
  )
}
