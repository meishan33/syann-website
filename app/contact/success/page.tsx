import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

export default function ContactSuccessPage() {
  return (
    <main style={{ background: '#F6F1EB', ...BODY }}>

      {/* ── BANNER ───────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img
          src="/ContactBanner.png"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(246,241,235,0.72)' }} />

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>

          <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginBottom: 14, color: GOLD }} fill="currentColor" aria-hidden="true">
            <path d="M8 0 L9 7 L16 8 L9 9 L8 16 L7 9 L0 8 L7 7 Z" />
          </svg>

          <h1 style={{ ...SERIF, fontSize: 'clamp(42px, 7vw, 72px)', fontWeight: 300, color: '#3D2B1F', margin: '0 0 14px', lineHeight: 1 }}>
            Message Sent
          </h1>

          <div style={{ width: 36, height: 1.5, background: GOLD, marginBottom: 16 }} />

          <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', lineHeight: 1.75, maxWidth: 400, margin: 0 }}>
            Thank you for reaching out.<br />We'll get back to you within 24–48 hours.
          </p>

        </div>
      </section>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <section style={{ display: 'flex', justifyContent: 'center', padding: '64px 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, maxWidth: 480, width: '100%', textAlign: 'center' }}>

          {/* Diamond divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #E5DDD5)' }} />
            <svg width="8" height="8" viewBox="0 0 8 8" fill={GOLD} aria-hidden="true">
              <polygon points="4,0 8,4 4,8 0,4" />
            </svg>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #E5DDD5)' }} />
          </div>

          <p style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: '#3D2B1F', margin: 0 }}>
            While you wait, explore SYANN.
          </p>

          <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#9A8573', lineHeight: 1.8, margin: 0 }}>
            Discover the crystals aligned to your energy, or learn more about the intention behind every bracelet we craft.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            <Link
              href="/energy-quiz"
              style={{ ...BODY, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px', background: '#4A3A32', border: '1px solid #4A3A32', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', textDecoration: 'none' }}
            >
              Discover Your Bracelet
            </Link>

            <Link
              href="/about"
              style={{ ...BODY, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px', background: 'transparent', border: `1px solid ${GOLD}`, color: '#4A3A32', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', textDecoration: 'none' }}
            >
              Our Story
            </Link>

            <Link
              href="/"
              style={{ ...BODY, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', background: 'transparent', border: 'none', color: '#9A8573', fontSize: 11, fontWeight: 400, letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none' }}
            >
              Return Home
            </Link>
          </div>

        </div>
      </section>

    </main>
  )
}
