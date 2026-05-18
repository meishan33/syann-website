import Image from 'next/image'
import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }

/* ─── inline SVG icons ───────────────────────────────────────────────── */

const icons = {
  wood: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12"/><path d="M5 12c0-7 7-10 7-10s7 3 7 10"/>
      <path d="M5 17c0 2 3 3 7 3s7-1 7-3"/>
    </svg>
  ),
  fire: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c0 0-6 5-6 11a6 6 0 0 0 12 0c0-4-2-7-2-7s-1 3-4 3c0 0 2-4 0-7z"/>
    </svg>
  ),
  earth: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 19 2 19"/>
      <line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>
    </svg>
  ),
  metal: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="4" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="20"/>
      <line x1="4" y1="12" x2="2" y2="12"/><line x1="22" y1="12" x2="20" y2="12"/>
    </svg>
  ),
  water: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6 10 4 14 4 17a8 8 0 0 0 16 0c0-3-2-7-8-15z"/>
    </svg>
  ),
  star: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  sparkle: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  ),
  heart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  crystal: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 17 9 12 22 7 9"/><line x1="7" y1="9" x2="17" y2="9"/>
    </svg>
  ),
  lotus: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c0 0-8-4-8-10 0-3 2-5 4-5 1 0 2 .5 3 1.5"/>
      <path d="M12 22c0 0 8-4 8-10 0-3-2-5-4-5-1 0-2 .5-3 1.5"/>
      <path d="M12 8c-2-3-5-3-5 0 0 3 2 6 5 8 3-2 5-5 5-8 0-3-3-3-5 0z"/>
    </svg>
  ),
  moon: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      <circle cx="17" cy="5" r="1" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
  circle: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5" strokeDasharray="2 2"/>
    </svg>
  ),
}

