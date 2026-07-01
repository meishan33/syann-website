import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Everything you need to know about SYANN crystal bracelets — personalization, sizing, care, packaging, shipping, and returns.',
  openGraph: {
    title: 'FAQ — SYANN.CO Crystal Bracelets',
    description: 'Answers to your questions about crystal bracelets, personalization, shipping, sizing, and more.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is SYANN?', acceptedAnswer: { '@type': 'Answer', text: 'SYANN is a personalized crystal bracelet brand rooted in Five Elements wisdom and powered by AI.' } },
    { '@type': 'Question', name: 'How does the AI bracelet personalization work?', acceptedAnswer: { '@type': 'Answer', text: 'You share your birth date, birth time, and intention. Our system analyzes your Five Elements profile and uses AI to select the 3 crystals that best support your unique energy.' } },
    { '@type': 'Question', name: 'Are the crystals natural?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every SYANN bracelet is made with genuine, ethically sourced natural gemstones — 8 mm perfectly round beads.' } },
    { '@type': 'Question', name: 'How long does it take to receive my order?', acceptedAnswer: { '@type': 'Answer', text: 'Each bracelet is handcrafted after your order is placed. Please allow 3–5 business days for crafting, followed by 5–10 business days for shipping.' } },
    { '@type': 'Question', name: 'Can I return or exchange my bracelet?', acceptedAnswer: { '@type': 'Answer', text: 'As every bracelet is personally curated and handcrafted for you, we are unable to accept returns or exchanges. If your bracelet arrives damaged, contact us within 7 days.' } },
  ],
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  )
}
