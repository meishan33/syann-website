import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Crystal Blog | Gemstone Guides & Healing Tips | SYANN.CO',
  description: 'Explore our crystal blog — guides on natural gemstones, healing properties, crystal care, and how to choose the right crystal bracelet for your energy.',
  openGraph: { title: 'The Crystal Journal | SYANN.CO', description: 'Guides on crystal healing, gemstone meanings, and harnessing natural energy — from SYANN Singapore.' },
}

type Post = { id: string; title: string; slug: string; date: string; excerpt: string; cover_image_url: string | null }

async function getPosts(): Promise<Post[]> {
  const { data } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, date, excerpt, cover_image_url')
    .eq('status', 'published')
    .order('date', { ascending: false })
  return (data ?? []) as Post[]
}

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'
const DARK = '#4A3A32'

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', ...BODY }}>

      {/* Banner */}
      <section style={{ background: '#FDFAF7', borderBottom: '1px solid #EDE8DF', padding: '48px 24px 40px', textAlign: 'center' }}>
        <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.36em', color: GOLD, textTransform: 'uppercase', margin: '0 0 12px' }}>Crystal Knowledge</p>
        <h1 style={{ ...SERIF, fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 300, color: DARK, margin: '0 0 10px', lineHeight: 1 }}>The Crystal Journal</h1>
        <div style={{ width: 32, height: 1.5, background: GOLD, margin: '0 auto 16px' }} />
        <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#9A8573', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Guides on crystal healing, gemstone meanings, and how to harness natural energy in everyday life.
        </p>
      </section>

      {/* Posts grid */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px 72px' }}>
        {posts.length === 0 ? (
          <p style={{ ...BODY, fontSize: 13, color: '#9A8573', textAlign: 'center', paddingTop: 48 }}>
            Coming soon — our first crystal guide is on its way.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <article style={{ background: '#FDFAF7', border: '1px solid #E5DDD5', borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {post.cover_image_url && (
                    <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  )}
                  <div style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', color: '#B0A090', textTransform: 'uppercase', margin: 0 }}>
                      {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h2 style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: DARK, margin: 0, lineHeight: 1.3 }}>{post.title}</h2>
                    <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#7A6355', margin: 0, lineHeight: 1.7, flex: 1 }}>{post.excerpt}</p>
                    <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>Read More →</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

    </main>
  )
}
