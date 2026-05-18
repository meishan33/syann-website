'use client'

import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }

const NAV_LINKS = [
  { href: '/about',      label: 'About' },
  { href: '/collection', label: 'Bracelets' },
  { href: '/faq',        label: 'FAQ' },
  { href: '/contact',    label: 'Contact' },
]

const LINK_COLOR   = '#8B7060'
const LINK_HOVER   = '#B08B57'
const GOLD         = '#B08B57'
const GOLD_FAINT   = 'rgba(176,139,87,0.35)'

export default function Footer() {
  return (
    <footer
      style={{
        width: '100%',
        backgroundImage: "url('/footerbanner3.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        ...BODY,
      }}
    >
      {/* Warm translucent overlay so image shows through but text is legible */}
      <div style={{ background: 'rgba(245, 238, 228, 0.72)' }}>

        {/* ── MAIN TWO-COLUMN BODY ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 0,
          maxWidth: 960,
          margin: '0 auto',
          padding: '60px 48px 52px',
          alignItems: 'center',
        }}>

          {/* ── LEFT: BRAND BLOCK ── */}
          <div style={{ paddingRight: 56 }}>

            {/* Wordmark */}
            <p style={{
              ...SERIF,
              fontSize: 42,
              fontWeight: 300,
              letterSpacing: '0.22em',
              color: '#5C4030',
              lineHeight: 1,
              margin: '0 0 7px',
            }}>
              SYANN.CO
            </p>

            {/* Subtitle */}
            <p style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.38em',
              color: GOLD,
              textTransform: 'uppercase',
              margin: '0 0 20px',
              ...BODY,
            }}>
              Crystals · Energy · You
            </p>

            {/* Ornament rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, maxWidth: 200 }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${GOLD_FAINT}, transparent)` }} />
              <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                <polygon points="4,0 8,4 4,8 0,4" fill={GOLD} opacity="0.65"/>
              </svg>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, ${GOLD_FAINT}, transparent)` }} />
            </div>

            {/* Tagline */}
            <p style={{
              ...SERIF,
              fontSize: 14,
              fontStyle: 'italic',
              color: '#9A8070',
              lineHeight: 1.7,
              letterSpacing: '0.02em',
              margin: 0,
            }}>
              Personalized crystal bracelets,
              <br />designed by AI. Aligned with your energy.
            </p>

          </div>


          {/* ── CENTER: VERTICAL SEPARATOR ── */}
          <div style={{
            width: 1,
            alignSelf: 'stretch',
            background: `linear-gradient(to bottom, transparent, ${GOLD_FAINT} 25%, ${GOLD_FAINT} 75%, transparent)`,
          }} />


          {/* ── RIGHT: NAV + SOCIAL ── */}
          <div style={{ paddingLeft: 56 }}>

            {/* Nav links — horizontal row */}
            <div style={{
              display: 'flex',
              gap: 28,
              flexWrap: 'nowrap',
              marginBottom: 36,
            }}>
              {NAV_LINKS.map(({ href, label }) => (
                <div key={href}>
                  <Link
                    href={href}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.32em',
                      textTransform: 'uppercase',
                      color: LINK_COLOR,
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: 8,
                      transition: 'color 0.2s',
                      ...BODY,
                    }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = LINK_HOVER)}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = LINK_COLOR)}
                  >
                    {label}
                  </Link>
                  {/* Individual underbar accent */}
                  <div style={{ width: 20, height: 1, background: GOLD_FAINT }} />
                </div>
              ))}
            </div>

            {/* Social links — vertical list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <a
                href="https://instagram.com/syann.co"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  color: LINK_COLOR,
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  transition: 'color 0.2s',
                  ...BODY,
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = LINK_HOVER)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = LINK_COLOR)}
              >
                <span style={{
                  width: 30, height: 30,
                  borderRadius: '50%',
                  border: `1px solid ${GOLD_FAINT}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                  </svg>
                </span>
                Instagram
              </a>

              <a
                href="https://tiktok.com/@syann.co"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  color: LINK_COLOR,
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  transition: 'color 0.2s',
                  ...BODY,
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = LINK_HOVER)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = LINK_COLOR)}
              >
                <span style={{
                  width: 30, height: 30,
                  borderRadius: '50%',
                  border: `1px solid ${GOLD_FAINT}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7.04a4.85 4.85 0 0 1-1.01-.35z"/>
                  </svg>
                </span>
                TikTok
              </a>

              <a
                href="mailto:hello@syann.co"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  color: LINK_COLOR,
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  transition: 'color 0.2s',
                  ...BODY,
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = LINK_HOVER)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = LINK_COLOR)}
              >
                <span style={{
                  width: 30, height: 30,
                  borderRadius: '50%',
                  border: `1px solid ${GOLD_FAINT}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
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


        {/* ── BOTTOM DIVIDER + COPYRIGHT ── */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 48px 28px' }}>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD_FAINT})` }} />
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ margin: '0 16px', flexShrink: 0 }} aria-hidden="true">
              <polygon points="6,0 12,6 6,12 0,6" fill={GOLD} opacity="0.55"/>
            </svg>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD_FAINT})` }} />
          </div>

          <p style={{
            textAlign: 'center',
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: '0.28em',
            color: '#AE9C8A',
            textTransform: 'uppercase',
            margin: 0,
            ...BODY,
          }}>
            © 2026 SYANN.CO — Energy · Beauty · You.
          </p>

        </div>

      </div>
    </footer>
  )
}
