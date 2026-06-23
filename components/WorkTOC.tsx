'use client'

import { useEffect, useState } from 'react'

export interface Section {
  id: string
  label: string
}

export function WorkTOC({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const observers = sections.map(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return null
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { rootMargin: '-10% 0px -80% 0px' }
      )
      observer.observe(el)
      return observer
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [sections])

  return (
    <nav style={{ position: 'sticky', top: 120, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
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
  )
}
