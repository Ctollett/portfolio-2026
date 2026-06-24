'use client'

import { useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { WorkSidebar } from './WorkSidebar'
import { WorkLiveLink } from './WorkLiveLink'
import type { Section } from './WorkTOC'
import type { WorkItem } from '@/lib/work'
import TX84Content,    { sections as tx84Sections }    from '@/content/work/tx-84'
import RuunContent,    { sections as ruunSections }    from '@/content/work/ruun'
import WasmDspContent, { sections as wasmDspSections } from '@/content/work/wasm-dsp-engine'

const ease = [0.25, 0.1, 0.25, 1] as const

const NAV_ITEMS = [
  { label: 'Work',    href: '/' },
  { label: 'Lab',     href: '/lab' },
  { label: 'Writing', href: '/writing' },
  { label: 'About',   href: '/about' },
]

const contentMap: Record<string, { Component: React.ComponentType; sections: Section[] }> = {
  'tx-84':           { Component: TX84Content,    sections: tx84Sections },
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

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  return (
    <div style={{ background: '#F4F2ED', minHeight: '100vh' }}>

      {/* Fixed nav — animates its own opacity so fixed positioning is unaffected */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '32px',
          zIndex: 10,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(244, 242, 237, 0.8)',
        }}
      >
        <Link href="/" style={{ display: 'flex', textDecoration: 'none' }}>
          <svg width="28" height="20" viewBox="0 0 29 21" fill="none">
            <path d="M8.47189 9.49798H0.5C0.5 9.49798 0.817269 1.26634 9.5 0.5V8.86104C9.5 8.86104 9.32329 9.4353 8.47189 9.5V9.49798Z" stroke="#000000" strokeMiterlimit="10"/>
            <path d="M8.47189 11.5H0.5C0.5 11.5 0.817269 19.7342 9.5 20.5V12.1378C9.5 12.1378 9.32329 11.563 8.47189 11.5Z" stroke="#000000" strokeMiterlimit="10"/>
            <path d="M16 20.5C18.4853 20.5 20.5 18.4853 20.5 16C20.5 13.5147 18.4853 11.5 16 11.5C13.5147 11.5 11.5 13.5147 11.5 16C11.5 18.4853 13.5147 20.5 16 20.5Z" stroke="#000000" strokeMiterlimit="10"/>
            <path d="M17.5964 0.5H14.4036C12.8 0.5 11.5 1.79996 11.5 3.40355V6.59645C11.5 8.20003 12.8 9.5 14.4036 9.5H17.5964C19.2 9.5 20.5 8.20003 20.5 6.59645V3.40355C20.5 1.79996 19.2 0.5 17.5964 0.5Z" stroke="#000000" strokeMiterlimit="10"/>
          </svg>
        </Link>
        <nav style={{ display: 'flex', gap: 16 }}>
          {NAV_ITEMS.map(n => (
            <Link key={n.label} href={n.href} style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 12,
              letterSpacing: '0.14em',
              color: '#888884',
              textDecoration: 'none',
            }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </motion.div>

      {/* Sidebar animates its own opacity inside the component */}
      <WorkSidebar sections={sections} animDelay={0.6} />

      {/* Centered content column */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '120px 32px 50vh' }}>

        {/* Hero video */}
        {item.video && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease }}
            style={{
              height: 480,
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
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
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
              fontSize: 40,
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#1A1A18',
              margin: 0,
              lineHeight: 1,
            }}>
              {item.title}
            </h1>
            {item.liveUrl && <WorkLiveLink href={item.liveUrl} />}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.45, ease }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'right' }}
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
