import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Natural Crystal & Gemstone Guide Singapore | Crystal Healing Properties | SYANN.CO',
  description: 'Explore our guide to natural crystals and gemstones — rose quartz, amethyst, citrine, obsidian & more. Learn their healing properties, elemental associations, and how they are used in personalized crystal bracelets.',
  openGraph: {
    title: 'Natural Crystal & Gemstone Guide | SYANN.CO',
    description: 'Discover the healing properties of rose quartz, amethyst, citrine, and more — the natural gemstones used in SYANN personalized crystal bracelets.',
  },
}

export default function CrystalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
