'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCart, cartCount } from '@/lib/cart'
import CartDrawer from './CartDrawer'
import MobileMenu from './MobileMenu'

const BASE_NAV_LINKS = [
  { href: '/energy-quiz', label: 'Energy Quiz' },
  { href: '/design',      label: 'Build Your Own' },
  { href: '/blog',        label: 'Blog' },
  { href: '/about',       label: 'About' },
  { href: '/faq',         label: 'FAQ' },
  { href: '/contact',     label: 'Contact' },
]

export default function Navbar({ shopEnabled }: { shopEnabled: boolean }) {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [cartItems, setCartItems] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navLinks = shopEnabled
    ? [BASE_NAV_LINKS[0], { href: '/shop', label: 'Shop' }, ...BASE_NAV_LINKS.slice(1)]
    : BASE_NAV_LINKS

  useEffect(() => {
    if (!shopEnabled) return
    setCartItems(cartCount(getCart()))
    const onCartUpdate = () => setCartItems(cartCount(getCart()))
    window.addEventListener('cart-updated', onCartUpdate)
    return () => window.removeEventListener('cart-updated', onCartUpdate)
  }, [shopEnabled])

  useEffect(() => {
    supabase.auth.refreshSession().then(({ data: { session } }) => {
      setLoggedIn(!!session?.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push('/signout')
  }

  return (
    <>
    <header className="navbar">
    <div className="navbar-inner">

      {/* LEFT — BRAND */}
      <div className="navbar-brand">
        <Link href="/" className="navbar-brand-link">
          <img
            src="/NewSymbols_transparent.webp"
            alt=""
            className="navbar-brand-icon"
          />
          <span className="navbar-brand-text">SYANN</span>
        </Link>
      </div>

      {/* CENTER — NAV LINKS */}
      <nav className="navbar-links" aria-label="Primary">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="navbar-link">
            {link.label}
          </Link>
        ))}
      </nav>

      {/* RIGHT — ICONS */}
      <div className="navbar-icons">

        {/* Hamburger — mobile only */}
        <button onClick={() => setMenuOpen(true)} className="navbar-menu-btn navbar-icon-btn" aria-label="Open menu">
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A2E14" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </span>
        </button>

        {shopEnabled && (
          <button onClick={() => setCartOpen(true)} className="navbar-icon-btn" aria-label="Shopping cart" style={{ position: 'relative', marginRight: -14, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A2E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </span>
            {cartItems > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, borderRadius: 999, background: '#B08B57', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', fontFamily: "'Montserrat', sans-serif" }}>
                {cartItems > 99 ? '99+' : cartItems}
              </span>
            )}
          </button>
        )}

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          {loggedIn ? (
            <button
              aria-label="Account"
              className="navbar-icon-btn"
              onClick={() => setDropdownOpen(o => !o)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '50%', background: '#EDE3D0', transition: 'background 0.3s ease' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A2E14" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.418 3.582-7 8-7s8 2.582 8 7" />
                </svg>
              </span>
            </button>
          ) : (
            <Link href="/account" aria-label="Account" className="navbar-icon-btn">
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '50%', background: '#EDE3D0', transition: 'background 0.3s ease' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A2E14" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.418 3.582-7 8-7s8 2.582 8 7" />
                </svg>
              </span>
            </Link>
          )}

          {dropdownOpen && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', background: '#fff', border: '1px solid rgba(200,165,115,0.25)', borderRadius: 10, boxShadow: '0 8px 28px rgba(74,46,20,0.1)', minWidth: 180, zIndex: 200, overflow: 'hidden' }}>
              {[
                { href: '/account', label: 'Account Settings', icon: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.418 3.582-7 8-7s8 2.582 8 7"/></> },
                { href: '/orders',  label: 'Orders',           icon: <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>, icon2: <><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></> },
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textDecoration: 'none', color: '#4A2E14', fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 400, letterSpacing: '0.04em', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAF2E6')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{item.icon}{item.icon2}</svg>
                  {item.label}
                </Link>
              ))}
              <div style={{ borderTop: '1px solid rgba(200,165,115,0.2)', margin: '4px 0' }} />
              <button onClick={handleSignOut}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 400, letterSpacing: '0.04em', textAlign: 'left', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FDF0EE')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          )}
        </div>


      </div>

    </div>
    </header>

    {shopEnabled && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />}
    <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={navLinks} />
    </>
  )
}
