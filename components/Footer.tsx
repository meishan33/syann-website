'use client'

import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }

const NAV_LINKS = [
  { href: '/',            label: 'Main' },
  { href: '/energy-quiz', label: 'Energy Quiz' },
  { href: '/about',       label: 'About' },
  { href: '/faq',         label: 'FAQ' },
  { href: '/contact',     label: 'Contact' },
]

const LINK_COLOR = '#8B7060'
const LINK_HOVER = '#B08B57'
const GOLD       = '#B08B57'
const GOLD_FAINT = 'rgba(176,139,87,0.35)'

export default function Footer() {
  return (
    <footer
      style={{
        width: '100%',
        backgroundImage: "url('/footerbanner3.png')",
        backgroundSize: '100% 100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        ...BODY,
      }}
    >
      <div style={{ background: 'rgba(245, 238, 228, 0.72)' }}>

        {/* ── MAIN BODY ── */}
        <div className="mx-auto max-w-[1280px] px-6 py-7 lg:px-12 lg:py-8">

          {/* Two-col on desktop, stacked on mobile */}
          <div className="flex flex-col items-center gap-10 lg:grid lg:items-center lg:gap-0"
               style={{ gridTemplateColumns: '1fr auto 1.6fr' }}>

            {/* ── LEFT: BRAND ── */}
            <div className="text-center lg:text-left w-full lg:pl-16">

              <p style={{ ...SERIF, fontSize: 30, fontWeight: 300, letterSpacing: '0.22em', color: '#5C4030', lineHeight: 1, margin: '0 0 5px' }}>
                SYANN.CO
              </p>

              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.38em', color: GOLD, textTransform: 'uppercase', margin: '0 0 12px', ...BODY }}>
                Crystals · Energy · You
              </p>

              {/* Ornament */}
              <div className="flex items-center gap-2.5 mb-3 mx-auto lg:mx-0" style={{ maxWidth: 180 }}>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${GOLD_FAINT}, transparent)` }} />
                <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden="true">
                  <polygon points="4,0 8,4 4,8 0,4" fill={GOLD} opacity="0.65" />
                </svg>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${GOLD_FAINT}, transparent)` }} />
              </div>

              <p style={{ ...SERIF, fontSize: 13, fontStyle: 'italic', color: '#9A8070', lineHeight: 1.6, letterSpacing: '0.02em', margin: 0 }}>
                Personalized crystal bracelets,
                <br />designed by AI. Aligned with your energy.
              </p>
            </div>


            {/* ── CENTER SEPARATOR — desktop only ── */}
            <div
              className="hidden lg:block self-stretch w-px"
              style={{ background: `linear-gradient(to bottom, transparent, ${GOLD_FAINT} 25%, ${GOLD_FAINT} 75%, transparent)` }}
            />


            {/* ── RIGHT: NAV + SOCIAL (two sub-columns) ── */}
            <div className="flex flex-col lg:flex-row w-full gap-10 lg:gap-12 items-center lg:items-start lg:justify-start lg:pl-16">

              {/* Nav links — stacked */}
              <div className="flex flex-col items-center lg:items-start gap-3">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: LINK_COLOR, textDecoration: 'none', transition: 'color 0.2s', ...BODY }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = LINK_HOVER)}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = LINK_COLOR)}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Social links — stacked */}
              <div className="flex flex-col items-center lg:items-start gap-3">

                <a
                  href="https://instagram.com/syann.co_official"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-colors duration-200"
                  style={{ color: LINK_COLOR, textDecoration: 'none', ...BODY }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = LINK_HOVER)}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = LINK_COLOR)}
                >
                  <span className="flex items-center justify-center w-[30px] h-[30px] rounded-full shrink-0" style={{ border: `1px solid ${GOLD_FAINT}` }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                    </svg>
                  </span>
                  <span style={{ fontSize: 11, letterSpacing: '0.16em', color: LINK_COLOR, fontWeight: 500, ...BODY }}>@syann.co_official</span>
                </a>

                <a
                  href="https://tiktok.com/@syann.co"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-colors duration-200"
                  style={{ color: LINK_COLOR, textDecoration: 'none', ...BODY }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = LINK_HOVER)}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = LINK_COLOR)}
                >
                  <span className="flex items-center justify-center w-[30px] h-[30px] rounded-full shrink-0" style={{ border: `1px solid ${GOLD_FAINT}` }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7.04a4.85 4.85 0 0 1-1.01-.35z"/>
                    </svg>
                  </span>
                  <span style={{ fontSize: 11, letterSpacing: '0.16em', color: LINK_COLOR, fontWeight: 500, ...BODY }}>@syann.co</span>
                </a>

                <a
                  href="mailto:hello@syann.co"
                  className="inline-flex items-center gap-3 transition-colors duration-200"
                  style={{ color: LINK_COLOR, textDecoration: 'none', fontSize: 11, fontWeight: 500, letterSpacing: '0.16em', ...BODY }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = LINK_HOVER)}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = LINK_COLOR)}
                >
                  <span className="flex items-center justify-center w-[30px] h-[30px] rounded-full shrink-0" style={{ border: `1px solid ${GOLD_FAINT}` }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  hello@syann.co
                </a>

              </div>
            </div>

          </div>
        </div>


        {/* ── BOTTOM DIVIDER + COPYRIGHT ── */}
        <div className="mx-auto max-w-[1280px] px-6 pb-7 lg:px-12">

          <div className="flex items-center mb-4">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${GOLD_FAINT})` }} />
            <svg width="11" height="11" viewBox="0 0 12 12" className="mx-4 shrink-0" aria-hidden="true">
              <polygon points="6,0 12,6 6,12 0,6" fill={GOLD} opacity="0.55" />
            </svg>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${GOLD_FAINT})` }} />
          </div>

          <p className="text-center" style={{ fontSize: 10, fontWeight: 400, letterSpacing: '0.26em', color: '#AE9C8A', textTransform: 'uppercase', margin: 0, ...BODY }}>
            © 2026 SYANN.CO — Crystals · Energy · You.
          </p>

        </div>

      </div>
    </footer>
  )
}
