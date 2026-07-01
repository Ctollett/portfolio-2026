'use client'

import { useRef, useState, useCallback } from 'react'
import type { MouseEvent, TouchEvent } from 'react'

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

const WHITE_KEYS = [60, 62, 64, 65, 67, 69, 71] // C4–B4

const BLACK_KEYS = [
  { midi: 61, left: 10.0   }, // C#4
  { midi: 63, left: 24.286 }, // D#4
  { midi: 66, left: 52.857 }, // F#4
  { midi: 68, left: 67.143 }, // G#4
  { midi: 70, left: 81.429 }, // A#4
]
const BLACK_KEY_W = 8.571

const BELL_MATRIX = new Float32Array(16)
BELL_MATRIX[4]  = 80  // A → C
BELL_MATRIX[8]  = 45  // B1 → C
BELL_MATRIX[14] = 60  // B2 → B1

export function SynthKeyboard() {
  const ctxRef     = useRef<AudioContext | null>(null)
  const workletRef = useRef<AudioWorkletNode | null>(null)
  const initRef    = useRef<Promise<void> | null>(null)

  const [status, setStatus] = useState<'idle' | 'loading' | 'ready'>('idle')
  const [active, setActive] = useState<Set<number>>(new Set())
  const [algo, setAlgo]     = useState(0)

  const initAudio = useCallback((): Promise<void> => {
    if (initRef.current) return initRef.current

    const p = (async () => {
      setStatus('loading')

      const ctx = ctxRef.current ?? new AudioContext()
      ctxRef.current = ctx
      await ctx.resume()

      const [wasmBytes] = await Promise.all([
        fetch('/wasm/synth_engine_bg.wasm').then(r => r.arrayBuffer()),
        ctx.audioWorklet.addModule('/synth_worklet.js'),
      ])
      const wasmModule = await WebAssembly.compile(wasmBytes)

      const node = new AudioWorkletNode(ctx, 'synth-processor', {
        outputChannelCount: [2],
        processorOptions: { wasmModule, sampleRate: ctx.sampleRate },
      })
      node.connect(ctx.destination)
      workletRef.current = node

      await new Promise<void>(resolve => {
        node.port.onmessage = (e) => {
          if (e.data.type !== 'ready') return
          const send = (fn: string, ...args: unknown[]) =>
            node.port.postMessage({ type: 'param', fn, args })

          send('set_algorithm', 0)
          send('set_amp_env', 0, 80, 10, 50)
          send('set_mod_depth_matrix', BELL_MATRIX)
          send('set_operator_feedback', 1, 35)
          send('set_ratio_c', 1.0)
          send('set_ratio_a', 2.0)
          send('set_ratio_b', 3.0, 4.0)
          send('set_reverb_enabled', true)
          send('set_reverb_mix', 0.35)
          send('set_reverb_decay', 0.75)
          send('set_reverb_damping', 0.5)
          send('set_chorus_enabled', false)
          send('set_delay_enabled', false)
          send('set_filter_cutoff', 20000)
          send('set_filter_resonance', 0.1)
          send('set_carrier_mix', 1.0)
          send('set_volume', 100)

          setStatus('ready')
          resolve()
        }
      })
    })()

    initRef.current = p
    return p
  }, [])

  const noteOn = useCallback((midi: number) => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }

    const play = () => {
      workletRef.current?.port.postMessage({ type: 'note_on', args: [midi, midiToFreq(midi)] })
      setActive(prev => { const s = new Set(prev); s.add(midi); return s })
    }

    if (status === 'ready') {
      play()
    } else {
      initAudio().then(play)
    }
  }, [status, initAudio])

  const noteOff = useCallback((midi: number) => {
    workletRef.current?.port.postMessage({ type: 'note_off', args: [midi] })
    setActive(prev => { const s = new Set(prev); s.delete(midi); return s })
  }, [])

  const changeAlgo = (idx: number) => {
    setAlgo(idx)
    workletRef.current?.port.postMessage({ type: 'param', fn: 'set_algorithm', args: [idx] })
  }

  const keyProps = (midi: number) => ({
    onMouseDown: (e: MouseEvent) => { e.preventDefault(); noteOn(midi) },
    onMouseUp:   () => noteOff(midi),
    onMouseLeave: () => { if (active.has(midi)) noteOff(midi) },
    onTouchStart: (e: TouchEvent) => { e.preventDefault(); noteOn(midi) },
    onTouchEnd:   (e: TouchEvent) => { e.preventDefault(); noteOff(midi) },
    onTouchCancel: () => noteOff(midi),
  })

  return (
    <div style={{
      background: '#ECEAE0',
      border: '1px solid rgba(26,26,24,0.09)',
      borderRadius: 12,
      padding: '16px 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>

      {/* Keyboard */}
      <div style={{ position: 'relative', height: 88 }}>
        <div style={{ display: 'flex', height: '100%', gap: 1 }}>
          {WHITE_KEYS.map(midi => (
            <div
              key={midi}
              {...keyProps(midi)}
              style={{
                flex: 1,
                position: 'relative',
                background: active.has(midi) ? '#CCCAC0' : '#F0EDE5',
                border: '1px solid rgba(26,26,24,0.10)',
                borderRadius: '0 0 7px 7px',
                cursor: 'pointer',
                transition: 'background 0.04s',
                touchAction: 'none',
              }}
            >
              {midi % 12 === 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: 7,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'rgba(26,26,24,0.18)',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          ))}
        </div>

        {BLACK_KEYS.map(({ midi, left }) => (
          <div
            key={midi}
            {...keyProps(midi)}
            style={{
              position: 'absolute',
              top: 0,
              left: `${left}%`,
              width: `${BLACK_KEY_W}%`,
              height: '52%',
              background: active.has(midi) ? '#8F3E10' : '#C05218',
              borderRadius: '0 0 5px 5px',
              cursor: 'pointer',
              zIndex: 1,
              transition: 'background 0.04s',
              touchAction: 'none',
            }}
          />
        ))}
      </div>

      {/* Footer row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: "'MDUIXS', sans-serif",
          fontSize: 9,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(26,26,24,0.28)',
        }}>
          {status === 'idle'    ? 'Click a key to start' :
           status === 'loading' ? 'Loading engine...'    : 'Algo'}
        </span>

        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => changeAlgo(i)}
              disabled={status !== 'ready'}
              style={{
                width: 26,
                height: 26,
                border: 'none',
                borderRadius: '50%',
                background: algo === i && status === 'ready'
                  ? '#1A1A18'
                  : 'rgba(26,26,24,0.10)',
                color: algo === i && status === 'ready'
                  ? '#F0EDE5'
                  : 'rgba(26,26,24,0.28)',
                fontFamily: "'MDUIXS', sans-serif",
                fontSize: 9,
                letterSpacing: '0.04em',
                cursor: status === 'ready' ? 'pointer' : 'default',
                transition: 'background 0.10s, color 0.10s',
                opacity: status !== 'ready' ? 0.4 : 1,
                lineHeight: 1,
                boxShadow: algo !== i || status !== 'ready'
                  ? 'inset 0 -2px 0 rgba(0,0,0,0.10)'
                  : 'none',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
