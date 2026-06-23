const prose: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 14,
  lineHeight: 1.85,
  color: '#555559',
  margin: '0 0 20px',
};

const h2Style: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 10,
  fontWeight: 400,
  color: '#1A1A18',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  margin: '52px 0 16px',
};

const h3Style: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 9,
  fontWeight: 400,
  color: '#888884',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  margin: '32px 0 8px',
};

const codeBlockStyle: React.CSSProperties = {
  display: 'block',
  background: '#ECEAE3',
  borderRadius: 6,
  padding: '16px 20px',
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 12,
  lineHeight: 1.7,
  color: '#2A2A28',
  margin: '16px 0 24px',
  overflowX: 'auto',
  whiteSpace: 'pre',
};

const noteStyle: React.CSSProperties = {
  fontFamily: "'MDUIXS', sans-serif",
  fontSize: 12,
  lineHeight: 1.7,
  color: '#888884',
  fontStyle: 'italic',
  borderLeft: '2px solid #D8D4CC',
  paddingLeft: 16,
  margin: '0 0 24px',
};

export default function InteractionConcept() {
  return (
    <>
      <p style={prose}>
        For this concept, the screen acts as a 'lens.' Cards appear sharp in the middle and refract towards the edges, warping and distorting as they scroll in and out of focus, like light bending at the curvature of glass.
      </p>

      <h2 style={h2Style}>Initial Problems</h2>

      <h3 style={h3Style}>CSS can't handle lens distortion accurately</h3>
      <p style={prose}>
        I originally went to CSS in an attempt to replicate the lens distortion effect, but ultimately found that <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>filter: blur()</code> and perspective transforms led to less realistic results. The technique requires warping individual vertices, splitting color channels and applying radial distortion that are just unavailable with only CSS.
      </p>

      <h3 style={h3Style}>DOM + WebGL sync</h3>
      <p style={prose}>
        Moving over to WebGL resulted in a more realistic effect, but this now introduces two separate rendering systems that have no awareness of each other. I needed a way to keep the WebGL meshes in sync with the DOM cards on every frame without the two systems drifting apart.
      </p>

      <h2 style={h2Style}>Core Solution</h2>
      <p style={prose}>
        DOM cards act as invisible layout placeholders. Three.js meshes render on top, synced to DOM positions each frame via <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>getBoundingClientRect()</code>. A two-pass render loop prevents layout thrash. Lenis handles smooth scroll, feeding a continuous float position to the shader. Ghost card padding keeps the infinite scroll boundary seamless. The active card drives a metadata transition with title, year and accent color updating as each card comes into focus.
      </p>
      <p style={prose}>
        The shader math for the lens distortion and chromatic aberration required a lot of precise iteration. I used Claude Code as a collaborator to work through the calculations and refine the effect. The creative direction and interaction design were mine, but having AI help with the shader logic specifically made the process much faster and more accurate to what I was envisioning.
      </p>

      <h2 style={h2Style}>DOM + Three.js Hybrid Approach</h2>
      <p style={prose}>
        This hybrid approach is the foundation of the effect. Without it, the DOM and Three.js mesh would not be in sync. The lens distortion would fire at the wrong position and break the illusion that the card itself is warping.
      </p>
      <code style={codeBlockStyle}>{`// DOM card
<Image style={{ visibility: "hidden" }} />

// WebGL mesh reads that position each frame
const rect = el.getBoundingClientRect();
mesh.position.set(
  rect.left + rect.width / 2 - window.innerWidth / 2,
  -(rect.top + rect.height / 2 - vh / 2),
  0
);`}</code>
      <p style={prose}>
        In this approach, I set a DOM element to <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>visibility: hidden</code>. This is simply to maintain the position and dimensions of the card in the DOM so that the WebGL mesh can use <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>getBoundingClientRect()</code> to retrieve the data and accurately render on top of the DOM 'ghost' element.
      </p>
      <p style={noteStyle}>
        Why use <code style={{ fontFamily: 'monospace', fontSize: 11 }}>visibility: hidden</code> rather than <code style={{ fontFamily: 'monospace', fontSize: 11 }}>display: none</code>? Setting the visibility to hidden ensures that the element is still available in the DOM and can be accessed by getBoundingClientRect().
      </p>

      <h2 style={h2Style}>The Two-Pass Render Loop</h2>

      <h3 style={h3Style}>Pass One</h3>
      <code style={codeBlockStyle}>{`for (let i = 0; i < PADDED.length; i++) {
  const el = outerRefs.current[i];
  if (!el) continue;
  const dist = Math.abs(i - floatIndex);
  const offset = (i - floatIndex) * cardStep;
  const s = 1 - Math.min(dist, 1) * 0.05;
  const o = Math.max(0, 1 - Math.min(dist, 2) * 0.3);
  el.style.transform = \`translateY(\${offset.toFixed(1)}px) scale(\${s.toFixed(3)})\`;
  el.style.opacity = o.toFixed(3);
  el.style.zIndex = String(Math.round(100 - dist * 10));
}`}</code>
      <p style={prose}>
        Pass one serves to write all of the transforms on the hidden 'ghost' images in a batch. These transforms include position, scale, opacity and z-index. These elements never become visible but their layout can still be calculated by the browser and read by the WebGL mesh in a second pass.
      </p>

      <h3 style={h3Style}>Pass Two</h3>
      <code style={codeBlockStyle}>{`for (let i = 0; i < PADDED.length; i++) {
  const el = outerRefs.current[i];
  if (!el) continue;

  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2 - window.innerWidth / 2;
  const cy = -(rect.top + rect.height / 2 - vh / 2);

  const mesh = meshes[i];
  mesh.visible = true;
  mesh.position.set(cx, cy, 0);
  mesh.scale.set(rect.width / CARD_W, rect.height / CARD_H, 1);
  const u = (mesh.material as THREE.ShaderMaterial).uniforms;
  u.uOpacity.value = o;
  u.uDistFromCenter.value = cy / (vh / 2);
}`}</code>
      <p style={prose}>
        This second pass reads the settled DOM positions using <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>getBoundingClientRect()</code> and uses them to position the WebGL meshes.
      </p>
      <p style={noteStyle}>
        There's an important conversion here. <code style={{ fontFamily: 'monospace', fontSize: 11 }}>getBoundingClientRect()</code> returns coordinates from the top-left of the viewport, but Three.js measures from the center with Y flipped. cx and cy provide a conversion by offsetting half the viewport and negating Y to bridge the two systems.
      </p>

      <h2 style={h2Style}>Smooth Scroll with Lenis</h2>
      <code style={codeBlockStyle}>{`const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

lenis.on("scroll", (e) => {
  scroll = e.scroll;
});

const rawFloat = ((scroll / sectionH) % CARDS.length + CARDS.length) % CARDS.length;
const floatIndex = rawFloat + PADDING;`}</code>
      <p style={prose}>
        Lenis Smooth Scroll is primarily used in conjunction with infinite scroll logic to create the smooth, infinite scroll effect. Without Lenis, the cards would simply snap between positions while scrolling.
      </p>
      <p style={prose}>
        The smoothed scroll value is converted into a continuous decimal card index via <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>rawFloat</code>. The scroll position is divided by <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>sectionH</code> to convert from pixels into card units, with modulo wrapping to loop infinitely. To prevent a visible jump at the scroll boundary, I padded the card array with ghost copies — the last 3 cards prepended and the first 3 appended so there are always real cards visible on both sides when the index wraps.
      </p>

      <h2 style={h2Style}>The Lens Shader</h2>
      <p style={prose}>
        This effect, which uses a combination of vertex and fragment shaders, was where I leaned on Claude Code most heavily. The shader math — particularly the barrel distortion coefficient and chromatic aberration split — required a lot of precise iteration to achieve a realistic lens effect.
      </p>

      <h3 style={h3Style}>Vertex Shader — The physical warping of the card mesh</h3>
      <code style={codeBlockStyle}>{`float raw = smoothstep(0.6, 1.0, abs(uDistFromCenter));
float lens = raw;

float xFlare = 0.6 + t * t * 2.6;
pos.x += sign(n.x + 0.0001) * lens * abs(n.x) * xFlare * HW;
pos.y += dir * lens * t * t * HH * 1.2;`}</code>
      <p style={prose}>
        The vertex shader uses <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>uDistFromCenter</code> to push the mesh vertices outward. The smoothstep ensures the effect only kicks in when the card is 60% or more from the center, so cards near focus are completely unaffected. <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>xFlare</code> pushes the left and right edges outward with a quadratic curve, accelerating toward the screen boundary. <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>pos.y</code> stretches the entry edges as the card scrolls in.
      </p>

      <h3 style={h3Style}>Fragment Shader — The visual effects on the card</h3>
      <code style={codeBlockStyle}>{`// Barrel distortion
float barrel = 1.0 + lens * 14.0 * r * r;

// Chromatic aberration
float chroma = lens * 1.1;
vec2 uvR = c / vec2(aspect, 1.0) * (barrel + chroma) + 0.5;
vec2 uvB = c / vec2(aspect, 1.0) * (barrel - chroma) + 0.5;

// Specular highlight
float highlight = (1.0 - smoothstep(0.0, 0.28, length(hlPos))) * lens * 1.0;`}</code>
      <p style={prose}>
        The fragment shader handles three distinct visual effects on the warped surface.
      </p>
      <p style={prose}>
        Barrel distortion warps the UV coordinates radially outward, making the image bulge like it's being viewed through curved glass. Chromatic aberration samples the R, G and B channels from slightly different UV positions — this creates the pink/teal fringe colors at the edges. The specular highlight adds a soft white glow near the top of the card that fades in as the lens fires, simulating light catching the surface of glass.
      </p>

      <h2 style={h2Style}>The Metadata Transition</h2>
      <code style={codeBlockStyle}>{`if (newActive !== lastActive) {
  lastActive = newActive;
  titleRef.current.textContent = CARDS[newActive].title;
  titleRef.current.style.color = CARDS[newActive].color;
  yearRef.current.textContent = CARDS[newActive].label;
}

const newActive = Math.round(rawFloat) % CARDS.length;`}</code>
      <p style={prose}>
        The active state of the cards is derived from <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#ECEAE3', padding: '1px 5px', borderRadius: 3 }}>Math.round(rawFloat) % CARDS.length</code> — meaning that while rawFloat crosses the 0.5 midpoint between two cards, the active state is updated and the respective card metadata is displayed. This ensures that the metadata matches the active card throughout the scrolling action.
      </p>
      <p style={noteStyle}>
        The <code style={{ fontFamily: 'monospace', fontSize: 11 }}>newActive !== lastActive</code> guard ensures that the DOM only updates once when the card changes rather than every frame. This keeps the effect performant — the code isn't running 60 times per second creating unnecessary repaints.
      </p>

      <h2 style={h2Style}>Closing Thoughts on Process</h2>
      <p style={prose}>
        Overall I'm very happy with how the effect turned out and I feel this implementation represents my process accurately. When building interactions like this, I focus on owning the creative direction and implementation while using AI tools like Claude Code to push the quality of execution. This is particularly useful in areas like shader math where precision matters more than intuition. The ability to prompt and iterate during the visual design stage made all the difference.
      </p>
      <p style={prose}>
        Moving forward, I plan to keep refining this piece. The feedback after posting it was really encouraging and I'd like to build a second iteration based on what people responded to most.
      </p>
    </>
  );
}
