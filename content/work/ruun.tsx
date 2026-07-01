import type { Section } from '@/components/WorkTOC'
import { RuunDemo } from '@/components/RuunDemo'
import { ArticleLink } from '@/components/ArticleLink'
import { TweenVsSpring } from '@/components/TweenVsSpring'
import { SpringGraph } from '@/components/SpringGraph'

export const sections: Section[] = [
  { id: 'overview',    label: 'Overview' },
  { id: 'the-feel',   label: 'The Feel' },
  { id: 'spring',     label: 'Spring, Not Tween' },
  { id: 'api',        label: 'API Design' },
  { id: 'internals',  label: 'Under the Hood' },
  { id: 'playground', label: 'Playground' },
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

      <div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(26,26,24,0.05)',
          borderRadius: 6,
          padding: '9px 14px',
        }}>
          <span style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 11, color: '#888884', letterSpacing: '0.04em' }}>$</span>
          <span style={{ fontFamily: "'MDUIXS', sans-serif", fontSize: 11, color: '#1A1A18', letterSpacing: '0.04em' }}>npm install getruun</span>
        </div>
        <ArticleLink href="https://www.npmjs.com/package/getruun" label="View on npm" variant="chevron" />
      </div>

      <section id="overview">
        <hr style={divider} />
        <p style={sectionLabel}>Overview</p>
        <h2 style={sectionTitle}>SVG morphing with physical weight.</h2>
        <p style={prose}>
          Ruun is a small JavaScript library for morphing between any two SVG paths using <strong>spring physics</strong>. Most SVG animation libraries treat path morphing as a timing function: a start point, an end point, and a deterministic easing curve. Ruun treats it as a physical simulation. The result feels less mechanical and brings life to SVGs in a noticeable but difficult to articulate way.
        </p>
      </section>

      <section id="the-feel">
        <hr style={divider} />
        <p style={sectionLabel}>The Feel</p>
        <h2 style={sectionTitle}>What you're designing for.</h2>
        <p style={prose}>
          Despite their subtlety, tiny micro-interactions like SVG morphs have an outsized impact on the overall feel of an interface. Most are handled as deterministic, point-to-point transitions. This robotic quality, while functional, leaves motion feeling like a value being updated rather than something actually moving organically.
        </p>
        <p style={prose}>
          The rise of AI tools has created a subtle pressure to humanize interfaces. Products built around natural, conversational language need motion to match. Just as that tone creates an almost invisible sense of familiarity, the micro-interactions surrounding it must carry the same quality.
        </p>
      </section>

      <section id="spring">
        <hr style={divider} />
        <p style={sectionLabel}>Spring, Not Tween</p>
        <h2 style={sectionTitle}>The design decision at the center of everything.</h2>
        <p style={prose}>
          That organic quality has a specific cause. A tween interpolates a value from A to B over a fixed duration. The path is predetermined, the outcome certain before the animation starts. A spring moves toward a target with velocity and damping. It can overshoot, oscillate, and settle. The motion is a response to force, not a playback of a curve.
        </p>
        <p style={prose}>
          In an SVG morph, every coordinate point on the path springs independently toward its target. Different parts of the shape settle at different rates, and that unevenness is where the organic quality lives.
        </p>
        <TweenVsSpring />
      </section>

      <section id="api">
        <hr style={divider} />
        <p style={sectionLabel}>API Design</p>
        <h2 style={sectionTitle}>One function. Three parameters.</h2>
        <p style={prose}>
          The API surface is intentionally minimal. <code style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 13, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>morphSvg</code> takes a container, a target SVG string, and optionally a spring config. The config accepts either a raw <code style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 13, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>{'{ stiffness, damping, mass }'}</code> object or a named preset. No keyframes, no timelines, no animation IDs to track. Pass in what you want the shape to become and how you want it to feel. Calling <code style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 13, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>morphSvg</code> mid-animation retargets smoothly. Velocity is inherited, so motion stays continuous no matter when you trigger it.
        </p>
        <code style={{
          display: 'block',
          background: '#ECEAE3',
          borderRadius: 6,
          padding: '16px 20px',
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 12,
          lineHeight: 1.7,
          color: '#2A2A28',
          whiteSpace: 'pre',
          margin: '0 0 20px',
        }}>{`import { initMorphSvg, morphSvg } from 'getruun'

const container = document.querySelector('svg')

initMorphSvg(container, fromSvg)

morphSvg(container, toSvg, { stiffness: 200, damping: 20, mass: 1 })`}</code>
      </section>

      <section id="internals">
        <hr style={divider} />
        <p style={sectionLabel}>Under the Hood</p>
        <h2 style={sectionTitle}>How the spring math works.</h2>
        <p style={prose}>
          Each frame, the spring simulation computes one step of Euler integration. Stiffness controls how hard the spring pulls toward its target. Damping controls how much force resists the current velocity. Mass controls inertia, making the shape feel heavier or lighter in response to those forces. The output of each step feeds directly into the next, and that feedback loop is what produces overshoot and organic settle.
        </p>
        <code style={{
          display: 'block',
          background: '#ECEAE3',
          borderRadius: 6,
          padding: '16px 20px',
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 12,
          lineHeight: 1.7,
          color: '#2A2A28',
          whiteSpace: 'pre',
          margin: '0 0 20px',
        }}>{`function stepSpring(config, state, dt) {
  const displacement = state.position - state.target
  const springForce  = -config.stiffness * displacement
  const dampingForce = -config.damping * state.velocity
  const acceleration = (springForce + dampingForce) / config.mass
  const velocity     = state.velocity + acceleration * dt
  const position     = state.position + velocity * dt
  return { position, velocity }
}`}</code>
        <SpringGraph />
        <p style={{ ...prose, marginTop: 32 }}>
          Before any spring math can run, the two paths need to be in the same form. SVG paths can contain a mix of commands: lines, arcs, quadratic curves, shorthand variants. Ruun converts all of it to absolute cubic bezier segments. Then both shapes get resampled to the same number of points, spaced evenly by arc length rather than by parameter value, so points distribute evenly around the actual perimeter of each shape. For closed paths, a best-fit alignment pass cycles through all possible starting offsets and picks the rotation that minimizes total displacement between corresponding points. That last step is what keeps a circular morph from spinning instead of just scaling.
        </p>
      </section>

      <section id="playground">
        <hr style={divider} />
        <p style={sectionLabel}>Playground</p>
        <h2 style={sectionTitle}>Try it yourself.</h2>
        <p style={prose}>
          Each preset changes the three physics parameters: stiffness, damping, and mass.
          Click through them on the star and you'll feel the difference immediately. Gentle
          eases in slowly with no overshoot; wobbly overshoots and oscillates before
          settling. The icon grid uses the smooth preset by default. Click fast across
          several icons to see velocity inherited mid-animation.
        </p>
        <RuunDemo />
      </section>

    </div>
  )
}
