'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }

/* ── FAQ data ──────────────────────────────────────────────────────── */

const FAQS = [
  {
    q: 'How is my crystal bracelet personalized?',
    a: 'We use your birth date and personal intention to analyze your Five Elements balance and energetic needs. Our AI then recommends the crystal combination that best supports your unique journey and goals — no two bracelets are ever the same.',
  },
  {
    q: 'What are the Five Elements?',
    a: 'Wood, Fire, Earth, Metal, and Water are the five fundamental energies that govern nature and our inner world. Each person carries a unique elemental composition that shapes their emotions, health, relationships, and energy flow. Understanding your elemental balance is the foundation of every SYANN bracelet.',
  },
  {
    q: 'Are the crystals natural and authentic?',
    a: 'Yes. Every SYANN bracelet is crafted using genuine, ethically sourced natural gemstones. Each crystal is carefully selected for quality, clarity, and energetic resonance — never synthetic, never dyed.',
  },
  {
    q: 'How do I choose my intention?',
    a: 'Your intention is the area of life you most want to nurture right now — whether it\'s love, career growth, emotional healing, confidence, or inner calm. There are no wrong answers. Choose what resonates most deeply with you in this moment.',
  },
  {
    q: 'Can I wear my bracelet every day?',
    a: 'Yes. Natural stone bracelets are designed for daily wear. In fact, consistent wear deepens the connection between the crystals\' energy and your own, allowing their resonance to integrate more fully into your energy field over time.',
  },
  {
    q: 'Is it safe for sensitive skin?',
    a: 'SYANN bracelets use natural stone beads and high-quality elastic cord. They are free from metals and chemical coatings, making them suitable for most skin types. If you have specific sensitivities, please contact us before purchasing and we will guide you personally.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Standard shipping takes 5–10 business days depending on your location. Expedited options are available at checkout. All orders are carefully packed and fully tracked from our studio to your door.',
  },
  {
    q: 'How do I care for my bracelet?',
    a: 'Avoid prolonged exposure to water, perfume, and direct sunlight to preserve the stones\' natural luster. Cleanse your crystals periodically by placing them under moonlight or resting them on a selenite plate overnight. Store your bracelet separately to prevent scratching.',
  },
]

/* ── small reusable pieces ─────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.38em]"
       style={{ color: '#B08B57', ...BODY }}>
      {children}
    </p>
  )
}

function GoldBar() {
  return <div className="mb-6 h-[1.5px] w-9" style={{ background: '#B08B57' }} />
}

function DiamondDivider() {
  return (
    <div className="flex items-center gap-0 my-7" style={{ maxWidth: 240 }}>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(176,139,87,0.5), transparent)' }} />
      <svg width="8" height="8" viewBox="0 0 8 8" className="mx-3 shrink-0" aria-hidden="true">
        <polygon points="4,0 8,4 4,8 0,4" fill="#B08B57" opacity="0.7" />
      </svg>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, rgba(176,139,87,0.5), transparent)' }} />
    </div>
  )
}

/* ── accordion item ────────────────────────────────────────────────── */

