import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About SYANN.CO — Our Story & Mission',
  description: 'SYANN combines ancient Five Elements wisdom with AI to create crystal bracelets uniquely aligned to your energy. Learn about our story, values, and commitment to natural gemstones.',
  openGraph: { title: 'About SYANN.CO', description: 'Where Five Elements wisdom meets AI — discover the story behind every personalized crystal bracelet.' },
}

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

export default function AboutPage() {
  return (
    <main style={{ background: '#F6F1EB', color: '#4A3A32', ...BODY }}>

      {/* ── 1 · HERO BANNER ──────────────────────────────────── */}
      <section style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img
          src="/AboutPageBanner.webp"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(246,241,235,0.72)' }} />

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>

          <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginBottom: 14, color: GOLD }} fill="currentColor" aria-hidden="true">
            <path d="M8 0 L9 7 L16 8 L9 9 L8 16 L7 9 L0 8 L7 7 Z" />
          </svg>

          <h1 style={{ ...SERIF, fontSize: 'clamp(42px, 7vw, 72px)', fontWeight: 300, color: '#3D2B1F', margin: '0 0 14px', lineHeight: 1 }}>
            About SYANN
          </h1>

          <div style={{ width: 36, height: 1.5, background: GOLD, marginBottom: 16 }} />

          <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', lineHeight: 1.75, maxWidth: 420, margin: 0 }}>
            Crafted around your energy — personalized crystal bracelets
            <br />rooted in Five Elements wisdom and modern AI.
          </p>

        </div>
      </section>


      {/* ── 2 · CRAFTED AROUND YOUR ENERGY ──────────────────── */}
      <section style={{ position: 'relative', minHeight: 520, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>

        {/* Background image */}
        <img
          src="/AboutImage2.webp"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 78%', display: 'block' }}
        />

        {/* Left gradient overlay for text legibility */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(246,241,235,0.96) 0%, rgba(246,241,235,0.88) 35%, rgba(246,241,235,0.55) 60%, rgba(246,241,235,0) 80%)',
        }} />

        {/* Text content */}
        <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(56px, 6vw, 96px) clamp(32px, 6vw, 96px)', maxWidth: 580 }}>

          <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.38em', color: GOLD, textTransform: 'uppercase', marginBottom: 18 }}>
            About SYANN
          </p>

          <h2 style={{ ...SERIF, fontSize: 'clamp(38px, 5vw, 62px)', fontWeight: 300, lineHeight: 1.1, color: '#3D2B1F', margin: '0 0 22px' }}>
            Crafted Around<br />Your Energy.
          </h2>

          <p style={{ ...BODY, fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: '#7A6355', margin: '0 0 32px', maxWidth: 420 }}>
            At SYANN, every bracelet is thoughtfully designed through a blend of crystal energy, five element balance, and modern AI personalization — creating a piece uniquely aligned to you.
          </p>

          <Link
            href="/energy-quiz"
            style={{ ...BODY, display: 'inline-block', padding: '14px 28px', background: GOLD, color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', textDecoration: 'none', transition: 'background 0.3s' }}
          >
            Discover Your Bracelet
          </Link>

        </div>

      </section>


      {/* ── 3 · OUR STORY ────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        <div style={{ position: 'relative', minHeight: 420 }}>
          <img src="/AboutImage1.webp" alt="SYANN brand story" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(36px, 4vw, 56px) clamp(24px, 4vw, 48px)', background: '#EDE8DF' }}>
          <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.38em', color: GOLD, textTransform: 'uppercase', marginBottom: 14 }}>
            Our Story
          </p>
          <h2 style={{ ...SERIF, fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 300, lineHeight: 1.2, color: '#3D2B1F', margin: '0 0 18px' }}>
            Intentional Jewelry.
            <br />Meaningful Energy.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'SYANN was created with a simple belief: energy should feel personal.',
              'In a world filled with mass-produced jewelry, we wanted to create something more intentional — bracelets designed uniquely for each individual.',
              'By combining traditional five element principles with AI-powered personalization, SYANN creates crystal combinations inspired by your birthdate, energy balance, and intentions.',
              'Every bracelet is thoughtfully assembled to bring together beauty, meaning, and emotional connection.',
            ].map((p, i) => (
              <p key={i} style={{ ...BODY, fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: '#7A6355', margin: 0 }}>{p}</p>
            ))}
          </div>
        </div>

      </section>


      {/* ── 3 · HOW IT WORKS ─────────────────────────────────── */}
      <section style={{ background: '#F6F1EB', padding: '56px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.38em', color: GOLD, textTransform: 'uppercase', marginBottom: 10 }}>
              The SYANN Experience
            </p>
            <h2 style={{ ...SERIF, fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 300, color: '#3D2B1F', margin: 0 }}>
              How It Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              {
                n: '1', title: 'Your Birthdate',
                desc: 'We analyze your five element balance based on your birth information.',
                svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 14h.01M12 14h.01M15 14h.01"/></svg>,
              },
              {
                n: '2', title: 'AI Crystal Matching',
                desc: 'Our system recommends crystal combinations aligned to your energy profile.',
                svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 17 9 12 22 7 9"/><line x1="7" y1="9" x2="17" y2="9"/></svg>,
              },
              {
                n: '3', title: 'Handcrafted for You',
                desc: 'Your bracelet is carefully assembled using natural crystals and premium materials.',
                svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>,
              },
            ].map(({ n, title, desc, svg }, i, arr) => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 20px', position: 'relative' }}>
                {i < arr.length - 1 && (
                  <div style={{ position: 'absolute', top: 19, left: '50%', right: '-50%', height: 1, background: `linear-gradient(90deg, ${GOLD}60, ${GOLD}20)` }} />
                )}
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#F4EFE8', border: `1px solid #C9B9A2`, color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, position: 'relative', zIndex: 1, fontSize: 12, fontWeight: 600, ...BODY }}>
                  {n}
                </div>
                <div style={{ color: GOLD, marginBottom: 10 }}>{svg}</div>
                <p style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#3D2B1F', marginBottom: 8 }}>{title}</p>
                <p style={{ ...BODY, fontSize: 11.5, fontWeight: 300, lineHeight: 1.8, color: '#9A8573', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ── 4 · OUR VALUES ───────────────────────────────────── */}
      <section style={{ background: '#EDE8DF', padding: '48px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>

          <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.38em', color: GOLD, textTransform: 'uppercase', textAlign: 'center', marginBottom: 28 }}>
            Our Values
          </p>

          <div className="about-values-grid">
            {[
              { title: 'Natural Crystals', desc: 'Carefully selected high-quality crystal materials.', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 17 9 12 22 7 9"/><line x1="7" y1="9" x2="17" y2="9"/></svg> },
              { title: 'Personalized Energy', desc: 'Every design is uniquely generated for your energy and intentions.', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              { title: 'Handmade With Care', desc: 'Each bracelet is crafted thoughtfully and intentionally by hand.', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
              { title: 'Minimal Luxury', desc: 'Elegant, timeless designs made for everyday meaningful wear.', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg> },
            ].map(({ title, desc, svg }) => (
              <div key={title} style={{ background: '#F4EFE8', border: '1px solid #E2D8CC', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
                <div style={{ color: GOLD }}>{svg}</div>
                <p style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', color: '#3D2B1F', margin: 0 }}>{title}</p>
                <p style={{ ...BODY, fontSize: 11.5, fontWeight: 300, lineHeight: 1.75, color: '#9A8573', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ── 5 · CLOSING ──────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        <div style={{ position: 'relative', minHeight: 400 }}>
          <img src="/AboutImage3.webp" alt="SYANN bracelet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(36px, 4vw, 56px) clamp(24px, 4vw, 48px)', background: '#F6F1EB' }}>
          <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.38em', color: GOLD, textTransform: 'uppercase', marginBottom: 14 }}>
            More Than Jewelry
          </p>
          <h2 style={{ ...SERIF, fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 300, lineHeight: 1.25, color: '#3D2B1F', margin: '0 0 18px' }}>
            A personal piece designed to reflect your energy, intentions, and individuality.
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"><polygon points="6,0 12,6 6,12 0,6" fill={GOLD} opacity="0.6" /></svg>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${GOLD}50, transparent)` }} />
          </div>
          <p style={{ ...BODY, fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: '#7A6355', margin: '0 0 24px' }}>
            This is more than a bracelet.
            <br />This is you, in your most aligned form.
          </p>
          <Link
            href="/energy-quiz"
            style={{ ...BODY, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', border: `1px solid ${GOLD}`, color: GOLD, fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            Begin Your Energy Quiz
          </Link>
        </div>

      </section>



    </main>
  )
}
