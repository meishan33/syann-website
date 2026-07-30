import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const revalidate = 60

const PER_PAGE = 8

export const metadata: Metadata = {
  title: 'Crystal Blog | Gemstone Guides & Healing Tips | SYANN.CO',
  description: 'Explore our crystal blog — guides on natural gemstones, healing properties, crystal care, and how to choose the right crystal bracelet for your energy.',
  openGraph: { title: 'The Crystal Journal | SYANN.CO', description: 'Guides on crystal healing, gemstone meanings, and harnessing natural energy — from SYANN Singapore.' },
}

type Post = { id: string; title: string; slug: string; date: string; excerpt: string; cover_image_url: string | null }

async function getPosts(page: number): Promise<{ posts: Post[]; total: number }> {
  const from = (page - 1) * PER_PAGE
  const { data, count } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, date, excerpt, cover_image_url', { count: 'exact' })
    .eq('status', 'published')
    .order('date', { ascending: false })
    .range(from, from + PER_PAGE - 1)
  return { posts: (data ?? []) as Post[], total: count ?? 0 }
}

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'
const DARK = '#4A3A32'

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const { posts, total } = await getPosts(page)
  const totalPages = Math.ceil(total / PER_PAGE)
  const safePage = Math.min(page, Math.max(1, totalPages))

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

      {/* Posts list */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 72px' }}>
        {posts.length === 0 ? (
          <p style={{ ...BODY, fontSize: 13, color: '#9A8573', textAlign: 'center', paddingTop: 48 }}>
            {total === 0 ? 'Coming soon — our first crystal guide is on its way.' : 'No posts on this page.'}
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {posts.map((post, i) => (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <article style={{
                    display: 'flex', gap: 28, alignItems: 'flex-start',
                    padding: '32px 0',
                    borderTop: i === 0 ? 'none' : '1px solid #EDE8DF',
                  }}>
                    {post.cover_image_url && (
                      <div style={{ flexShrink: 0, width: 120, height: 80, borderRadius: 10, overflow: 'hidden' }}>
                        <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', color: '#B0A090', textTransform: 'uppercase', margin: '0 0 8px' }}>
                        {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h2 style={{ ...SERIF, fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 300, color: DARK, margin: '0 0 10px', lineHeight: 1.25 }}>{post.title}</h2>
                      <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#7A6355', margin: '0 0 14px', lineHeight: 1.7 }}>{post.excerpt}</p>
                      <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>Read More →</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ borderTop: '1px solid #EDE8DF', paddingTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>

                {/* Prev */}
                {safePage > 1
                  ? <Link href={`/blog?page=${safePage - 1}`} style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, textDecoration: 'none', padding: '8px 16px', border: `1px solid #E5DDD5`, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                      ← Prev
                    </Link>
                  : <span style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C4B5A8', padding: '8px 16px', border: '1px solid #EDE8DF', borderRadius: 999, background: 'transparent', display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
                      ← Prev
                    </span>
                }

                {/* Page numbers */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <Link
                      key={n}
                      href={`/blog?page=${n}`}
                      style={{
                        ...BODY, fontSize: 11, fontWeight: n === safePage ? 700 : 400,
                        width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none',
                        background: n === safePage ? GOLD : 'transparent',
                        color: n === safePage ? '#fff' : '#7A6355',
                        border: n === safePage ? `1px solid ${GOLD}` : '1px solid transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      {n}
                    </Link>
                  ))}
                </div>

                {/* Next */}
                {safePage < totalPages
                  ? <Link href={`/blog?page=${safePage + 1}`} style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, textDecoration: 'none', padding: '8px 16px', border: `1px solid #E5DDD5`, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Next →
                    </Link>
                  : <span style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C4B5A8', padding: '8px 16px', border: '1px solid #EDE8DF', borderRadius: 999, background: 'transparent', display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
                      Next →
                    </span>
                }

              </div>
            )}

            {/* Post count */}
            <p style={{ ...BODY, fontSize: 10, color: '#C4B5A8', textAlign: 'center', marginTop: 20, letterSpacing: '0.12em' }}>
              Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, total)} of {total} articles
            </p>
          </>
        )}
      </section>

    </main>
  )
}