/* ─── sub-components ─────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.38em]" style={{ color: '#B08B57', ...BODY }}>
      {children}
    </p>
  )
}

function GoldBar() {
  return <div className="mb-6 h-[2px] w-10" style={{ background: '#B08B57' }} />
}

/* ─── page ───────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <main style={{ background: '#F6F1EB', color: '#4A3A32', ...BODY }}>

      {/* ════════════════════════════════════════════════════
          1 · HERO
      ════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[88vh]">

        {/* Left */}
        <div className="flex flex-col justify-center px-10 py-20 lg:px-20 lg:py-0">
          <SectionLabel>About SYANN</SectionLabel>
          <GoldBar />

          <h1
            style={{ ...SERIF }}
            className="text-5xl font-light leading-[1.15] text-[#3D2B1F] mb-7 lg:text-6xl"
          >
            Jewelry Designed
            <br />Through Energy,
            <br />Intention, and
            <br />Inner Alignment
          </h1>

          <p className="text-[13.5px] leading-[1.9] text-[#7A6355] max-w-sm mb-10">
            SYANN creates personalized crystal bracelets rooted in Five Elements
            wisdom and guided by AI personalization — each piece a reflection of
            your unique energy, designed to harmonize and realign.
          </p>

          <Link
            href="/energy-quiz"
            className="inline-flex items-center gap-3 self-start rounded-full px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-all duration-300 hover:opacity-80"
            style={{ background: '#B08B57' }}
          >
            Discover Your Energy
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>

        {/* Right — image */}
        <div className="relative min-h-[480px] lg:min-h-0" style={{ background: '#E8DFD3' }}>
          <Image
            src="/about-hero.jpg"
            alt="SYANN personalized crystal bracelet"
            fill
            className="object-cover"
            priority
          />
          {/* soft overlay */}
          <div className="absolute inset-0" style={{ background: 'rgba(244,238,230,0.12)' }} />
        </div>

      </section>


      {/* ════════════════════════════════════════════════════
          2 · BRAND STORY
      ════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-6 py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

        {/* Left — image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-[0_30px_80px_-20px_rgba(101,70,46,0.25)]">
          <Image
            src="/about-story.jpg"
            alt="SYANN brand story"
            fill
            className="object-cover"
          />
        </div>

        {/* Right — story */}
        <div>
          <SectionLabel>Our Story</SectionLabel>
          <GoldBar />

          <h2 style={{ ...SERIF }} className="text-4xl font-light leading-[1.2] text-[#3D2B1F] mb-8 lg:text-5xl">
            Born from belief
            <br />in the power of
            <br />alignment.
          </h2>

          <div className="space-y-5 text-[13px] leading-[1.95] text-[#7A6355]">
            <p>
              SYANN began with a simple but profound belief — that energy is real,
              that it shapes how we feel, how we move through the world, and what
              we attract into our lives.
            </p>
            <p>
              Rooted in the ancient philosophy of the Five Elements — Wood, Fire,
              Earth, Metal, and Water — we believe each person carries a unique
              elemental signature. When these elements fall out of balance, we feel
              it: restlessness, emotional heaviness, creative blocks, disconnection.
            </p>
            <p>
              Crystals, in this tradition, are more than beautiful objects. They are
              symbolic companions — each stone carrying a frequency that resonates
              with different energies, intentions, and emotional states.
            </p>
            <p>
              Through AI-powered analysis of your birth energy and personal
              intentions, SYANN curates a bracelet that is uniquely, precisely yours
              — a wearable reminder of who you are and what you are becoming.
            </p>
          </div>
        </div>

      </section>


      {/* ════════════════════════════════════════════════════
          3 · FIVE ELEMENTS
      ════════════════════════════════════════════════════ */}
      <section style={{ background: '#EDE8DF' }} className="py-24">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">

          {/* Left — Elements */}
          <div>
            <SectionLabel>Philosophy</SectionLabel>
            <GoldBar />
            <h2 style={{ ...SERIF }} className="text-4xl font-light leading-[1.2] text-[#3D2B1F] mb-4 lg:text-5xl">
              The Wisdom of the
              <br />Five Elements
            </h2>
            <p className="text-[13px] leading-[1.85] text-[#7A6355] mb-10 max-w-sm">
              An ancient framework for understanding energy, health, and harmony
              — each element a lens through which balance can be restored.
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {[
                { icon: icons.wood,  name: 'Wood',  keys: 'Growth · Creativity · Renewal' },
                { icon: icons.fire,  name: 'Fire',  keys: 'Passion · Joy · Expression' },
                { icon: icons.earth, name: 'Earth', keys: 'Stability · Nurture · Grounding' },
                { icon: icons.metal, name: 'Metal', keys: 'Clarity · Strength · Precision' },
                { icon: icons.water, name: 'Water', keys: 'Wisdom · Flow · Intuition' },
              ].map(({ icon, name, keys }) => (
                <div
                  key={name}
                  className="flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-shadow duration-300 hover:shadow-md"
                  style={{ background: '#F4EFE8', border: '1px solid #E2D8CC' }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ background: 'rgba(176,139,87,0.12)', color: '#B08B57' }}
                  >
                    {icon}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: '#4A3A32', ...BODY }}>
                    {name}
                  </p>
                  <p className="text-[10.5px] leading-relaxed" style={{ color: '#9A8573', ...BODY }}>
                    {keys}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Our Approach */}
          <div className="flex flex-col justify-center">
            <SectionLabel>Our Approach</SectionLabel>
            <GoldBar />
            <h2 style={{ ...SERIF }} className="text-4xl font-light leading-[1.2] text-[#3D2B1F] mb-10 lg:text-5xl">
              Ancient Wisdom,
              <br />Modern Precision.
            </h2>

            <div className="space-y-8">
              {[
                {
                  icon: icons.star,
                  title: 'Ancient Wisdom',
                  desc: 'Five Elements philosophy has guided healers and sages for millennia — we honour this tradition as the foundation of every bracelet.',
                },
                {
                  icon: icons.sparkle,
                  title: 'Modern AI Personalization',
                  desc: 'Our AI analyzes your birth energy profile and current intentions to recommend the precise crystal combination that resonates with you.',
                },
                {
                  icon: icons.heart,
                  title: 'Personal & Meaningful',
                  desc: 'No two bracelets are the same. Each piece is curated for your story — a wearable reflection of your energy, intentions, and inner world.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-5 items-start">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'rgba(176,139,87,0.14)', color: '#B08B57' }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: '#4A3A32', ...BODY }}>
                      {title}
                    </p>
                    <p className="text-[13px] leading-[1.85]" style={{ color: '#7A6355' }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* ════════════════════════════════════════════════════
          4 · HOW IT WORKS
      ════════════════════════════════════════════════════ */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-5xl">

          <div className="mb-16 text-center">
            <SectionLabel>Process</SectionLabel>
            <h2 style={{ ...SERIF }} className="text-4xl font-light text-[#3D2B1F] lg:text-5xl">
              How It Works
            </h2>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">

            {/* Connecting line (desktop only) */}
            <div
              className="absolute top-[22px] left-[12.5%] right-[12.5%] hidden h-px lg:block"
              style={{ background: 'linear-gradient(90deg, transparent, #D4C0A6 20%, #D4C0A6 80%, transparent)' }}
            />

            {[
              {
                n: '01',
                title: 'Share Your Details',
                desc: 'Enter your birth date, birth time, and current intention into our energy quiz.',
                svg: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                ),
              },
              {
                n: '02',
                title: 'We Analyse Your Energy',
                desc: 'Our AI maps your elemental profile using Five Elements wisdom and birth energy principles.',
                svg: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4l3 3"/>
                  </svg>
                ),
              },
              {
                n: '03',
                title: 'Crystal Recommendation',
                desc: 'We select 3–5 natural gemstones that resonate precisely with your energy and intentions.',
                svg: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 17 9 12 22 7 9"/>
                    <line x1="7" y1="9" x2="17" y2="9"/>
                  </svg>
                ),
              },
              {
                n: '04',
                title: 'Your Signature Bracelet',
                desc: 'Your bracelet is handcrafted and shipped — a wearable expression of your unique energy.',
                svg: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3.5 3.5"/>
                    <circle cx="12" cy="12" r="1" fill="currentColor"/>
                  </svg>
                ),
              },
            ].map(({ n, title, desc, svg }) => (
              <div key={n} className="relative flex flex-col items-center text-center">
                {/* Icon circle */}
                <div
                  className="relative z-10 mb-5 flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: '#F4EFE8', border: '1px solid #C9B9A2', color: '#B08B57' }}
                >
                  {svg}
                </div>
                {/* Step number */}
                <p className="mb-2 text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: '#B08B57', ...BODY }}>
                  {n}
                </p>
                <p className="mb-2 text-[13.5px] font-semibold tracking-wide" style={{ color: '#3D2B1F', ...BODY }}>
                  {title}
                </p>
                <p className="text-[12px] leading-[1.85]" style={{ color: '#9A8573' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/energy-quiz"
              className="inline-flex items-center gap-3 rounded-full border px-9 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] transition-all duration-300 hover:text-white"
              style={{ border: '1px solid #B08B57', color: '#B08B57' }}
              onMouseEnter={undefined}
            >
              Begin Your Energy Quiz
            </Link>
          </div>

        </div>
      </section>


      {/* ════════════════════════════════════════════════════
          5 · SYMBOL MEANING
      ════════════════════════════════════════════════════ */}
      <section style={{ background: '#EDE8DF' }} className="py-24 px-6">
        <div className="mx-auto max-w-5xl">

          <div className="mb-14 text-center">
            <SectionLabel>The Symbol</SectionLabel>
            <GoldBar />
            <h2 style={{ ...SERIF }} className="text-4xl font-light text-[#3D2B1F] lg:text-5xl">
              The Meaning Behind
              <br />The SYANN Symbol
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[13px] leading-[1.9] text-[#7A6355]">
              Every element of the SYANN symbol was chosen with intention — a visual
              language of energy, protection, and spiritual alignment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {[
              {
                icon: icons.crystal,
                name: 'Crystal',
                meaning: 'Amplification of energy and intention. The centrepiece of every bracelet.',
              },
              {
                icon: icons.lotus,
                name: 'Lotus Leaves',
                meaning: 'Purity, growth, and spiritual unfolding from stillness.',
              },
              {
                icon: icons.star,
                name: 'Star',
                meaning: 'Guidance, illumination, and connection to the cosmos.',
              },
              {
                icon: icons.moon,
                name: 'Moon & Sun',
                meaning: 'Balance of feminine and masculine energy — inner and outer light.',
              },
              {
                icon: icons.circle,
                name: 'Circle',
                meaning: 'Wholeness, continuity, and the eternal cycle of energy.',
              },
            ].map(({ icon, name, meaning }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-4 rounded-3xl p-6 text-center transition-shadow duration-300 hover:shadow-md"
                style={{ background: '#F4EFE8', border: '1px solid #E2D8CC' }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: 'rgba(176,139,87,0.1)', color: '#B08B57' }}
                >
                  {icon}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: '#4A3A32', ...BODY }}>
                  {name}
                </p>
                <p className="text-[12px] leading-[1.8]" style={{ color: '#9A8573' }}>
                  {meaning}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ════════════════════════════════════════════════════
          6 · FINAL CTA
      ════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-28 px-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #C8AD90 0%, #B08B57 40%, #C4A070 70%, #D4B98A 100%)',
        }}
      >
        {/* Soft noise overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'rgba(255,250,242,0.08)' }}
        />

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full opacity-10" style={{ background: '#fff' }} />

        <div className="relative mx-auto max-w-2xl">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.38em] text-white/70" style={{ ...BODY }}>
            ✦ Your Journey Begins Here
          </p>

          <h2
            style={{ ...SERIF }}
            className="mb-2 text-5xl font-light leading-[1.15] text-white lg:text-6xl"
          >
            Your Energy.
          </h2>
          <h2
            style={{ ...SERIF }}
            className="mb-2 text-5xl font-light leading-[1.15] text-white/80 lg:text-6xl"
          >
            Your Story.
          </h2>
          <h2
            style={{ ...SERIF }}
            className="mb-8 text-5xl font-light leading-[1.15] text-white/60 lg:text-6xl"
          >
            Your Bracelet.
          </h2>

          <p className="mb-10 text-[14px] leading-[1.85] text-white/75" style={{ ...BODY }}>
            Discover the crystals designed uniquely for you — curated through
            <br className="hidden sm:block" />
            Five Elements wisdom and the intelligence of AI.
          </p>

          <Link
            href="/energy-quiz"
            className="inline-flex items-center gap-3 rounded-full px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.32em] transition-all duration-300 hover:opacity-90 hover:shadow-xl"
            style={{ background: '#fff', color: '#B08B57' }}
          >
            Create Your Bracelet
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </section>

    </main>
  )
}
