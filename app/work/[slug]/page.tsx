import { notFound } from 'next/navigation'
import { getWorkItem } from '@/lib/work'
import { WorkPageClient } from '@/components/WorkPageClient'

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = getWorkItem(slug)
  if (!item) notFound()

  return <WorkPageClient key={slug} item={item} slug={slug} />
}
