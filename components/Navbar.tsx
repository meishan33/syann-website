'use client'

import Link from 'next/link'
import LogoIcon from './LogoIcon'
import './navbar.css'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/energy-quiz', label: 'Energy Quiz' },
  { href: '/collection', label: 'Collection' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
]

export default function Navbar() {
  return (
    <header className="navbar">

      {/* LEFT — BRAND */}
      <div className="navbar-brand">
        <Link href="/" className="navbar-brand-link">
          <LogoIcon className="w-10 h-10" />
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

        <Link href="/cart" aria-label="Shopping Cart" className="navbar-icon-btn">
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
            <path d="M6 7h12l-1.2 11.1a2 2 0 0 1-2 1.9H9.2a2 2 0 0 1-2-1.9L6 7z" />
            <path d="M9 7V5a3 3 0 0 1 6 0v2" />
          </svg>
        </Link>

      </div>

    </header>
  )
}
