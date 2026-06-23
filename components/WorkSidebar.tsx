'use client'

import { useEffect, useState, useRef } from 'react'
import { morph } from 'getruun'
import Link from 'next/link'
import type { Section } from './WorkTOC'

const SPRING       = { stiffness: 320, damping: 22, mass: 1 }
const CHEVRON      = 'M15 18 L9 12 L15 6 M15 18 L9 12 L15 6'
const CHEVRONS_LEFT = 'M11 17 L6 12 L11 7 M18 17 L13 12 L18 7'

export function WorkSidebar({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      const vh = window.innerHeight
      const docH = document.documentElement.scrollHeight

      const atBottom = scrollY + vh >= docH - 4
      if (atBottom) {
        setActive(sections[sections.length - 1]?.id ?? '')
        return
      }

      const trigger = scrollY + 130
      let current = sections[0]?.id ?? ''
      for (const { id } of sections) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.getBoundingClientRect().top + scrollY
          if (top <= trigger) current = id
        }
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [sections])

  return (
    <div style={{
      position: 'fixed',
      left: 'calc(50% - 320px - 48px - 152px)',
      top: 112,
      width: 152,
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      zIndex: 5,
    }}>

      {/* Back button */}
      <Link
        href="/"
        onMouseEnter={() => morph(pathRef.current!, CHEVRONS_LEFT, SPRING)}
        onMouseLeave={() => morph(pathRef.current!, CHEVRON, SPRING)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888884" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path ref={pathRef} d={CHEVRON} />
        </svg>
        <span style={{
          fontFamily: "'MDUIXS', sans-serif",
          fontSize: 12,
          letterSpacing: '0.08em',
          color: '#888884',
        }}>
          Work
        </span>
      </Link>

      {/* TOC */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{
          fontFamily: "'MDUIXS', sans-serif",
          fontSize: 8,
          letterSpacing: '0.18em',
          color: '#AAAAAA',
          textTransform: 'uppercase',
          margin: '0 0 16px',
        }}>
          Contents
        </p>
        {sections.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={e => {
              e.preventDefault()
              const el = document.getElementById(id)
              if (!el) return
              const top = el.getBoundingClientRect().top + window.scrollY - 96
              window.scrollTo({ top, behavior: 'smooth' })
            }}
            style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 12,
              letterSpacing: '0.06em',
              color: active === id ? '#1A1A18' : '#BBBBBB',
              textDecoration: 'none',
              lineHeight: 2,
              transition: 'color 0.15s ease',
            }}
          >
            {label}
          </a>
        ))}
      </nav>

    </div>
  )
}