function AccordionItem({
  question, answer, index, isOpen, onToggle,
}: {
  question: string
  answer: string
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="rounded-2xl transition-all duration-300"
      style={{
        background: isOpen ? '#FDFAF6' : '#FAF7F3',
        border: `1px solid ${isOpen ? 'rgba(176,139,87,0.3)' : 'rgba(176,139,87,0.15)'}`,
        boxShadow: isOpen ? '0 8px 32px -8px rgba(101,70,46,0.12)' : 'none',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left flex items-center gap-5 px-7 py-6 group"
        aria-expanded={isOpen}
      >
        {/* Number */}
        <span
          className="shrink-0 text-[11px] font-semibold tabular-nums"
          style={{ color: '#C9A96E', letterSpacing: '0.1em', ...BODY }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Question */}
        <span
          className="flex-1 text-[15px] font-light leading-snug transition-colors duration-200"
          style={{
            ...SERIF,
            color: isOpen ? '#3D2B1F' : '#5C4030',
            fontSize: 17,
          }}
        >
          {question}
        </span>

        {/* Expand / collapse icon */}
        <span
          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300"
          style={{
            background: isOpen ? 'rgba(176,139,87,0.14)' : 'transparent',
            border: `1px solid ${isOpen ? 'rgba(176,139,87,0.4)' : 'rgba(176,139,87,0.25)'}`,
            color: '#B08B57',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <line x1="6" y1="1" x2="6" y2="11" />
            <line x1="1" y1="6" x2="11" y2="6" />
          </svg>
        </span>
      </button>

      {/* Answer */}
      <div
        style={{
          maxHeight: isOpen ? 400 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="px-7 pb-7 pt-0 flex gap-5">
          {/* Left accent bar */}
          <div className="shrink-0 mt-1" style={{ width: 1.5, background: 'linear-gradient(to bottom, #B08B57, transparent)', borderRadius: 2, minHeight: 40 }} />
          <p
            className="text-[13px] leading-[1.95]"
            style={{ color: '#7A6355', ...BODY }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── page ──────────────────────────────────────────────────────────── */

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i))

  return (
    <main style={{ background: '#F6F1EB', color: '#4A3A32', ...BODY }}>

      {/* ════════════════════════════════════════════════════
          1 · HERO
      ════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[72vh]">

        {/* Left */}
        <div className="flex flex-col justify-center px-10 py-20 lg:px-20 lg:py-0">
          <SectionLabel>FAQ</SectionLabel>
          <GoldBar />

          <h1
            style={{ ...SERIF }}
            className="text-5xl font-light leading-[1.15] text-[#3D2B1F] lg:text-6xl"
          >
            Frequently
            <br />Asked Questions
          </h1>

          <DiamondDivider />

          <p className="text-[13.5px] leading-[1.9] text-[#7A6355] max-w-sm">
            Everything you need to know about SYANN, our crystals, and your
            personalized bracelet journey.
          </p>

          {/* Soft glow accent */}
          <div
            className="mt-12 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.28em]"
            style={{ color: '#B08B57', ...BODY }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 17 9 12 22 7 9" />
              <line x1="7" y1="9" x2="17" y2="9" />
            </svg>
            8 questions answered below
          </div>
        </div>

        {/* Right — image */}
        <div className="relative min-h-[440px] lg:min-h-0 m-6 lg:m-8 overflow-hidden rounded-3xl shadow-[0_24px_64px_-16px_rgba(101,70,46,0.22)]"
             style={{ background: '#EDE4D8' }}>
          <Image
            src="/faq-hero.jpg"
            alt="SYANN crystal bracelet editorial"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0" style={{ background: 'rgba(244,238,230,0.1)' }} />
        </div>

      </section>


      {/* ════════════════════════════════════════════════════
          2 · FAQ ACCORDION
      ════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl">

          {/* Section header */}
          <div className="text-center mb-14">
            <SectionLabel>Your Questions</SectionLabel>
            <h2 style={{ ...SERIF }} className="text-4xl font-light text-[#3D2B1F] lg:text-5xl">
              All you need to know
            </h2>
          </div>

          {/* Accordion list */}
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                index={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>

          {/* Subtle bottom ornament */}
          <div className="mt-14 flex items-center gap-0">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(176,139,87,0.3))' }} />
            <svg width="10" height="10" viewBox="0 0 10 10" className="mx-4 shrink-0" aria-hidden="true">
              <polygon points="5,0 10,5 5,10 0,5" fill="#B08B57" opacity="0.45" />
            </svg>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(176,139,87,0.3))' }} />
          </div>

        </div>
      </section>


      {/* ════════════════════════════════════════════════════
          3 · CONTACT CTA
      ════════════════════════════════════════════════════ */}
      <section className="px-6 pb-28">
        <div
          className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-8 rounded-3xl px-10 py-10"
          style={{
            background: 'linear-gradient(135deg, #F4EDE2 0%, #EDE4D6 100%)',
            border: '1px solid rgba(176,139,87,0.2)',
            boxShadow: '0 16px 48px -12px rgba(101,70,46,0.14)',
          }}
        >
          {/* Left */}
          <div className="flex items-start gap-5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(176,139,87,0.12)', color: '#B08B57' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 17 9 12 22 7 9" />
                <line x1="7" y1="9" x2="17" y2="9" />
              </svg>
            </div>
            <div>
              <h3 style={{ ...SERIF }} className="text-2xl font-light text-[#3D2B1F] mb-1.5">
                Still have questions?
              </h3>
              <p className="text-[13px] text-[#9A8070] leading-relaxed" style={{ ...BODY }}>
                We're here to help you on your journey.
              </p>
            </div>
          </div>

          {/* Right — button */}
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-all duration-300 hover:shadow-lg hover:opacity-90"
            style={{ background: '#B08B57', ...BODY }}
          >
            Contact Us
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

    </main>
  )
}
