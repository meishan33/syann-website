import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crystal Encyclopedia — Natural Gemstone Guide',
  description: 'Explore our guide to natural crystals and gemstones. Learn about the healing properties, elemental associations, and energy of each crystal used in SYANN bracelets.',
  openGraph: {
    title: 'Crystal Encyclopedia | SYANN.CO',
    description: 'Discover the healing properties and elemental energy of natural crystals and gemstones.',
  },
}

export default function CrystalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
