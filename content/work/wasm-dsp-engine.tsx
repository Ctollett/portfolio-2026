import type { Section } from '@/components/WorkTOC'
import { LatencyScale } from '@/components/LatencyScale'
import { SynthKeyboard } from '@/components/SynthKeyboard'
import { FMWaveform } from '@/components/FMWaveform'

export const sections: Section[] = [
  { id: 'overview',   label: 'Overview' },
  { id: 'standard',   label: 'The Instrument Standard' },
  { id: 'latency',    label: 'The Latency Problem' },
  { id: 'character',  label: 'Sound Character' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'playability',  label: 'Playability' },
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
          audio worklet. It powers <a href="/work/tx-84" style={{ color: '#1A1A18', textDecoration: 'underline', textDecorationColor: 'rgba(26,26,24,0.25)', textUnderlineOffset: 3 }}>TX-84</a> but
          exists as a standalone layer, with the synthesis logic fully decoupled from
          the UI above it.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What was the motivation for building this as a separate,
              standalone engine rather than coupling it to TX-84? */}
        </p>
      </section>

      <section id="standard">
        <hr style={divider} />
        <p style={sectionLabel}>The Instrument Standard</p>
        <h2 style={sectionTitle}>What it needs to feel like.</h2>
        <p style={prose}>
          The two reference points were the <a href="https://usa.yamaha.com/products/contents/music_production/synth_chronology/modal/modal_dx7.html" target="_blank" rel="noopener noreferrer" style={{ color: '#1A1A18', textDecoration: 'underline', textDecorationColor: 'rgba(26,26,24,0.25)', textUnderlineOffset: 3 }}>Yamaha DX7</a> and
          the <a href="https://www.elektron.se/explore/digitone-ii" target="_blank" rel="noopener noreferrer" style={{ color: '#1A1A18', textDecoration: 'underline', textDecorationColor: 'rgba(26,26,24,0.25)', textUnderlineOffset: 3 }}>Elektron Digitone</a>.
          The DX7 defined what FM synthesis sounds like at its best: bright, complex, with a harmonic
          richness that additive and subtractive synthesis can't replicate. The Digitone made that
          character approachable. It took the same underlying math and wrapped it in controls that
          feel musical rather than mathematical. Both are FM instruments, but they feel completely
          different to play.
        </p>
        <p style={prose}>
          The goal wasn't to clone either one. It was to build a custom engine that starts from the
          same sonic foundation and adds free operator routing that neither instrument offers. The
          tonal character comes from the DX7's approach: true Phase Modulation, the same
          algorithm-based operator system, the same kind of harmonic complexity. The playability
          comes from the Digitone's philosophy: parameters that feel like musical decisions, not
          engineering ones.
        </p>
      </section>

      <section id="latency">
        <hr style={divider} />
        <p style={sectionLabel}>The Latency Problem</p>
        <h2 style={sectionTitle}>Why JavaScript isn't an option.</h2>
        <p style={prose}>
          Real-time audio synthesis demands processing in 128-sample blocks at 44.1kHz,
          roughly every 2.9 milliseconds. JavaScript running on the main thread competes
          with layout, paint, and garbage collection. Any interruption creates an audible
          glitch. For a synthesizer, that's not a degraded experience. It's a broken one.
        </p>
        <LatencyScale />
        <p style={prose}>
          The engine started as a JavaScript implementation. The latency issues showed up
          early, but the root cause wasn't that JS couldn't do the math. It was that JS
          couldn't do it consistently. Garbage collection, JIT deoptimizations, and runtime
          overhead meant the right code still produced glitches at unpredictable moments.
          At the scale of 8 voices with a full effects chain, per-operator envelopes, and
          LFO modulation running every 2.9 milliseconds, there was no margin for that
          unpredictability. Rust compiled to WASM removed it. No garbage collector in the
          audio loop, no JIT variance, just predictable near-native performance on every block.
        </p>
      </section>

      <section id="character">
        <hr style={divider} />
        <p style={sectionLabel}>Sound Character</p>
        <h2 style={sectionTitle}>The decisions that define the timbre.</h2>
        <p style={prose}>
          The engine uses true Phase Modulation rather than Frequency Modulation, the same
          distinction that defines the DX7's sound. In FM, the modulator shifts the carrier's
          frequency directly, and the effect scales with the time step, making the behavior
          sample-rate dependent. In PM, the modulator applies a phase offset at compute time:
          the carrier's phase register advances naturally, and the offset lands on top of it at
          the moment of synthesis. That distinction gives PM a characteristic brightness and
          harmonic consistency that FM approximations rarely match.
        </p>
        <FMWaveform />
        <p style={prose}>
          Routing determines the rest of the character. The four operators (one carrier and three
          modulators) can be arranged into eight preset algorithms or a fully custom routing matrix.
          A single modulator feeding the carrier produces clean bell tones and mallet sounds. Stack
          two in series and the spectral complexity layers: each operator adds its own harmonic
          weight to the signal, pushing the waveform from smooth to dense. A Digitone-inspired
          wavefolder on the output side extends this further, adding non-linear shaping that can
          harden the edge of any patch without reaching for an additional filter stage.
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
          audio block is processed. The Rust <code style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 13, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>Synth</code> struct
          is the single JS-facing boundary. Each call to <code style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 13, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>process_sample_array()</code> returns
          a <code style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 13, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>Float32Array</code> of 256 interleaved stereo samples per block,
          ready for the Web Audio graph. Parameter changes from the UI cross the thread
          boundary as messages and land directly on the Rust struct's setter methods.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What were the challenges of this architecture? The thread
              boundary, compiling Rust to WASM, passing the module to the worklet,
              anything that surprised you or took longer than expected? */}
        </p>
      </section>

      <section id="playability">
        <hr style={divider} />
        <p style={sectionLabel}>Playability</p>
        <h2 style={sectionTitle}>Engineering the feel of the keyboard.</h2>
        <p style={prose}>
          Polyphony, voice stealing, portamento, and pitch bend are all design decisions
          before they are engineering ones. The engine runs 8 voices. When all are held and
          a new note arrives, it steals the oldest — not the quietest, not the most
          recently triggered, the oldest — which preserves the character of what you're
          currently playing rather than dropping something unexpected. Portamento is
          legato-only: glide only activates when a note is played while another is held.
          Playing staccato snaps to pitch instantly. The behavior matches how a
          monophonic instrument with glide actually feels.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: How did these choices affect the feel of playing TX-84?
              Was there anything about the voice behavior you had to tune by feel
              rather than by spec? */}
        </p>
      </section>

      <section id="performance">
        <hr style={divider} />
        <p style={sectionLabel}>Performance</p>
        <h2 style={sectionTitle}>Hear it directly.</h2>
        <p style={prose}>
          The keyboard below runs the actual engine. One octave, a bell tone preset,
          eight algorithms to switch between. Each algorithm changes how the four operators
          route into each other, shifting the character from clear and harmonic to
          complex and metallic. The engine initializes on your first keypress.
        </p>
        <SynthKeyboard />
      </section>

    </div>
  )
}
