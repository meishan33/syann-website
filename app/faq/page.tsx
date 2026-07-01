'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TOTAL_BEADS } from '@/lib/bracelet-config'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

const FAQS = [
  {
    q: 'What is SYANN?',
    a: 'SYANN is a personalized crystal bracelet brand rooted in Five Elements wisdom and powered by AI. We create bracelets uniquely designed for your energy — based on your birth date, elemental balance, and personal intentions.',
  },
  {
    q: 'How does the AI bracelet personalization work?',
    a: 'You share your birth date, birth time (optional), and current intention. Our system analyzes your Five Elements profile and uses AI to select the 3 crystals that best support your unique energy. Every bracelet is one-of-a-kind.',
  },
  {
    q: 'Are the crystals natural?',
    a: 'Yes. Every SYANN bracelet is made with genuine, ethically sourced natural gemstones — 8 mm perfectly round beads selected for quality and energetic resonance. We never use synthetic or dyed stones.',
  },
  {
    q: 'Will my bracelet look exactly like the preview?',
    a: 'The bracelet preview is a digital render using reference images of each crystal type to show you the design and bead arrangement. Because every crystal is a genuine natural gemstone, no two beads are exactly alike — your actual handcrafted bracelet may have slight differences in color, tone, and texture compared to the preview. These natural variations are what make each piece uniquely yours.',
  },
  {
    q: 'What is included in every SYANN bracelet?',
    a: 'Every SYANN bracelet comes with 2 metal spacer discs and 1 silver SYANN logo charm as standard inclusions — no extra charge. The spacer metal tone (gold or silver) is chosen by our AI designer to complement your specific crystal combination. If you have a preference for the spacer metal or placement, simply note it in the Remarks field when placing your order.',
  },
  {
    q: 'How do I choose the right bracelet size?',
    a: `The default bracelet size is 16 cm (approximately ${TOTAL_BEADS} beads). If you need a different size, simply include your wrist measurement in the Remarks field when placing your order and we will adjust it for you.`,
  },
  {
    q: 'How do I take care of my crystal bracelet?',
    a: 'Avoid prolonged contact with water, perfume, and direct sunlight to preserve the stones\' natural luster. To cleanse your crystals, rest them under moonlight overnight or place them on a selenite plate. Store separately to prevent scratching.',
  },
  {
    q: 'How long does it take to receive my order?',
    a: 'Each bracelet is handcrafted after your order is placed. Please allow 3–5 business days for crafting, followed by 5–10 business days for shipping depending on your location. You will receive a tracking number once your order is dispatched.',
  },
  {
    q: 'What does the packaging look like?',
    a: 'Every SYANN bracelet arrives in a premium gift box with a crystal care card, a small bag of cleansing salt crystals, and a pouch — beautifully presented and ready to gift.',
    image: '/SamplePackaging.png',
  },
  {
    q: 'Can I return or exchange my bracelet?',
    a: 'As every bracelet is personally curated and handcrafted for you, we are unable to accept returns or exchanges. However, if your bracelet arrives damaged or defective, please contact us within 7 days and we will make it right.',
  },
]

function AccordionItem({
  question, answer, image, isOpen, onToggle,
}: {
  question: string
  answer: string
  image?: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div style={{ borderBottom: '1px solid #E5DDD5' }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left flex items-center justify-between gap-6 py-5"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '20px 0' }}
        aria-expanded={isOpen}
      >
        <span style={{ ...BODY, fontSize: 13.5, fontWeight: 400, color: '#3D2B1F', letterSpacing: '0.01em' }}>
          {question}
        </span>
        <span
          style={{
            flexShrink: 0,
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: GOLD,
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="7" y1="1" x2="7" y2="13" />
            <line x1="1" y1="7" x2="13" y2="7" />
          </svg>
        </span>
      </button>

      <div style={{
        maxHeight: isOpen ? 600 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <p style={{ ...BODY, fontSize: 13, fontWeight: 300, lineHeight: 1.9, color: '#7A6355', paddingBottom: image ? 12 : 20, margin: 0 }}>
          {answer}
        </p>
        {image && (
          <div style={{ paddingBottom: 20 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 380, borderRadius: 14, overflow: 'hidden', border: '1px solid #E5DDD5', aspectRatio: '1/1' }}>
              <Image src={image} alt="Sample packaging" fill sizes="380px" style={{ objectFit: 'cover' }} />
            </div>
            <a href={image} target="_blank" rel="noopener noreferrer" style={{ ...BODY, fontSize: 11, color: GOLD, marginTop: 8, display: 'inline-block', letterSpacing: '0.06em', textDecoration: 'none' }}>
              View full size ↗
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i)

  return (
    <main style={{ background: '#F6F1EB', color: '#4A3A32', ...BODY }}>

      {/* ── HERO BANNER ───────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img
          src="/FAQimage.png"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(246,241,235,0.72)' }} />

        {/* Centered content */}
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>

          {/* Star ornament */}
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginBottom: 14, color: GOLD }} fill="currentColor" aria-hidden="true">
            <path d="M8 0 L9 7 L16 8 L9 9 L8 16 L7 9 L0 8 L7 7 Z" />
          </svg>

          <h1 style={{ ...SERIF, fontSize: 'clamp(52px, 8vw, 80px)', fontWeight: 300, color: '#3D2B1F', margin: '0 0 14px', lineHeight: 1 }}>
            FAQ
          </h1>

          {/* Gold divider */}
          <div style={{ width: 36, height: 1.5, background: GOLD, marginBottom: 16 }} />

          <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', lineHeight: 1.75, maxWidth: 380, margin: 0 }}>
            Everything you need to know about SYANN
            <br />and your crystal bracelet journey.
          </p>

        </div>
      </section>


      {/* ── FAQ ACCORDION ─────────────────────────────────────── */}
      <section style={{ background: '#FDFAF7', padding: '64px 24px 72px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Top border */}
          <div style={{ borderTop: '1px solid #E5DDD5' }} />

          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              question={faq.q}
              answer={faq.a}
              image={'image' in faq ? faq.image : undefined}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}

        </div>
      </section>


      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <section style={{ background: '#F6F1EB', padding: '48px 24px 72px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, width: '100%' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #E5DDD5)' }} />
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <polygon points="5,0 10,5 5,10 0,5" fill={GOLD} opacity="0.5" />
            </svg>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #E5DDD5)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, width: '100%' }}>

            {/* Left — envelope icon */}
            <div style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid rgba(176,139,87,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>

            {/* Middle — text */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ ...SERIF, fontSize: 24, fontWeight: 300, color: '#3D2B1F', margin: '0 0 3px' }}>
                Still have questions?
              </h3>
              <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#9A8573', margin: 0 }}>
                We're here to help.
              </p>
            </div>

            {/* Right — button */}
            <Link
              href="/contact"
              style={{
                ...BODY,
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 24px',
                border: `1px solid #3D2B1F`,
                color: '#3D2B1F',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'background 0.3s, color 0.3s',
              }}
            >
              Contact Us
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>

          </div>
        </div>
      </section>

    </main>
  )
}
