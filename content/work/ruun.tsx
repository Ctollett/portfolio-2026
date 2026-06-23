import type { Section } from '@/components/WorkTOC'

export const sections: Section[] = [
  { id: 'overview',    label: 'Overview' },
  { id: 'the-feel',   label: 'The Feel' },
  { id: 'spring',     label: 'Spring, Not Tween' },
  { id: 'api',        label: 'API Design' },
  { id: 'internals',  label: 'Under the Hood' },
  { id: 'in-the-wild', label: 'In the Wild' },
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

export default function RuunContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>

      <section id="overview">
        <hr style={divider} />
        <p style={sectionLabel}>Overview</p>
        <h2 style={sectionTitle}>SVG morphing with physical weight.</h2>
        <p style={prose}>
          Ruun is a small JavaScript library for morphing between SVG paths using spring
          physics. The premise: most SVG animation libraries treat path morphing as a
          timing function — start here, end there, ease in-out. Ruun treats it as a
          physical simulation. The result feels different in a way that's immediately
          noticeable but difficult to articulate.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What made you build this? What problem were existing tools not solving? */}
        </p>
      </section>

      <section id="the-feel">
        <hr style={divider} />
        <p style={sectionLabel}>The Feel</p>
        <h2 style={sectionTitle}>What you're designing for.</h2>
        <p style={prose}>
          {/* YOUR TEXT: Describe the feeling you were after. What does "weight" or "momentum"
              mean in the context of SVG path transitions? What reference points were you
              drawing from — physical objects, other interfaces, something else? */}
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What does a spring-morphed icon feel like vs a tweened one?
              How do you explain that to someone who hasn't felt it? */}
        </p>
      </section>

      <section id="spring">
        <hr style={divider} />
        <p style={sectionLabel}>Spring, Not Tween</p>
        <h2 style={sectionTitle}>The design decision at the center of everything.</h2>
        <p style={prose}>
          A tween moves a value from A to B over a fixed duration. A spring moves
          toward a target with velocity and damping — it can overshoot, oscillate, and
          settle. That difference is what makes spring-based animation feel physical:
          the motion is a response to force, not a playback of a curve.
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What does this mean specifically for SVG paths? Each point on
              the path can spring independently. Walk through why that matters. */}
        </p>
        <p style={prose}>
          {/* YOUR TEXT: Were there tradeoffs? Cases where a spring is wrong and a tween
              is right? */}
        </p>
      </section>

      <section id="api">
        <hr style={divider} />
        <p style={sectionLabel}>API Design</p>
        <h2 style={sectionTitle}>One function. Three parameters.</h2>
        <p style={prose}>
          {/* YOUR TEXT: Walk through the API surface. What does morph() take? How did
              you land on this interface? What did earlier versions look like and why
              did you simplify? */}
        </p>
        <p style={prose}>
          {/* YOUR TEXT: What constraints shaped the API — performance, ergonomics,
              composability with React/Vue/vanilla JS? */}
        </p>
      </section>

      <section id="internals">
        <hr style={divider} />
        <p style={sectionLabel}>Under the Hood</p>
        <h2 style={sectionTitle}>How the spring math works.</h2>
        <p style={prose}>
          {/* YOUR TEXT: Explain the spring simulation — stiffness, damping, mass.
              How are SVG path commands decomposed into interpolatable values?
              How are paths with different numbers of commands handled? */}
        </p>
        <p style={prose}>
          {/* YOUR TEXT: Any interesting engineering decisions — frame loop, path
              normalization, handling edge cases like paths with different topologies? */}
        </p>
      </section>

      <section id="in-the-wild">
        <hr style={divider} />
        <p style={sectionLabel}>In the Wild</p>
        <h2 style={sectionTitle}>Where it shows up.</h2>
        <p style={prose}>
          {/* YOUR TEXT: Where is ruun used? The portfolio back button, the resume
              download→check morph, any other places. What does it feel like in context
              vs in isolation? */}
        </p>
      </section>

    </div>
  )
}
