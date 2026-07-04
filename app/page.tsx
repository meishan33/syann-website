import type { Metadata } from 'next'
import EnergyQuizForm from '@/components/EnergyQuizForm'

export const metadata: Metadata = {
  title: 'Crystal Bracelets Singapore | Personalized Natural Gemstone Bracelets | SYANN.CO',
  description: 'Shop handcrafted natural crystal bracelets in Singapore. Take our free Energy Quiz for a personalized gemstone bracelet aligned to your Five Elements, zodiac & intentions. Free SG & MY delivery.',
  openGraph: { title: 'SYANN.CO — Personalized Crystal Bracelets Singapore', description: 'Handcrafted natural crystal bracelets personalized by your zodiac, Five Elements & intentions. Free delivery in Singapore & Malaysia.', url: 'https://syann.co' },
}

const SELLING_POINTS = [
  {
    label: 'Natural Crystal Beads',
    description:
      'Hand-selected 8 mm genuine gemstones — ethically sourced, energetically cleansed, and never synthetic.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer gem outline */}
        <polygon points="10,7 22,7 27,14 16,27 5,14" />
        {/* Girdle */}
        <line x1="5" y1="14" x2="27" y2="14" />
        {/* Crown facets */}
        <line x1="10" y1="7" x2="16" y2="14" />
        <line x1="22" y1="7" x2="16" y2="14" />
        {/* Pavilion facets */}
        <line x1="10" y1="14" x2="16" y2="27" />
        <line x1="22" y1="14" x2="16" y2="27" />
      </svg>
    ),
  },
  {
    label: 'AI Energy Analysis',
    description:
      'Your zodiac sign, Five Elements balance, and intentions translated into a bespoke crystal bracelet blueprint.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 5 L18 14 L27 16 L18 18 L16 27 L14 18 L5 16 L14 14 Z" />
        <circle cx="24" cy="8" r="1.4" fill="currentColor" />
        <circle cx="8" cy="24" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Made With Intention',
    description:
      'Every bracelet is hand-knotted, blessed, and finished with quiet, mindful care.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 26 C8 20 5 15 8 11 C10.5 8 14 9 16 12 C18 9 21.5 8 24 11 C27 15 24 20 16 26 Z" />
      </svg>
    ),
  },
  {
    label: 'Designed Uniquely For You',
    description:
      'No two SYANN bracelets are alike — each one is composed for your singular energy.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="11" />
        <path d="M16 7 L18.2 13.8 L25 16 L18.2 18.2 L16 25 L13.8 18.2 L7 16 L13.8 13.8 Z" />
      </svg>
    ),
  },
]

const BRACELETS = [
  {
    image: '/LoveAndHarmony.webp',
    title: 'Love & Harmony',
    description: 'Crystals for love, self-worth, and deepening emotional connection — open the heart and invite tender devotion.',
  },
  {
    image: '/WealthAndAbundance.webp',
    title: 'Wealth & Abundance',
    description: 'Gemstones for prosperity, opportunity, and creative flow — attract abundance and unlock your potential.',
  },
  {
    image: '/ProtectionAndGrounding.webp',
    title: 'Protection & Grounding',
    description: 'Crystals for protection, calm, and inner steadiness — shield your aura and root your energy.',
  },
  {
    image: '/CalmAndBalance.webp',
    title: 'Calm & Balance',
    description: 'Stones for anxiety relief, stress reduction, and mental clarity — quiet the noise and restore inner stillness.',
  },
]

export default function Home() {
  return (
    <main className="home">

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="home-hero">

        <img
          src="/banner.webp"
          alt=""
          className="home-hero-bg"
        />

        <div className="home-hero-overlay">

          <div className="home-hero-content">
          <div className="home-hero-text">

            <h1 className="home-hero-title">
              Personalized Crystal Bracelets
              <br />
              Designed For Your Energy
            </h1>

            <p className="home-hero-subtitle">
              AI-POWERED · ENERGY ALIGNED · MADE FOR YOU
            </p>

            <a href="/energy-quiz" className="home-hero-cta">
              Discover Your Bracelet
              <span className="home-hero-cta-icon" aria-hidden="true">✦</span>
            </a>

          </div>
          </div>

        </div>

      </section>


      {/* ─── SELLING POINTS ───────────────────────────────── */}
      <section className="home-points-section">
      <div className="home-points">

        {SELLING_POINTS.map((point) => (
          <article key={point.label} className="home-point">

            <div className="home-point-icon" aria-hidden="true">
              {point.icon}
            </div>

            <h3 className="home-point-title">{point.label}</h3>

            <p className="home-point-description">{point.description}</p>

          </article>
        ))}

      </div>
      </section>


      {/* ─── BRACELET DISPLAY ─────────────────────────────── */}
      <section className="home-collection">

        <div className="home-collection-header">
          <p className="home-collection-eyebrow">Our Collection</p>
          <h2 className="home-collection-title">
            Crystals Aligned To Every Intention
          </h2>
        </div>

        <div className="home-collection-grid">

          {BRACELETS.map((b) => (
            <article key={b.title} className="home-bracelet-card">

              <div className="home-bracelet-image-wrap">
                <img
                  src={b.image}
                  alt={b.title}
                  className="home-bracelet-image"
                />
              </div>

              <div className="home-bracelet-content">
                <h3 className="home-bracelet-title">{b.title}</h3>
                <p className="home-bracelet-description">{b.description}</p>
              </div>

            </article>
          ))}

        </div>

      </section>


      {/* ─── ENERGY QUIZ FORM ─────────────────────────────── */}
      <section id="energy-quiz" className="home-quiz">

        <div className="home-quiz-header">
          <p className="home-quiz-eyebrow">✦ Free Personalized Energy Quiz</p>
          <h2 className="home-quiz-title">
            Find Your Perfect Crystal Bracelet
          </h2>
          <p className="home-quiz-description">
            Share your birth date, zodiac sign, and intentions — our AI analyzes your Five Elements profile and handpicks the natural gemstones best aligned to your energy. Free delivery in Singapore & Malaysia.
          </p>
        </div>

        <EnergyQuizForm />

      </section>

    </main>
  )
}
