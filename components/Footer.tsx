'use client'

import { useState } from 'react'
import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const RESET_LIST: React.CSSProperties = { listStyle: 'none', padding: 0, margin: 0 }

const DISCOVER_LINKS = [
  { href: '/how-it-works',  label: 'How It Works' },
  { href: '/five-elements', label: 'The Five Elements' },
  { href: '/crystals',      label: 'Crystal Guide' },
  { href: '/journal',       label: 'Journal' },
  { href: '/about',         label: 'About Us' },
]

const CARE_LINKS = [
  { href: '/faq',            label: 'FAQ' },
  { href: '/shipping',       label: 'Shipping & Delivery' },
  { href: '/returns',        label: 'Returns & Exchanges' },
  { href: '/order-tracking', label: 'Order Tracking' },
  { href: '/care',           label: 'Care Instructions' },
  { href: '/contact',        label: 'Contact Us' },
]

const SOCIAL = [
  {
    href: 'https://instagram.com/syann.co', label: 'Instagram',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>,
  },
  {
    href: 'https://tiktok.com/@syann.co', label: 'TikTok',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7.04a4.85 4.85 0 0 1-1.01-.35z"/></svg>,
  },
  {
    href: 'https://pinterest.com/syann_co', label: 'Pinterest',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>,
  },
  {
    href: 'mailto:hello@syann.co', label: 'Email',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) setJoined(true)
  }

  return (
    <footer
      style={{
        width: '100%',
        backgroundImage: "url('/footerBanner.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        ...BODY,
      }}
    >

      {/* ══ MAIN — warm overlay ══ */}
      <div style={{ background: 'rgba(243, 237, 229, 0.94)' }}>
        <div style={{ padding: '0 48px' }}>

          {/* Top ornament */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 36 }}>
            <div style={{ flex: 1, height: 1, background: '#C9B99E' }} />
            <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
              <polygon points="4,0 8,4 4,8 0,4" fill="#B08B57" />
            </svg>
            <div style={{ flex: 1, height: 1, background: '#C9B99E' }} />
          </div>

          {/* ── BRAND STRIP ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 26px', gap: 48 }}>

            {/* Wordmark */}
            <div style={{ flexShrink: 0 }}>
              <p style={{ ...SERIF, fontSize: 34, fontWeight: 300, letterSpacing: '0.42em', color: '#4A3A32', lineHeight: 1, margin: 0 }}>
                SYANN<span style={{ color: '#B08B57' }}> · </span>CO
              </p>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.36em', color: '#B08B57', textTransform: 'uppercase', margin: '6px 0 0' }}>
                Crystals · Energy · You
              </p>
            </div>

            {/* Description */}
            <p style={{ fontSize: 12, lineHeight: 1.8, color: '#7A6355', maxWidth: 340, margin: 0, flexShrink: 1 }}>
              Handcrafted crystal bracelets designed through Five Elements wisdom and AI
              energy analysis — to harmonize, protect, and align your energy.
            </p>

            {/* Social */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {SOCIAL.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  style={{
                    width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    border: '1px solid #C9B99E',
                    color: '#9A8573',
                    textDecoration: 'none',
                    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = '#B08B57'
                    el.style.borderColor = '#B08B57'
                    el.style.color = '#fff'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'transparent'
                    el.style.borderColor = '#C9B99E'
                    el.style.color = '#9A8573'
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>

          </div>

          {/* Hairline separator */}
          <div style={{ height: 1, background: '#D4C5B4' }} />

          {/* ── LINK COLUMNS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.6fr', gap: '0 56px', padding: '32px 0 40px' }}>

            {/* Discover */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: '#4A3A32', textTransform: 'uppercase', margin: '0 0 10px' }}>
                Discover
              </p>
              <div style={{ width: 28, height: 2, background: '#B08B57', marginBottom: 18 }} />
              <ul style={RESET_LIST}>
                {DISCOVER_LINKS.map(({ href, label }) => (
                  <li key={href} style={{ marginBottom: 11 }}>
                    <Link
                      href={href}
                      style={{ fontSize: 12, color: '#7A6355', textDecoration: 'none', letterSpacing: '0.03em', transition: 'color 0.2s' }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#7A6355')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: '#4A3A32', textTransform: 'uppercase', margin: '0 0 10px' }}>
                Customer Care
              </p>
              <div style={{ width: 28, height: 2, background: '#B08B57', marginBottom: 18 }} />
              <ul style={RESET_LIST}>
                {CARE_LINKS.map(({ href, label }) => (
                  <li key={href} style={{ marginBottom: 11 }}>
                    <Link
                      href={href}
                      style={{ fontSize: 12, color: '#7A6355', textDecoration: 'none', letterSpacing: '0.03em', transition: 'color 0.2s' }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#7A6355')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stay Connected */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: '#4A3A32', textTransform: 'uppercase', margin: '0 0 10px' }}>
                Stay Connected
              </p>
              <div style={{ width: 28, height: 2, background: '#B08B57', marginBottom: 18 }} />

              {joined ? (
                <p style={{ fontSize: 12, fontWeight: 500, color: '#B08B57', letterSpacing: '0.06em' }}>
                  ✦ Welcome to the SYANN circle
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: '#7A6355', lineHeight: 1.75, marginBottom: 14 }}>
                    Join our circle for crystal wisdom, exclusive offers, and energy insights.
                  </p>
                  <form onSubmit={handleJoin} style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Your email address"
                      required
                      style={{
                        flex: 1,
                        fontSize: 12,
                        padding: '9px 14px',
                        border: '1px solid #C9B99E',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.65)',
                        color: '#4A3A32',
                        outline: 'none',
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        flexShrink: 0,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        padding: '9px 18px',
                        background: '#B08B57',
                        border: '1px solid #B08B57',
                        borderRadius: 8,
                        color: '#fff',
                        cursor: 'pointer',
                        fontFamily: "'Montserrat', sans-serif",
                        transition: 'background 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#8A6A3F')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#B08B57')}
                    >
                      Join
                    </button>
                  </form>
                </>
              )}

              <blockquote
                style={{
                  ...SERIF,
                  fontStyle: 'italic',
                  fontSize: 13.5,
                  lineHeight: 1.85,
                  color: '#9A8573',
                  borderLeft: '2px solid #C9B99E',
                  paddingLeft: 14,
                  margin: '20px 0 0',
                  letterSpacing: '0.02em',
                }}
              >
                "Every crystal carries a memory of the earth. Wear yours with intention."
              </blockquote>
            </div>

          </div>
        </div>
      </div>


      {/* ══ BOTTOM BAR — dark overlay ══ */}
      <div style={{ background: 'rgba(18, 11, 7, 0.93)' }}>
        <div style={{ height: 1, background: 'rgba(176, 139, 87, 0.2)', margin: '0 48px' }} />
        <div
          style={{
            padding: '16px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >

          {/* Copyright + legal + payment */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 20px' }}>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.24em', color: '#A89885', textTransform: 'uppercase' }}>
              © 2026 SYANN.CO
            </span>
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms',   label: 'Terms of Service' },
              { href: '/cookies', label: 'Cookie Policy' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.2em', color: '#A89885', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#D4AF80')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#A89885')}
              >
                {label}
              </Link>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {['VISA', 'MC', 'AMEX', 'PayPal'].map(badge => (
                <span
                  key={badge}
                  style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                    padding: '2px 6px', borderRadius: 4,
                    border: '1px solid rgba(176,139,87,0.25)',
                    color: '#A89885',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <p style={{ ...SERIF, fontStyle: 'italic', fontSize: 14.5, color: '#C9A96E', letterSpacing: '0.04em', margin: 0, whiteSpace: 'nowrap' }}>
            You deserve to feel aligned, beautiful, and you.
          </p>

        </div>
      </div>

    </footer>
  )
}
