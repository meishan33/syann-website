import type { Metadata } from 'next'
import EnergyQuizForm from '@/components/EnergyQuizForm'

export const metadata: Metadata = {
  title: 'Crystal Energy Quiz — Discover Your Bracelet',
  description: 'Answer a few questions about your birth date and intentions. Our AI analyzes your Five Elements profile and curates the perfect crystal bracelet for your energy.',
  openGraph: { title: 'Take the Crystal Energy Quiz | SYANN.CO', description: 'Discover the crystals aligned with your energy — powered by Five Elements wisdom and AI.' },
}

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

export default function EnergyQuizPage() {
  return (
    <main>

      {/* ── BANNER ───────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img
          src="/EnergyQuizBanner.webp"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(246,241,235,0.72)' }} />

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>

          <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginBottom: 14, color: GOLD }} fill="currentColor" aria-hidden="true">
            <path d="M8 0 L9 7 L16 8 L9 9 L8 16 L7 9 L0 8 L7 7 Z" />
          </svg>

          <h1 style={{ ...SERIF, fontSize: 'clamp(42px, 7vw, 72px)', fontWeight: 300, color: '#3D2B1F', margin: '0 0 14px', lineHeight: 1 }}>
            Energy Quiz
          </h1>

          <div style={{ width: 36, height: 1.5, background: GOLD, marginBottom: 16 }} />

          <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', lineHeight: 1.75, maxWidth: 400, margin: 0 }}>
            Discover the crystals aligned with your energy
            <br />through Five Elements wisdom and AI-powered curation.
          </p>

        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────────── */}
      <section className="home-quiz" style={{ paddingTop: 56 }}>
        <EnergyQuizForm />
      </section>

    </main>
  )
}
