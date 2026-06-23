'use client'

import { useRef } from 'react'
import { morph } from 'getruun'

const SPRING        = { stiffness: 320, damping: 22, mass: 1 }
const CHEVRON_RIGHT = 'M9 18 L15 12 L9 6 M9 18 L15 12 L9 6'
const ARROW_RIGHT   = 'M4 12 L12 12 L20 12 M15 7 L20 12 L15 17'

export function WorkLiveLink({ href }: { href: string }) {
  const pathRef = useRef<SVGPathElement>(null)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => morph(pathRef.current!, ARROW_RIGHT, SPRING)}
      onMouseLeave={() => morph(pathRef.current!, CHEVRON_RIGHT, SPRING)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        textDecoration: 'none',
      }}
    >
      <span style={{
        fontFamily: "'MDUIXS', sans-serif",
        fontSize: 12,
        letterSpacing: '0.08em',
        color: '#888884',
      }}>
        View Live Site
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#888884"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path ref={pathRef} d={CHEVRON_RIGHT} />
      </svg>
    </a>
  )
}
