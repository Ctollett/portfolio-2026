export interface WritingItem {
  id:      number
  slug:    string
  title:   string
  year:    string
  month:   string
  excerpt: string
}

export const writingItems: WritingItem[] = [
  {
    id:      1,
    slug:    'interaction-concept',
    title:   'Interaction Concept',
    year:    '2026',
    month:   '06.01',
    excerpt: 'How I built the lens distortion carousel using a DOM + WebGL hybrid approach, and what I learned about keeping two rendering systems in sync.',
  },
]
