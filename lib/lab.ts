const LAB_BASE_URL = 'https://design-lab-lilac.vercel.app'

export interface LabItem {
  id: number
  number: string
  slug: string
  title: string
  description: string
  date: string
  iframeUrl: string
  codeUrl: string
  previewVideo?: string
  posterImage?: string
}

interface LabManifest {
  repo: string
  labs: {
    slug: string
    title: string
    description: string
    date: string
    codeFile: string
    previewVideo?: string
    posterImage?: string
  }[]
}

const LAB_ORDER = [
  'dot-grid',
  'card-lift',
  'image-cube',
  '3d-carousel',
  'pull-up-footer',
  'parallax-lens',
  'card-shelf',
  'infinite-canvas',
  'marginalia',
  'ruun-showcase',
  'single-card-image-focus',
  'spatial-scrubber',
  'font-flare',
  'command-menu',
  'dropdown-menu',
  'image-filter',
  'velocity-stepper',
]

export async function getLabItems(): Promise<LabItem[]> {
  const res = await fetch(`${LAB_BASE_URL}/labs.json`)
  const data: LabManifest = await res.json()

  const labs = data.labs.map((lab, i) => ({
    id: i + 1,
    number: String(i + 1).padStart(3, '0'),
    slug: lab.slug,
    title: lab.title,
    description: lab.description,
    date: lab.date,
    iframeUrl: `${LAB_BASE_URL}/${lab.slug}`,
    codeUrl: `https://raw.githubusercontent.com/${data.repo}/main/${lab.codeFile}`,
    previewVideo: lab.previewVideo ? `${LAB_BASE_URL}${lab.previewVideo}` : undefined,
    posterImage: lab.posterImage ? `${LAB_BASE_URL}${lab.posterImage}` : undefined
  }))

  // Sort by custom order
  return labs.sort((a, b) => {
    const aIndex = LAB_ORDER.indexOf(a.slug)
    const bIndex = LAB_ORDER.indexOf(b.slug)
    // Items not in LAB_ORDER go to the end
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
}
