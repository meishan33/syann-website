'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

const INPUT: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
  width: '100%',
  padding: '13px 16px',
  border: '1px solid #E5DDD5',
  background: '#FDFAF7',
  fontSize: 13,
  color: '#4A3A32',
  outline: 'none',
  borderRadius: 8,
}

function Diamond() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill={GOLD} opacity={0.65} aria-hidden="true">
      <polygon points="5,0 10,5 5,10 0,5" />
    </svg>
  )
}

/* ── Sign-in panel (shown when not logged in) ─────────────── */
function SignInPanel() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/account` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (!data.user || data.user.identities?.length === 0) {
          setError('An account with this email already exists. Please sign in instead.')
          setMode('login')
          return
        }
        window.location.reload()
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.reload()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ background: '#F6F1EB', ...BODY }}>

      {/* ── BANNER ───────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img
          src="/AccountCreateBanner.png"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(246,241,235,0.72)' }} />

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginBottom: 14, color: GOLD }} fill="currentColor" aria-hidden="true">
            <path d="M8 0 L9 7 L16 8 L9 9 L8 16 L7 9 L0 8 L7 7 Z" />
          </svg>
          <h1 style={{ ...SERIF, fontSize: 'clamp(42px, 7vw, 72px)', fontWeight: 300, color: '#3D2B1F', margin: '0 0 14px', lineHeight: 1 }}>
            {mode === 'signup' ? 'Join SYANN' : 'Welcome Back'}
          </h1>
          <div style={{ width: 36, height: 1.5, background: GOLD, marginBottom: 16 }} />
          <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', lineHeight: 1.75, maxWidth: 400, margin: 0 }}>
            {mode === 'signup'
              ? <> Every reading is personal.<br />Join SYANN to discover the crystals aligned to you.</>
              : <>Sign in to continue your<br />crystal journey with SYANN.</>}
          </p>
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────────── */}
      <section style={{ display: 'flex', justifyContent: 'center', padding: '56px 24px 72px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          <div style={{ background: '#FDFAF7', border: '1px solid #E5DDD5', borderRadius: 20, padding: '36px 36px 32px' }}>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                style={{ ...BODY, width: '100%', padding: '13px', background: '#fff', border: '1px solid #E5DDD5', borderRadius: 999, color: '#4A3A32', fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.93c-.56 2.95-2.26 5.45-4.81 7.12v5.91h7.79c4.55-4.19 7.17-10.36 7.17-16.99z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.15 15.9-5.84l-7.79-5.91c-2.15 1.45-4.9 2.3-8.11 2.3-6.23 0-11.51-4.21-13.4-9.87H2.54v6.09C6.49 42.62 14.72 48 24 48z"/>
                  <path fill="#FBBC05" d="M10.6 28.68A14.95 14.95 0 0 1 9.6 24c0-1.64.28-3.23.8-4.68V13.23H2.54A23.96 23.96 0 0 0 0 24c0 3.88.92 7.55 2.54 10.77l8.06-6.09z"/>
                  <path fill="#EA4335" d="M24 9.45c3.51 0 6.66 1.21 9.14 3.57l6.86-6.86C35.91 2.38 30.47 0 24 0 14.72 0 6.49 5.38 2.54 13.23l8.06 6.09C12.49 13.66 17.77 9.45 24 9.45z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: '#E5DDD5' }} />
                <span style={{ ...BODY, fontSize: 10, color: '#C4B5A8', letterSpacing: '0.14em', textTransform: 'uppercase' }}>or</span>
                <div style={{ flex: 1, height: 1, background: '#E5DDD5' }} />
              </div>

              {/* Email / password */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={INPUT} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={INPUT} />

                {error && <p style={{ ...BODY, fontSize: 12, color: '#C0392B', margin: 0 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...BODY, marginTop: 4, padding: '14px', background: loading ? '#C9A96E' : '#4A3A32', border: 'none', borderRadius: 999, color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.3s' }}
                >
                  {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <p style={{ ...BODY, fontSize: 12, textAlign: 'center', color: '#9A8573', marginTop: 20, marginBottom: 0 }}>
                {mode === 'signup' ? 'Already have an account? ' : 'New to SYANN? '}
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(null) }}
                  style={{ ...BODY, background: 'none', border: 'none', color: GOLD, fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  {mode === 'signup' ? 'Sign In' : 'Create Account'}
                </button>
              </p>

            </div>

        </div>
      </section>

    </main>
  )
}

/* ── Profile panel (shown when logged in) ─────────────────── */
export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  type Address = {
    delivery_name: string; delivery_phone: string
    delivery_address_line1: string; delivery_address_line2: string
    delivery_city: string; delivery_state: string
    delivery_postal_code: string; delivery_country: string
  }
  const EMPTY_ADDRESS: Address = { delivery_name: '', delivery_phone: '', delivery_address_line1: '', delivery_address_line2: '', delivery_city: '', delivery_state: '', delivery_postal_code: '', delivery_country: '' }
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS)
  const [addressEdit, setAddressEdit] = useState<Address>(EMPTY_ADDRESS)
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressSaving, setAddressSaving] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.refreshSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        const { data } = await supabase.from('profiles')
          .select('is_admin, delivery_name, delivery_phone, delivery_address_line1, delivery_address_line2, delivery_city, delivery_state, delivery_postal_code, delivery_country')
          .eq('id', u.id).single()
        setIsAdmin(data?.is_admin === true)
        if (data) {
          const addr: Address = {
            delivery_name: data.delivery_name ?? '',
            delivery_phone: data.delivery_phone ?? '',
            delivery_address_line1: data.delivery_address_line1 ?? '',
            delivery_address_line2: data.delivery_address_line2 ?? '',
            delivery_city: data.delivery_city ?? '',
            delivery_state: data.delivery_state ?? '',
            delivery_postal_code: data.delivery_postal_code ?? '',
            delivery_country: data.delivery_country ?? '',
          }
          setAddress(addr)
          setAddressEdit(addr)
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [router])

  const saveAddress = async () => {
    if (!user) return
    setAddressSaving(true); setAddressError(null)
    const { error } = await supabase.from('profiles').update(addressEdit).eq('id', user.id)
    if (error) { setAddressError(error.message); setAddressSaving(false); return }
    setAddress(addressEdit)
    setEditingAddress(false)
    setAddressSaving(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/signout')
  }

  if (loading) {
    return (
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F6F1EB' }}>
        <p style={{ ...BODY, fontSize: 11, letterSpacing: '0.28em', color: GOLD, textTransform: 'uppercase' }}>Loading…</p>
      </main>
    )
  }

  if (!user) return <SignInPanel />

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const initials = user.email ? user.email.slice(0, 2).toUpperCase() : '??'

  return (
    <main style={{ background: '#F6F1EB', ...BODY }}>

      {/* ── BANNER ───────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img
          src="/UserProfileBanner.png"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 65%', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(246,241,235,0.72)' }} />

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', gap: 0 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.36em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>
              My Account
            </p>
            <svg width="8" height="8" viewBox="0 0 8 8" fill={GOLD} aria-hidden="true">
              <polygon points="4,0 8,4 4,8 0,4" />
            </svg>
            <div style={{ flex: 1, maxWidth: 40, height: 1, background: GOLD, opacity: 0.5 }} />
          </div>

          <h1 style={{ ...SERIF, fontSize: 'clamp(38px, 6vw, 64px)', fontWeight: 300, color: '#3D2B1F', margin: '0 0 12px', lineHeight: 1 }}>
            Welcome Back
          </h1>

          <div style={{ width: 36, height: 1.5, background: GOLD, marginBottom: 12 }} />

          <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#7A6355', margin: 0, letterSpacing: '0.04em' }}>
            {user.email}
          </p>

        </div>
      </section>


      {/* ── MAIN LAYOUT ──────────────────────────────────────── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 24px 72px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ background: '#FDFAF7', border: '1px solid #E5DDD5', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 88 }}>
          {/* Avatar */}
          <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid #EDE8DF', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#EDE3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <span style={{ ...BODY, fontSize: 16, fontWeight: 600, color: '#4A3A32', letterSpacing: '0.04em' }}>{initials}</span>
            </div>
            <p style={{ ...BODY, fontSize: 11, fontWeight: 500, color: '#4A3A32', margin: '0 0 2px', wordBreak: 'break-all' }}>{user.email}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7CB98A' }} />
              <span style={{ ...BODY, fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7CB98A' }}>Active</span>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ padding: '10px 8px' }}>
            {[
              { href: '/energy-quiz', label: 'New Crystal Reading', icon: <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/> },
              { href: '/orders',      label: 'My Orders',           icon: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></> },
              { href: '/contact',     label: 'Contact Support',     icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></> },
              { href: '/about',       label: 'About SYANN',         icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> },
              ...(isAdmin ? [{ href: '/admin', label: 'Admin Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></> }] : []),
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#4A3A32', marginBottom: 2 }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F6F1EB')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                <span style={{ ...BODY, fontSize: 12, fontWeight: 400 }}>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Sign out */}
          <div style={{ padding: '8px', borderTop: '1px solid #EDE8DF' }}>
            <button onClick={handleSignOut} disabled={signingOut}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', width: '100%', background: 'none', border: 'none', borderRadius: 8, cursor: signingOut ? 'not-allowed' : 'pointer', color: '#C0392B' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FDF0EE')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span style={{ ...BODY, fontSize: 12, fontWeight: 400 }}>{signingOut ? 'Signing out…' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT CONTENT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Account Details */}
          <div style={{ background: '#FDFAF7', border: '1px solid #E5DDD5', borderRadius: 16, padding: '32px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <Diamond />
              <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>Account Details</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { label: 'Email',        value: user.email },
                { label: 'Member Since', value: memberSince ?? '—' },
              ].map(({ label, value }, i, arr) => (
                <div key={label}>
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 12 }}>
                    <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: 0 }}>{label}</p>
                    <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#4A3A32', margin: 0, wordBreak: 'break-all' }}>{value}</p>
                  </div>
                  {i < arr.length - 1 && <div style={{ height: 1, background: '#EDE8DF', marginTop: 18 }} />}
                </div>
              ))}
              <div style={{ height: 1, background: '#EDE8DF' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 12 }}>
                <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: 0 }}>Status</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7CB98A' }} />
                  <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#4A3A32', margin: 0 }}>Active Member</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{ background: '#FDFAF7', border: '1px solid #E5DDD5', borderRadius: 16, padding: '32px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Diamond />
                <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>Delivery Address</p>
              </div>
              {!editingAddress && (
                <button onClick={() => { setAddressEdit(address); setEditingAddress(true); setAddressError(null) }}
                  style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '7px 16px', background: 'transparent', border: '1px solid #E5DDD5', borderRadius: 7, color: '#7A6355', cursor: 'pointer' }}>
                  {Object.values(address).every(v => !v) ? 'Add Address' : 'Edit'}
                </button>
              )}
            </div>

            {editingAddress ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {([
                    { key: 'delivery_name',  label: 'Full Name',    placeholder: 'e.g. Jane Lim' },
                    { key: 'delivery_phone', label: 'Phone Number', placeholder: 'e.g. +60 12 345 6789' },
                  ] as { key: keyof Address; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>{label}</label>
                      <input value={addressEdit[key]} onChange={e => setAddressEdit(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={{ ...INPUT, fontSize: 12, padding: '10px 14px' }} />
                    </div>
                  ))}
                </div>
                {([
                  { key: 'delivery_address_line1', label: 'Address Line 1', placeholder: 'Street, unit, block' },
                  { key: 'delivery_address_line2', label: 'Address Line 2', placeholder: 'Apartment, suite (optional)' },
                ] as { key: keyof Address; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>{label}</label>
                    <input value={addressEdit[key]} onChange={e => setAddressEdit(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={{ ...INPUT, fontSize: 12, padding: '10px 14px' }} />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {([
                    { key: 'delivery_city',        label: 'City',        placeholder: 'e.g. Kuala Lumpur' },
                    { key: 'delivery_state',       label: 'State',       placeholder: 'e.g. Selangor' },
                    { key: 'delivery_postal_code', label: 'Postal Code', placeholder: 'e.g. 50000' },
                  ] as { key: keyof Address; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>{label}</label>
                      <input value={addressEdit[key]} onChange={e => setAddressEdit(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={{ ...INPUT, fontSize: 12, padding: '10px 14px' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>Country</label>
                  <input value={addressEdit.delivery_country} onChange={e => setAddressEdit(p => ({ ...p, delivery_country: e.target.value }))} placeholder="e.g. Malaysia" style={{ ...INPUT, fontSize: 12, padding: '10px 14px' }} />
                </div>
                {addressError && <p style={{ ...BODY, fontSize: 12, color: '#C0392B', margin: 0 }}>{addressError}</p>}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button onClick={() => { setEditingAddress(false); setAddressEdit(address) }} style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '9px 20px', background: 'transparent', border: '1px solid #E5DDD5', borderRadius: 8, color: '#9A8573', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={saveAddress} disabled={addressSaving} style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '9px 20px', background: '#4A3A32', border: 'none', borderRadius: 8, color: '#F6F1EB', cursor: addressSaving ? 'not-allowed' : 'pointer', opacity: addressSaving ? 0.7 : 1 }}>{addressSaving ? 'Saving…' : 'Save Address'}</button>
                </div>
              </div>
            ) : Object.values(address).every(v => !v) ? (
              <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#C4B5A8', fontStyle: 'italic' }}>No delivery address saved yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Name',        value: address.delivery_name },
                  { label: 'Phone',       value: address.delivery_phone },
                  { label: 'Address',     value: [address.delivery_address_line1, address.delivery_address_line2].filter(Boolean).join(', ') },
                  { label: 'City',        value: address.delivery_city },
                  { label: 'State',       value: address.delivery_state },
                  { label: 'Postal Code', value: address.delivery_postal_code },
                  { label: 'Country',     value: address.delivery_country },
                ].filter(r => r.value).map(({ label, value }, i, arr) => (
                  <div key={label}>
                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 12 }}>
                      <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: 0 }}>{label}</p>
                      <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#4A3A32', margin: 0 }}>{value}</p>
                    </div>
                    {i < arr.length - 1 && <div style={{ height: 1, background: '#EDE8DF', marginTop: 14 }} />}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

    </main>
  )
}
