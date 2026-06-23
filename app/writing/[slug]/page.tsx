import { notFound } from 'next/navigation';
import { writingItems } from '@/lib/writing';
import Link from 'next/link';
import InteractionConcept from '@/content/writing/interaction-concept';

const contentMap: Record<string, React.ComponentType> = {
  'interaction-concept': InteractionConcept,
};

const NAV_ITEMS = [
  { label: 'Work',    href: '/' },
  { label: 'Lab',     href: '/lab' },
  { label: 'Writing', href: '/writing' },
  { label: 'About',   href: '/about' },
];

export default async function WritingArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item    = writingItems.find(w => w.slug === slug);
  const Content = contentMap[slug];

  if (!item || !Content) notFound();

  return (
    <div style={{ background: '#F4F2ED', minHeight: '100vh' }}>

      {/* Nav */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '32px 32px',
        zIndex: 10,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(244, 242, 237, 0.7)',
      }}>
        <Link href="/" style={{ display: 'flex', textDecoration: 'none' }}>
          <svg width="28" height="20" viewBox="0 0 29 21" fill="none">
            <path d="M8.47189 9.49798H0.5C0.5 9.49798 0.817269 1.26634 9.5 0.5V8.86104C9.5 8.86104 9.32329 9.4353 8.47189 9.5V9.49798Z" stroke="#000000" strokeMiterlimit="10"/>
            <path d="M8.47189 11.5H0.5C0.5 11.5 0.817269 19.7342 9.5 20.5V12.1378C9.5 12.1378 9.32329 11.563 8.47189 11.5Z" stroke="#000000" strokeMiterlimit="10"/>
            <path d="M16 20.5C18.4853 20.5 20.5 18.4853 20.5 16C20.5 13.5147 18.4853 11.5 16 11.5C13.5147 11.5 11.5 13.5147 11.5 16C11.5 18.4853 13.5147 20.5 16 20.5Z" stroke="#000000" strokeMiterlimit="10"/>
            <path d="M17.5964 0.5H14.4036C12.8 0.5 11.5 1.79996 11.5 3.40355V6.59645C11.5 8.20003 12.8 9.5 14.4036 9.5H17.5964C19.2 9.5 20.5 8.20003 20.5 6.59645V3.40355C20.5 1.79996 19.2 0.5 17.5964 0.5Z" stroke="#000000" strokeMiterlimit="10"/>
          </svg>
        </Link>
        <nav style={{ display: 'flex', gap: 16 }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.label} href={item.href} style={{
              fontFamily: "'MDUIXS', sans-serif",
              fontSize: 12,
              letterSpacing: '0.14em',
              color: item.href === '/writing' ? '#1A1A18' : '#888884',
              textDecoration: 'none',
            }}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Article */}
      <article style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '140px 32px 96px',
      }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{
            fontFamily: "'MDUIXS', sans-serif",
            fontSize: 9,
            letterSpacing: '0.14em',
            color: '#888884',
            margin: '0 0 12px',
          }}>
            {item.year} · {item.month}
          </p>
          <h1 style={{
            fontFamily: "'Canela', serif",
            fontSize: 36,
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#1A1A18',
            margin: 0,
            lineHeight: 1.15,
          }}>
            {item.title}
          </h1>
        </div>

        <Content />

      </article>
    </div>
  );
}
