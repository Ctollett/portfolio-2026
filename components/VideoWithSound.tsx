'use client'

import { useRef, useState } from 'react'

function SoundOnIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M1 3.5H2.8L5.5 1V10L2.8 7.5H1V3.5Z" fill="#F4F2ED" />
      <path d="M7.5 3C8.2 3.6 8.8 4.3 8.8 5.5C8.8 6.7 8.2 7.4 7.5 8" stroke="#F4F2ED" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M9 1.5C10.2 2.5 11 3.9 11 5.5C11 7.1 10.2 8.5 9 9.5" stroke="#F4F2ED" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function SoundOffIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M1 3.5H2.8L5.5 1V10L2.8 7.5H1V3.5Z" fill="#F4F2ED" />
      <line x1="7.5" y1="3.5" x2="10.5" y2="7.5" stroke="#F4F2ED" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10.5" y1="3.5" x2="7.5" y2="7.5" stroke="#F4F2ED" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function VideoWithSound({ src, style }: { src: string; style?: React.CSSProperties }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  const toggleSound = () => {
    const video = videoRef.current
    if (!video) return
    const next = !muted
    video.muted = next
    setMuted(next)
  }

  return (
    <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', ...style }}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        style={{ width: '100%', display: 'block' }}
      />
      <button
        onClick={toggleSound}
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          background: 'rgba(26,26,24,0.58)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          fontFamily: "'MDUIXS', sans-serif",
          fontSize: 8,
          letterSpacing: '0.14em',
          color: '#F4F2ED',
          textTransform: 'uppercase',
        }}
      >
        {muted ? <SoundOffIcon /> : <SoundOnIcon />}
        {muted ? 'Sound off' : 'Sound on'}
      </button>
    </div>
  )
}
