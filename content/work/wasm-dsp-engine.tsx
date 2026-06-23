import type { Section } from '@/components/WorkTOC'

export const sections: Section[] = [
  { id: 'overview',     label: 'Overview' },
  { id: 'latency',      label: 'The Latency Problem' },
  { id: 'rust',         label: 'Rust as DSP Language' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'modules',      label: 'DSP Modules' },
  { id: 'performance',  label: 'Performance' },
]

const prose: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 14,
  lineHeight: 1.85,
  color: '#555559',
  margin: '0 0 20px',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 8,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#888884',
  margin: '0 0 16px',
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 20,
  letterSpacing: '0.04em',
  color: '#1A1A18',
  margin: '0 0 24px',
  lineHeight: 1.3,
}

const divider: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid rgba(26,26,24,0.08)',
  margin: '0 0 64px',
}

export default function WasmDspContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>

      <section id="overview">
        <hr style={divider} />
        <p style={sectionLabel}>Overview</p>
        <h2 style={sectionTitle}>Real-time FM synthesis, entirely in the browser.</h2>
        <p style={prose}>
          The WASM DSP Engine is a polyphonic FM synthesis engine written in Rust,
          compiled to WebAssembly, and designed to run in real time inside a browser
          audio worklet. It powers TX-84 but exists as a standalone layer — the synthesis
          logic is fully decoupled from the UI above it.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What was the motivation for building this as a separate,
              standalone engine rather than coupling it to TX-84? */}
        </p>
      </section>

      <section id="latency">
        <hr style={divider} />
        <p style={sectionLabel}>The Latency Problem</p>
        <h2 style={sectionTitle}>Why JavaScript isn't an option.</h2>
        <p style={prose}>
          Real-time audio synthesis demands processing in 128-sample blocks at 44.1kHz —
          roughly every 2.9 milliseconds. JavaScript running on the main thread competes
          with layout, paint, and garbage collection. Any interruption creates an audible
          glitch. For a synthesizer, that's not a degraded experience — it's a broken one.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: Did you try a JS-based approach first? What did the failure
              mode look like in practice? When did you decide WASM was the path? */}
        </p>
      </section>

      <section id="rust">
        <hr style={divider} />
        <p style={sectionLabel}>Rust as DSP Language</p>
        <h2 style={sectionTitle}>Why Rust, specifically.</h2>
        <p style={prose}>
          {/* YOUR TEXT: What made Rust the right choice for the DSP layer? Performance,
              WASM compilation target, memory safety, something else? Were there other
              candidates (C, C++, AssemblyScript)? */}
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What was the experience of writing DSP code in Rust?
              Any specific language features that were particularly useful? */}
        </p>
      </section>

      <section id="architecture">
        <hr style={divider} />
        <p style={sectionLabel}>Architecture</p>
        <h2 style={sectionTitle}>Two threads, one message channel.</h2>
        <p style={prose}>
          The engine runs entirely on the browser's dedicated audio thread, inside an
          AudioWorkletProcessor. The WASM module is compiled on the main thread, passed
          to the worklet via its processor options, and initialized before the first
          audio block is processed. Parameter changes from the UI are sent as messages
          across the thread boundary.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What were the challenges of this architecture? Message latency,
              state synchronization between threads, anything that surprised you? */}
        </p>
      </section>

      <section id="modules">
        <hr style={divider} />
        <p style={sectionLabel}>DSP Modules</p>
        <h2 style={sectionTitle}>What the engine includes.</h2>
        <p style={prose}>
          {/* YOUR TEXT: Walk through the module structure — oscillators, envelopes
              (ADSR, mod envelope), LFO, filter, effects (delay, reverb, chorus),
              polyphony, voice management. What was interesting or difficult about
              any of these? */}
        </p>
        <p style={prose}>
          {/* YOUR TEXT: Any specific DSP techniques worth calling out?
              The FM algorithm matching, feedback handling, anything else? */}
        </p>
      </section>

      <section id="performance">
        <hr style={divider} />
        <p style={sectionLabel}>Performance</p>
        <h2 style={sectionTitle}>What running in WASM actually unlocks.</h2>
        <p style={prose}>
          {/* YOUR TEXT: What performance characteristics does the engine have?
              How many voices? What's the CPU profile? How does it compare to
              what's possible in JS? What does this performance ceiling enable
              that wasn't possible before? */}
        </p>
      </section>

    </div>
  )
}
