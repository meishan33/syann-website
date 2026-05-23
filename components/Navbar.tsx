'use client'

import Link from 'next/link'
import './navbar.css'

const NAV_LINKS = [
  { href: '/',            label: 'Main' },
  { href: '/energy-quiz', label: 'Energy Quiz' },
  { href: '/about',       label: 'About' },
  { href: '/faq',         label: 'FAQ' },
  { href: '/contact',     label: 'Contact' },
]

export default function Navbar() {
  return (
    <header className="navbar">
    <div className="navbar-inner">

      {/* LEFT — BRAND */}
      <div className="navbar-brand">
        <Link href="/" className="navbar-brand-link">
          <img
            src="/NewSymbols_transparent.png"
            alt=""
            className="navbar-brand-icon"
          />
          <span className="navbar-brand-text">SYANN</span>
        </Link>
      </div>

      {/* CENTER — NAV LINKS */}
      <nav className="navbar-links" aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="navbar-link">
            {link.label}
          </Link>
        ))}
      </nav>

      {/* RIGHT — ICONS */}
      <div className="navbar-icons">

        <Link href="/account" aria-label="Account" className="navbar-icon-btn">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.418 3.582-7 8-7s8 2.582 8 7" />
          </svg>
        </Link>


      </div>

    </div>
    </header>
  )
}
