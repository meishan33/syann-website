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

export default function Footer() {
  return (
    <footer
      style={{
        width: '100%',
        background: '#D4C5AE',
        ...BODY,
        textAlign: 'center',
      }}
    >
      <div style={{ padding: '52px 24px 0' }}>

        {/* ── BRAND BLOCK ── */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 28,
          }}
        >
          {/* Logo */}
          <img
            src="/NewSymbols_transparent.png"
            alt="SYANN crystal symbol"
            style={{ width: 90, height: 90, objectFit: 'contain', display: 'block', opacity: 0.92 }}
          />

          {/* Vertical divider */}
          <div style={{ width: 1, height: 72, background: '#B08B57', opacity: 0.5, flexShrink: 0 }} />

          {/* Text block */}
          <div style={{ textAlign: 'left' }}>
            <p
              style={{
                ...SERIF,
                fontSize: 38,
                fontWeight: 300,
                letterSpacing: '0.26em',
                color: '#6B4F3A',
                lineHeight: 1,
                margin: '0 0 6px',
              }}
            >
              SYANN.CO
            </p>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.32em',
                color: '#B08B57',
                textTransform: 'uppercase',
                margin: '0 0 12px',
              }}
            >
              Crystals · Energy · You
            </p>
            <p
              style={{
                ...SERIF,
                fontSize: 14.5,
                fontStyle: 'italic',
                color: '#8B7060',
                lineHeight: 1.65,
                letterSpacing: '0.03em',
                margin: 0,
              }}
            >
              Personalized crystal bracelets, designed
              <br />by AI. Aligned with your energy.
            </p>
          </div>
        </div>

        {/* ── HAIRLINE ── */}
        <div style={{ height: 1, background: 'rgba(107,79,58,0.2)', margin: '36px auto', maxWidth: 480 }} />

        {/* ── NAV LINKS ── */}
        <nav aria-label="Footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {NAV_LINKS.map(({ href, label }, i) => (
            <span key={href} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {i > 0 && (
                <span style={{ color: 'rgba(107,79,58,0.3)', fontSize: 11, margin: '0 18px' }}>|</span>
              )}
              <Link
                href={href}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: '#7A5C42',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#7A5C42')}
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
            flexWrap: 'wrap',
            marginTop: 22,
          }}
        >
          <a
            href="https://instagram.com/syann.co"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#7A5C42', textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B08B57')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#7A5C42')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
            </svg>
            Instagram
          </a>

          <span style={{ color: 'rgba(107,79,58,0.35)', margin: '0 14px' }}>·</span>

          <a
            href="https://tiktok.com/@syann.co"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#7A5C42', textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B08B57')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#7A5C42')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7.04a4.85 4.85 0 0 1-1.01-.35z"/>
            </svg>
            TikTok
          </a>

          <span style={{ color: 'rgba(107,79,58,0.35)', margin: '0 14px' }}>·</span>

          <a
            href="mailto:hello@syann.co"
            style={{ color: '#7A5C42', textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B08B57')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#7A5C42')}
          >
            hello@syann.co
          </a>
        </div>

      </div>

      {/* ── ORNAMENT DIVIDER ── */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '36px 48px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(107,79,58,0.2)' }} />
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ margin: '0 14px', flexShrink: 0 }} aria-hidden="true">
          <polygon points="6,0 12,6 6,12 0,6" fill="#B08B57" opacity="0.55"/>
        </svg>
        <div style={{ flex: 1, height: 1, background: 'rgba(107,79,58,0.2)' }} />
      </div>

      {/* ── COPYRIGHT ── */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.22em',
          color: '#9A8070',
          textTransform: 'uppercase',
          margin: 0,
          padding: '16px 24px 22px',
        }}
      >
        © 2026 SYANN.CO — Energy · Beauty · You.
      </p>

    </footer>
  )
}
