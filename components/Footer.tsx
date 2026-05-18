'use client'

import { useState } from 'react'
import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const NO_LIST: React.CSSProperties = { listStyle: 'none', padding: 0, margin: 0 }

const COL_HEAD: React.CSSProperties = {
  ...{ fontFamily: "'Montserrat', sans-serif" },
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.28em',
  textTransform: 'uppercase' as const,
  color: '#D4C4AE',
  margin: '0 0 10px',
}

const UNDERBAR = (
  <div style={{ width: 28, height: 1.5, background: '#C4A882', marginBottom: 20 }} />
)

const LINK_STYLE: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 12.5,
  color: '#A89280',
  textDecoration: 'none',
  letterSpacing: '0.02em',
  lineHeight: 1,
  transition: 'color 0.2s',
}

const SHOP_LINKS = [
  { href: '/collection',   label: 'All Bracelets' },
  { href: '/how-it-works', label: 'How It Works' },
]

const ABOUT_LINKS = [
  { href: '/about', label: 'Our Story' },
  { href: '/faq',   label: 'FAQ' },
]

const CARE_LINKS = [
  { href: '/shipping', label: 'Shipping & Delivery' },
  { href: '/returns',  label: 'Returns & Exchanges' },
  { href: '/contact',  label: 'Contact Us' },
]

const SOCIAL_LINKS = [
  {
    href: 'https://instagram.com/syann.co',
    label: 'Instagram',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: 'https://tiktok.com/@syann.co',
    label: 'TikTok',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7.04a4.85 4.85 0 0 1-1.01-.35z"/>
      </svg>
    ),
  },
  {
    href: 'mailto:hello@syann.co',
    label: 'hello@syann.co',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
]

/* Crystal ornament SVG for divider */
function CrystalOrnament() {
  return (
    <svg width="48" height="52" viewBox="0 0 48 52" fill="none" aria-hidden="true">
      <line x1="24" y1="2" x2="24" y2="12" stroke="#C4A882" strokeWidth="0.8"/>
      <line x1="24" y1="40" x2="24" y2="50" stroke="#C4A882" strokeWidth="0.8"/>
      <polygon points="24,2 26,5 24,8 22,5" fill="#C4A882" opacity="0.7"/>
      <g transform="translate(24,26)" stroke="#C4A882" strokeWidth="0.9" fill="none">
        <polygon points="0,-14 4,-6 0,0 -4,-6" opacity="0.9"/>
        <polygon points="0,-10 3,-4 0,2 -3,-4" fill="#C4A882" fillOpacity="0.15" opacity="0.8"/>
        <polygon points="5,-10 8,-3 5,4 2,-3" opacity="0.7"/>
        <polygon points="-5,-10 -2,-3 -5,4 -8,-3" opacity="0.7"/>
        <polygon points="0,-6 2,-1 0,3 -2,-1" fill="#C4A882" fillOpacity="0.25"/>
      </g>
    </svg>
  )
}

