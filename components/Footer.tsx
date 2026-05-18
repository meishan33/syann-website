'use client'

import { useState } from 'react'
import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }

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
    href: 'https://instagram.com/syann.co',
    label: 'Instagram',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: 'https://tiktok.com/@syann.co',
    label: 'TikTok',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7.04a4.85 4.85 0 0 1-1.01-.35z" />
      </svg>
    ),
  },
  {
    href: 'https://pinterest.com/syann_co',
    label: 'Pinterest',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
  {
    href: 'mailto:hello@syann.co',
    label: 'Email',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
]

const LINK_HOVER = {
  onMouseEnter: (e: React.MouseEvent) => ((e.target as HTMLElement).style.color = '#B08B57'),
  onMouseLeave: (e: React.MouseEvent) => ((e.target as HTMLElement).style.color = '#C9B8A8'),
}

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

      {/* ── MAIN SECTION — warm overlay ── */}
      <div style={{ background: 'rgba(244, 239, 232, 0.93)' }}>

        {/* Top ornament */}
        <div style={{ padding: '0 48px' }}>
          <div className="flex items-center gap-4 pt-10">
            <div className="flex-1 h-px" style={{ background: '#C9B99E' }} />
            <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
              <polygon points="4.5,0 9,4.5 4.5,9 0,4.5" fill="#B08B57" />
            </svg>
            <div className="flex-1 h-px" style={{ background: '#C9B99E' }} />
          </div>
        </div>

        {/* 4-column grid */}
        <div
          style={{ padding: '32px 48px 40px' }}
          className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1.4fr] gap-10 lg:gap-8"
        >

          {/* ── BRAND ── */}
          <div className="flex flex-col gap-4">

            <div>
              <p style={{ ...SERIF, letterSpacing: '0.44em', color: '#4A3A32', lineHeight: 1, fontSize: 36 }} className="font-light">
                SYANN<span style={{ color: '#B08B57' }}> · </span>CO
              </p>
              <p style={{ color: '#B08B57', letterSpacing: '0.32em', fontSize: 10 }} className="mt-1.5 font-semibold uppercase">
                Crystals · Energy · You
              </p>
            </div>

            <p style={{ color: '#7A6355', fontSize: 12.5, lineHeight: 1.85, maxWidth: 280 }}>
              Handcrafted crystal bracelets designed through Five Elements wisdom
              and AI energy analysis — to harmonize, protect, and align your energy.
            </p>

            <div>
              <p style={{ color: '#9A8573', letterSpacing: '0.28em', fontSize: 10 }} className="mb-2.5 font-semibold uppercase">
                Follow Us
              </p>
              <div className="flex gap-2">
                {SOCIAL.map(({ href, label, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={label}
                    className="flex items-center justify-center rounded-full transition-all duration-200"
                    style={{ width: 32, height: 32, border: '1px solid #C9B99E', color: '#9A8573' }}
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

          </div>


          {/* ── DISCOVER ── */}
          <div>
            <p style={{ color: '#4A3A32', letterSpacing: '0.28em', fontSize: 10 }} className="mb-1 font-semibold uppercase">
              Discover
            </p>
            <div className="mb-4 h-[2px] w-7" style={{ background: '#B08B57' }} />
            <ul className="flex flex-col gap-2.5">
              {DISCOVER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{ color: '#7A6355', fontSize: 12, textDecoration: 'none', letterSpacing: '0.03em' }}
                    className="transition-colors duration-200"
                    {...LINK_HOVER}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/* ── CUSTOMER CARE ── */}
          <div>
            <p style={{ color: '#4A3A32', letterSpacing: '0.28em', fontSize: 10 }} className="mb-1 font-semibold uppercase">
              Customer Care
            </p>
            <div className="mb-4 h-[2px] w-7" style={{ background: '#B08B57' }} />
            <ul className="flex flex-col gap-2.5">
              {CARE_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{ color: '#7A6355', fontSize: 12, textDecoration: 'none', letterSpacing: '0.03em' }}
                    className="transition-colors duration-200"
                    {...LINK_HOVER}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/* ── STAY CONNECTED ── */}
          <div>
            <p style={{ color: '#4A3A32', letterSpacing: '0.28em', fontSize: 10 }} className="mb-1 font-semibold uppercase">
              Stay Connected
            </p>
            <div className="mb-4 h-[2px] w-7" style={{ background: '#B08B57' }} />

            <p style={{ color: '#7A6355', fontSize: 12, lineHeight: 1.8 }} className="mb-3">
              Join our circle for crystal wisdom, exclusive offers, and energy insights.
            </p>

            {joined ? (
              <p style={{ color: '#B08B57', fontSize: 12, letterSpacing: '0.06em' }} className="font-medium">
                ✦ Welcome to the SYANN circle
              </p>
            ) : (
              <form onSubmit={handleJoin} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  style={{
                    border: '1px solid #C9B99E',
                    background: 'rgba(255,255,255,0.7)',
                    color: '#4A3A32',
                    fontSize: 12,
                    padding: '9px 14px',
                    borderRadius: 8,
                    outline: 'none',
                    fontFamily: "'Montserrat', sans-serif",
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#B08B57',
                    border: '1px solid #B08B57',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    padding: '9px 0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontFamily: "'Montserrat', sans-serif",
                    width: '100%',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = '#7A5B45'
                    el.style.borderColor = '#7A5B45'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = '#B08B57'
                    el.style.borderColor = '#B08B57'
                  }}
                >
                  Join SYANN
                </button>
              </form>
            )}

            <blockquote
              style={{
                ...SERIF,
                fontStyle: 'italic',
                color: '#9A8573',
                borderLeft: '2px solid #C9B99E',
                paddingLeft: 14,
                marginTop: 20,
                fontSize: 13,
                lineHeight: 1.9,
                letterSpacing: '0.03em',
              }}
            >
              "Every crystal carries a memory of the earth. Wear yours with intention."
            </blockquote>
          </div>

        </div>
      </div>


      {/* ── BOTTOM BAR — dark overlay ── */}
      <div style={{ background: 'rgba(20, 13, 9, 0.92)' }}>

        {/* Hairline */}
        <div style={{ padding: '0 48px' }}>
          <div className="h-px" style={{ background: 'rgba(180, 140, 100, 0.25)' }} />
        </div>

        <div
          style={{ padding: '18px 48px 20px' }}
          className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-3 lg:gap-6"
        >

          {/* Copyright + legal */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-1.5">
            <span style={{ color: '#A89885', fontSize: 10, letterSpacing: '0.26em', fontWeight: 500, textTransform: 'uppercase' }}>
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
                style={{ color: '#A89885', fontSize: 10, letterSpacing: '0.22em', fontWeight: 500, textDecoration: 'none', textTransform: 'uppercase' }}
                className="transition-colors duration-200"
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#D4AF80')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#A89885')}
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-1.5 ml-1">
              {['VISA', 'MC', 'AMEX', 'PayPal'].map(badge => (
                <span
                  key={badge}
                  style={{
                    border: '1px solid rgba(180,140,100,0.3)',
                    color: '#A89885',
                    background: 'rgba(255,255,255,0.04)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '2px 7px',
                    borderRadius: 4,
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <p
            style={{
              ...SERIF,
              fontStyle: 'italic',
              color: '#D4AF80',
              fontSize: 15,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}
          >
            You deserve to feel aligned, beautiful, and you.
          </p>

        </div>

      </div>

    </footer>
  )
}
