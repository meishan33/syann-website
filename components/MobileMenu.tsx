'use client'

import { useEffect } from 'react'
import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

type NavLink = { href: string; label: string }
type Props = { open: boolean; onClose: () => void; links: NavLink[] }

export default function MobileMenu({ open, onClose, links }: Props) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(46,33,24,0.45)',
          backdropFilter: 'blur(3px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 401,
          width: '100%', maxWidth: 320,
          background: '#FBF8F4',
          boxShadow: '8px 0 40px rgba(74,46,20,0.15)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
          ...BODY,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #E5DDD5' }}>
          <span style={{ ...SERIF, fontSize: 20, fontWeight: 400, letterSpacing: '0.06em', color: '#4A2E14' }}>SYANN</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#F0E8DF', cursor: 'pointer', fontSize: 14, color: '#7A5B45', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '12px 8px' }} aria-label="Primary">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              style={{
                padding: '16px 20px',
                fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#4A2E14', textDecoration: 'none',
                borderBottom: '1px solid #F0E8DF',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <p style={{ padding: '20px 24px', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, margin: 0, textAlign: 'center' }}>
          Crystals · Energy · You
        </p>
      </div>
    </>
  )
}