export default function Footer() {
  const [email, setEmail]   = useState('')
  const [joined, setJoined] = useState(false)

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) setJoined(true)
  }

  return (
    <footer
      style={{
        width: '100%',
        background: '#3D2B1F',
        ...BODY,
      }}
    >
      <div>

        {/* ── 5-COLUMN GRID ── */}
        <div style={{ padding: '52px 24px 36px' }}>
          <div style={{
            maxWidth: 1060,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1.2fr 1fr 1.5fr',
            gap: '0 48px',
            alignItems: 'start',
          }}>

            {/* SHOP */}
            <div>
              <p style={COL_HEAD}>Shop</p>
              {UNDERBAR}
              <ul style={NO_LIST}>
                {SHOP_LINKS.map(({ href, label }) => (
                  <li key={href} style={{ marginBottom: 14 }}>
                    <Link href={href} style={LINK_STYLE}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#C9A96E')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#A89280')}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ABOUT */}
            <div>
              <p style={COL_HEAD}>About</p>
              {UNDERBAR}
              <ul style={NO_LIST}>
                {ABOUT_LINKS.map(({ href, label }) => (
                  <li key={href} style={{ marginBottom: 14 }}>
                    <Link href={href} style={LINK_STYLE}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#C9A96E')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#A89280')}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CUSTOMER CARE */}
            <div>
              <p style={COL_HEAD}>Customer Care</p>
              {UNDERBAR}
              <ul style={NO_LIST}>
                {CARE_LINKS.map(({ href, label }) => (
                  <li key={href} style={{ marginBottom: 14 }}>
                    <Link href={href} style={LINK_STYLE}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#C9A96E')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#A89280')}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONNECT */}
            <div>
              <p style={COL_HEAD}>Connect</p>
              {UNDERBAR}
              <ul style={NO_LIST}>
                {SOCIAL_LINKS.map(({ href, label, icon }) => (
                  <li key={href} style={{ marginBottom: 14 }}>
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{ ...LINK_STYLE, display: 'inline-flex', alignItems: 'center', gap: 9 }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C9A96E')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89280')}
                    >
                      <span style={{ opacity: 0.75, display: 'flex' }}>{icon}</span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* NEWSLETTER */}
            <div>
              <p style={COL_HEAD}>Newsletter</p>
              {UNDERBAR}
              {joined ? (
                <p style={{ ...LINK_STYLE, color: '#B08B57', fontWeight: 500 }}>
                  Thank you for joining!
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 12.5, color: '#A89280', lineHeight: 1.75, marginBottom: 18 }}>
                    Stay inspired. Be the first to know about new collections and offers.
                  </p>
                  <form onSubmit={handleJoin} style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Your email address"
                      required
                      style={{
                        width: '100%',
                        fontSize: 12,
                        padding: '11px 44px 11px 14px',
                        border: '1px solid rgba(196,168,130,0.35)',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.07)',
                        color: '#E0D0BC',
                        outline: 'none',
                        fontFamily: "'Montserrat', sans-serif",
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="submit"
                      aria-label="Subscribe"
                      style={{
                        position: 'absolute',
                        right: 1,
                        top: 1,
                        bottom: 1,
                        width: 38,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        borderLeft: '1px solid #C4A882',
                        color: '#B08B57',
                        cursor: 'pointer',
                        borderRadius: '0 5px 5px 0',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(176,139,87,0.12)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>


        {/* ── ORNAMENT DIVIDER ── */}
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 0 }}>
          {/* Left side: line — small diamond — line */}
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ flexShrink: 0 }}>
            <polygon points="8,2 14,8 8,14 2,8" fill="none" stroke="#C4A882" strokeWidth="1"/>
          </svg>
          <div style={{ flex: 1, height: 1, background: '#C4A882', opacity: 0.6 }} />
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" style={{ flexShrink: 0, margin: '0 8px' }}>
            <polygon points="5,0 10,5 5,10 0,5" fill="#C4A882" opacity="0.7"/>
          </svg>
          {/* Crystal ornament center */}
          <CrystalOrnament />
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" style={{ flexShrink: 0, margin: '0 8px' }}>
            <polygon points="5,0 10,5 5,10 0,5" fill="#C4A882" opacity="0.7"/>
          </svg>
          <div style={{ flex: 1, height: 1, background: '#C4A882', opacity: 0.6 }} />
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ flexShrink: 0 }}>
            <polygon points="8,2 14,8 8,14 2,8" fill="none" stroke="#C4A882" strokeWidth="1"/>
          </svg>
        </div>


        {/* ── COPYRIGHT ROW ── */}
        <div style={{
          padding: '20px 24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 11, color: '#7A6858', letterSpacing: '0.06em' }}>
            © 2026 SYANN.CO. All rights reserved.
          </span>
          <span style={{ color: 'rgba(196,168,130,0.4)', fontSize: 11 }}>|</span>
          <Link
            href="/privacy"
            style={{ fontSize: 11, color: '#7A6858', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#C9A96E')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = '#7A6858')}
          >
            Privacy Policy
          </Link>
          <span style={{ color: 'rgba(196,168,130,0.4)', fontSize: 11 }}>|</span>
          <Link
            href="/terms"
            style={{ fontSize: 11, color: '#7A6858', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#C9A96E')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = '#7A6858')}
          >
            Terms of Service
          </Link>
        </div>

      </div>
    </footer>
  )
}
