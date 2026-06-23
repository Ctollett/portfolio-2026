export interface WorkItem {
  slug:        string
  title:       string
  year:        string
  type:        string
  description: string
  liveUrl?:    string
  video?:      string
  image?:      string
}

export const workItems: WorkItem[] = [
  {
    slug:        'tx-84',
    title:       'TX-84',
    year:        '2024',
    type:        'Browser-Based Spatial Operator FM Synth',
    description: 'Coming soon.',
    liveUrl:     'https://example.com',
    video:       '/videos/tx-84.mp4',
  },
  {
    slug:        'ruun',
    title:       'Ruun',
    year:        '2026',
    type:        'SVG Spring Morph Library',
    description: 'Coming soon.',
    liveUrl:     'https://example.com',
    video:       '/videos/ruun.mp4',
  },
  {
    slug:        'wasm-dsp-engine',
    title:       'WASM DSP Engine',
    year:        '2025',
    type:        'Real-Time FM Synthesis in WebAssembly',
    description: 'Coming soon.',
    liveUrl:     'https://example.com',
    video:       '/videos/WASM.mp4',
  },
]

export function getWorkItem(slug: string): WorkItem | undefined {
  return workItems.find(w => w.slug === slug)
}
