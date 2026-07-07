'use client'

import { useLayoutEffect, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { WorkSidebar } from './WorkSidebar'
import { WorkLiveLink } from './WorkLiveLink'
import { NavBar } from './NavBar'
import type { Section } from './WorkTOC'
import type { WorkItem } from '@/lib/work'
import TX04Content,    { sections as tx04Sections }    from '@/content/work/tx-04'
import RuunContent,    { sections as ruunSections }    from '@/content/work/ruun'
import WasmDspContent, { sections as wasmDspSections } from '@/content/work/wasm-dsp-engine'

const ease = [0.25, 0.1, 0.25, 1] as const

const contentMap: Record<string, { Component: React.ComponentType; sections: Section[] }> = {
  'tx-04':           { Component: TX04Content,    sections: tx04Sections },
  'ruun':            { Component: RuunContent,    sections: ruunSections },
  'wasm-dsp-engine': { Component: WasmDspContent, sections: wasmDspSections },
}

interface Props {
  item: WorkItem
  slug: string
}

export function WorkPageClient({ item, slug }: Props) {
  const entry = contentMap[slug]
  const sections = entry?.sections ?? []
  const ContentComponent = entry?.Component ?? (() => null)

  const [isMobile, setIsMobile] = useState(false)

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1080)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>

      <NavBar blur animDelay={0.6} />

      {!isMobile && <WorkSidebar sections={sections} animDelay={0.6} />}

      {/* Centered content column */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: `${isMobile ? 100 : 120}px ${isMobile ? 20 : 32}px 50vh` }}>

        {/* Mobile back button */}
        {isMobile && (
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: "'MDUIXS', sans-serif",
            fontSize: 13,
            letterSpacing: '0.1em',
            color: '#888884',
            textDecoration: 'none',
            marginBottom: 24,
            minHeight: 44,
            paddingRight: 16,
          }}>
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="butt">
              <path d="M8 1 L2 8 L8 15" />
            </svg>
            Work
          </Link>
        )}

        {/* Hero video */}
        {item.video && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease }}
            style={{
              height: isMobile ? 220 : 360,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#E8E5DE',
              marginBottom: 48,
            }}
          >
            <video
              src={item.video}
              autoPlay muted loop playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </motion.div>
        )}

        {/* Title + metadata row — bottom-aligned, with divider */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          gap: isMobile ? 20 : 0,
          paddingBottom: 48,
          marginBottom: 64,
          borderBottom: '1px solid rgba(26,26,24,0.08)',
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.3, ease }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <h1 style={{
              fontFamily: "'Canela', serif",
              fontSize: isMobile ? 30 : 40,
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#1A1A18',
              margin: 0,
              lineHeight: 1,
            }}>
              {item.title}
            </h1>
            {item.liveUrl && <WorkLiveLink href={item.liveUrl} />}
            {item.repoUrl && <WorkLiveLink href={item.repoUrl} label="View Code" />}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.45, ease }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: isMobile ? 'left' : 'right' }}
          >
            <p style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 8,
              letterSpacing: '0.14em',
              whiteSpace: 'nowrap',
              color: '#888884',
              margin: 0,
            }}>
              {item.year}
            </p>
            <p style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 12,
              letterSpacing: '0.06em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              color: '#1A1A18',
              margin: 0,
            }}>
              {item.type}
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease }}
        >
          <ContentComponent />
        </motion.div>

      </div>
    </div>
  )
}
