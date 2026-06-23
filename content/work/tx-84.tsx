import type { Section } from '@/components/WorkTOC'

export const sections: Section[] = [
  { id: 'overview',        label: 'Overview' },
  { id: 'visual-language', label: 'Instrument, Not Plugin' },
  { id: 'the-canvas',      label: 'The Canvas' },
  { id: 'distance',        label: 'Distance as Modulation' },
  { id: 'physics',         label: 'Physics' },
  { id: 'the-engine',      label: 'The Engine' },
  { id: 'waveform',        label: 'Waveform as Feedback' },
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

export default function TX84Content() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>

      <section id="overview">
        <hr style={divider} />
        <p style={sectionLabel}>Overview</p>
        <h2 style={sectionTitle}>FM synthesis, made spatial.</h2>
        <p style={prose}>
          TX-84 is a polyphonic FM synthesizer that runs entirely in the browser.
          FM synthesis is notoriously difficult to control intuitively — the relationship
          between operators, ratios, and modulation depths is usually expressed as a
          matrix of numbers. Most musicians spend years developing an intuition for it.
          TX-84 asks whether that abstraction can be made physical.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: Describe what TX-84 feels like to use. What's the first thing someone experiences when they open it? */}
        </p>
      </section>

      <section id="visual-language">
        <hr style={divider} />
        <p style={sectionLabel}>Instrument, Not Plugin</p>
        <h2 style={sectionTitle}>The visual direction.</h2>
        <p style={prose}>
          {/* YOUR TEXT: Walk through your moodboard and the visual directions you explored.
              What were you referencing? Hardware modulars, oscilloscope displays, something else?
              What did you land on and why did it matter for how the interface reads? */}
        </p>
        <p style={prose}>
          {/* YOUR TEXT: Color decisions — why each operator has a distinct color, what that
              communicates about routing and identity. Typography choices. */}
        </p>
        {/* MOODBOARD IMAGES: Add image components here */}
      </section>

      <section id="the-canvas">
        <hr style={divider} />
        <p style={sectionLabel}>The Canvas</p>
        <h2 style={sectionTitle}>A routing system you draw by hand.</h2>
        <p style={prose}>
          Rather than a fixed algorithm selector or a modulation matrix, TX-84 uses a
          freeform canvas where FM operators are draggable nodes. You define the routing
          structure by drawing connections between them — dragging from one operator to
          another to establish a modulator-carrier relationship.
        </p>
        <p style={prose}>
          The connection pattern you draw is matched in real time against a set of
          known FM algorithms. The interface doesn't force you into a preset topology —
          you arrive at one organically, by exploring.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What was difficult about designing this canvas? What did you try
              that didn't work? Any specific layout decisions worth mentioning? */}
        </p>
      </section>

      <section id="distance">
        <hr style={divider} />
        <p style={sectionLabel}>Distance as Modulation</p>
        <h2 style={sectionTitle}>Proximity is the control.</h2>
        <p style={prose}>
          The central design decision in TX-84 is that the physical distance between
          connected operators on the canvas directly controls modulation depth. Drag two
          operators together and the modulation deepens. Pull them apart and it fades.
          A parameter that's usually a number becomes something you navigate with your hands.
        </p>
        <p style={prose}>
          The mapping uses an exponential decay function: depth = 127 × e^(−distance / k).
          The exponential curve was a deliberate choice — linear distance felt too mechanical.
          The exponential makes the transition feel more like the way acoustic resonance
          behaves: intense up close, falling off quickly with distance.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What led you to this idea? Was there a moment where this clicked
              as the right approach? What did earlier versions of this interaction look like? */}
        </p>
      </section>

      <section id="physics">
        <hr style={divider} />
        <p style={sectionLabel}>Physics</p>
        <h2 style={sectionTitle}>The routing has weight.</h2>
        <p style={prose}>
          Connected operators don't move independently. When you drag one, its connections
          apply spring forces to their neighbors — each connected node gets pulled along,
          decelerating and settling with a velocity-damped physics simulation.
        </p>
        <p style={prose}>
          This wasn't just an aesthetic decision. Because distance controls modulation depth,
          you're constantly making micro-adjustments to the sound by repositioning operators.
          The spring behavior means those adjustments propagate through the routing graph —
          moving one operator subtly shifts the modulation relationships of everything connected to it.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What does the physics add to the experience? How does it change
              the way you interact with the routing versus a static drag? */}
        </p>
      </section>

      <section id="the-engine">
        <hr style={divider} />
        <p style={sectionLabel}>The Engine</p>
        <h2 style={sectionTitle}>Rust, compiled to WebAssembly, on a dedicated audio thread.</h2>
        <p style={prose}>
          The synthesis itself is written in Rust — a full polyphonic FM engine with per-voice
          operators, ADSR envelopes, LFO, filter, and effects. It compiles to WebAssembly and
          loads into an AudioWorklet processor, running on the browser's dedicated audio thread
          entirely separate from the main thread and render loop.
        </p>
        <p style={prose}>
          JavaScript is not fast enough for real-time polyphonic FM synthesis at 44.1kHz without
          risking audio dropouts. WASM running inside an AudioWorklet eliminates that constraint.
          The audio thread processes in 128-sample blocks, communicating with the UI thread
          via a message channel for parameter changes.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What was the hardest part of the engine architecture?
              Any specific decisions about the Rust module structure worth mentioning?
              What does running synthesis in Rust enable that JS couldn't? */}
        </p>
      </section>

      <section id="waveform">
        <hr style={divider} />
        <p style={sectionLabel}>Waveform as Feedback</p>
        <h2 style={sectionTitle}>Watch the modulation happen.</h2>
        <p style={prose}>
          Each operator node in the canvas draws its current output waveform in real time —
          including the effect of any incoming modulation. Move two operators closer together
          and you can watch the carrier waveform distort as the modulation depth increases.
          The visual feedback makes an invisible process legible.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: How did you implement the real-time waveform rendering?
              What does this add to the experience of using the synth? */}
        </p>
      </section>

    </div>
  )
}
