'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'
const DARK = '#4A3A32'

type Tab = 'orders' | 'users' | 'crystals' | 'inquiry' | 'readings' | 'ai-prompt' | 'shop'

type Order = {
  id: string; order_number: number | null; customer_name: string; customer_email: string; customer_phone: string | null
  recommended_crystal_names: string[]; total_amount: number
  payment_status: string; fulfillment_status: string; created_at: string
  shipping_address: string | null; spacer_choice: string | null; remark: string | null
  weak_element: string | null; strong_element: string | null; analysis_summary: string | null
  generated_image_url: string | null
}
type User = {
  id: string; email: string; name: string | null
  is_admin: boolean; created_at: string; last_sign_in_at: string | null
}
type Reading = {
  id: string; user_name: string; birth_date: string; main_goal: string
  calculated_weak_element: string; calculated_strong_element: string
  crystal_names: string[]; cached_image_url: string | null
  analysis_summary: string; suggested_spacer: string | null; created_at: string
}

type Crystal = {
  id: number; name: string; slug: string | null; element: string; primary_element: string | null
  color_family: string; meaning: string; active: boolean; price_tier: string
  luxury_score: number | null; energy_tags: string[] | null; bead_image_url: string | null
  bead_image_urls: string[] | null
}

const CRYSTAL_COLUMNS: { key: keyof Crystal | 'toggle'; label: string }[] = [
  { key: 'bead_image_url', label: 'Image' },
  { key: 'name',           label: 'Name' },
  { key: 'slug',           label: 'Slug' },
  { key: 'element',        label: 'Element' },
  { key: 'primary_element',label: 'Primary Element' },
  { key: 'color_family',   label: 'Color Family' },
  { key: 'meaning',        label: 'Meaning' },
  { key: 'price_tier',     label: 'Price Tier' },
  { key: 'luxury_score',   label: 'Luxury Score' },
  { key: 'energy_tags',    label: 'Energy Tags' },
  { key: 'active',         label: 'Status' },
  { key: 'toggle',         label: 'Toggle' },
]
type Inquiry = {
  id: string; name: string; email: string; subject: string; message: string; submitted_at: string; is_replied: boolean
}
type InquirySortKey = 'submitted_at' | 'name' | 'email'

const NAV_ITEMS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: 'orders', label: 'Orders',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  },
  {
    key: 'users', label: 'Users',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    key: 'crystals', label: 'Crystals',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22,8.5 12,15.5 2,8.5"/></svg>,
  },
  {
    key: 'inquiry', label: 'Inquiry',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  },
  {
    key: 'readings', label: 'AI Bracelets',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  },
  {
    key: 'ai-prompt', label: 'AI Prompt',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  },
  {
    key: 'shop', label: 'Shop',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
]

const AI_SYSTEM_PROMPT = `You are a luxury crystal bracelet designer and Five Elements (Wu Xing) energy specialist for SYANN, a premium crystal jewelry brand.

Based on the user's birth date, birth time, and intention, you will:
1. Analyze their Five Elements balance (Wood, Fire, Earth, Metal, Water)
2. Identify their weak and strong elements
3. Select exactly 3 crystals from the provided catalog that best support their weak element and intention
4. Optionally recommend a spacer style
5. Write a detailed image generation prompt for the bracelet visualization

Selection rules:
- Choose crystals that address the user's weak element
- Ensure visual harmony (colors should complement each other)
- Consider the user's stated intention
- All crystal beads are 8mm perfectly round spheres`

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999, background: color + '22', color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  )
}

const TH: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: 700,
  letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573',
  padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #E5DDD5', whiteSpace: 'nowrap',
}
const TD: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 300,
  color: '#4A3A32', padding: '14px 16px', borderBottom: '1px solid #F0E8DF', verticalAlign: 'middle',
}

