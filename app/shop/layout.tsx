import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Crystal Jewellery & Accessories',
  description: 'Browse SYANN\'s curated collection of crystal jewellery, accessories, and spiritual gifts. Handpicked natural gemstones for energy and wellbeing.',
  openGraph: {
    title: 'Shop | SYANN.CO',
    description: 'Crystal jewellery, accessories, and gifts handpicked for energy and wellbeing.',
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
