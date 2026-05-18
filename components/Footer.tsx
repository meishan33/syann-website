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
  color: '#6B4F3A',
  margin: '0 0 10px',
}

const UNDERBAR = (
  <div style={{ width: 28, height: 1.5, background: '#C4A882', marginBottom: 20 }} />
)

const LINK_STYLE: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 12.5,
  color: '#8B6E52',
  textDecoration: 'none',
  letterSpacing: '0.02em',
  lineHeight: 1,
  transition: 'color 0.2s',
}

const SHOP_LINKS = [
  { href: '/collection',    label: 'All Bracelets' },
  { href: '/how-it-works',  label: 'How It Works' },
  { href: '/best-sellers',  label: 'Best Sellers' },
  { href: '/gift-cards',    label: 'Gift Cards' },
]

const ABOUT_LINKS = [
  { href: '/about',         label: 'Our Story' },
  { href: '/five-elements', label: 'The Five Elements' },
  { href: '/crystals',      label: 'Crystal Guide' },
  { href: '/faq',           label: 'FAQ' },
]

const CARE_LINKS = [
  { href: '/order-tracking', label: 'Track Your Order' },
  { href: '/shipping',       label: 'Shipping & Delivery' },
  { href: '/returns',        label: 'Returns & Exchanges' },
  { href: '/contact',        label: 'Contact Us' },
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
    href: 'https://facebook.com/syannco',
    label: 'Facebook',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    href: 'https://pinterest.com/syann_co',
    label: 'Pinterest',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
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
        backgroundImage: "url('/footerbanner2.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        ...BODY,
      }}
    >
      {/* Light overlay so text reads cleanly over the image */}
      <div style={{ background: 'rgba(248, 242, 234, 0.78)' }}>

        {/* ── 5-COLUMN GRID ── */}
        <div style={{ padding: '52px 48px 36px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1.2fr 1fr 1.5fr',
            gap: '0 44px',
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
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#8B6E52')}
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
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#8B6E52')}
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
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#8B6E52')}
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
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B08B57')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8B6E52')}
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
                  <p style={{ fontSize: 12.5, color: '#8B6E52', lineHeight: 1.75, marginBottom: 18 }}>
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
                        border: '1px solid #C4A882',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.55)',
                        color: '#4A3A32',
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
        <div style={{ padding: '0 48px', display: 'flex', alignItems: 'center', gap: 0 }}>
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
          padding: '20px 48px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 11, color: '#8B7060', letterSpacing: '0.06em' }}>
            © 2026 SYANN.CO. All rights reserved.
          </span>
          <span style={{ color: '#C4A882', fontSize: 11 }}>|</span>
          <Link
            href="/privacy"
            style={{ fontSize: 11, color: '#8B7060', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = '#8B7060')}
          >
            Privacy Policy
          </Link>
          <span style={{ color: '#C4A882', fontSize: 11 }}>|</span>
          <Link
            href="/terms"
            style={{ fontSize: 11, color: '#8B7060', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = '#8B7060')}
          >
            Terms of Service
          </Link>
        </div>

      </div>
    </footer>
  )
}
