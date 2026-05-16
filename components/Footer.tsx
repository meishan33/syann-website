'use client'

import Link from 'next/link'
import './footer.css'

const FOOTER_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/collection', label: 'Bracelets' },
  { href: '/energy-quiz', label: 'Energy Quiz' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="footer">

      {/* BRAND MARK */}
      <div className="footer-brand">
        <img
          src="/NewLogo.png"
          alt=""
          className="footer-brand-icon"
        />
        <div className="footer-logo">
          SYANN<span className="footer-logo-dot">.</span>CO
        </div>
      </div>

      {/* TAGLINE */}
      <p className="footer-tagline">
        Crystal Energy, Uniquely Yours
      </p>

      {/* LINKS */}
      <nav className="footer-links" aria-label="Footer">
        {FOOTER_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* SOCIAL */}
      <div className="footer-social">

        <a
          href="https://instagram.com/syann.co"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-item"
        >
          <span className="footer-social-icon" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
            </svg>
          </span>
          Instagram
        </a>

        <span className="footer-divider" aria-hidden="true">|</span>

        <a href="mailto:hello@syann.co" className="footer-social-item">
          hello@syann.co
        </a>

      </div>

      {/* DIVIDER + STAR */}
      <div className="footer-line-wrapper">
        <div className="footer-line"></div>
        <div className="footer-star" aria-hidden="true">✦</div>
      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        © 2026 SYANN.CO — Energy · Beauty · You.
      </div>

    </footer>
  )
}
