"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  { src: "/compressed-gallery/1.jpg", title: "Last Mile",     label: "Highway at dusk" },
  { src: "/compressed-gallery/2.jpg", title: "Blue Hour",     label: "Motel pool" },
  { src: "/compressed-gallery/3.jpg", title: "Still Morning", label: "Fog over the hills" },
  { src: "/compressed-gallery/4.jpg", title: "Intermission",  label: "Drive-in, off season" },
  { src: "/compressed-gallery/5.jpg", title: "Outside In",    label: "Rain on glass" },
  { src: "/compressed-gallery/6.jpg", title: "General",       label: "Afternoon light" },
  { src: "/compressed-gallery/7.jpg", title: "Off Season",    label: "Empty outfield" },
];

const N            = ITEMS.length;
const EXPANDED_H   = 400;
const COMPRESSED_H = 2;
const GAP          = 12;
const SCROLL_STEP  = 800;
const IMG_W        = 540;

function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function update(
  progress: number,
  itemRefs: (HTMLDivElement | null)[],
  imgRefs:  (HTMLImageElement | null)[],
  textRefs: (HTMLDivElement | null)[]
) {
  itemRefs.forEach((el, i) => {
    if (!el) return;
    const dist  = Math.abs(i - progress);
    const t     = Math.max(0, 1 - dist);
    const eased = ease(t);
    el.style.height = `${COMPRESSED_H + (EXPANDED_H - COMPRESSED_H) * eased}px`;

    const fadeT = Math.max(0, (eased - 0.4) / 0.6);
    const img   = imgRefs[i];
    const text  = textRefs[i];
    if (img)  img.style.opacity  = `${fadeT}`;
    if (text) text.style.opacity = `${fadeT}`;
  });
}

export default function CompressedGallery() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs     = useRef<(HTMLImageElement | null)[]>([]);
  const textRefs    = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.style.height = `${(N - 1) * SCROLL_STEP + window.innerHeight}px`;

    const lenis = new Lenis({
      duration: 2.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    update(0, itemRefs.current, imgRefs.current, textRefs.current);

    const st = ScrollTrigger.create({
      trigger: scroller,
      start:   "top top",
      end:     `+=${(N - 1) * SCROLL_STEP}`,
      scrub:   1,
      onUpdate: (self) => {
        update(self.progress * (N - 1), itemRefs.current, imgRefs.current, textRefs.current);
      },
    });

    return () => {
      st.kill();
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={scrollerRef} style={{ background: "var(--color-bg)" }}>
      <div style={{
        position:       "fixed",
        inset:          0,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
      }}>
        <div style={{
          display:       "flex",
          flexDirection: "column",
          gap:           GAP,
          alignItems:    "center",
        }}>
          {ITEMS.map((item, i) => (
            <div
              key={i}
              ref={(el) => { itemRefs.current[i] = el; }}
              style={{
                width:        IMG_W,
                height:       COMPRESSED_H,
                borderRadius: 3,
                flexShrink:   0,
                overflow:     "hidden",
                position:     "relative",
                background:   "#000",
              }}
            >
              <img
                ref={(el) => { imgRefs.current[i] = el; }}
                src={item.src}
                alt=""
                style={{
                  width:          "100%",
                  height:         EXPANDED_H,
                  objectFit:      "cover",
                  objectPosition: "center",
                  display:        "block",
                  opacity:        0,
                }}
              />
              <div
                ref={(el) => { textRefs.current[i] = el; }}
                style={{
                  position:   "absolute",
                  bottom:     0,
                  left:       0,
                  right:      0,
                  padding:    "24px 20px 18px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
                  opacity:    0,
                }}
              >
                <p style={{
                  fontFamily:    "'MDUIXS', sans-serif",
                  fontSize:      15,
                  fontWeight:    400,
                  color:         "#fff",
                  margin:        "0 0 4px",
                  letterSpacing: "0.02em",
                }}>
                  {item.title}
                </p>
                <p style={{
                  fontFamily:    "'MDUIXS', sans-serif",
                  fontSize:      9,
                  letterSpacing: "0.14em",
                  color:         "rgba(255,255,255,0.6)",
                  margin:        0,
                  textTransform: "uppercase",
                }}>
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
