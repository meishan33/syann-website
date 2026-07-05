import type { Metadata } from 'next'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Post = { title: string; slug: string; date: string; excerpt: string; content: string }

const BLOG_DIR = join(process.cwd(), 'content/blog')

async function getPost(slug: string): Promise<Post | null> {
  try {
    const files = await readdir(BLOG_DIR)
    const file = files.find(f => f.endsWith('.json') && f.includes(slug))
    if (!file) return null
    const raw = await readFile(join(BLOG_DIR, file), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  try {
    const files = await readdir(BLOG_DIR)
    const slugs = await Promise.all(
      files.filter(f => f.endsWith('.json')).map(async f => {
        const raw = await readFile(join(BLOG_DIR, f), 'utf-8')
        return { slug: JSON.parse(raw).slug as string }
      })
    )
    return slugs
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} | SYANN.CO Crystal Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt },
  }
}

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'
const DARK = '#4A3A32'

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', ...BODY }}>

      {/* Header */}
      <section style={{ background: '#FDFAF7', borderBottom: '1px solid #EDE8DF', padding: '40px 24px 36px', textAlign: 'center' }}>
        <Link href="/blog" style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
          ← Crystal Journal
        </Link>
        <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', color: '#B0A090', textTransform: 'uppercase', margin: '0 0 16px' }}>
          {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 style={{ ...SERIF, fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 300, color: DARK, margin: '0 auto 16px', lineHeight: 1.15, maxWidth: 680 }}>
          {post.title}
        </h1>
        <div style={{ width: 32, height: 1.5, background: GOLD, margin: '0 auto' }} />
      </section>

      {/* Content */}
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div style={{ marginTop: 56, padding: '32px 28px', background: '#FDFAF7', border: '1px solid #E5DDD5', borderRadius: 16, textAlign: 'center' }}>
          <p style={{ ...SERIF, fontSize: 26, fontWeight: 300, color: DARK, margin: '0 0 10px' }}>Find Your Crystal Bracelet</p>
          <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#9A8573', margin: '0 0 20px', lineHeight: 1.7 }}>
            Take our free Energy Quiz and discover the natural gemstones aligned to your zodiac, Five Elements, and intentions.
          </p>
          <Link href="/energy-quiz" style={{ ...BODY, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: DARK, color: '#F6F1EB', borderRadius: 999, textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase' }}>
            Discover Your Bracelet
          </Link>
        </div>
      </article>

    </main>
  )
}
