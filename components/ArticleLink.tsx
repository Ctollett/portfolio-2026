'use client'

import { useRef, useEffect } from 'react'

const MORPH = { stiffness: 200, damping: 18, mass: 0.8 }

const SA = `stroke="#1A1A18" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"`

const FROM = `<svg viewBox="0 0 16 16"><path d="M2,8 L13,8" ${SA}/><path d="M9,4 L13,8 L9,12" ${SA}/></svg>`
const TO   = `<svg viewBox="0 0 16 16"><path d="M4,13 L12,5" ${SA}/><path d="M7,5 L12,5 L12,10" ${SA}/></svg>`

export function ArticleLink({ href, label = 'Read the article' }: { href: string; label?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    import('getruun').then(({ initMorphSvg }) => {
      if (svgRef.current) initMorphSvg(svgRef.current, FROM)
    })
  }, [])

  const handleEnter = () => {
    import('getruun').then(({ morphSvg }) => {
      if (svgRef.current) morphSvg(svgRef.current, TO, MORPH)
    })
  }

  const handleLeave = () => {
    import('getruun').then(({ morphSvg }) => {
      if (svgRef.current) morphSvg(svgRef.current, FROM, MORPH)
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
