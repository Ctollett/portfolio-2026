export interface LabItem {
  id:           number
  number:       string
  slug:         string
  title:        string
  description:  string
  date:         string
  iframeUrl:    string   // kept for API compat — now a local route
  codeUrl:      string
  previewVideo?: string
}

const labs: Omit<LabItem, 'id' | 'number' | 'iframeUrl'>[] = [
  { slug: 'card-lift',               title: 'Card Lift',        description: 'Infinite scroll carousel with Three.js cloth physics',              date: '2026-06-11', codeUrl: '', previewVideo: '/previews/card-lift.mp4' },
  { slug: 'image-cube',              title: 'Image Cube',       description: '3D architecture gallery cube with scroll, drag, and category flip', date: '2026-06-16', codeUrl: '', previewVideo: '/previews/image-cube.mp4' },
  { slug: 'image-filter',            title: 'Image Filter',     description: 'Adjust button that expands into a filter panel with spring sliders', date: '2026-06-21', codeUrl: '', previewVideo: '/previews/image-filter.mp4' },
  { slug: 'infinite-canvas',         title: 'Infinite Canvas',  description: 'Three.js depth grid with waterbed squish physics',                  date: '2026-05-23', codeUrl: '', previewVideo: '/previews/infinite-canvas.mp4' },
  { slug: 'marginalia',              title: 'Marginalia',       description: 'Citation reader with drag-to-flip card stack',                      date: '2026-05-23', codeUrl: '', previewVideo: '/previews/marginalia.mp4' },
  { slug: '3d-carousel',             title: '3D Carousel',      description: 'Iridescent B&W film carousel with wave physics',                    date: '2026-05-28', codeUrl: '', previewVideo: '/previews/3d-carousel.mp4' },
  { slug: 'pull-up-footer',          title: 'Pull-Up Footer',   description: 'Scroll-reveal footer with film grain and SVG morph',                date: '2026-05-30', codeUrl: '', previewVideo: '/previews/pull-up-footer.mp4' },
  { slug: 'parallax-lens',           title: 'Parallax Lens',    description: 'Biome scroll with refracted glass orbs',                            date: '2026-05-18', codeUrl: '', previewVideo: '/previews/parallax-lens.mp4' },
  { slug: 'card-shelf',              title: 'Card Shelf',       description: 'Portrait cards scrolling horizontally with lava lamp blob reveal',   date: '2026-05-12', codeUrl: '', previewVideo: '/previews/card-shelf.mp4' },
  { slug: 'single-card-image-focus', title: 'Single Card',      description: 'WebGL lens refraction carousel with single card focus',             date: '2026-05-11', codeUrl: '', previewVideo: '/previews/single-image.mp4' },
  { slug: 'spatial-scrubber',        title: 'Spatial Scrubber', description: 'Distance-based audio scrub with liquid blob handle',                date: '2026-05-15', codeUrl: '', previewVideo: '/previews/spacial-scrubber.mp4' },
]

export function getLabItems(): LabItem[] {
  return labs.map((lab, i) => ({
    ...lab,
    id:       i + 1,
    number:   String(i + 1).padStart(3, '0'),
    iframeUrl: `/lab/${lab.slug}`,
  }))
}
