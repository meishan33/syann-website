'use client'

import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }

const NAV_LINKS = [
  { href: '/about',       label: 'About' },
  { href: '/collection',  label: 'Bracelets' },
  { href: '/faq',         label: 'FAQ' },
  { href: '/contact',     label: 'Contact' },
]

function CrystalIcon() {
  return (
    <svg width="38" height="44" viewBox="0 0 38 44" fill="none" aria-hidden="true">
      <polygon points="19,2 28,14 19,28 10,14" stroke="#C4A882" strokeWidth="0.9" fill="none" opacity="0.9"/>
      <polygon points="19,8 25,16 19,26 13,16"  stroke="#C4A882" strokeWidth="0.6" fill="#C4A882" fillOpacity="0.08" opacity="0.7"/>
      <line x1="19" y1="28" x2="19" y2="40"    stroke="#C4A882" strokeWidth="0.8" opacity="0.6"/>
      <line x1="10" y1="14" x2="4"  y2="20"    stroke="#C4A882" strokeWidth="0.6" opacity="0.4"/>
      <line x1="28" y1="14" x2="34" y2="20"    stroke="#C4A882" strokeWidth="0.6" opacity="0.4"/>
      <circle cx="33" cy="8"  r="1"  fill="#C4A882" opacity="0.5"/>
      <circle cx="6"  cy="22" r="0.7" fill="#C4A882" opacity="0.4"/>
      <polygon points="19,38 20.5,40 19,42 17.5,40" fill="#C4A882" opacity="0.55"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer
      style={{
        width: '100%',
        background: '#3D2B1F',
        ...BODY,
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px 0' }}>

        {/* ── WORDMARK ── */}
        <p
          style={{
            ...SERIF,
            fontSize: 52,
            fontWeight: 300,
            letterSpacing: '0.32em',
            color: '#C4A882',
            lineHeight: 1,
            margin: 0,
          }}
        >
          SYANN.CO
        </p>

        {/* ── CRYSTAL ICON ── */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 16px' }}>
          <CrystalIcon />
        </div>

        {/* ── TAGLINE ── */}
        <p
          style={{
            ...SERIF,
            fontSize: 16,
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#A89280',
            lineHeight: 1.75,
            letterSpacing: '0.04em',
            margin: 0,
          }}
        >
          Personalized crystal bracelets, designed by AI.
          <br />Aligned with your energy.
        </p>

        {/* ── HAIRLINE ── */}
        <div style={{ height: 1, background: 'rgba(196,168,130,0.2)', margin: '36px 0' }} />

        {/* ── NAV LINKS ── */}
        <nav aria-label="Footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px 0', flexWrap: 'wrap' }}>
          {NAV_LINKS.map(({ href, label }, i) => (
            <span key={href} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <span style={{ color: 'rgba(196,168,130,0.4)', fontSize: 11, margin: '0 20px' }}>|</span>
              )}
              <Link
                href={href}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#A89280',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#C9A96E')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#A89280')}
              >
                {label}
              </Link>
            </span>
          ))}
        </nav>

        {/* ── SOCIAL ROW ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0,
            flexWrap: 'wrap',
            margin: '28px 0 0',
          }}
        >
          {/* Instagram */}
          <a
            href="https://instagram.com/syann.co"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#A89280', textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C9A96E')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89280')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
            </svg>
            Instagram
          </a>

          <span style={{ color: 'rgba(196,168,130,0.4)', margin: '0 16px', fontSize: 12 }}>·</span>

          {/* TikTok */}
          <a
            href="https://tiktok.com/@syann.co"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#A89280', textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C9A96E')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89280')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7.04a4.85 4.85 0 0 1-1.01-.35z"/>
            </svg>
            TikTok
          </a>

          <span style={{ color: 'rgba(196,168,130,0.4)', margin: '0 16px', fontSize: 12 }}>·</span>

          {/* Email */}
          <a
            href="mailto:hello@syann.co"
            style={{ color: '#A89280', textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C9A96E')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89280')}
          >
            hello@syann.co
          </a>
        </div>

      </div>

      {/* ── ORNAMENT DIVIDER ── */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '40px 48px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(196,168,130,0.25)' }} />
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ margin: '0 16px', flexShrink: 0 }} aria-hidden="true">
          <polygon points="7,0 14,7 7,14 0,7" fill="#C4A882" opacity="0.6"/>
        </svg>
        <div style={{ flex: 1, height: 1, background: 'rgba(196,168,130,0.25)' }} />
      </div>

      {/* ── COPYRIGHT ── */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.24em',
          color: '#6A5848',
          textTransform: 'uppercase',
          margin: 0,
          padding: '18px 24px 24px',
        }}
      >
        © 2026 SYANN.CO — Energy · Beauty · You.
      </p>

    </footer>
  )
}
