import type { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function getBlogPosts(): Promise<{ slug: string; date: string }[]> {
  try {
    const { data } = await supabaseAdmin
      .from('blog_posts')
      .select('slug, date')
      .eq('status', 'published')
    return (data ?? []) as { slug: string; date: string }[]
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://syann.co'
  const now = new Date()
  const blogPosts = await getBlogPosts()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/energy-quiz`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/crystals`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/bracelet-designs`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    ...blogPosts.map(p => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: 'never' as const,
      priority: 0.7,
    })),
  ]
}
