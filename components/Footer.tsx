'use client'

import { useState } from 'react'
import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }

const DISCOVER_LINKS = [
  { href: '/how-it-works',     label: 'How It Works' },
  { href: '/five-elements',    label: 'The Five Elements' },
  { href: '/crystals',         label: 'Crystal Guide' },
  { href: '/journal',          label: 'Journal' },
  { href: '/about',            label: 'About Us' },
]

const CARE_LINKS = [
  { href: '/faq',              label: 'FAQ' },
  { href: '/shipping',         label: 'Shipping & Delivery' },
  { href: '/returns',          label: 'Returns & Exchanges' },
  { href: '/order-tracking',   label: 'Order Tracking' },
  { href: '/care',             label: 'Care Instructions' },
  { href: '/contact',          label: 'Contact Us' },
]

const TRUST_ITEMS = [
  {
    label: 'Premium Quality',
    sub: 'Natural gemstone beads',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    label: 'Safe & Secure',
    sub: 'Encrypted checkout',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'Beautifully Packed',
    sub: 'Gift-ready packaging',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    label: 'Worldwide Shipping',
    sub: 'Delivered to your door',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
]

const FEATURE_BULLETS = [
  {
    label: 'Genuine natural gemstones',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    label: 'AI-powered energy analysis',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    label: 'Rooted in Five Elements wisdom',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    label: 'Handcrafted with intention',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
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
    <footer className="w-full" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* ── TOP ORNAMENT ── */}
      <div style={{ background: '#F4EFE8' }} className="px-6 pt-10 pb-0">
        <div className="mx-auto max-w-7xl flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: '#C9B99E' }} />
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <polygon points="5,0 10,5 5,10 0,5" fill="#B08B57" />
          </svg>
          <div className="flex-1 h-px" style={{ background: '#C9B99E' }} />
        </div>
      </div>


      {/* ── MAIN SECTION ── */}
      <div style={{ background: '#F4EFE8' }} className="px-6 pt-14 pb-16">
        <div
          className="mx-auto max-w-7xl grid gap-12 lg:gap-8"
          style={{ gridTemplateColumns: 'repeat(1,1fr)' }}
        >
          <div
            className="hidden lg:grid gap-8"
            style={{ gridTemplateColumns: '2fr 1fr 1fr 1.5fr' }}
          >

            {/* ── BRAND COLUMN ── */}
            <div className="flex flex-col gap-5">

              <div>
                <p
                  style={{ ...SERIF, letterSpacing: '0.44em', color: '#4A3A32', lineHeight: 1 }}
                  className="text-4xl font-light"
                >
                  SYANN<span style={{ color: '#B08B57' }}> . </span>CO
                </p>
                <p
                  className="mt-2 text-[10px] font-semibold uppercase tracking-[0.34em]"
                  style={{ color: '#B08B57' }}
                >
                  Crystals · Energy · You
                </p>
              </div>

              <p className="text-[12.5px] leading-[1.85]" style={{ color: '#7A6355', maxWidth: 300 }}>
                Handcrafted crystal bracelets designed through Five Elements wisdom
                and AI energy analysis — to harmonize, protect, and align your energy.
              </p>

              <ul className="flex flex-col gap-2.5">
                {FEATURE_BULLETS.map(({ label, icon }) => (
                  <li key={label} className="flex items-center gap-2.5">
                    <span style={{ color: '#B08B57' }}>{icon}</span>
                    <span className="text-[11.5px]" style={{ color: '#6B5848', letterSpacing: '0.04em' }}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-1">
                <p
                  className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
                  style={{ color: '#9A8573' }}
                >
                  Follow Us
                </p>
                <div className="flex gap-3">
                  {[
                    {
                      href: 'https://instagram.com/syann.co',
                      label: 'Instagram',
                      icon: (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7.04a4.85 4.85 0 0 1-1.01-.35z" />
                        </svg>
                      ),
                    },
                    {
                      href: 'https://pinterest.com/syann_co',
                      label: 'Pinterest',
                      icon: (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                        </svg>
                      ),
                    },
                    {
                      href: 'mailto:hello@syann.co',
                      label: 'Email',
                      icon: (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      ),
                    },
                  ].map(({ href, label, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      aria-label={label}
                      className="flex items-center justify-center rounded-full transition-colors duration-200"
                      style={{
                        width: 34, height: 34,
                        border: '1px solid #C9B99E',
                        background: 'transparent',
                        color: '#9A8573',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = '#B08B57'
                        ;(e.currentTarget as HTMLElement).style.borderColor = '#B08B57'
                        ;(e.currentTarget as HTMLElement).style.color = '#fff'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent'
                        ;(e.currentTarget as HTMLElement).style.borderColor = '#C9B99E'
                        ;(e.currentTarget as HTMLElement).style.color = '#9A8573'
                      }}
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </div>

            </div>


            {/* ── DISCOVER COLUMN ── */}
            <div>
              <p
                className="mb-1 text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ color: '#4A3A32' }}
              >
                Discover
              </p>
              <div className="mb-5 h-[2px] w-8" style={{ background: '#B08B57' }} />
              <ul className="flex flex-col gap-3">
                {DISCOVER_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-[12px] transition-colors duration-200"
                      style={{ color: '#7A6355', textDecoration: 'none', letterSpacing: '0.04em' }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#7A6355')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>


            {/* ── CUSTOMER CARE COLUMN ── */}
            <div>
              <p
                className="mb-1 text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ color: '#4A3A32' }}
              >
                Customer Care
              </p>
              <div className="mb-5 h-[2px] w-8" style={{ background: '#B08B57' }} />
              <ul className="flex flex-col gap-3">
                {CARE_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-[12px] transition-colors duration-200"
                      style={{ color: '#7A6355', textDecoration: 'none', letterSpacing: '0.04em' }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#7A6355')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>


            {/* ── STAY CONNECTED COLUMN ── */}
            <div>
              <p
                className="mb-1 text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ color: '#4A3A32' }}
              >
                Stay Connected
              </p>
              <div className="mb-5 h-[2px] w-8" style={{ background: '#B08B57' }} />

              <p className="mb-4 text-[12px] leading-[1.8]" style={{ color: '#7A6355' }}>
                Join our circle for crystal wisdom, exclusive offers, and energy insights.
              </p>

              {joined ? (
                <p className="text-[12px] font-medium" style={{ color: '#B08B57', letterSpacing: '0.06em' }}>
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
                    className="w-full rounded-lg px-3.5 py-2.5 text-[12px] outline-none transition-colors"
                    style={{
                      border: '1px solid #C9B99E',
                      background: '#FBF8F4',
                      color: '#4A3A32',
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg py-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-colors duration-200"
                    style={{ background: '#B08B57', border: '1px solid #B08B57', fontFamily: "'Montserrat', sans-serif", cursor: 'pointer' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = '#7A5B45'
                      ;(e.currentTarget as HTMLElement).style.borderColor = '#7A5B45'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = '#B08B57'
                      ;(e.currentTarget as HTMLElement).style.borderColor = '#B08B57'
                    }}
                  >
                    Join SYANN
                  </button>
                </form>
              )}

              <blockquote
                className="mt-6 pl-4 text-[12.5px] leading-[1.9]"
                style={{
                  ...SERIF,
                  fontStyle: 'italic',
                  color: '#9A8573',
                  borderLeft: '2px solid #C9B99E',
                  letterSpacing: '0.03em',
                }}
              >
                "Every crystal carries a memory of the earth. Wear yours with intention."
              </blockquote>
            </div>

          </div>


          {/* ── MOBILE LAYOUT ── */}
          <div className="lg:hidden flex flex-col gap-10">

            {/* Brand */}
            <div className="text-center">
              <p style={{ ...SERIF, letterSpacing: '0.44em', color: '#4A3A32', lineHeight: 1 }} className="text-3xl font-light">
                SYANN<span style={{ color: '#B08B57' }}> . </span>CO
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.34em]" style={{ color: '#B08B57' }}>
                Crystals · Energy · You
              </p>
              <p className="mt-4 text-[12.5px] leading-[1.85] mx-auto max-w-xs" style={{ color: '#7A6355' }}>
                Handcrafted crystal bracelets designed through Five Elements wisdom and AI energy analysis.
              </p>
            </div>

            {/* Nav links two-column */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[...DISCOVER_LINKS, ...CARE_LINKS].map(({ href, label }) => (
                <Link key={href} href={href} className="text-[12px]" style={{ color: '#7A6355', textDecoration: 'none' }}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Email */}
            {joined ? (
              <p className="text-center text-[12px] font-medium" style={{ color: '#B08B57' }}>✦ Welcome to the SYANN circle</p>
            ) : (
              <form onSubmit={handleJoin} className="flex flex-col gap-2 max-w-xs mx-auto w-full">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full rounded-lg px-3.5 py-2.5 text-[12px] outline-none"
                  style={{ border: '1px solid #C9B99E', background: '#FBF8F4', color: '#4A3A32', fontFamily: "'Montserrat', sans-serif" }}
                />
                <button
                  type="submit"
                  className="w-full rounded-lg py-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white"
                  style={{ background: '#B08B57', border: '1px solid #B08B57', fontFamily: "'Montserrat', sans-serif", cursor: 'pointer' }}
                >
                  Join SYANN
                </button>
              </form>
            )}

            {/* Social */}
            <div className="flex justify-center gap-3">
              {[
                { href: 'https://instagram.com/syann.co', label: 'Instagram' },
                { href: 'https://tiktok.com/@syann.co', label: 'TikTok' },
                { href: 'mailto:hello@syann.co', label: 'Email' },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-center rounded-full text-[10px] font-medium uppercase tracking-[0.2em] px-4 py-1.5"
                  style={{ border: '1px solid #C9B99E', color: '#9A8573', textDecoration: 'none' }}
                >
                  {label}
                </a>
              ))}
            </div>

          </div>
        </div>
      </div>


      {/* ── TRUST BAR ── */}
      <div style={{ background: '#EDE8E1', borderTop: '1px solid #D4C5B4', borderBottom: '1px solid #D4C5B4' }}>
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map(({ label, sub, icon }, i) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 py-2 text-center"
                style={{
                  borderRight: i < TRUST_ITEMS.length - 1 ? '1px solid #C9B99E' : undefined,
                }}
              >
                <span style={{ color: '#B08B57' }}>{icon}</span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: '#4A3A32' }}>
                  {label}
                </p>
                <p className="text-[10.5px]" style={{ color: '#9A8573', letterSpacing: '0.04em' }}>
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ── DARK BOTTOM BAR ── */}
      <div style={{ background: '#1C1510' }}>

        {/* Crystal illustration + content */}
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-8 flex flex-col lg:flex-row items-center lg:items-start gap-8">

          {/* Crystal/moon SVG illustration */}
          <div className="shrink-0 opacity-30" aria-hidden="true">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" stroke="#B08B57" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="36" cy="36" r="30" />
              <circle cx="36" cy="36" r="20" />
              <line x1="36" y1="6" x2="36" y2="66" />
              <line x1="6" y1="36" x2="66" y2="36" />
              <line x1="14.9" y1="14.9" x2="57.1" y2="57.1" />
              <line x1="57.1" y1="14.9" x2="14.9" y2="57.1" />
              <polygon points="36,20 40,32 52,32 42,39 46,51 36,44 26,51 30,39 20,32 32,32" fill="#B08B57" fillOpacity="0.15" />
            </svg>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col items-center lg:items-start gap-6 text-center lg:text-left">

            {/* Legal + payment row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.26em]" style={{ color: '#7A6355' }}>
                © 2026 SYANN.CO
              </p>
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/cookies', label: 'Cookie Policy' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[10px] font-medium uppercase tracking-[0.22em] transition-colors duration-200"
                  style={{ color: '#7A6355', textDecoration: 'none' }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = '#B08B57')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = '#7A6355')}
                >
                  {label}
                </Link>
              ))}

              {/* Payment badges */}
              <div className="flex items-center gap-2 ml-2">
                {['VISA', 'MC', 'AMEX', 'PayPal'].map(badge => (
                  <span
                    key={badge}
                    className="inline-flex items-center justify-center rounded px-2 py-0.5 text-[9px] font-bold tracking-wide"
                    style={{ border: '1px solid #3A2E26', color: '#6B5848', background: '#231910' }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Gold italic tagline */}
            <p
              style={{
                ...SERIF,
                fontStyle: 'italic',
                color: '#B08B57',
                letterSpacing: '0.05em',
                fontSize: 15,
              }}
            >
              You deserve to feel aligned, beautiful, and you.
            </p>

          </div>
        </div>

        {/* Bottom ornament */}
        <div className="px-6 pb-6">
          <div className="mx-auto max-w-7xl flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: '#2E2118' }} />
            <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
              <polygon points="4,0 8,4 4,8 0,4" fill="#B08B57" opacity="0.6" />
            </svg>
            <div className="flex-1 h-px" style={{ background: '#2E2118' }} />
          </div>
        </div>

      </div>

    </footer>
  )
}
