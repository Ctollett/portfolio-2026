# Colton Tollett: Portfolio (2026)

Personal portfolio site, built with Next.js.

## Overview

The site is organized into a few sections:

- **Work**: case studies, including [ruun](https://github.com/Ctollett/ruun-svg) (spring-physics SVG morphing), [TX-84](https://github.com/Ctollett/TX-84) (Rust/WASM FM synthesizer), and a WASM DSP engine
- **Lab**: a live showcase of interaction and motion experiments (3D carousels, parallax, generative canvases, and more), pulled from [design-lab](https://github.com/Ctollett/design-lab)
- **Writing**: short articles and interaction concepts
- **Wasm preview**: an in-browser demo running a WebAssembly audio engine
- **About**: bio and background

## Tech stack

- **Framework**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Motion**: Framer Motion, Lenis (smooth scroll)
- **3D**: Three.js, React Three Fiber + Drei
- **SVG animation**: [ruun](https://github.com/Ctollett/ruun-svg), a custom spring-physics morphing library
- **Code display**: Shiki, Prism React Renderer
- **Typography**: opentype.js

## Development

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # run production build
```
