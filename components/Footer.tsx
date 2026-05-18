import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }

const NAV_LINKS = [
  { href: '/about',      label: 'About' },
  { href: '/collection', label: 'Bracelets' },
  { href: '/faq',        label: 'FAQ' },
  { href: '/contact',    label: 'Contact' },
]

export default function Footer() {
  return (
    <footer
      style={{
        width: '100%',
        ...BODY,
        position: 'relative',
        overflow: 'hidden',
        /* Soft ivory-to-taupe gradient — layered depth */
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #EEE5D6 0%, #DDD0BC 55%, #CFC0A6 100%)',
      }}
    >

      {/* ── Subtle corner celestial accents ── */}

      {/* Top-left: faint crystal silhouette */}
      <svg
        aria-hidden="true"
        width="120" height="140"
        viewBox="0 0 120 140"
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0.07, pointerEvents: 'none' }}
      >
        <polygon points="60,8 90,52 60,130 30,52" stroke="#8B6E52" strokeWidth="1" fill="none"/>
        <polygon points="60,28 78,56 60,108 42,56" stroke="#8B6E52" strokeWidth="0.6" fill="none"/>
        <line x1="30" y1="52" x2="8" y2="70" stroke="#8B6E52" strokeWidth="0.6"/>
        <line x1="90" y1="52" x2="112" y2="70" stroke="#8B6E52" strokeWidth="0.6"/>
        <circle cx="18" cy="28" r="1.5" fill="#8B6E52"/>
        <circle cx="8"  cy="48" r="1"   fill="#8B6E52"/>
      </svg>

      {/* Top-right: celestial dots */}
      <svg
        aria-hidden="true"
        width="100" height="100"
        viewBox="0 0 100 100"
        style={{ position: 'absolute', top: 0, right: 0, opacity: 0.08, pointerEvents: 'none' }}
      >
        <circle cx="80" cy="20" r="2"   fill="#8B6E52"/>
        <circle cx="92" cy="38" r="1.2" fill="#8B6E52"/>
        <circle cx="65" cy="12" r="1"   fill="#8B6E52"/>
        <circle cx="96" cy="56" r="0.8" fill="#8B6E52"/>
        <path d="M70 30 Q80 10 95 25" stroke="#8B6E52" strokeWidth="0.5" fill="none"/>
      </svg>

      {/* Bottom-left: soft arc */}
      <svg
        aria-hidden="true"
        width="90" height="60"
        viewBox="0 0 90 60"
        style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.06, pointerEvents: 'none' }}
      >
        <path d="M0 60 Q40 20 90 40" stroke="#8B6E52" strokeWidth="0.8" fill="none"/>
        <circle cx="15" cy="50" r="1.5" fill="#8B6E52"/>
      </svg>

      {/* Bottom-right: arc */}
      <svg
        aria-hidden="true"
        width="90" height="60"
        viewBox="0 0 90 60"
        style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.06, pointerEvents: 'none' }}
      >
        <path d="M90 60 Q50 20 0 40" stroke="#8B6E52" strokeWidth="0.8" fill="none"/>
        <circle cx="75" cy="50" r="1.5" fill="#8B6E52"/>
      </svg>


      {/* ── MAIN CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '60px 24px 0' }}>

        {/* ── LOGO AREA ── */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>

          {/* Radial glow behind logo */}
          <div style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 24,
          }}>
            {/* Glow layer */}
            <div style={{
              position: 'absolute',
              inset: '-24px -40px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(176,139,87,0.14) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Symbol */}
            <img
              src="/NewSymbols_transparent.png"
              alt="SYANN crystal symbol"
              style={{
                width: 108,
                height: 108,
                objectFit: 'contain',
                display: 'block',
                opacity: 0.88,
                position: 'relative',
              }}
            />

            {/* Vertical rule */}
            <div style={{
              width: 1,
              height: 76,
              flexShrink: 0,
              background: 'linear-gradient(to bottom, transparent, rgba(176,139,87,0.55) 30%, rgba(176,139,87,0.55) 70%, transparent)',
              position: 'relative',
            }} />

            {/* Text */}
            <div style={{ textAlign: 'left', position: 'relative' }}>
              <p style={{
                ...SERIF,
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '0.28em',
                color: '#5C4030',
                lineHeight: 1,
                margin: '0 0 5px',
              }}>
                SYANN.CO
              </p>
              <p style={{
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.38em',
                color: '#B08B57',
                textTransform: 'uppercase',
                margin: '0 0 10px',
                ...BODY,
              }}>
                Crystals · Energy · You
              </p>
              <p style={{
                ...SERIF,
                fontSize: 13,
                fontStyle: 'italic',
                color: '#9A8070',
                lineHeight: 1.65,
                letterSpacing: '0.025em',
                margin: 0,
              }}>
                Personalized crystal bracelets,
                <br />designed by AI. Aligned with your energy.
              </p>
            </div>
          </div>
        </div>


        {/* ── GRADIENT HAIRLINE DIVIDER ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          maxWidth: 520,
          margin: '0 auto 38px',
        }}>
          <div style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(176,139,87,0.45))',
          }} />
          <span style={{
            fontSize: 10,
            color: 'rgba(176,139,87,0.65)',
            margin: '0 14px',
            lineHeight: 1,
          }}>✦</span>
          <div style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(to left, transparent, rgba(176,139,87,0.45))',
          }} />
        </div>


        {/* ── NAV LINKS ── */}
        <nav
          aria-label="Footer"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px 0',
            marginBottom: 30,
          }}
        >
          {NAV_LINKS.map(({ href, label }, i) => (
            <span key={href} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {i > 0 && (
                <span style={{
                  color: 'rgba(139,110,82,0.28)',
                  fontSize: 10,
                  margin: '0 22px',
                  letterSpacing: 0,
                }}>|</span>
              )}
              <Link
                href={href}
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.34em',
                  textTransform: 'uppercase',
                  color: '#8B7060',
                  textDecoration: 'none',
                  transition: 'color 0.25s',
                  ...BODY,
                }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#8B7060')}
              >
                {label}
              </Link>
            </span>
          ))}
        </nav>


        {/* ── SOCIAL ROW ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 0,
          marginBottom: 48,
        }}>

          {/* Instagram */}
          <a
            href="https://instagram.com/syann.co"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              color: '#9A8070',
              textDecoration: 'none',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              transition: 'color 0.25s',
              ...BODY,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B08B57')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9A8070')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
            </svg>
            Instagram
          </a>

          <span style={{ color: 'rgba(139,110,82,0.3)', margin: '0 18px', fontSize: 11 }}>·</span>

          {/* TikTok */}
          <a
            href="https://tiktok.com/@syann.co"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              color: '#9A8070',
              textDecoration: 'none',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              transition: 'color 0.25s',
              ...BODY,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B08B57')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9A8070')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7.04a4.85 4.85 0 0 1-1.01-.35z"/>
            </svg>
            TikTok
          </a>

          <span style={{ color: 'rgba(139,110,82,0.3)', margin: '0 18px', fontSize: 11 }}>·</span>

          {/* Email */}
          <a
            href="mailto:hello@syann.co"
            style={{
              color: '#9A8070',
              textDecoration: 'none',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.18em',
              transition: 'color 0.25s',
              ...BODY,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B08B57')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9A8070')}
          >
            hello@syann.co
          </a>
        </div>

      </div>


      {/* ── BOTTOM ORNAMENT + COPYRIGHT ── */}
      <div style={{ position: 'relative', zIndex: 1, paddingBottom: 28 }}>

        {/* Gradient divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '0 48px 20px',
        }}>
          <div style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(176,139,87,0.3))',
          }} />
          <svg
            width="14" height="14"
            viewBox="0 0 14 14"
            aria-hidden="true"
            style={{ margin: '0 14px', flexShrink: 0, opacity: 0.45 }}
          >
            <polygon points="7,0 14,7 7,14 0,7" fill="#B08B57"/>
          </svg>
          <div style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(to left, transparent, rgba(176,139,87,0.3))',
          }} />
        </div>

        {/* Copyright */}
        <p style={{
          textAlign: 'center',
          fontSize: 9.5,
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

    </footer>
  )
}
