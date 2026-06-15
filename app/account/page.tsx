'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCurrency } from '@/context/CurrencyContext'
import type { User } from '@supabase/supabase-js'

type Tab = 'profile' | 'orders'

type Order = {
  id: string
  order_number: number | null
  customer_name: string
  recommended_crystal_names: string[]
  total_amount: number
  payment_status: string
  fulfillment_status: string
  created_at: string
  generated_image_url: string | null
  weak_element: string | null
  strong_element: string | null
  analysis_summary: string | null
  shipping_address: string | null
  spacer_choice: string | null
  remark: string | null
  customer_phone: string | null
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' as const, padding: '3px 10px', borderRadius: 999, background: color + '22', color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  )
}

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
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const { format } = useCurrency()
  const [tab, setTab] = useState<Tab>(searchParams.get('tab') === 'orders' ? 'orders' : 'profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  type DeliveryAddress = {
    id: string; label: string | null; name: string | null; phone: string | null
    line1: string; line2: string | null; city: string | null; state: string | null
    postal_code: string | null; country: string | null; is_default: boolean
  }
  type AddrForm = { label: string; name: string; phone: string; line1: string; line2: string; city: string; state: string; postal_code: string; country: string }
  const EMPTY_FORM: AddrForm = { label: '', name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'MY' }

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [addrForm, setAddrForm] = useState<AddrForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [addrSaving, setAddrSaving] = useState(false)
  const [addrError, setAddrError] = useState<string | null>(null)

  const fetchAddresses = async (token: string) => {
    const res = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setAddresses(await res.json())
  }

  useEffect(() => {
    supabase.auth.refreshSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        const { data } = await supabase.from('profiles').select('is_admin').eq('id', u.id).single()
        setIsAdmin(data?.is_admin === true)
        await fetchAddresses(session!.access_token)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [router])

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  const saveAddr = async () => {
    if (!addrForm.line1.trim()) { setAddrError('Address line 1 is required'); return }
    setAddrSaving(true); setAddrError(null)
    const token = await getToken()
    if (!token) return
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    let res: Response
    if (editingId === 'new') {
      res = await fetch('/api/addresses', { method: 'POST', headers, body: JSON.stringify(addrForm) })
    } else {
      res = await fetch('/api/addresses', { method: 'PATCH', headers, body: JSON.stringify({ id: editingId, ...addrForm }) })
    }
    if (!res.ok) { const e = await res.json(); setAddrError(e.error || 'Failed to save'); setAddrSaving(false); return }
    await fetchAddresses(token)
    setEditingId(null); setAddrForm(EMPTY_FORM); setAddrSaving(false)
  }

  const deleteAddr = async (id: string) => {
    const token = await getToken()
    if (!token) return
    await fetch('/api/addresses', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) })
    await fetchAddresses(token)
  }

  const setDefault = async (id: string) => {
    const token = await getToken()
    if (!token) return
    await fetch('/api/addresses', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, is_default: true }) })
    await fetchAddresses(token)
  }

  const fetchOrders = async () => {
    setOrdersLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setOrdersLoading(false); return }
    const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${session.access_token}` } })
    if (res.ok) setOrders(await res.json())
    setOrdersLoading(false)
  }

  useEffect(() => {
    if (searchParams.get('tab') === 'orders') fetchOrders()
  }, [])

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
            {/* Profile tab */}
            <button onClick={() => setTab('profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#4A3A32', marginBottom: 2, width: '100%', background: tab === 'profile' ? '#F6F1EB' : 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F6F1EB')}
              onMouseLeave={e => (e.currentTarget.style.background = tab === 'profile' ? '#F6F1EB' : 'transparent')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              <span style={{ ...BODY, fontSize: 12, fontWeight: tab === 'profile' ? 600 : 400 }}>My Profile</span>
            </button>

            {/* Orders tab */}
            <button onClick={() => { setTab('orders'); fetchOrders() }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: '#4A3A32', marginBottom: 2, width: '100%', background: tab === 'orders' ? '#F6F1EB' : 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F6F1EB')}
              onMouseLeave={e => (e.currentTarget.style.background = tab === 'orders' ? '#F6F1EB' : 'transparent')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              <span style={{ ...BODY, fontSize: 12, fontWeight: tab === 'orders' ? 600 : 400 }}>My Orders</span>
            </button>

            {/* External links */}
            {[
              { href: '/energy-quiz', label: 'New Crystal Reading', icon: <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/> },
              { href: '/contact',     label: 'Contact Support',     icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></> },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#4A3A32', marginBottom: 2 }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F6F1EB')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                <span style={{ ...BODY, fontSize: 12, fontWeight: 400 }}>{label}</span>
              </Link>
            ))}

            {/* Admin Dashboard — boxed */}
            {isAdmin && (
              <div style={{ padding: '8px 4px 2px' }}>
                <Link href="/admin"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#7A5B3A', background: '#F5EDE0', border: '1px solid #D9C4A8' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EFE0C8'; e.currentTarget.style.borderColor = '#C4A870' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F5EDE0'; e.currentTarget.style.borderColor = '#D9C4A8' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A7040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                  <span style={{ ...BODY, fontSize: 12, fontWeight: 600, color: '#7A5B3A' }}>Admin Dashboard</span>
                </Link>
              </div>
            )}
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

          {/* ── ORDERS TAB ── */}
          {tab === 'orders' && (
            <div style={{ background: '#FDFAF7', border: '1px solid #E5DDD5', borderRadius: 16, padding: '32px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <Diamond />
                <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>My Orders</p>
              </div>
              {ordersLoading ? (
                <p style={{ ...BODY, fontSize: 11, letterSpacing: '0.28em', color: GOLD, textTransform: 'uppercase', textAlign: 'center', padding: '32px 0' }}>Loading…</p>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: '#4A3A32', margin: '0 0 8px' }}>No Orders Yet</p>
                  <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#9A8573', margin: '0 0 24px', lineHeight: 1.7 }}>Your crystal bracelet orders will appear here.</p>
                  <Link href="/energy-quiz" style={{ ...BODY, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: '#4A3A32', color: '#F6F1EB', borderRadius: 999, textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase' }}>
                    Discover Your Bracelet
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {orders.map((order) => {
                    const isOpen = expandedOrder === order.id
                    return (
                    <div key={order.id} style={{ background: '#F9F5F0', border: '1px solid #E5DDD5', borderRadius: 12, overflow: 'hidden' }}>
                      {/* Clickable header */}
                      <button
                        onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}
                      >
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1, flexWrap: 'wrap', textAlign: 'left' }}>
                          {order.generated_image_url && (
                            <div style={{ position: 'relative', width: 60, height: 60, borderRadius: 10, overflow: 'hidden', border: '1px solid #E5DDD5', flexShrink: 0 }}>
                              <Image src={order.generated_image_url} alt="Crystal bracelet" fill sizes="60px" style={{ objectFit: 'contain' }} />
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ ...BODY, fontSize: 10, color: '#B0A090', letterSpacing: '0.06em' }}>
                              {order.order_number ? `#${order.order_number}` : '—'} · {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <p style={{ ...SERIF, fontSize: 16, fontWeight: 300, color: '#4A3A32', margin: 0 }}>Crystal Bracelet</p>
                            <p style={{ ...BODY, fontSize: 11, fontWeight: 300, color: '#7A6355', margin: 0, lineHeight: 1.6 }}>
                              {order.recommended_crystal_names?.join(' · ') || '—'}
                            </p>
                            {(order.weak_element || order.strong_element) && (
                              <p style={{ ...BODY, fontSize: 10, color: GOLD, margin: 0 }}>
                                Weak: {order.weak_element || '—'} · Strong: {order.strong_element || '—'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                          <p style={{ ...SERIF, fontSize: 18, fontWeight: 400, color: '#4A3A32', margin: 0 }}>{format(Number(order.total_amount))}</p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <StatusBadge label={order.payment_status} color={order.payment_status === 'paid' ? '#7CB98A' : '#C0392B'} />
                            <StatusBadge label={order.fulfillment_status} color={order.fulfillment_status === 'fulfilled' ? '#7CB98A' : order.fulfillment_status === 'processing' ? GOLD : '#9A8573'} />
                          </div>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A8573" strokeWidth="2" strokeLinecap="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginTop: 4 }}><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isOpen && (
                        <div style={{ borderTop: '1px solid #E5DDD5', padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                          {/* Delivery info */}
                          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px 24px' }}>
                            {order.customer_name && <>
                              <div>
                                <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 3px' }}>Name</p>
                                <p style={{ ...BODY, fontSize: 12, color: '#4A3A32', margin: 0 }}>{order.customer_name}</p>
                              </div>
                              {order.shipping_address
                                ? <div>
                                    <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 3px' }}>Delivery Address</p>
                                    <p style={{ ...BODY, fontSize: 12, color: '#4A3A32', margin: 0 }}>{order.shipping_address}</p>
                                  </div>
                                : <div />
                              }
                            </>}
                            {order.customer_phone && <>
                              <div>
                                <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 3px' }}>Phone</p>
                                <p style={{ ...BODY, fontSize: 12, color: '#4A3A32', margin: 0 }}>{order.customer_phone}</p>
                              </div>
                              {order.remark
                                ? <div>
                                    <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 3px' }}>Remarks</p>
                                    <p style={{ ...BODY, fontSize: 12, color: '#4A3A32', margin: 0 }}>{order.remark}</p>
                                  </div>
                                : <div />
                              }
                            </>}
                            {!order.customer_phone && order.remark && <>
                              <div>
                                <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 3px' }}>Remarks</p>
                                <p style={{ ...BODY, fontSize: 12, color: '#4A3A32', margin: 0 }}>{order.remark}</p>
                              </div>
                              <div />
                            </>}
                          </div>

                          {/* Element analysis */}
                          {order.analysis_summary && (
                            <div style={{ background: '#F6F1EB', borderRadius: 10, padding: '14px 16px' }}>
                              <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, margin: '0 0 6px' }}>Elemental Analysis</p>
                              <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#7A6355', margin: 0, lineHeight: 1.8 }}>{order.analysis_summary}</p>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                    )
                  })}
                  <p style={{ ...BODY, fontSize: 11, color: '#B0A090', textAlign: 'center', letterSpacing: '0.1em', paddingTop: 4 }}>
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && <>

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

          {/* Delivery Addresses */}
          <div style={{ background: '#FDFAF7', border: '1px solid #E5DDD5', borderRadius: 16, padding: '32px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Diamond />
                <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>Delivery Addresses</p>
              </div>
              {editingId === null && (
                <button onClick={() => { setEditingId('new'); setAddrForm(EMPTY_FORM); setAddrError(null) }}
                  style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '7px 16px', background: 'transparent', border: '1px solid #E5DDD5', borderRadius: 7, color: '#7A6355', cursor: 'pointer' }}>
                  + Add Address
                </button>
              )}
            </div>

            {/* Address form (new or edit) */}
            {editingId !== null && (() => {
              const f = (key: keyof AddrForm, label: string, placeholder: string) => (
                <div key={key}>
                  <label style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#9A8573', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input value={addrForm[key]} onChange={e => setAddrForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={{ ...INPUT, fontSize: 12, padding: '10px 14px' }} />
                </div>
              )
              return (
                <div style={{ background: '#F6F1EB', borderRadius: 12, padding: '20px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, margin: 0 }}>{editingId === 'new' ? 'New Address' : 'Edit Address'}</p>
                  {f('label', 'Label (optional)', 'e.g. Home, Office')}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {f('name', 'Full Name', 'e.g. Jane Lim')}
                    {f('phone', 'Phone', 'e.g. +60 12 345 6789')}
                  </div>
                  {f('line1', 'Address Line 1 *', 'Street, unit, block')}
                  {f('line2', 'Address Line 2', 'Apartment, suite (optional)')}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {f('city', 'City', 'e.g. Kuala Lumpur')}
                    {f('state', 'State', 'e.g. Selangor')}
                    {f('postal_code', 'Postal Code', 'e.g. 50000')}
                  </div>
                  {f('country', 'Country', 'e.g. MY')}
                  {addrError && <p style={{ ...BODY, fontSize: 12, color: '#C0392B', margin: 0 }}>{addrError}</p>}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={() => { setEditingId(null); setAddrError(null) }} style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '9px 20px', background: 'transparent', border: '1px solid #E5DDD5', borderRadius: 8, color: '#9A8573', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={saveAddr} disabled={addrSaving} style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '9px 20px', background: '#4A3A32', border: 'none', borderRadius: 8, color: '#F6F1EB', cursor: addrSaving ? 'not-allowed' : 'pointer', opacity: addrSaving ? 0.7 : 1 }}>{addrSaving ? 'Saving…' : 'Save'}</button>
                  </div>
                </div>
              )
            })()}

            {/* Address list */}
            {addresses.length === 0 && editingId === null ? (
              <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#C4B5A8', fontStyle: 'italic' }}>No delivery addresses saved yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {addresses.map(a => (
                  <div key={a.id} style={{ border: `1px solid ${a.is_default ? GOLD + '66' : '#E5DDD5'}`, borderRadius: 10, padding: '16px 20px', background: a.is_default ? '#FEFAF4' : '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          {a.label && <span style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD }}>{a.label}</span>}
                          {a.is_default && <span style={{ ...BODY, fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999, background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}44` }}>Default</span>}
                        </div>
                        <p style={{ ...BODY, fontSize: 12, fontWeight: 500, color: '#4A3A32', margin: '0 0 2px' }}>{a.name || '—'} {a.phone && `· ${a.phone}`}</p>
                        <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#7A6355', margin: 0, lineHeight: 1.6 }}>
                          {[a.line1, a.line2, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {!a.is_default && (
                          <button onClick={() => setDefault(a.id)} style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', background: 'transparent', border: '1px solid #E5DDD5', borderRadius: 6, color: '#7A6355', cursor: 'pointer' }}>Set Default</button>
                        )}
                        <button onClick={() => { setEditingId(a.id); setAddrForm({ label: a.label ?? '', name: a.name ?? '', phone: a.phone ?? '', line1: a.line1, line2: a.line2 ?? '', city: a.city ?? '', state: a.state ?? '', postal_code: a.postal_code ?? '', country: a.country ?? 'MY' }); setAddrError(null) }} style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', background: 'transparent', border: '1px solid #E5DDD5', borderRadius: 6, color: '#7A6355', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => deleteAddr(a.id)} style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', background: 'transparent', border: '1px solid #F0D0CC', borderRadius: 6, color: '#C0392B', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          </>}

        </div>
      </section>

    </main>
  )
}
