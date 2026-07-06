'use client'

import { useEffect, useRef, useState } from 'react'
import { m, animate, useMotionValue, useTransform } from 'framer-motion'

const TRACK_W = 240
const SVG_H   = 28
const CY      = SVG_H / 2
const R       = 9
const ARM     = 11
const TICK    = 3
const SW      = 1.0
const LEFT_X  = R
const RIGHT_X = TRACK_W - R

// Timeline (ms):
//   0–200   : startup delay
//   200–4200: animation runs (4.0s)
//   4200    : 100% reached, brief pause
//   4600    : "Welcome" fades in
//   5100    : whole screen fades out
//   5600    : onDone fires

export function IntroScreen({ onDone }: { onDone: () => void }) {
  const [exiting,     setExiting]     = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [pct,         setPct]         = useState(0)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const xMV     = useMotionValue(LEFT_X)
  const pathLen = useTransform(xMV, [LEFT_X, RIGHT_X], [0, 1])

  useEffect(() => {
    const controls = animate(xMV, RIGHT_X, {
      duration: 4.0,
      delay: 0.2,
      ease: [0.4, 0, 0.15, 1],
    })
    const unsub = xMV.on('change', (v: number) => {
      setPct(Math.round((v - LEFT_X) / (RIGHT_X - LEFT_X) * 100))
    })

    const welcomeTimer = setTimeout(() => setShowWelcome(true), 4600)
    const fadeTimer    = setTimeout(() => setExiting(true), 5100)
    const doneTimer    = setTimeout(() => onDoneRef.current(), 5600)

    return () => {
      controls.stop()
      unsub()
      clearTimeout(welcomeTimer)
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [xMV])

  return (
    <m.div
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#F4F2ED',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        pointerEvents: 'none',
      }}
    >
      {/* Logo mark */}
      <m.svg
        width={36}
        height={26}
        viewBox="0 0 29 21"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ display: 'block' }}
      >
        <path d="M8.47189 9.49798H0.5C0.5 9.49798 0.817269 1.26634 9.5 0.5V8.86104C9.5 8.86104 9.32329 9.4353 8.47189 9.5V9.49798Z" stroke="#888884" strokeWidth="1.2" strokeMiterlimit="10" />
        <path d="M8.47189 11.5H0.5C0.5 11.5 0.817269 19.7342 9.5 20.5V12.1378C9.5 12.1378 9.32329 11.563 8.47189 11.5Z" stroke="#888884" strokeWidth="1.2" strokeMiterlimit="10" />
        <path d="M16 20.5C18.4853 20.5 20.5 18.4853 20.5 16C20.5 13.5147 18.4853 11.5 16 11.5C13.5147 11.5 11.5 13.5147 11.5 16C11.5 18.4853 13.5147 20.5 16 20.5Z" stroke="#888884" strokeWidth="1.2" strokeMiterlimit="10" />
        <path d="M17.5964 0.5H14.4036C12.8 0.5 11.5 1.79996 11.5 3.40355V6.59645C11.5 8.20003 12.8 9.5 14.4036 9.5H17.5964C19.2 9.5 20.5 8.20003 20.5 6.59645V3.40355C20.5 1.79996 19.2 0.5 17.5964 0.5Z" stroke="#888884" strokeWidth="1.2" strokeMiterlimit="10" />
      </m.svg>

      {/* Track + label */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <svg
          width={TRACK_W}
          height={SVG_H}
          viewBox={`0 0 ${TRACK_W} ${SVG_H}`}
          style={{ overflow: 'visible' }}
        >
          {/* Gray track */}
          <line x1={LEFT_X}  y1={CY} x2={RIGHT_X} y2={CY}
            stroke="rgba(26,26,24,0.12)" strokeWidth={SW} />
          <line x1={LEFT_X}  y1={CY - TICK} x2={LEFT_X}  y2={CY + TICK}
            stroke="rgba(26,26,24,0.12)" strokeWidth={SW} />
          <line x1={RIGHT_X} y1={CY - TICK} x2={RIGHT_X} y2={CY + TICK}
            stroke="rgba(26,26,24,0.12)" strokeWidth={SW} />

          {/* Red progress fill */}
          <m.path
            d={`M ${LEFT_X} ${CY} L ${RIGHT_X} ${CY}`}
            stroke="#C0582A"
            strokeWidth={SW}
            fill="none"
            style={{ pathLength: pathLen }}
          />

          {/* Sliding mark */}
          <m.g
            style={{ x: xMV }}
            stroke="#C0582A"
            fill="none"
            strokeWidth={SW}
          >
            <circle cx={0} cy={CY} r={R} />
            <line x1={0} y1={CY - ARM} x2={0} y2={CY + ARM} />
            <line x1={-TICK} y1={CY - ARM} x2={TICK} y2={CY - ARM} />
            <line x1={-TICK} y1={CY + ARM} x2={TICK} y2={CY + ARM} />
          </m.g>
        </svg>

        {/* Percentage / Welcome crossfade */}
        <div style={{ position: 'relative', height: '1.3em', width: 120, textAlign: 'center' }}>
          <m.span
            animate={{ opacity: showWelcome ? 0 : 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              fontFamily: "'Canela', Georgia, serif",
              fontSize: 14,
              color: 'rgba(26,26,24,0.38)',
              fontVariantNumeric: 'tabular-nums',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {pct}%
          </m.span>
          <m.span
            initial={{ opacity: 0 }}
            animate={{ opacity: showWelcome ? 1 : 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              fontFamily: "'Canela', Georgia, serif",
              fontSize: 14,
              color: '#C0582A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '0.02em',
            }}
          >
            Welcome
          </m.span>
        </div>
      </div>
    </m.div>
  )
}