export default function AdminPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('orders')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [crystals, setCrystals] = useState<Crystal[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [readings, setReadings] = useState<Reading[]>([])
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [orderFilter, setOrderFilter] = useState<'all' | 'unfulfilled' | 'processing' | 'fulfilled'>('all')
  const [orderSort, setOrderSort] = useState<'created_at' | 'customer_name' | 'total_amount'>('created_at')
  const [orderSortAsc, setOrderSortAsc] = useState(false)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderSearchField, setOrderSearchField] = useState<'customer_name' | 'customer_email'>('customer_name')
  const [showOrderSortDropdown, setShowOrderSortDropdown] = useState(false)
  const [expandedInquiry, setExpandedInquiry] = useState<string | null>(null)
  const [inquirySort, setInquirySort] = useState<InquirySortKey>('submitted_at')
  const [inquirySortAsc, setInquirySortAsc] = useState(false)
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'replied' | 'pending'>('all')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [inquirySearch, setInquirySearch] = useState('')
  const [inquirySearchField, setInquirySearchField] = useState<'name' | 'email' | 'subject'>('name')
  const [expandedReading, setExpandedReading] = useState<string | null>(null)
  const [showAddCrystal, setShowAddCrystal] = useState(false)
  const [newCrystal, setNewCrystal] = useState({ name: '', slug: '', element: '', primary_element: '', color_family: '', meaning: '', price_tier: '', luxury_score: '', energy_tags: '', bead_image_urls: [] as string[], active: true })
  const [addCrystalError, setAddCrystalError] = useState<string | null>(null)
  const [addCrystalLoading, setAddCrystalLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  // Edit crystal images
  const [editCrystalId, setEditCrystalId] = useState<number | null>(null)
  const [editCrystalName, setEditCrystalName] = useState('')
  const [editCrystalImages, setEditCrystalImages] = useState<string[]>([])
  const [editCrystalImageUploading, setEditCrystalImageUploading] = useState(false)
  const [editCrystalError, setEditCrystalError] = useState<string | null>(null)
  const [editCrystalSaving, setEditCrystalSaving] = useState(false)

  // Shop
  type ShopProduct = { id: string; name: string; description: string | null; price: number; category: string; image_url: string | null; active: boolean }
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([])
  const [shopLoading, setShopLoading] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category: 'bracelet', image_url: '' })
  const [addProductError, setAddProductError] = useState<string | null>(null)
  const [addProductLoading, setAddProductLoading] = useState(false)
  const [productImageUploading, setProductImageUploading] = useState(false)
  const [editProductId, setEditProductId] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState({ name: '', description: '', price: '', category: 'bracelet', image_url: '' })
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    new Set(['bead_image_url', 'name', 'element', 'color_family', 'price_tier', 'active', 'toggle'])
  )

  const [showColPicker, setShowColPicker] = useState(false)
  const [authStatus, setAuthStatus] = useState<'checking' | 'authorized' | 'denied'>('checking')

  useEffect(() => {
    supabase.auth.refreshSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setAuthStatus('denied'); return }
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single()
      if (data?.is_admin !== true) { setAuthStatus('denied'); return }
      setAdminEmail(session.user.email ?? null)
      setToken(session.access_token)
      setAuthStatus('authorized')
    })
  }, [router])

  useEffect(() => {
    if (!token) return
    Promise.all([fetchOrders(), fetchUsers(), fetchCrystals(), fetchInquiries(), fetchReadings(), fetchShopProducts()])
      .finally(() => setLoading(false))
  }, [token])

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })

  const fetchOrders   = async () => { const r = await fetch('/api/admin/orders',   { headers: headers() }); if (r.ok) setOrders(await r.json()) }
  const fetchUsers    = async () => { const r = await fetch('/api/admin/users',    { headers: headers() }); if (r.ok) setUsers(await r.json()) }
  const fetchCrystals = async () => { const r = await fetch('/api/admin/crystals', { headers: headers() }); if (r.ok) setCrystals(await r.json()) }
  const fetchInquiries= async () => { const r = await fetch('/api/admin/inquiry',  { headers: headers() }); if (r.ok) setInquiries(await r.json()) }
  const fetchReadings = async () => { const r = await fetch('/api/admin/readings', { headers: headers() }); if (r.ok) setReadings(await r.json()) }
  const fetchShopProducts = async () => {
    setShopLoading(true)
    const r = await fetch('/api/shop/products', { headers: headers() })
    if (r.ok) setShopProducts(await r.json())
    setShopLoading(false)
  }

  const updateFulfillment = async (id: string, fulfillment_status: string) => {
    setActionLoading(id)
    await fetch('/api/admin/orders', { method: 'PATCH', headers: headers(), body: JSON.stringify({ id, fulfillment_status }) })
    await fetchOrders(); setActionLoading(null)
  }

  const toggleAdmin = async (userId: string, grant: boolean) => {
    setActionLoading(userId)
    await fetch('/api/admin/set-admin', { method: 'POST', headers: headers(), body: JSON.stringify({ userId, grant }) })
    await fetchUsers(); setActionLoading(null)
  }

  const toggleCrystal = async (id: number, active: boolean) => {
    setActionLoading(String(id))
    await fetch('/api/admin/crystals', { method: 'PATCH', headers: headers(), body: JSON.stringify({ id, active }) })
    await fetchCrystals(); setActionLoading(null)
  }

  const toggleReplied = async (id: string, is_replied: boolean) => {
    setActionLoading(id)
    await fetch('/api/admin/inquiry', { method: 'PATCH', headers: headers(), body: JSON.stringify({ id, is_replied }) })
    await fetchInquiries(); setActionLoading(null)
  }

  const addCrystal = async () => {
    if (!newCrystal.name.trim()) { setAddCrystalError('Crystal name is required.'); return }
    setAddCrystalLoading(true); setAddCrystalError(null)
    const r = await fetch('/api/admin/crystals', { method: 'POST', headers: headers(), body: JSON.stringify(newCrystal) })
    if (!r.ok) { const e = await r.json(); setAddCrystalError(e.error || 'Failed to add crystal.'); setAddCrystalLoading(false); return }
    await fetchCrystals()
    setShowAddCrystal(false)
    setNewCrystal({ name: '', slug: '', element: '', primary_element: '', color_family: '', meaning: '', price_tier: '', luxury_score: '', energy_tags: '', bead_image_urls: [], active: true })
    setAddCrystalLoading(false)
  }

  const uploadBeadImage = async (file: File) => {
    setImageUploading(true); setAddCrystalError(null)
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/admin/crystals/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    if (!r.ok) { const e = await r.json(); setAddCrystalError(e.error || 'Image upload failed.'); setImageUploading(false); return }
    const { url } = await r.json()
    setNewCrystal(prev => ({ ...prev, bead_image_urls: [...prev.bead_image_urls, url] }))
    setImageUploading(false)
  }

  const uploadEditCrystalImage = async (file: File) => {
    setEditCrystalImageUploading(true); setEditCrystalError(null)
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/admin/crystals/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    if (!r.ok) { const e = await r.json(); setEditCrystalError(e.error || 'Image upload failed.'); setEditCrystalImageUploading(false); return }
    const { url } = await r.json()
    setEditCrystalImages(prev => [...prev, url])
    setEditCrystalImageUploading(false)
  }

  const saveEditCrystalImages = async () => {
    if (editCrystalId === null) return
    setEditCrystalSaving(true); setEditCrystalError(null)
    const r = await fetch('/api/admin/crystals', { method: 'PATCH', headers: headers(), body: JSON.stringify({ id: editCrystalId, bead_image_urls: editCrystalImages }) })
    if (!r.ok) { const e = await r.json(); setEditCrystalError(e.error || 'Save failed.'); setEditCrystalSaving(false); return }
    await fetchCrystals()
    setEditCrystalId(null)
    setEditCrystalSaving(false)
  }

  if (authStatus === 'checking') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F6F1EB' }}>
      <p style={{ ...BODY, fontSize: 11, letterSpacing: '0.28em', color: GOLD, textTransform: 'uppercase' }}>Verifying access…</p>
    </div>
  )

  if (authStatus === 'denied') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F6F1EB', gap: 16 }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <h1 style={{ ...SERIF, fontSize: 28, fontWeight: 300, color: DARK, margin: 0 }}>Access Denied</h1>
      <p style={{ ...BODY, fontSize: 12, color: '#9A8573', margin: 0, letterSpacing: '0.04em' }}>You don't have permission to view this page.</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={() => router.push('/')} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '9px 20px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Go Home</button>
        <button onClick={() => router.push('/account')} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '9px 20px', background: 'transparent', color: DARK, border: '1px solid #E5DDD5', borderRadius: 8, cursor: 'pointer' }}>My Account</button>
      </div>
    </div>
  )

  const SIDEBAR_W = sidebarOpen ? 220 : 64

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F6F1EB', ...BODY }}>

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside style={{ width: SIDEBAR_W, minHeight: '100vh', background: DARK, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.25s ease', overflow: 'hidden' }}>

        {/* Logo + toggle */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {sidebarOpen && (
            <div>
              <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.36em', color: GOLD, textTransform: 'uppercase', margin: '0 0 2px' }}>Admin</p>
              <p style={{ ...SERIF, fontSize: 18, fontWeight: 300, color: '#F6F1EB', margin: 0, lineHeight: 1 }}>SYANN</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#C4B5A8', flexShrink: 0 }}
          >
            {sidebarOpen
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ key, label, icon }) => {
            const active = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                title={!sidebarOpen ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: sidebarOpen ? '10px 14px' : '10px',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  background: active ? 'rgba(176,139,87,0.18)' : 'transparent',
                  border: 'none', borderRadius: 8,
                  color: active ? GOLD : '#C4B5A8',
                  cursor: 'pointer', width: '100%',
                  transition: 'background 0.2s, color 0.2s',
                  borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
                }}
              >
                {icon}
                {sidebarOpen && (
                  <span style={{ ...BODY, fontSize: 12, fontWeight: active ? 600 : 400, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Back to site */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => router.push('/')}
            title={!sidebarOpen ? 'Back to Site' : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: sidebarOpen ? '10px 14px' : '10px', justifyContent: sidebarOpen ? 'flex-start' : 'center', background: 'transparent', border: 'none', borderRadius: 8, color: '#9A8573', cursor: 'pointer', width: '100%' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {sidebarOpen && <span style={{ ...BODY, fontSize: 11, letterSpacing: '0.1em' }}>Back to Site</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E5DDD5', padding: '16px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ ...SERIF, fontSize: 26, fontWeight: 300, color: DARK, margin: 0 }}>
            {NAV_ITEMS.find(n => n.key === tab)?.label}
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ ...BODY, fontSize: 11, fontWeight: 600, color: GOLD, letterSpacing: '0.1em' }}>Admin</span>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7CB98A', flexShrink: 0 }} />
            </div>
            {adminEmail && (
              <span style={{ ...BODY, fontSize: 10, color: '#9A8573', letterSpacing: '0.04em' }}>{adminEmail}</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          {loading ? (
            <p style={{ ...BODY, fontSize: 11, letterSpacing: '0.28em', color: GOLD, textTransform: 'uppercase', textAlign: 'center', paddingTop: 80 }}>Loading…</p>
          ) : (
            <>
              {/* ── ORDERS ── */}
              {tab === 'orders' && (() => {
                const q = orderSearch.trim().toLowerCase()
                const searchFiltered = orders.filter(o => !q || (o[orderSearchField] || '').toLowerCase().includes(q))
                const tabCounts = {
                  all: searchFiltered.length,
                  unfulfilled: searchFiltered.filter(o => o.fulfillment_status === 'unfulfilled').length,
                  processing:  searchFiltered.filter(o => o.fulfillment_status === 'processing').length,
                  fulfilled:   searchFiltered.filter(o => o.fulfillment_status === 'fulfilled').length,
                }
                const ORDER_SORT_OPTIONS: { key: 'created_at' | 'customer_name' | 'total_amount'; label: string }[] = [
                  { key: 'created_at',    label: 'Date' },
                  { key: 'customer_name', label: 'Name' },
                  { key: 'total_amount',  label: 'Amount' },
                ]
                const filteredOrders = searchFiltered
                  .filter(o => orderFilter === 'all' || o.fulfillment_status === orderFilter)
                  .sort((a, b) => {
                    let result: number
                    if (orderSort === 'total_amount') result = Number(a.total_amount) - Number(b.total_amount)
                    else if (orderSort === 'customer_name') result = (a.customer_name || '').toLowerCase().localeCompare((b.customer_name || '').toLowerCase())
                    else result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    return orderSortAsc ? result : -result
                  })

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onClick={() => setShowOrderSortDropdown(false)}>

                    {/* Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      {/* Filter tabs */}
                      <div style={{ display: 'flex', gap: 6, background: '#fff', border: '1px solid #E5DDD5', borderRadius: 8, padding: 4 }}>
                        {(['all', 'unfulfilled', 'processing', 'fulfilled'] as const).map(f => (
                          <button key={f} onClick={() => setOrderFilter(f)}
                            style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '6px 14px', background: orderFilter === f ? DARK : 'transparent', color: orderFilter === f ? '#F6F1EB' : '#9A8573', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                            {f}
                            {f !== 'all' && tabCounts[f] > 0 && (
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 999, background: orderFilter === f ? 'rgba(255,255,255,0.2)' : '#F0E8DF', color: orderFilter === f ? '#F6F1EB' : '#9A8573' }}>
                                {tabCounts[f]}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Search + Sort */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5DDD5', borderRadius: 7, background: '#fff', overflow: 'hidden' }}>
                          <select
                            value={orderSearchField}
                            onChange={e => { setOrderSearchField(e.target.value as 'customer_name' | 'customer_email'); setOrderSearch('') }}
                            style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 8px', border: 'none', borderRight: '1px solid #E5DDD5', background: '#F6F1EB', color: '#7A6355', cursor: 'pointer', outline: 'none' }}
                          >
                            <option value="customer_name">Name</option>
                            <option value="customer_email">Email</option>
                          </select>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A8573" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 8, pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input
                              value={orderSearch}
                              onChange={e => setOrderSearch(e.target.value)}
                              placeholder={`Search by ${orderSearchField === 'customer_name' ? 'name' : 'email'}…`}
                              style={{ ...BODY, fontSize: 11, padding: '7px 28px 7px 26px', border: 'none', color: DARK, background: 'transparent', outline: 'none', width: 180 }}
                            />
                            {orderSearch && (
                              <button onClick={() => setOrderSearch('')} style={{ position: 'absolute', right: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#C4B5A8', padding: 0, display: 'flex' }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
                            )}
                          </div>
                        </div>

                        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setShowOrderSortDropdown(o => !o)}
                            style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '7px 14px', background: '#fff', color: DARK, border: '1px solid #E5DDD5', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                            {ORDER_SORT_OPTIONS.find(s => s.key === orderSort)?.label}
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              {orderSortAsc ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                            </svg>
                          </button>
                          {showOrderSortDropdown && (
                            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid #E5DDD5', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '6px 0', zIndex: 50, minWidth: 150 }}>
                              {ORDER_SORT_OPTIONS.map(opt => (
                                <button key={opt.key}
                                  onClick={() => {
                                    if (orderSort === opt.key) setOrderSortAsc(a => !a)
                                    else { setOrderSort(opt.key); setOrderSortAsc(false) }
                                    setShowOrderSortDropdown(false)
                                  }}
                                  style={{ ...BODY, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: orderSort === opt.key ? GOLD : DARK, fontWeight: orderSort === opt.key ? 600 : 400 }}
                                >
                                  {opt.label}
                                  {orderSort === opt.key && (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round">
                                      {orderSortAsc ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, overflow: 'hidden' }}>
                      {filteredOrders.length === 0 ? (
                        <p style={{ ...BODY, fontSize: 13, color: '#9A8573', textAlign: 'center', padding: '48px 0' }}>No orders found.</p>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead><tr style={{ background: '#F6F1EB' }}>
                              <th style={TH}>#</th>
                              <th style={TH}>Customer</th><th style={TH}>Crystals</th>
                              <th style={TH}>Amount</th><th style={TH}>Payment</th>
                              <th style={TH}>Fulfilment</th><th style={TH}>Date</th><th style={TH}>Update</th>
                            </tr></thead>
                            <tbody>
                              {filteredOrders.map((o, idx) => (
                                <React.Fragment key={o.id}>
                                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                                    <td style={{ ...TD, color: '#B0A090', fontSize: 11, letterSpacing: '0.06em' }}>#{o.order_number ?? '—'}</td>
                                    <td style={TD}><p style={{ margin: '0 0 2px', fontWeight: 400 }}>{o.customer_name || '—'}</p><p style={{ margin: 0, fontSize: 11, color: '#9A8573' }}>{o.customer_email}</p></td>
                                    <td style={TD}><p style={{ margin: 0, fontSize: 11, lineHeight: 1.6 }}>{o.recommended_crystal_names?.join(', ') || '—'}</p></td>
                                    <td style={TD}>S${Number(o.total_amount).toFixed(2)}</td>
                                    <td style={TD}><Badge label={o.payment_status} color={o.payment_status === 'paid' ? '#7CB98A' : '#C0392B'} /></td>
                                    <td style={TD}><Badge label={o.fulfillment_status} color={o.fulfillment_status === 'fulfilled' ? '#7CB98A' : o.fulfillment_status === 'processing' ? GOLD : '#9A8573'} /></td>
                                    <td style={TD}>{new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td style={TD} onClick={e => e.stopPropagation()}>
                                      <select value={o.fulfillment_status} disabled={actionLoading === o.id} onChange={e => updateFulfillment(o.id, e.target.value)}
                                        style={{ ...BODY, fontSize: 11, padding: '6px 10px', border: '1px solid #E5DDD5', background: '#fff', color: DARK, cursor: 'pointer', borderRadius: 6 }}>
                                        <option value="unfulfilled">Unfulfilled</option>
                                        <option value="processing">Processing</option>
                                        <option value="fulfilled">Fulfilled</option>
                                      </select>
                                    </td>
                                  </tr>
                                  {expandedOrder === o.id && (
                                    <tr>
                                      <td colSpan={8} style={{ ...TD, background: '#F9F6F2', borderBottom: '2px solid #E5DDD5' }}>
                                        <div style={{ display: 'flex', gap: 24, padding: '4px 0', alignItems: 'flex-start' }}>
                                          {o.generated_image_url && (
                                            <button
                                              onClick={e => { e.stopPropagation(); setLightboxUrl(o.generated_image_url) }}
                                              style={{ background: 'none', border: '1px solid #E5DDD5', borderRadius: 10, padding: 0, cursor: 'zoom-in', flexShrink: 0, overflow: 'hidden', width: 80, height: 80 }}
                                              title="Click to enlarge"
                                            >
                                              <img src={o.generated_image_url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }} />
                                            </button>
                                          )}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 40px', flex: 1 }}>
                                          <div>
                                            <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 4px' }}>Delivery Address</p>
                                            <p style={{ ...BODY, fontSize: 12, color: DARK, margin: 0 }}>{o.shipping_address || '—'}</p>
                                          </div>
                                          <div>
                                            <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 4px' }}>Phone</p>
                                            <p style={{ ...BODY, fontSize: 12, color: DARK, margin: 0 }}>{o.customer_phone || '—'}</p>
                                          </div>
                                          <div>
                                            <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 4px' }}>Spacer</p>
                                            <p style={{ ...BODY, fontSize: 12, color: DARK, margin: 0, textTransform: 'capitalize' }}>{o.spacer_choice || '—'}</p>
                                          </div>
                                          {o.remark && (
                                            <div>
                                              <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 4px' }}>Remark</p>
                                              <p style={{ ...BODY, fontSize: 12, color: DARK, margin: 0 }}>{o.remark}</p>
                                            </div>
                                          )}
                                          {(o.weak_element || o.strong_element) && (
                                            <div>
                                              <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 4px' }}>Element Analysis</p>
                                              <p style={{ ...BODY, fontSize: 12, color: DARK, margin: 0 }}>Weak: {o.weak_element || '—'} · Strong: {o.strong_element || '—'}</p>
                                            </div>
                                          )}
                                          {o.analysis_summary && (
                                            <div style={{ width: '100%' }}>
                                              <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 4px' }}>Analysis Summary</p>
                                              <p style={{ ...BODY, fontSize: 12, color: '#7A6355', margin: 0, lineHeight: 1.7 }}>{o.analysis_summary}</p>
                                            </div>
                                          )}
                                        </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Count footer */}
                    <p style={{ ...BODY, fontSize: 11, color: '#B0A090', textAlign: 'center', letterSpacing: '0.1em', paddingTop: 4 }}>
                      {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                      {tabCounts.processing > 0 && <span style={{ color: GOLD }}> · {tabCounts.processing} processing</span>}
                      {tabCounts.unfulfilled > 0 && <span style={{ color: '#C0392B' }}> · {tabCounts.unfulfilled} unfulfilled</span>}
                    </p>
                  </div>
                )
              })()}

              {/* ── USERS ── */}
              {tab === 'users' && (
                <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, overflow: 'hidden' }}>
                  {users.length === 0 ? (
                    <p style={{ ...BODY, fontSize: 13, color: '#9A8573', textAlign: 'center', padding: '48px 0' }}>No users.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: '#F6F1EB' }}>
                          <th style={TH}>Name</th><th style={TH}>Email</th><th style={TH}>Is Admin</th>
                          <th style={TH}>Joined</th><th style={TH}>Last Sign In</th><th style={TH}>Action</th>
                        </tr></thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u.id}>
                              <td style={TD}>{u.name || '—'}</td>
                              <td style={TD}>{u.email}</td>
                              <td style={TD}><Badge label={u.is_admin ? 'Admin' : 'User'} color={u.is_admin ? GOLD : '#9A8573'} /></td>
                              <td style={TD}>{new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                              <td style={TD}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                              <td style={TD}>
                                {u.is_admin
                                  ? <button disabled={actionLoading === u.id} onClick={() => toggleAdmin(u.id, false)} style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '6px 12px', background: 'transparent', border: '1px solid #C0392B', color: '#C0392B', borderRadius: 6, cursor: 'pointer' }}>{actionLoading === u.id ? '…' : 'Revoke'}</button>
                                  : <button disabled={actionLoading === u.id} onClick={() => toggleAdmin(u.id, true)} style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '6px 12px', background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 6, cursor: 'pointer' }}>{actionLoading === u.id ? '…' : 'Make Admin'}</button>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── CRYSTALS ── */}
              {tab === 'crystals' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Toolbar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                    {/* Column picker */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setShowColPicker(o => !o)}
                        style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '9px 16px', background: '#fff', color: DARK, border: '1px solid #E5DDD5', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        Columns
                      </button>
                      {showColPicker && (
                        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid #E5DDD5', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '10px 0', zIndex: 50, minWidth: 180 }}>
                          {CRYSTAL_COLUMNS.map(col => (
                            <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={visibleCols.has(col.key)}
                                onChange={() => setVisibleCols(prev => {
                                  const next = new Set(prev)
                                  next.has(col.key) ? next.delete(col.key) : next.add(col.key)
                                  return next
                                })}
                                style={{ accentColor: GOLD, width: 13, height: 13 }}
                              />
                              <span style={{ ...BODY, fontSize: 12, color: DARK }}>{col.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => { setShowAddCrystal(true); setAddCrystalError(null); setShowColPicker(false) }}
                      style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '9px 20px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Add Crystal
                    </button>
                  </div>

                  {/* Table */}
                  <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, overflow: 'hidden' }} onClick={() => setShowColPicker(false)}>
                    {crystals.length === 0 ? (
                      <p style={{ ...BODY, fontSize: 13, color: '#9A8573', textAlign: 'center', padding: '48px 0' }}>No crystals found.</p>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead><tr style={{ background: '#F6F1EB' }}>
                            {CRYSTAL_COLUMNS.filter(c => visibleCols.has(c.key)).map(col => (
                              <th key={col.key} style={TH}>{col.label}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {crystals.map(c => (
                              <tr key={c.id}>
                                {CRYSTAL_COLUMNS.filter(col => visibleCols.has(col.key)).map(col => {
                                  if (col.key === 'bead_image_url') return (
                                    <td key="img" style={TD}>
                                      {c.bead_image_url
                                        ? <img src={c.bead_image_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5DDD5' }} />
                                        : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EDE8DF', border: '1px solid #E5DDD5' }} />}
                                    </td>
                                  )
                                  if (col.key === 'name') return <td key="name" style={{ ...TD, fontWeight: 400 }}>{c.name}</td>
                                  if (col.key === 'active') return <td key="active" style={TD}><Badge label={c.active ? 'Active' : 'Inactive'} color={c.active ? '#7CB98A' : '#9A8573'} /></td>
                                  if (col.key === 'toggle') return (
                                    <td key="toggle" style={{ ...TD, whiteSpace: 'nowrap' }}>
                                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <button disabled={actionLoading === String(c.id)} onClick={() => toggleCrystal(c.id, !c.active)}
                                          style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '6px 12px', background: 'transparent', border: `1px solid ${c.active ? '#C0392B' : '#7CB98A'}`, color: c.active ? '#C0392B' : '#7CB98A', borderRadius: 6, cursor: 'pointer' }}>
                                          {actionLoading === String(c.id) ? '…' : c.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => { setEditCrystalId(c.id); setEditCrystalName(c.name); setEditCrystalImages(c.bead_image_urls ?? (c.bead_image_url ? [c.bead_image_url] : [])); setEditCrystalError(null) }}
                                          style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '6px 12px', background: 'transparent', border: '1px solid #B08B57', color: '#B08B57', borderRadius: 6, cursor: 'pointer' }}>
                                          Images
                                        </button>
                                      </div>
                                    </td>
                                  )
                                  if (col.key === 'energy_tags') return (
                                    <td key="energy_tags" style={TD}>
                                      {c.energy_tags?.length ? c.energy_tags.join(', ') : '—'}
                                    </td>
                                  )
                                  const val = c[col.key as keyof Crystal]
                                  return <td key={col.key} style={TD}>{val !== null && val !== undefined && val !== '' ? String(val) : '—'}</td>
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── INQUIRY ── */}
              {tab === 'inquiry' && (() => {
                const q = inquirySearch.trim().toLowerCase()
                const searchFiltered = inquiries.filter(inq => !q || inq[inquirySearchField]?.toLowerCase().includes(q))
                const tabCounts = {
                  all: searchFiltered.length,
                  pending: searchFiltered.filter(i => !i.is_replied).length,
                  replied: searchFiltered.filter(i => i.is_replied).length,
                }
                const sorted = searchFiltered
                  .filter(inq => inquiryFilter === 'all' ? true : inquiryFilter === 'replied' ? inq.is_replied : !inq.is_replied)
                  .sort((a, b) => {
                    let result: number
                    if (inquirySort === 'submitted_at') {
                      result = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
                    } else {
                      result = (a[inquirySort] || '').toLowerCase().localeCompare((b[inquirySort] || '').toLowerCase())
                    }
                    return inquirySortAsc ? result : -result
                  })

                const SORT_OPTIONS: { key: InquirySortKey; label: string }[] = [
                  { key: 'submitted_at', label: 'Date' },
                  { key: 'name',         label: 'Name' },
                  { key: 'email',        label: 'Email' },
                ]
                const currentSortLabel = SORT_OPTIONS.find(s => s.key === inquirySort)?.label

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onClick={() => setShowSortDropdown(false)}>
                    {/* Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      {/* Filter tabs */}
                      <div style={{ display: 'flex', gap: 6, background: '#fff', border: '1px solid #E5DDD5', borderRadius: 8, padding: 4 }}>
                        {(['all', 'pending', 'replied'] as const).map(f => (
                          <button key={f} onClick={() => setInquiryFilter(f)}
                            style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '6px 14px', background: inquiryFilter === f ? DARK : 'transparent', color: inquiryFilter === f ? '#F6F1EB' : '#9A8573', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                            {f}
                            {f === 'pending' && (
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 999, background: inquiryFilter === f ? 'rgba(255,255,255,0.2)' : '#F0E8DF', color: inquiryFilter === f ? '#F6F1EB' : '#9A8573' }}>
                                {tabCounts[f]}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Right: Search + Sort */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                        {/* Search with field selector */}
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5DDD5', borderRadius: 7, background: '#fff', overflow: 'hidden' }}>
                          <select
                            value={inquirySearchField}
                            onChange={e => { setInquirySearchField(e.target.value as 'name' | 'email' | 'subject'); setInquirySearch('') }}
                            style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 8px', border: 'none', borderRight: '1px solid #E5DDD5', background: '#F6F1EB', color: '#7A6355', cursor: 'pointer', outline: 'none' }}
                          >
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="subject">Subject</option>
                          </select>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A8573" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 8, pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input
                              value={inquirySearch}
                              onChange={e => setInquirySearch(e.target.value)}
                              placeholder={`Search by ${inquirySearchField}…`}
                              style={{ ...BODY, fontSize: 11, padding: '7px 28px 7px 26px', border: 'none', color: DARK, background: 'transparent', outline: 'none', width: 180 }}
                            />
                            {inquirySearch && (
                              <button onClick={() => setInquirySearch('')} style={{ position: 'absolute', right: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#C4B5A8', padding: 0, display: 'flex' }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
                            )}
                          </div>
                        </div>

                      {/* Sort dropdown */}
                      <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setShowSortDropdown(o => !o)}
                          style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '7px 14px', background: '#fff', color: DARK, border: '1px solid #E5DDD5', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                          {currentSortLabel}
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            {inquirySortAsc ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                          </svg>
                        </button>
                        {showSortDropdown && (
                          <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid #E5DDD5', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '6px 0', zIndex: 50, minWidth: 150 }}>
                            {SORT_OPTIONS.map(opt => (
                              <button key={opt.key}
                                onClick={() => {
                                  if (inquirySort === opt.key) setInquirySortAsc(a => !a)
                                  else { setInquirySort(opt.key); setInquirySortAsc(false) }
                                  setShowSortDropdown(false)
                                }}
                                style={{ ...BODY, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: inquirySort === opt.key ? GOLD : DARK, fontWeight: inquirySort === opt.key ? 600 : 400 }}
                              >
                                {opt.label}
                                {inquirySort === opt.key && (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round">
                                    {inquirySortAsc ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      </div>{/* end right group */}
                    </div>

                    {sorted.length === 0 ? (
                      <p style={{ ...BODY, fontSize: 13, color: '#9A8573', textAlign: 'center', paddingTop: 48 }}>No inquiries found.</p>
                    ) : sorted.map((inq, idx) => (
                      <div key={inq.id} style={{ background: '#fff', border: `1px solid ${inq.is_replied ? '#D4EAD8' : '#E5DDD5'}`, borderRadius: 12, overflow: 'hidden' }}>
                        <button
                          onClick={() => setExpandedInquiry(expandedInquiry === inq.id ? null : inq.id)}
                          style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                            <span style={{ ...BODY, fontSize: 10, fontWeight: 700, color: '#C4B5A8', letterSpacing: '0.1em', minWidth: 24, flexShrink: 0 }}>#{idx + 1}</span>
                            <div>
                              <p style={{ ...BODY, fontSize: 12, fontWeight: 500, color: DARK, margin: '0 0 2px' }}>
                                {inq.name || '—'} · <span style={{ color: '#9A8573', fontWeight: 300 }}>{inq.email}</span>
                              </p>
                              <p style={{ ...BODY, fontSize: 12, fontWeight: 400, color: DARK, margin: 0 }}>{inq.subject}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <Badge label={inq.is_replied ? 'Replied' : 'Pending'} color={inq.is_replied ? '#7CB98A' : GOLD} />
                            <span style={{ ...BODY, fontSize: 10, color: '#9A8573' }}>{new Date(inq.submitted_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A8573" strokeWidth="2" strokeLinecap="round" style={{ transform: expandedInquiry === inq.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                          </div>
                        </button>
                        {expandedInquiry === inq.id && (
                          <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F0E8DF' }}>
                            <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', lineHeight: 1.8, margin: '16px 0 16px', whiteSpace: 'pre-wrap' }}>{inq.message}</p>
                            <button
                              disabled={actionLoading === inq.id}
                              onClick={() => toggleReplied(inq.id, !inq.is_replied)}
                              style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '7px 16px', background: 'transparent', border: `1px solid ${inq.is_replied ? '#C0392B' : '#7CB98A'}`, color: inq.is_replied ? '#C0392B' : '#7CB98A', borderRadius: 6, cursor: 'pointer' }}
                            >
                              {actionLoading === inq.id ? '…' : inq.is_replied ? 'Mark as Pending' : 'Mark as Replied'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Count footer */}
                    <p style={{ ...BODY, fontSize: 11, color: '#B0A090', textAlign: 'center', letterSpacing: '0.1em', paddingTop: 4 }}>
                      {sorted.length} {sorted.length === 1 ? 'inquiry' : 'inquiries'}
                      {sorted.filter(i => !i.is_replied).length > 0 && (
                        <span style={{ color: GOLD }}> · {sorted.filter(i => !i.is_replied).length} pending</span>
                      )}
                    </p>
                  </div>
                )
              })()}

              {/* ── READINGS ── */}
              {tab === 'readings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {readings.length === 0 ? (
                    <p style={{ ...BODY, fontSize: 13, color: '#9A8573', textAlign: 'center', paddingTop: 48 }}>No readings yet.</p>
                  ) : readings.map(r => (
                    <div key={r.id} style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, overflow: 'hidden' }}>
                      <button
                        onClick={() => setExpandedReading(expandedReading === r.id ? null : r.id)}
                        style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}
                      >
                        {/* Bracelet thumbnail */}
                        {r.cached_image_url
                          ? <img src={r.cached_image_url} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '1px solid #E5DDD5', flexShrink: 0 }} />
                          : <div style={{ width: 56, height: 56, borderRadius: 8, background: '#F6F1EB', border: '1px solid #E5DDD5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4B5A8" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/></svg>
                            </div>
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ ...BODY, fontSize: 12, fontWeight: 500, color: DARK, margin: '0 0 3px' }}>
                            {r.user_name || 'Anonymous'} · <span style={{ color: '#9A8573', fontWeight: 300 }}>{r.birth_date || '—'}</span>
                          </p>
                          <p style={{ ...BODY, fontSize: 11, color: GOLD, margin: '0 0 3px' }}>{r.crystal_names?.join(' · ') || '—'}</p>
                          <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: 0 }}>
                            Goal: {r.main_goal || '—'} · Weak: {r.calculated_weak_element || '—'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                          <span style={{ ...BODY, fontSize: 10, color: '#9A8573' }}>{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A8573" strokeWidth="2" strokeLinecap="round" style={{ transform: expandedReading === r.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </button>

                      {expandedReading === r.id && (
                        <div style={{ borderTop: '1px solid #F0E8DF', display: 'grid', gridTemplateColumns: r.cached_image_url ? '200px 1fr' : '1fr', gap: 0 }}>
                          {r.cached_image_url && (
                            <img src={r.cached_image_url} alt="Generated bracelet" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                          )}
                          <div style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 16 }}>
                              {[
                                ['Weak Element', r.calculated_weak_element],
                                ['Strong Element', r.calculated_strong_element],
                                ['Goal', r.main_goal],
                                ['Spacer', r.suggested_spacer || '—'],
                              ].map(([label, value]) => (
                                <div key={label}>
                                  <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 2px' }}>{label}</p>
                                  <p style={{ ...BODY, fontSize: 12, color: DARK, margin: 0 }}>{value || '—'}</p>
                                </div>
                              ))}
                            </div>
                            <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 6px' }}>Analysis</p>
                            <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#7A6355', lineHeight: 1.8, margin: 0 }}>{r.analysis_summary || '—'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── AI PROMPT ── */}
              {tab === 'shop' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Toolbar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ ...BODY, fontSize: 12, color: '#9A8573', margin: 0 }}>{shopProducts.length} product{shopProducts.length !== 1 ? 's' : ''}</p>
                    <button
                      onClick={() => { setShowAddProduct(true); setAddProductError(null); setNewProduct({ name: '', description: '', price: '', category: 'bracelet', image_url: '' }) }}
                      style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '9px 18px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    >
                      + Add Product
                    </button>
                  </div>

                  {shopLoading ? (
                    <p style={{ ...BODY, fontSize: 12, color: '#9A8573', textAlign: 'center', padding: 40 }}>Loading…</p>
                  ) : shopProducts.length === 0 ? (
                    <p style={{ ...BODY, fontSize: 12, color: '#9A8573', textAlign: 'center', padding: 40 }}>No products yet. Add your first one.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                      {shopProducts.map(p => (
                        <div key={p.id} style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ position: 'relative', aspectRatio: '1', background: '#F8F4EF' }}>
                            {p.image_url
                              ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: GOLD, opacity: 0.3 }}>✦</div>
                            }
                            <span style={{ position: 'absolute', top: 8, right: 8, ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: p.active ? '#22C55E22' : '#E5DDD5', color: p.active ? '#15803D' : '#9A8573', border: `1px solid ${p.active ? '#22C55E44' : '#E5DDD5'}` }}>
                              {p.active ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                          <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, margin: 0 }}>{p.category}</p>
                            <p style={{ ...SERIF, fontSize: 16, fontWeight: 300, color: DARK, margin: 0 }}>{p.name}</p>
                            {p.description && <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: 0, lineHeight: 1.6 }}>{p.description}</p>}
                            <p style={{ ...SERIF, fontSize: 18, color: DARK, margin: '4px 0 0' }}>S${p.price.toFixed(2)}</p>
                          </div>
                          <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => { setEditProductId(p.id); setEditProduct({ name: p.name, description: p.description || '', price: String(p.price), category: p.category, image_url: p.image_url || '' }) }}
                              style={{ ...BODY, flex: 1, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '8px', background: '#F6F1EB', border: '1px solid #E5DDD5', borderRadius: 8, cursor: 'pointer', color: DARK }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this product?')) return
                                const token = (await supabase.auth.getSession()).data.session?.access_token
                                await fetch('/api/shop/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: p.id }) })
                                fetchShopProducts()
                              }}
                              style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', color: '#DC2626' }}
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'ai-prompt' && (
                <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, padding: '28px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill={GOLD}><polygon points="4,0 8,4 4,8 0,4"/></svg>
                    <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>System Prompt</p>
                  </div>
                  <p style={{ ...BODY, fontSize: 11, color: '#9A8573', marginBottom: 16, lineHeight: 1.6 }}>
                    This is the current AI system prompt used to analyze user energy and select crystals. To edit it, update <code style={{ background: '#F6F1EB', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>app/api/analyze/route.ts</code>.
                  </p>
                  <pre style={{ ...BODY, fontSize: 12, lineHeight: 1.8, color: '#4A3A32', background: '#F6F1EB', padding: '20px 24px', borderRadius: 8, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                    {AI_SYSTEM_PROMPT}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── IMAGE LIGHTBOX ── */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out' }}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <img
            src={lightboxUrl}
            alt="Bracelet"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', cursor: 'default' }}
          />
        </div>
      )}

      {/* ── ADD CRYSTAL MODAL ── */}
      {showAddCrystal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddCrystal(false) }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '32px 36px', width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: DARK, margin: 0 }}>Add Crystal</h2>
              <button onClick={() => setShowAddCrystal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8573', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {([
                { key: 'name',         label: 'Crystal Name *', placeholder: 'e.g. Rose Quartz' },
                { key: 'slug',         label: 'Slug',           placeholder: 'e.g. rose-quartz' },
                { key: 'color_family', label: 'Color Family',   placeholder: 'e.g. Pink' },
                { key: 'meaning',      label: 'Meaning',        placeholder: 'e.g. Love, compassion, healing' },
                { key: 'price_tier',   label: 'Price Tier',     placeholder: 'e.g. standard, premium' },
                { key: 'luxury_score', label: 'Luxury Score',   placeholder: 'e.g. 8', type: 'number' },
                { key: 'energy_tags',  label: 'Energy Tags',    placeholder: 'Comma-separated, e.g. love, calm, focus' },
              ] as { key: keyof typeof newCrystal; label: string; placeholder: string; type?: string }[]).map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input
                    value={newCrystal[key] as string}
                    onChange={e => setNewCrystal(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    type={type || 'text'}
                    style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              {/* Bead Images Upload (multiple) */}
              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>
                  Bead Images <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10, color: '#C4B5A8' }}>— upload multiple for variety</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                  {newCrystal.bead_image_urls.map((url, i) => (
                    <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={url} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5DDD5', display: 'block' }} />
                      <button onClick={() => setNewCrystal(prev => ({ ...prev, bead_image_urls: prev.bead_image_urls.filter((_, j) => j !== i) }))}
                        style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#C0392B', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '18px', textAlign: 'center', padding: 0 }}>
                        ×
                      </button>
                    </div>
                  ))}
                  <label style={{ width: 52, height: 52, borderRadius: '50%', border: '1px dashed #C4B5A8', background: '#F6F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: imageUploading ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: imageUploading ? 0.5 : 1 }}>
                    {imageUploading
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4B5A8" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A8573" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    }
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={imageUploading}
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadBeadImage(f); e.target.value = '' }} />
                  </label>
                </div>
              </div>

              {(['element', 'primary_element'] as const).map(key => (
                <div key={key}>
                  <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>
                    {key === 'element' ? 'Element' : 'Primary Element'}
                  </label>
                  <select
                    value={newCrystal[key]}
                    onChange={e => setNewCrystal(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none' }}
                  >
                    <option value="">— Select Element —</option>
                    {['Wood', 'Fire', 'Earth', 'Metal', 'Water'].map(el => <option key={el} value={el}>{el}</option>)}
                  </select>
                </div>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573' }}>Active</label>
                <button
                  onClick={() => setNewCrystal(prev => ({ ...prev, active: !prev.active }))}
                  style={{ width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', background: newCrystal.active ? '#7CB98A' : '#D5CDC6', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{ position: 'absolute', top: 3, left: newCrystal.active ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            </div>

            {addCrystalError && (
              <p style={{ ...BODY, fontSize: 11, color: '#C0392B', margin: '14px 0 0' }}>{addCrystalError}</p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddCrystal(false)} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: 'transparent', border: '1px solid #E5DDD5', color: '#9A8573', borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={addCrystal} disabled={addCrystalLoading} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: addCrystalLoading ? 'not-allowed' : 'pointer', opacity: addCrystalLoading ? 0.7 : 1 }}>
                {addCrystalLoading ? 'Saving…' : 'Add Crystal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT CRYSTAL IMAGES MODAL ── */}
      {editCrystalId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setEditCrystalId(null) }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '32px 36px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: DARK, margin: 0 }}>Bead Images</h2>
              <button onClick={() => setEditCrystalId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8573', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p style={{ ...BODY, fontSize: 12, color: '#9A8573', marginBottom: 24 }}>{editCrystalName}</p>

            <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 12 }}>
              Images — upload multiple for variety
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 24 }}>
              {editCrystalImages.map((url, i) => (
                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={url} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5DDD5', display: 'block' }} />
                  <button onClick={() => setEditCrystalImages(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, borderRadius: '50%', background: '#C0392B', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontSize: 13, lineHeight: '16px', textAlign: 'center', padding: 0 }}>
                    ×
                  </button>
                </div>
              ))}
              <label style={{ width: 64, height: 64, borderRadius: '50%', border: '2px dashed #C4B5A8', background: '#F6F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: editCrystalImageUploading ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: editCrystalImageUploading ? 0.5 : 1 }}>
                {editCrystalImageUploading
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4B5A8" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A8573" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                }
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={editCrystalImageUploading}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadEditCrystalImage(f); e.target.value = '' }} />
              </label>
            </div>

            {editCrystalImages.length === 0 && (
              <p style={{ ...BODY, fontSize: 11, color: '#C4B5A8', marginBottom: 16 }}>No images — upload at least one to show in the bracelet preview.</p>
            )}

            {editCrystalError && (
              <p style={{ ...BODY, fontSize: 11, color: '#C0392B', marginBottom: 14 }}>{editCrystalError}</p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditCrystalId(null)} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: 'transparent', border: '1px solid #E5DDD5', color: '#9A8573', borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveEditCrystalImages} disabled={editCrystalSaving} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: editCrystalSaving ? 'not-allowed' : 'pointer', opacity: editCrystalSaving ? 0.7 : 1 }}>
                {editCrystalSaving ? 'Saving…' : 'Save Images'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD PRODUCT MODAL ── */}
      {showAddProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddProduct(false) }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '32px 36px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: DARK, margin: 0 }}>Add Product</h2>
              <button onClick={() => setShowAddProduct(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8573', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(['name', 'description', 'price'] as const).map(k => (
                <div key={k}>
                  <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 5 }}>{k.charAt(0).toUpperCase() + k.slice(1)}{k === 'name' || k === 'price' ? ' *' : ''}</label>
                  <input value={newProduct[k]} onChange={e => setNewProduct(p => ({ ...p, [k]: e.target.value }))} placeholder={k === 'price' ? 'e.g. 88.00' : ''} type={k === 'price' ? 'number' : 'text'}
                    style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 5 }}>Category *</label>
                <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                  style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none' }}>
                  <option value="bracelet">Bracelet</option>
                  <option value="crystal">Crystal</option>
                  <option value="accessory">Accessory</option>
                </select>
              </div>
              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 5 }}>Product Image</label>
                {newProduct.image_url && (
                  <img src={newProduct.image_url} alt="Preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8, border: '1px solid #E5DDD5' }} />
                )}
                <label style={{ ...BODY, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: '1px dashed #D5CDC6', borderRadius: 8, cursor: productImageUploading ? 'not-allowed' : 'pointer', background: '#FAFAF8', fontSize: 11, color: '#9A8573', opacity: productImageUploading ? 0.6 : 1 }}>
                  {productImageUploading ? 'Uploading…' : '⬆ Upload Image'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} disabled={productImageUploading} onChange={async e => {
                    const file = e.target.files?.[0]; if (!file) return
                    setProductImageUploading(true)
                    const token = (await supabase.auth.getSession()).data.session?.access_token
                    const fd = new FormData(); fd.append('file', file)
                    const r = await fetch('/api/admin/shop/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
                    const d = await r.json()
                    if (d.url) setNewProduct(p => ({ ...p, image_url: d.url }))
                    setProductImageUploading(false)
                  }} />
                </label>
              </div>
            </div>
            {addProductError && <p style={{ ...BODY, fontSize: 11, color: '#C0392B', margin: '12px 0 0' }}>{addProductError}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddProduct(false)} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: 'transparent', border: '1px solid #E5DDD5', color: '#9A8573', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              <button disabled={addProductLoading} onClick={async () => {
                setAddProductError(null)
                if (!newProduct.name || !newProduct.price) { setAddProductError('Name and price are required.'); return }
                setAddProductLoading(true)
                const token = (await supabase.auth.getSession()).data.session?.access_token
                const r = await fetch('/api/shop/products', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...newProduct, price: parseFloat(newProduct.price), image_url: newProduct.image_url || null, description: newProduct.description || null }) })
                if (!r.ok) { const d = await r.json(); setAddProductError(d.error || 'Failed'); setAddProductLoading(false); return }
                setAddProductLoading(false); setShowAddProduct(false); fetchShopProducts()
              }} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: addProductLoading ? 'not-allowed' : 'pointer', opacity: addProductLoading ? 0.7 : 1 }}>
                {addProductLoading ? 'Saving…' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PRODUCT MODAL ── */}
      {editProductId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setEditProductId(null) }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '32px 36px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: DARK, margin: 0 }}>Edit Product</h2>
              <button onClick={() => setEditProductId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8573', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(['name', 'description', 'price'] as const).map(k => (
                <div key={k}>
                  <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 5 }}>{k.charAt(0).toUpperCase() + k.slice(1)}{k === 'name' || k === 'price' ? ' *' : ''}</label>
                  <input value={editProduct[k]} onChange={e => setEditProduct(p => ({ ...p, [k]: e.target.value }))} type={k === 'price' ? 'number' : 'text'}
                    style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 5 }}>Product Image</label>
                {editProduct.image_url && (
                  <img src={editProduct.image_url} alt="Preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8, border: '1px solid #E5DDD5' }} />
                )}
                <label style={{ ...BODY, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: '1px dashed #D5CDC6', borderRadius: 8, cursor: productImageUploading ? 'not-allowed' : 'pointer', background: '#FAFAF8', fontSize: 11, color: '#9A8573', opacity: productImageUploading ? 0.6 : 1 }}>
                  {productImageUploading ? 'Uploading…' : editProduct.image_url ? '⬆ Change Image' : '⬆ Upload Image'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} disabled={productImageUploading} onChange={async e => {
                    const file = e.target.files?.[0]; if (!file) return
                    setProductImageUploading(true)
                    const tok = (await supabase.auth.getSession()).data.session?.access_token
                    const fd = new FormData(); fd.append('file', file)
                    const r = await fetch('/api/admin/shop/upload', { method: 'POST', headers: { Authorization: `Bearer ${tok}` }, body: fd })
                    const d = await r.json()
                    if (d.url) setEditProduct(p => ({ ...p, image_url: d.url }))
                    setProductImageUploading(false)
                  }} />
                </label>
              </div>
              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 5 }}>Category</label>
                <select value={editProduct.category} onChange={e => setEditProduct(p => ({ ...p, category: e.target.value }))}
                  style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none' }}>
                  <option value="bracelet">Bracelet</option>
                  <option value="crystal">Crystal</option>
                  <option value="accessory">Accessory</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditProductId(null)} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: 'transparent', border: '1px solid #E5DDD5', color: '#9A8573', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              <button onClick={async () => {
                const token = (await supabase.auth.getSession()).data.session?.access_token
                await fetch('/api/shop/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: editProductId, ...editProduct, price: parseFloat(editProduct.price), image_url: editProduct.image_url || null, description: editProduct.description || null }) })
                setEditProductId(null); fetchShopProducts()
              }} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
