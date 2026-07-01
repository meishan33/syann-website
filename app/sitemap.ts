import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://syann.co'
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/energy-quiz`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/crystals`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/bracelet-designs`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ]
}
