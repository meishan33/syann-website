'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BeadPatternEditor, { isValidPattern, defaultPattern } from '@/components/admin/BeadPatternEditor'
import { BEAD_COUNTS } from '@/lib/bracelet-config'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'
const DARK = '#4A3A32'

type Tab = 'orders' | 'users' | 'crystals' | 'inquiry' | 'readings' | 'ai-prompt' | 'shop' | 'instagram' | 'stock' | 'designs' | 'settings'

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
  id: number; name: string; slug: string | null; primary_element: string | null
  color_family: string; meaning: string; active: boolean; price_tier: string
  luxury_score: number | null; energy_tags: string[] | null; bead_image_url: string | null
  bead_image_urls: string[] | null
  stock_qty: number | null; cost_price: number | null
}

const CRYSTAL_COLUMNS: { key: keyof Crystal; label: string }[] = [
  { key: 'bead_image_url', label: 'Image' },
  { key: 'name',           label: 'Name' },
  { key: 'slug',           label: 'Slug' },
  { key: 'primary_element',label: 'Primary Element' },
  { key: 'color_family',   label: 'Color Family' },
  { key: 'meaning',        label: 'Meaning' },
  { key: 'price_tier',     label: 'Price Tier' },
  { key: 'luxury_score',   label: 'Luxury Score' },
  { key: 'energy_tags',    label: 'Energy Tags' },
  { key: 'active',         label: 'Status' },
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
    key: 'instagram', label: 'Instagram',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  },
  {
    key: 'stock', label: 'Stock',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  },
  {
    key: 'designs', label: 'Designs',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="4.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="17.8" cy="8.2" r="1.4" fill="currentColor" stroke="none"/><circle cx="17.8" cy="15.8" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="19.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="6.2" cy="15.8" r="1.4" fill="currentColor" stroke="none"/><circle cx="6.2" cy="8.2" r="1.4" fill="currentColor" stroke="none"/></svg>,
  },
  {
    key: 'shop', label: 'Shop',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    key: 'settings', label: 'Settings',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
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
  const [shopEnabled, setShopEnabled] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)

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
  const [orderFilter, setOrderFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all')
  const [orderSort, setOrderSort] = useState<'created_at' | 'customer_name' | 'total_amount'>('created_at')
  const [orderSortAsc, setOrderSortAsc] = useState(false)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderSearchField, setOrderSearchField] = useState<'customer_name' | 'customer_email' | 'order_number'>('customer_name')
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
  const [newCrystal, setNewCrystal] = useState({ name: '', slug: '', primary_element: '', color_family: '', meaning: '', price_tier: '', luxury_score: '', energy_tags: '', bead_image_urls: [] as string[], active: true })
  const [addCrystalError, setAddCrystalError] = useState<string | null>(null)
  const [addCrystalLoading, setAddCrystalLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  // Edit crystal (full details + images)
  const [editCrystalId, setEditCrystalId] = useState<number | null>(null)
  const [editCrystalData, setEditCrystalData] = useState({ name: '', slug: '', primary_element: '', color_family: '', meaning: '', price_tier: '', luxury_score: '', energy_tags: '', active: true })
  const [editCrystalImages, setEditCrystalImages] = useState<string[]>([])
  const [editPreviewIndex, setEditPreviewIndex] = useState(0)
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

  // Shop orders
  type ShopOrderItem = { productId: string; name: string; price: number; quantity: number }
  type ShopOrder = {
    id: string; order_number: number | null; customer_name: string | null; customer_email: string | null
    customer_phone: string | null; shipping_address: Record<string, string | null> | null
    items: ShopOrderItem[]; total_amount: number; payment_status: string; fulfillment_status: string; created_at: string
  }
  const [shopTabView, setShopTabView] = useState<'products' | 'orders'>('products')
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>([])
  const [shopOrdersLoading, setShopOrdersLoading] = useState(false)
  const [expandedShopOrder, setExpandedShopOrder] = useState<string | null>(null)

  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    new Set(['bead_image_url', 'name', 'primary_element', 'color_family', 'meaning', 'price_tier', 'energy_tags', 'active'])
  )

  // Instagram generator state
  const [igPillar, setIgPillar] = useState<'product' | 'education' | 'quiz' | 'social_proof' | 'brand'>('product')
  const [igCrystal, setIgCrystal] = useState('')
  const [igContext, setIgContext] = useState('')
  const [igTone, setIgTone] = useState<'luxury' | 'warm' | 'mystical' | 'educational'>('warm')
  const [igLoading, setIgLoading] = useState(false)
  const [igError, setIgError] = useState<string | null>(null)
  const [igResult, setIgResult] = useState<{ caption: string; hashtags: string; imageNote: string } | null>(null)
  const [igCopied, setIgCopied] = useState<'caption' | 'hashtags' | null>(null)

  // Stock management
  const [stockEdits, setStockEdits] = useState<Record<number, { stock_qty: string; cost_price: string }>>({})
  const [stockSaving, setStockSaving] = useState<Record<number, boolean>>({})
  const [calcCrystals, setCalcCrystals] = useState<[number | null, number | null, number | null]>([null, null, null])
  const [calcBeads, setCalcBeads] = useState<[number, number, number]>([...BEAD_COUNTS])
  const [calcOtherCost, setCalcOtherCost] = useState('5.00')
  const [calcSellingPrice, setCalcSellingPrice] = useState('59')

  // Bracelet designs
  type Design = { id: string; name: string; description: string | null; sequence: number[]; active: boolean }
  const [designs, setDesigns] = useState<Design[]>([])
  const [designsLoading, setDesignsLoading] = useState(false)
  const [designActionLoading, setDesignActionLoading] = useState<string | null>(null)
  const [showAddDesign, setShowAddDesign] = useState(false)
  const [newDesignName, setNewDesignName] = useState('')
  const [newDesignDescription, setNewDesignDescription] = useState('')
  const [newDesignSequence, setNewDesignSequence] = useState<number[]>(defaultPattern())
  const [addDesignError, setAddDesignError] = useState<string | null>(null)
  const [addDesignLoading, setAddDesignLoading] = useState(false)
  const [editDesignId, setEditDesignId] = useState<string | null>(null)
  const [editDesignName, setEditDesignName] = useState('')
  const [editDesignDescription, setEditDesignDescription] = useState('')
  const [editDesignSequence, setEditDesignSequence] = useState<number[]>(defaultPattern())
  const [editDesignError, setEditDesignError] = useState<string | null>(null)
  const [editDesignSaving, setEditDesignSaving] = useState(false)

  const [showColPicker, setShowColPicker] = useState(false)
  const [crystalSort, setCrystalSort] = useState<keyof Crystal | null>(null)
  const [crystalSortAsc, setCrystalSortAsc] = useState(true)
  const [crystalFilter, setCrystalFilter] = useState<'all' | 'active' | 'inactive'>('all')
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
    Promise.all([fetchOrders(), fetchUsers(), fetchCrystals(), fetchInquiries(), fetchReadings(), fetchShopProducts(), fetchDesigns(), fetchSettings()])
      .finally(() => setLoading(false))
  }, [token])

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })

  const fetchSettings = async () => {
    const r = await fetch('/api/admin/settings', { headers: headers() })
    if (r.ok) setShopEnabled((await r.json()).shop_enabled === true)
  }

  const toggleShopEnabled = async () => {
    const next = !shopEnabled
    setSettingsSaving(true)
    const r = await fetch('/api/admin/settings', { method: 'PATCH', headers: headers(), body: JSON.stringify({ shop_enabled: next }) })
    if (r.ok) setShopEnabled(next)
    setSettingsSaving(false)
  }

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
  const fetchDesigns = async () => {
    setDesignsLoading(true)
    const r = await fetch('/api/admin/bracelet-designs', { headers: headers() })
    if (r.ok) setDesigns(await r.json())
    setDesignsLoading(false)
  }
  const fetchShopOrders = async () => {
    setShopOrdersLoading(true)
    const r = await fetch('/api/admin/shop-orders', { headers: headers() })
    if (r.ok) setShopOrders(await r.json())
    setShopOrdersLoading(false)
  }

  const updateShopFulfillment = async (id: string, fulfillment_status: string) => {
    setActionLoading(id)
    await fetch('/api/admin/shop-orders', { method: 'PATCH', headers: headers(), body: JSON.stringify({ id, fulfillment_status }) })
    await fetchShopOrders(); setActionLoading(null)
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

  const toggleDesignActive = async (id: string, active: boolean) => {
    setDesignActionLoading(id)
    await fetch('/api/admin/bracelet-designs', { method: 'PATCH', headers: headers(), body: JSON.stringify({ id, active }) })
    await fetchDesigns(); setDesignActionLoading(null)
  }

  const deleteDesign = async (id: string) => {
    if (!confirm('Delete this design? This cannot be undone.')) return
    setDesignActionLoading(id)
    await fetch('/api/admin/bracelet-designs', { method: 'DELETE', headers: headers(), body: JSON.stringify({ id }) })
    await fetchDesigns(); setDesignActionLoading(null)
  }

  const addDesign = async () => {
    if (!newDesignName.trim()) { setAddDesignError('Design name is required.'); return }
    if (!isValidPattern(newDesignSequence)) { setAddDesignError('Bead counts must be exactly 10 primary / 8 secondary / 6 accent.'); return }
    setAddDesignLoading(true); setAddDesignError(null)
    const r = await fetch('/api/admin/bracelet-designs', {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ name: newDesignName, description: newDesignDescription || null, sequence: newDesignSequence, active: true }),
    })
    if (!r.ok) { const e = await r.json(); setAddDesignError(e.error || 'Failed to add design.'); setAddDesignLoading(false); return }
    await fetchDesigns()
    setShowAddDesign(false)
    setNewDesignName(''); setNewDesignDescription(''); setNewDesignSequence(defaultPattern())
    setAddDesignLoading(false)
  }

  const openEditDesign = (d: Design) => {
    setEditDesignId(d.id)
    setEditDesignName(d.name)
    setEditDesignDescription(d.description || '')
    setEditDesignSequence(d.sequence)
    setEditDesignError(null)
  }

  const saveEditDesign = async () => {
    if (editDesignId === null) return
    if (!editDesignName.trim()) { setEditDesignError('Design name is required.'); return }
    if (!isValidPattern(editDesignSequence)) { setEditDesignError('Bead counts must be exactly 10 primary / 8 secondary / 6 accent.'); return }
    setEditDesignSaving(true); setEditDesignError(null)
    const r = await fetch('/api/admin/bracelet-designs', {
      method: 'PATCH', headers: headers(),
      body: JSON.stringify({ id: editDesignId, name: editDesignName, description: editDesignDescription || null, sequence: editDesignSequence }),
    })
    if (!r.ok) { const e = await r.json(); setEditDesignError(e.error || 'Save failed.'); setEditDesignSaving(false); return }
    await fetchDesigns()
    setEditDesignId(null)
    setEditDesignSaving(false)
  }

  const saveStock = async (id: number) => {
    const edit = stockEdits[id]
    if (!edit) return
    setStockSaving(prev => ({ ...prev, [id]: true }))
    await fetch('/api/admin/crystals', {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({
        id,
        stock_qty: edit.stock_qty !== '' ? Number(edit.stock_qty) : null,
        cost_price: edit.cost_price !== '' ? parseFloat(edit.cost_price) : null,
      }),
    })
    setStockEdits(prev => { const n = { ...prev }; delete n[id]; return n })
    setStockSaving(prev => ({ ...prev, [id]: false }))
    await fetchCrystals()
  }

  const addCrystal = async () => {
    if (!newCrystal.name.trim()) { setAddCrystalError('Crystal name is required.'); return }
    setAddCrystalLoading(true); setAddCrystalError(null)
    const r = await fetch('/api/admin/crystals', { method: 'POST', headers: headers(), body: JSON.stringify(newCrystal) })
    if (!r.ok) { const e = await r.json(); setAddCrystalError(e.error || 'Failed to add crystal.'); setAddCrystalLoading(false); return }
    await fetchCrystals()
    setShowAddCrystal(false)
    setNewCrystal({ name: '', slug: '', primary_element: '', color_family: '', meaning: '', price_tier: '', luxury_score: '', energy_tags: '', bead_image_urls: [], active: true })
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

  const openEditCrystal = (c: Crystal) => {
    setEditCrystalId(c.id)
    setEditCrystalData({
      name: c.name, slug: c.slug || '', primary_element: c.primary_element || '',
      color_family: c.color_family || '', meaning: c.meaning || '', price_tier: c.price_tier || '',
      luxury_score: c.luxury_score != null ? String(c.luxury_score) : '', energy_tags: c.energy_tags?.join(', ') || '',
      active: c.active,
    })
    setEditCrystalImages(c.bead_image_urls ?? (c.bead_image_url ? [c.bead_image_url] : []))
    setEditPreviewIndex(0)
    setEditCrystalError(null)
  }

  const saveEditCrystal = async () => {
    if (editCrystalId === null) return
    if (!editCrystalData.name.trim()) { setEditCrystalError('Crystal name is required.'); return }
    setEditCrystalSaving(true); setEditCrystalError(null)
    const r = await fetch('/api/admin/crystals', {
      method: 'PATCH', headers: headers(),
      body: JSON.stringify({ id: editCrystalId, bead_image_urls: editCrystalImages, ...editCrystalData }),
    })
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
          {NAV_ITEMS.filter(({ key }) => key !== 'shop' || shopEnabled).map(({ key, label, icon }) => {
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
                const searchFiltered = orders.filter(o => !q || String(o[orderSearchField] ?? '').toLowerCase().includes(q))
                const tabCounts = {
                  all: searchFiltered.length,
                  processing: searchFiltered.filter(o => o.fulfillment_status === 'processing').length,
                  shipped:    searchFiltered.filter(o => o.fulfillment_status === 'shipped').length,
                  delivered:  searchFiltered.filter(o => o.fulfillment_status === 'delivered').length,
                  cancelled:  searchFiltered.filter(o => o.fulfillment_status === 'cancelled').length,
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
                        {(['all', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(f => (
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
                            onChange={e => { setOrderSearchField(e.target.value as 'customer_name' | 'customer_email' | 'order_number'); setOrderSearch('') }}
                            style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 8px', border: 'none', borderRight: '1px solid #E5DDD5', background: '#F6F1EB', color: '#7A6355', cursor: 'pointer', outline: 'none' }}
                          >
                            <option value="customer_name">Name</option>
                            <option value="customer_email">Email</option>
                            <option value="order_number">Order ID</option>
                          </select>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A8573" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 8, pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input
                              value={orderSearch}
                              onChange={e => setOrderSearch(e.target.value)}
                              placeholder={`Search by ${orderSearchField === 'customer_name' ? 'name' : orderSearchField === 'customer_email' ? 'email' : 'order ID'}…`}
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
                                    <td style={TD}><Badge label={o.fulfillment_status} color={o.fulfillment_status === 'delivered' ? '#7CB98A' : o.fulfillment_status === 'processing' ? GOLD : o.fulfillment_status === 'cancelled' ? '#C0392B' : '#9A8573'} /></td>
                                    <td style={TD}>{new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td style={TD} onClick={e => e.stopPropagation()}>
                                      <select value={o.fulfillment_status} disabled={actionLoading === o.id} onChange={e => updateFulfillment(o.id, e.target.value)}
                                        style={{ ...BODY, fontSize: 11, padding: '6px 10px', border: '1px solid #E5DDD5', background: '#fff', color: DARK, cursor: 'pointer', borderRadius: 6 }}>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
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
                      {tabCounts.shipped > 0 && <span style={{ color: '#C0392B' }}> · {tabCounts.shipped} shipped</span>}
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
              {tab === 'crystals' && (() => {
                const sortedCrystals = [...crystals].sort((a, b) => {
                  if (!crystalSort) return 0
                  let av: unknown = a[crystalSort]
                  let bv: unknown = b[crystalSort]
                  if (crystalSort === 'energy_tags') {
                    av = (a.energy_tags || []).join(', ')
                    bv = (b.energy_tags || []).join(', ')
                  } else if (crystalSort === 'active') {
                    av = a.active ? 1 : 0
                    bv = b.active ? 1 : 0
                  }
                  if (av === null || av === undefined) av = ''
                  if (bv === null || bv === undefined) bv = ''
                  const result = typeof av === 'number' && typeof bv === 'number'
                    ? av - bv
                    : String(av).toLowerCase().localeCompare(String(bv).toLowerCase())
                  return crystalSortAsc ? result : -result
                })
                const activeCount = sortedCrystals.filter(c => c.active).length
                const inactiveCount = sortedCrystals.length - activeCount
                const filteredCrystals = sortedCrystals.filter(c =>
                  crystalFilter === 'all' ? true : crystalFilter === 'active' ? c.active : !c.active
                )

                return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Toolbar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    {/* Filter tabs */}
                    <div style={{ display: 'flex', gap: 6, background: '#fff', border: '1px solid #E5DDD5', borderRadius: 8, padding: 4 }}>
                      {([
                        { key: 'all',      label: 'all',      count: sortedCrystals.length },
                        { key: 'active',   label: 'active',   count: activeCount },
                        { key: 'inactive', label: 'inactive', count: inactiveCount },
                      ] as const).map(f => (
                        <button key={f.key} onClick={() => setCrystalFilter(f.key)}
                          style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '6px 14px', background: crystalFilter === f.key ? DARK : 'transparent', color: crystalFilter === f.key ? '#F6F1EB' : '#9A8573', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {f.label}
                          {f.count > 0 && (
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 999, background: crystalFilter === f.key ? 'rgba(255,255,255,0.2)' : '#F0E8DF', color: crystalFilter === f.key ? '#F6F1EB' : '#9A8573' }}>
                              {f.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                  </div>

                  {/* Table */}
                  <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, overflow: 'hidden' }} onClick={() => setShowColPicker(false)}>
                    {filteredCrystals.length === 0 ? (
                      <p style={{ ...BODY, fontSize: 13, color: '#9A8573', textAlign: 'center', padding: '48px 0' }}>No crystals found.</p>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead><tr style={{ background: '#F6F1EB' }}>
                            <th style={{ ...TH, width: 40 }}>#</th>
                            {CRYSTAL_COLUMNS.filter(c => visibleCols.has(c.key)).map(col => {
                              const sortable = col.key !== 'bead_image_url'
                              return (
                                <th key={col.key} style={{ ...TH, cursor: sortable ? 'pointer' : 'default', userSelect: 'none' }}
                                  onClick={!sortable ? undefined : () => {
                                    if (crystalSort === col.key) setCrystalSortAsc(a => !a)
                                    else { setCrystalSort(col.key as keyof Crystal); setCrystalSortAsc(true) }
                                  }}
                                >
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    {col.label}
                                    {sortable && crystalSort === col.key && (
                                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round">
                                        {crystalSortAsc ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                                      </svg>
                                    )}
                                  </span>
                                </th>
                              )
                            })}
                          </tr></thead>
                          <tbody>
                            {filteredCrystals.map((c, idx) => (
                              <tr key={c.id}>
                                <td style={{ ...TD, color: '#B0A090', fontSize: 11, letterSpacing: '0.06em' }}>#{idx + 1}</td>
                                {CRYSTAL_COLUMNS.filter(col => visibleCols.has(col.key)).map(col => {
                                  if (col.key === 'bead_image_url') return (
                                    <td key="img" style={TD}>
                                      <button onClick={() => openEditCrystal(c)} title="Edit crystal" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}>
                                        {c.bead_image_url
                                          ? <img src={c.bead_image_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5DDD5' }} />
                                          : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EDE8DF', border: '1px solid #E5DDD5' }} />}
                                      </button>
                                    </td>
                                  )
                                  if (col.key === 'name') return (
                                    <td key="name" style={{ ...TD, fontWeight: 400 }}>
                                      <button onClick={() => openEditCrystal(c)} title="Edit crystal"
                                        style={{ ...BODY, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, fontWeight: 400, color: DARK, textAlign: 'left' }}>
                                        {c.name}
                                      </button>
                                    </td>
                                  )
                                  if (col.key === 'active') return (
                                    <td key="active" style={{ ...TD, whiteSpace: 'nowrap' }}>
                                      <button
                                        disabled={actionLoading === String(c.id)}
                                        onClick={() => toggleCrystal(c.id, !c.active)}
                                        title={c.active ? 'Click to deactivate' : 'Click to activate'}
                                        style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', padding: 0, cursor: actionLoading === String(c.id) ? 'not-allowed' : 'pointer', opacity: actionLoading === String(c.id) ? 0.6 : 1 }}
                                      >
                                        <div style={{ width: 36, height: 20, borderRadius: 999, background: c.active ? '#7CB98A' : '#D5CDC6', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                                          <div style={{ position: 'absolute', top: 2, left: c.active ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                        </div>
                                        <span style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.active ? '#5A9B6A' : '#9A8573' }}>
                                          {actionLoading === String(c.id) ? '…' : c.active ? 'Active' : 'Inactive'}
                                        </span>
                                      </button>
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
                )
              })()}

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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 6, background: '#fff', border: '1px solid #E5DDD5', borderRadius: 8, padding: 4 }}>
                      {(['products', 'orders'] as const).map(v => (
                        <button key={v} onClick={() => { setShopTabView(v); if (v === 'orders') fetchShopOrders() }}
                          style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '6px 16px', background: shopTabView === v ? DARK : 'transparent', color: shopTabView === v ? '#F6F1EB' : '#9A8573', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                          {v}
                        </button>
                      ))}
                    </div>
                    {shopTabView === 'products' ? (
                      <p style={{ ...BODY, fontSize: 12, color: '#9A8573', margin: 0 }}>{shopProducts.length} product{shopProducts.length !== 1 ? 's' : ''}</p>
                    ) : (
                      <p style={{ ...BODY, fontSize: 12, color: '#9A8573', margin: 0 }}>{shopOrders.length} order{shopOrders.length !== 1 ? 's' : ''}</p>
                    )}
                    {shopTabView === 'products' && (
                      <button
                        onClick={() => { setShowAddProduct(true); setAddProductError(null); setNewProduct({ name: '', description: '', price: '', category: 'bracelet', image_url: '' }) }}
                        style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '9px 18px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                      >
                        + Add Product
                      </button>
                    )}
                  </div>

                  {shopTabView === 'orders' ? (
                    shopOrdersLoading ? (
                      <p style={{ ...BODY, fontSize: 12, color: '#9A8573', textAlign: 'center', padding: 40 }}>Loading…</p>
                    ) : shopOrders.length === 0 ? (
                      <p style={{ ...BODY, fontSize: 12, color: '#9A8573', textAlign: 'center', padding: 40 }}>No shop orders yet.</p>
                    ) : (
                      <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, overflow: 'hidden' }}>
                        {shopOrders.map(o => {
                          const isOpen = expandedShopOrder === o.id
                          const addr = o.shipping_address
                          return (
                            <div key={o.id} style={{ borderBottom: '1px solid #F0E8DF' }}>
                              <button
                                onClick={() => setExpandedShopOrder(isOpen ? null : o.id)}
                                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textAlign: 'left' }}
                              >
                                <div>
                                  <p style={{ ...BODY, fontSize: 10, color: '#B0A090', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                                    {o.order_number ? `#${o.order_number}` : '—'} · {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                  <p style={{ ...BODY, fontSize: 12, fontWeight: 500, color: DARK, margin: '0 0 2px' }}>{o.customer_name || '—'} · <span style={{ color: '#9A8573', fontWeight: 300 }}>{o.customer_email || '—'}</span></p>
                                  <p style={{ ...BODY, fontSize: 11, color: '#7A6355', margin: 0 }}>{o.items?.map(i => `${i.name} ×${i.quantity}`).join(', ') || '—'}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                  <p style={{ ...SERIF, fontSize: 16, color: DARK, margin: 0 }}>S${Number(o.total_amount).toFixed(2)}</p>
                                  <Badge label={o.payment_status} color={o.payment_status === 'paid' ? '#7CB98A' : '#C0392B'} />
                                  <Badge label={o.fulfillment_status} color={o.fulfillment_status === 'fulfilled' ? '#7CB98A' : o.fulfillment_status === 'unfulfilled' ? GOLD : '#9A8573'} />
                                </div>
                              </button>
                              {isOpen && (
                                <div style={{ padding: '0 20px 18px', display: 'flex', flexWrap: 'wrap', gap: '12px 32px', alignItems: 'flex-end' }}>
                                  <div>
                                    <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 3px' }}>Phone</p>
                                    <p style={{ ...BODY, fontSize: 12, color: DARK, margin: 0 }}>{o.customer_phone || '—'}</p>
                                  </div>
                                  <div>
                                    <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 3px' }}>Shipping Address</p>
                                    <p style={{ ...BODY, fontSize: 12, color: DARK, margin: 0 }}>
                                      {addr ? [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(', ') : '—'}
                                    </p>
                                  </div>
                                  <div style={{ marginLeft: 'auto' }}>
                                    <select value={o.fulfillment_status} disabled={actionLoading === o.id} onChange={e => updateShopFulfillment(o.id, e.target.value)}
                                      style={{ ...BODY, fontSize: 11, padding: '6px 10px', border: '1px solid #E5DDD5', background: '#fff', color: DARK, cursor: 'pointer', borderRadius: 6 }}>
                                      <option value="unfulfilled">Unfulfilled</option>
                                      <option value="processing">Processing</option>
                                      <option value="fulfilled">Fulfilled</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  ) : shopLoading ? (
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

              {/* ── SETTINGS ── */}
              {tab === 'settings' && (
                <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, padding: '28px 32px', maxWidth: 560 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill={GOLD}><polygon points="4,0 8,4 4,8 0,4"/></svg>
                    <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>Site Visibility</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 0' }}>
                    <div>
                      <p style={{ ...SERIF, fontSize: 17, fontWeight: 300, color: DARK, margin: '0 0 4px' }}>Shop & Cart</p>
                      <p style={{ ...BODY, fontSize: 12, color: '#9A8573', margin: 0, lineHeight: 1.6, maxWidth: 360 }}>
                        Show the Shop page, navbar link, and cart icon to customers. When off, /shop redirects to the homepage.
                      </p>
                    </div>
                    <button
                      onClick={toggleShopEnabled}
                      disabled={settingsSaving}
                      aria-label="Toggle Shop & Cart visibility"
                      style={{
                        position: 'relative', width: 48, height: 28, borderRadius: 999, border: 'none', flexShrink: 0,
                        background: shopEnabled ? GOLD : '#E5DDD5', cursor: settingsSaving ? 'not-allowed' : 'pointer',
                        opacity: settingsSaving ? 0.6 : 1, transition: 'background 0.2s ease',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 3, left: shopEnabled ? 23 : 3, width: 22, height: 22, borderRadius: '50%',
                        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.2s ease',
                      }} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── INSTAGRAM GENERATOR ── */}
              {/* ── STOCK ── */}
              {tab === 'stock' && (() => {
                const totalTypes = crystals.length
                const lowStock = crystals.filter(c => (c.stock_qty ?? 0) < 10).length
                const inventoryValue = crystals.reduce((sum, c) => sum + (c.stock_qty ?? 0) * (c.cost_price ?? 0), 0)

                const cA = calcCrystals[0] !== null ? crystals.find(c => c.id === calcCrystals[0]) : null
                const cB = calcCrystals[1] !== null ? crystals.find(c => c.id === calcCrystals[1]) : null
                const cC = calcCrystals[2] !== null ? crystals.find(c => c.id === calcCrystals[2]) : null
                const beadCostA = cA ? (cA.cost_price ?? 0) * calcBeads[0] : 0
                const beadCostB = cB ? (cB.cost_price ?? 0) * calcBeads[1] : 0
                const beadCostC = cC ? (cC.cost_price ?? 0) * calcBeads[2] : 0
                const totalBeadCost = beadCostA + beadCostB + beadCostC
                const otherCostNum = parseFloat(calcOtherCost) || 0
                const totalCost = totalBeadCost + otherCostNum
                const sellingPriceNum = parseFloat(calcSellingPrice) || 0
                const profit = sellingPriceNum - totalCost
                const margin = sellingPriceNum > 0 ? (profit / sellingPriceNum * 100) : 0

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Summary cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                      {[
                        { label: 'Crystal Types', value: String(totalTypes), color: GOLD },
                        { label: 'Low Stock  (< 10 beads)', value: String(lowStock), color: lowStock > 0 ? '#C0392B' : '#7CB98A' },
                        { label: 'Inventory Value', value: `S$${inventoryValue.toFixed(2)}`, color: '#7A6355' },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, padding: '20px 24px' }}>
                          <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 8px' }}>{label}</p>
                          <p style={{ ...SERIF, fontSize: 28, fontWeight: 300, color, margin: 0 }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Table + Calculator */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

                      {/* Stock table */}
                      <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0E8DF' }}>
                          <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: 0 }}>Crystal Bead Inventory</p>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: '#F6F1EB' }}>
                                <th style={TH}></th>
                                <th style={TH}>Crystal</th>
                                <th style={TH}>Element</th>
                                <th style={{ ...TH, textAlign: 'right' }}>Stock (beads)</th>
                                <th style={{ ...TH, textAlign: 'right' }}>Cost / Bead (S$)</th>
                                <th style={TH}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {crystals.map(c => {
                                const edit = stockEdits[c.id]
                                const currentQty = edit?.stock_qty ?? String(c.stock_qty ?? 0)
                                const currentCost = edit?.cost_price ?? String(c.cost_price ?? '')
                                const isDirty = edit !== undefined && (
                                  currentQty !== String(c.stock_qty ?? 0) ||
                                  currentCost !== String(c.cost_price ?? '')
                                )
                                const isSaving = !!stockSaving[c.id]
                                const isLow = (c.stock_qty ?? 0) < 10

                                return (
                                  <tr key={c.id} style={{ background: isDirty ? '#FFFDF8' : undefined }}>
                                    <td style={{ ...TD, width: 40 }}>
                                      {c.bead_image_url
                                        ? <img src={c.bead_image_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5DDD5', display: 'block' }} />
                                        : <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EDE8DF', border: '1px solid #E5DDD5' }} />
                                      }
                                    </td>
                                    <td style={{ ...TD, fontWeight: 400 }}>
                                      {c.name}
                                      {isLow && (
                                        <span style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#C0392B', marginLeft: 7, background: '#FEE2E2', padding: '2px 6px', borderRadius: 999 }}>LOW</span>
                                      )}
                                    </td>
                                    <td style={{ ...TD, textTransform: 'capitalize', color: '#7A6355' }}>{c.primary_element || '—'}</td>
                                    <td style={{ ...TD, textAlign: 'right' }}>
                                      <input
                                        type="number" min="0"
                                        value={currentQty}
                                        onChange={e => setStockEdits(prev => ({ ...prev, [c.id]: { stock_qty: e.target.value, cost_price: prev[c.id]?.cost_price ?? String(c.cost_price ?? '') } }))}
                                        style={{ ...BODY, width: 72, fontSize: 12, padding: '5px 8px', border: `1px solid ${isDirty ? GOLD : '#E5DDD5'}`, borderRadius: 6, color: DARK, background: isDirty ? '#FFFBF3' : '#FAFAF8', outline: 'none', textAlign: 'right' }}
                                      />
                                    </td>
                                    <td style={{ ...TD, textAlign: 'right' }}>
                                      <input
                                        type="number" min="0" step="0.01"
                                        value={currentCost}
                                        placeholder="0.00"
                                        onChange={e => setStockEdits(prev => ({ ...prev, [c.id]: { stock_qty: prev[c.id]?.stock_qty ?? String(c.stock_qty ?? 0), cost_price: e.target.value } }))}
                                        style={{ ...BODY, width: 80, fontSize: 12, padding: '5px 8px', border: `1px solid ${isDirty ? GOLD : '#E5DDD5'}`, borderRadius: 6, color: DARK, background: isDirty ? '#FFFBF3' : '#FAFAF8', outline: 'none', textAlign: 'right' }}
                                      />
                                    </td>
                                    <td style={{ ...TD, width: 70, textAlign: 'right' }}>
                                      {isDirty && (
                                        <button
                                          disabled={isSaving}
                                          onClick={() => saveStock(c.id)}
                                          style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 6, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}
                                        >
                                          {isSaving ? '…' : 'Save'}
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Profit Calculator */}
                      <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                          <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: 0 }}>Profit Calculator</p>
                        </div>

                        {(['Primary', 'Secondary', 'Accent'] as const).map((label, i) => (
                          <div key={label}>
                            <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 6px' }}>{label} Crystal</p>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <select
                                value={calcCrystals[i] ?? ''}
                                onChange={e => setCalcCrystals(prev => {
                                  const n: [number | null, number | null, number | null] = [...prev] as [number | null, number | null, number | null]
                                  n[i] = e.target.value ? Number(e.target.value) : null
                                  return n
                                })}
                                style={{ ...BODY, flex: 1, fontSize: 11, padding: '6px 8px', border: '1px solid #E5DDD5', borderRadius: 6, color: DARK, background: '#FAFAF8', outline: 'none' }}
                              >
                                <option value="">— None —</option>
                                {crystals.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}{c.cost_price ? ` (S$${Number(c.cost_price).toFixed(2)})` : ''}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number" min="1" max="30"
                                value={calcBeads[i]}
                                onChange={e => setCalcBeads(prev => {
                                  const n: [number, number, number] = [...prev] as [number, number, number]
                                  n[i] = parseInt(e.target.value) || 0
                                  return n
                                })}
                                style={{ ...BODY, width: 40, fontSize: 12, padding: '6px 4px', border: '1px solid #E5DDD5', borderRadius: 6, color: DARK, background: '#FAFAF8', outline: 'none', textAlign: 'center' }}
                              />
                            </div>
                          </div>
                        ))}

                        <div>
                          <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 6px' }}>Material & Labour (S$)</p>
                          <input type="number" min="0" step="0.50" value={calcOtherCost} onChange={e => setCalcOtherCost(e.target.value)}
                            style={{ ...BODY, width: '100%', fontSize: 12, padding: '7px 10px', border: '1px solid #E5DDD5', borderRadius: 6, color: DARK, background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }} />
                          <p style={{ ...BODY, fontSize: 9, color: '#B0A090', margin: '4px 0 0', letterSpacing: '0.04em' }}>Thread, clasp, packaging, labour</p>
                        </div>

                        <div>
                          <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 6px' }}>Selling Price (S$)</p>
                          <input type="number" min="0" step="1" value={calcSellingPrice} onChange={e => setCalcSellingPrice(e.target.value)}
                            style={{ ...BODY, width: '100%', fontSize: 12, padding: '7px 10px', border: '1px solid #E5DDD5', borderRadius: 6, color: DARK, background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }} />
                        </div>

                        {/* Results */}
                        <div style={{ background: '#F6F1EB', borderRadius: 8, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ ...BODY, fontSize: 11, color: '#7A6355' }}>Bead Cost</span>
                            <span style={{ ...BODY, fontSize: 11, color: DARK, fontWeight: 500 }}>S${totalBeadCost.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ ...BODY, fontSize: 11, color: '#7A6355' }}>Other Costs</span>
                            <span style={{ ...BODY, fontSize: 11, color: DARK, fontWeight: 500 }}>S${otherCostNum.toFixed(2)}</span>
                          </div>
                          <div style={{ borderTop: '1px solid #DDD0C4', paddingTop: 7, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ ...BODY, fontSize: 11, fontWeight: 600, color: DARK }}>Total Cost</span>
                            <span style={{ ...BODY, fontSize: 11, fontWeight: 600, color: DARK }}>S${totalCost.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ ...BODY, fontSize: 12, fontWeight: 700, color: profit >= 0 ? '#5A9B6A' : '#C0392B' }}>Profit</span>
                            <span style={{ ...BODY, fontSize: 14, fontWeight: 700, color: profit >= 0 ? '#5A9B6A' : '#C0392B' }}>S${profit.toFixed(2)}</span>
                          </div>
                          {sellingPriceNum > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ ...BODY, fontSize: 11, color: '#7A6355' }}>Margin</span>
                              <span style={{ ...SERIF, fontSize: 20, fontWeight: 300, color: margin >= 60 ? '#5A9B6A' : margin >= 30 ? GOLD : '#C0392B' }}>
                                {margin.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bead breakdown */}
                        {(cA || cB || cC) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 2px' }}>Bead Breakdown</p>
                            {([
                              { crystal: cA, beads: calcBeads[0], cost: beadCostA },
                              { crystal: cB, beads: calcBeads[1], cost: beadCostB },
                              { crystal: cC, beads: calcBeads[2], cost: beadCostC },
                            ] as { crystal: Crystal | undefined | null; beads: number; cost: number }[]).filter(x => x.crystal).map(({ crystal, beads, cost }) => (
                              <div key={crystal!.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ ...BODY, fontSize: 10, color: '#7A6355' }}>{crystal!.name} × {beads}</span>
                                <span style={{ ...BODY, fontSize: 10, color: DARK, fontWeight: 500 }}>S${cost.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}

              {tab === 'instagram' && (() => {
                const PILLARS = [
                  { key: 'product',      label: 'Product Showcase',    desc: 'Highlight a crystal or bracelet' },
                  { key: 'education',    label: 'Crystal Education',   desc: 'Teach about crystal energy / Five Elements' },
                  { key: 'quiz',         label: 'AI Quiz CTA',         desc: 'Drive traffic to the energy quiz' },
                  { key: 'social_proof', label: 'Social Proof',        desc: 'Customer journey or transformation' },
                  { key: 'brand',        label: 'Behind the Brand',    desc: 'SYANN story, values, process' },
                ]
                const TONES = [
                  { key: 'warm',        label: 'Warm & Personal' },
                  { key: 'luxury',      label: 'Luxury & Refined' },
                  { key: 'mystical',    label: 'Mystical & Poetic' },
                  { key: 'educational', label: 'Educational' },
                ]
                const copy = async (text: string, type: 'caption' | 'hashtags') => {
                  await navigator.clipboard.writeText(text)
                  setIgCopied(type)
                  setTimeout(() => setIgCopied(null), 2000)
                }
                const generate = async () => {
                  setIgLoading(true); setIgError(null); setIgResult(null)
                  try {
                    const res = await fetch('/api/admin/instagram', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ pillar: igPillar, crystalFocus: igCrystal, context: igContext, tone: igTone }),
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Generation failed')
                    setIgResult(data)
                  } catch (err) {
                    setIgError(err instanceof Error ? err.message : 'Something went wrong')
                  } finally {
                    setIgLoading(false)
                  }
                }

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

                    {/* Controls */}
                    <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                      {/* Content Pillar */}
                      <div>
                        <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 10px' }}>Content Pillar</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {PILLARS.map(p => (
                            <button key={p.key} onClick={() => setIgPillar(p.key as typeof igPillar)}
                              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${igPillar === p.key ? GOLD : '#E5DDD5'}`, background: igPillar === p.key ? '#FBF6EE' : '#FAFAF8', cursor: 'pointer', textAlign: 'left' }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: igPillar === p.key ? GOLD : '#C4B5A8', marginTop: 5, flexShrink: 0 }} />
                              <div>
                                <p style={{ ...BODY, fontSize: 11, fontWeight: 600, color: igPillar === p.key ? DARK : '#7A6355', margin: '0 0 1px' }}>{p.label}</p>
                                <p style={{ ...BODY, fontSize: 10, color: '#B0A090', margin: 0 }}>{p.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tone */}
                      <div>
                        <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 10px' }}>Tone</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          {TONES.map(t => (
                            <button key={t.key} onClick={() => setIgTone(t.key as typeof igTone)}
                              style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${igTone === t.key ? GOLD : '#E5DDD5'}`, background: igTone === t.key ? '#FBF6EE' : '#FAFAF8', cursor: 'pointer', ...BODY, fontSize: 11, fontWeight: igTone === t.key ? 600 : 400, color: igTone === t.key ? DARK : '#7A6355' }}>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Crystal focus */}
                      <div>
                        <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 8px' }}>Crystal Focus <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#B0A090' }}>(optional)</span></p>
                        <select value={igCrystal} onChange={e => setIgCrystal(e.target.value)}
                          style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 8, color: igCrystal ? DARK : '#B0A090', background: '#FAFAF8', outline: 'none' }}>
                          <option value="">Any / AI decides</option>
                          {crystals.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>

                      {/* Extra context */}
                      <div>
                        <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 8px' }}>Extra Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#B0A090' }}>(optional)</span></p>
                        <textarea value={igContext} onChange={e => setIgContext(e.target.value)} rows={3}
                          placeholder="e.g. promotion for Chinese New Year, focus on wealth energy..."
                          style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 8, color: DARK, background: '#FAFAF8', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                      </div>

                      <button onClick={generate} disabled={igLoading}
                        style={{ ...BODY, padding: '12px', borderRadius: 999, background: igLoading ? '#C9A96E' : DARK, border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: igLoading ? 'not-allowed' : 'pointer' }}>
                        {igLoading ? 'Generating…' : '✦ Generate Post'}
                      </button>

                      {igError && <p style={{ ...BODY, fontSize: 11, color: '#C0392B', margin: 0, textAlign: 'center' }}>{igError}</p>}
                    </div>

                    {/* Output */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {!igResult && !igLoading && (
                        <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, padding: '60px 40px', textAlign: 'center' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D9C4A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                          </svg>
                          <p style={{ ...SERIF, fontSize: 20, fontWeight: 300, color: DARK, margin: '0 0 6px' }}>Ready to Generate</p>
                          <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: 0 }}>Select a pillar and tone, then click Generate Post.</p>
                        </div>
                      )}

                      {igLoading && (
                        <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, padding: '60px 40px', textAlign: 'center' }}>
                          <p style={{ ...BODY, fontSize: 11, letterSpacing: '0.28em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>Writing your post…</p>
                        </div>
                      )}

                      {igResult && (
                        <>
                          {/* Caption */}
                          <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, padding: '24px 28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                              <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, margin: 0 }}>Caption</p>
                              <button onClick={() => copy(igResult.caption, 'caption')}
                                style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', padding: '5px 14px', borderRadius: 999, border: '1px solid #E5DDD5', background: igCopied === 'caption' ? '#F0F8F0' : '#FAFAF8', color: igCopied === 'caption' ? '#5A9B6A' : '#7A6355', cursor: 'pointer' }}>
                                {igCopied === 'caption' ? '✓ Copied' : 'Copy'}
                              </button>
                            </div>
                            <p style={{ ...BODY, fontSize: 13, color: DARK, lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>{igResult.caption}</p>
                          </div>

                          {/* Hashtags */}
                          <div style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, padding: '24px 28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                              <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, margin: 0 }}>Hashtags</p>
                              <button onClick={() => copy(igResult.hashtags, 'hashtags')}
                                style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', padding: '5px 14px', borderRadius: 999, border: '1px solid #E5DDD5', background: igCopied === 'hashtags' ? '#F0F8F0' : '#FAFAF8', color: igCopied === 'hashtags' ? '#5A9B6A' : '#7A6355', cursor: 'pointer' }}>
                                {igCopied === 'hashtags' ? '✓ Copied' : 'Copy'}
                              </button>
                            </div>
                            <p style={{ ...BODY, fontSize: 12, color: '#7A5B45', lineHeight: 2, margin: 0 }}>{igResult.hashtags}</p>
                          </div>

                          {/* Image suggestion */}
                          <div style={{ background: '#FBF6EE', border: '1px solid #E8D9C0', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <p style={{ ...BODY, fontSize: 12, color: '#7A5B45', margin: 0, lineHeight: 1.7 }}><strong>Image idea:</strong> {igResult.imageNote}</p>
                          </div>

                          {/* Regenerate */}
                          <button onClick={generate} disabled={igLoading}
                            style={{ ...BODY, padding: '10px', borderRadius: 999, background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD, fontSize: 10, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}>
                            ↻ Regenerate
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* ── DESIGNS ── */}
              {tab === 'designs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ ...BODY, fontSize: 12, color: '#9A8573', margin: 0 }}>{designs.length} design{designs.length !== 1 ? 's' : ''}</p>
                    <button
                      onClick={() => { setShowAddDesign(true); setAddDesignError(null); setNewDesignName(''); setNewDesignDescription(''); setNewDesignSequence(defaultPattern()) }}
                      style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '9px 20px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    >
                      + Add Design
                    </button>
                  </div>

                  {designsLoading ? (
                    <p style={{ ...BODY, fontSize: 12, color: '#9A8573', textAlign: 'center', padding: 40 }}>Loading…</p>
                  ) : designs.length === 0 ? (
                    <p style={{ ...BODY, fontSize: 12, color: '#9A8573', textAlign: 'center', padding: 40 }}>No designs yet. Add your first one.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                      {designs.map(d => {
                        const counts = [0, 0, 0]
                        for (const v of d.sequence) counts[v]++
                        return (
                          <div key={d.id} style={{ background: '#fff', border: '1px solid #E5DDD5', borderRadius: 12, padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', opacity: d.active ? 1 : 0.55 }}>
                            <svg width="120" height="120" viewBox="0 0 120 120">
                              <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(140,100,60,0.15)" strokeWidth="1" strokeDasharray="3 2.5" />
                              {d.sequence.map((type, i) => {
                                const angle = (i / d.sequence.length) * 2 * Math.PI - Math.PI / 2
                                const x = 60 + 46 * Math.cos(angle)
                                const y = 60 + 46 * Math.sin(angle)
                                return <circle key={i} cx={x} cy={y} r={6.5} fill={['#C4A460', '#9E7DA8', '#6A9BAE'][type]} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                              })}
                            </svg>
                            <p style={{ ...SERIF, fontSize: 16, fontWeight: 300, color: DARK, margin: '10px 0 2px' }}>{d.name}</p>
                            <p style={{ ...BODY, fontSize: 10, color: '#B0A090', margin: '0 0 8px' }}>{counts[0]}P · {counts[1]}S · {counts[2]}A</p>
                            {d.description && <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: '0 0 10px', lineHeight: 1.5 }}>{d.description}</p>}
                            <Badge label={d.active ? 'Active' : 'Inactive'} color={d.active ? '#7CB98A' : '#9A8573'} />
                            <div style={{ display: 'flex', gap: 6, marginTop: 12, width: '100%' }}>
                              <button onClick={() => openEditDesign(d)}
                                style={{ ...BODY, flex: 1, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '7px', background: '#F6F1EB', border: '1px solid #E5DDD5', borderRadius: 6, cursor: 'pointer', color: DARK }}>
                                Edit
                              </button>
                              <button disabled={designActionLoading === d.id} onClick={() => toggleDesignActive(d.id, !d.active)}
                                style={{ ...BODY, flex: 1, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '7px', background: 'transparent', border: `1px solid ${d.active ? '#C0392B' : '#7CB98A'}`, color: d.active ? '#C0392B' : '#7CB98A', borderRadius: 6, cursor: 'pointer' }}>
                                {designActionLoading === d.id ? '…' : d.active ? 'Hide' : 'Show'}
                              </button>
                              <button disabled={designActionLoading === d.id} onClick={() => deleteDesign(d.id)}
                                style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '7px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, cursor: 'pointer', color: '#DC2626' }}>
                                Del
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
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

              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>
                  Primary Element
                </label>
                <select
                  value={newCrystal.primary_element}
                  onChange={e => setNewCrystal(prev => ({ ...prev, primary_element: e.target.value }))}
                  style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none' }}
                >
                  <option value="">— Select Element —</option>
                  {['wood', 'fire', 'earth', 'metal', 'water'].map(el => <option key={el} value={el}>{el.charAt(0).toUpperCase() + el.slice(1)}</option>)}
                </select>
              </div>

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

      {/* ── EDIT CRYSTAL MODAL ── */}
      {editCrystalId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setEditCrystalId(null) }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '32px 36px', width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: DARK, margin: 0 }}>Edit Crystal</h2>
              <button onClick={() => setEditCrystalId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8573', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Large preview + thumbnails */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              {editCrystalImages.length > 0 ? (
                <img src={editCrystalImages[editPreviewIndex] ?? editCrystalImages[0]} alt="" style={{ width: 160, height: 160, borderRadius: '50%', objectFit: 'cover', border: '3px solid #E5DDD5', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
              ) : (
                <div style={{ width: 160, height: 160, borderRadius: '50%', background: '#F6F1EB', border: '3px dashed #D9C4A8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4B5A8" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/></svg>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                {editCrystalImages.map((url, i) => (
                  <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                    <button onClick={() => setEditPreviewIndex(i)} title="Preview" style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'block' }}>
                      <img src={url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${editPreviewIndex === i ? GOLD : '#E5DDD5'}`, display: 'block' }} />
                    </button>
                    <button onClick={() => setEditCrystalImages(prev => {
                      const next = prev.filter((_, j) => j !== i)
                      setEditPreviewIndex(p => Math.min(p, Math.max(next.length - 1, 0)))
                      return next
                    })}
                      style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#C0392B', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontSize: 11, lineHeight: '12px', textAlign: 'center', padding: 0 }}>
                      ×
                    </button>
                  </div>
                ))}
                <label style={{ width: 44, height: 44, borderRadius: '50%', border: '1px dashed #C4B5A8', background: '#F6F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: editCrystalImageUploading ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: editCrystalImageUploading ? 0.5 : 1 }}>
                  {editCrystalImageUploading
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4B5A8" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A8573" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  }
                  <input type="file" accept="image/*" style={{ display: 'none' }} disabled={editCrystalImageUploading}
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) {
                        uploadEditCrystalImage(f)
                        setEditPreviewIndex(editCrystalImages.length)
                      }
                      e.target.value = ''
                    }} />
                </label>
              </div>
              {editCrystalImages.length === 0 && (
                <p style={{ ...BODY, fontSize: 11, color: '#C4B5A8', margin: 0 }}>No images — upload at least one to show in the bracelet preview.</p>
              )}
            </div>

            {/* Detail fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {([
                { key: 'name',         label: 'Crystal Name *', placeholder: 'e.g. Rose Quartz' },
                { key: 'slug',         label: 'Slug',           placeholder: 'e.g. rose-quartz' },
                { key: 'color_family', label: 'Color Family',   placeholder: 'e.g. Pink' },
                { key: 'meaning',      label: 'Meaning',        placeholder: 'e.g. Love, compassion, healing' },
                { key: 'price_tier',   label: 'Price Tier',     placeholder: 'e.g. standard, premium' },
                { key: 'luxury_score', label: 'Luxury Score',   placeholder: 'e.g. 8', type: 'number' },
                { key: 'energy_tags',  label: 'Energy Tags',    placeholder: 'Comma-separated, e.g. love, calm, focus' },
              ] as { key: keyof typeof editCrystalData; label: string; placeholder: string; type?: string }[]).map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input
                    value={editCrystalData[key] as string}
                    onChange={e => setEditCrystalData(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    type={type || 'text'}
                    style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>
                  Primary Element
                </label>
                <select
                  value={editCrystalData.primary_element}
                  onChange={e => setEditCrystalData(prev => ({ ...prev, primary_element: e.target.value }))}
                  style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none' }}
                >
                  <option value="">— Select Element —</option>
                  {['wood', 'fire', 'earth', 'metal', 'water'].map(el => <option key={el} value={el}>{el.charAt(0).toUpperCase() + el.slice(1)}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573' }}>Active</label>
                <button
                  onClick={() => setEditCrystalData(prev => ({ ...prev, active: !prev.active }))}
                  style={{ width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', background: editCrystalData.active ? '#7CB98A' : '#D5CDC6', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{ position: 'absolute', top: 3, left: editCrystalData.active ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            </div>

            {editCrystalError && (
              <p style={{ ...BODY, fontSize: 11, color: '#C0392B', margin: '14px 0 0' }}>{editCrystalError}</p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditCrystalId(null)} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: 'transparent', border: '1px solid #E5DDD5', color: '#9A8573', borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveEditCrystal} disabled={editCrystalSaving} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: editCrystalSaving ? 'not-allowed' : 'pointer', opacity: editCrystalSaving ? 0.7 : 1 }}>
                {editCrystalSaving ? 'Saving…' : 'Save Changes'}
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

      {/* ── ADD DESIGN MODAL ── */}
      {showAddDesign && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddDesign(false) }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '32px 36px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: DARK, margin: 0 }}>Add Design</h2>
              <button onClick={() => setShowAddDesign(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8573', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <BeadPatternEditor value={newDesignSequence} onChange={setNewDesignSequence} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>Design Name *</label>
                <input value={newDesignName} onChange={e => setNewDesignName(e.target.value)} placeholder="e.g. Spiral"
                  style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={newDesignDescription} onChange={e => setNewDesignDescription(e.target.value)} rows={2} placeholder="Short description shown on the public designs page"
                  style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>

            {addDesignError && <p style={{ ...BODY, fontSize: 11, color: '#C0392B', margin: '14px 0 0' }}>{addDesignError}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddDesign(false)} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: 'transparent', border: '1px solid #E5DDD5', color: '#9A8573', borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={addDesign} disabled={addDesignLoading} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: addDesignLoading ? 'not-allowed' : 'pointer', opacity: addDesignLoading ? 0.7 : 1 }}>
                {addDesignLoading ? 'Saving…' : 'Add Design'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT DESIGN MODAL ── */}
      {editDesignId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setEditDesignId(null) }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '32px 36px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: DARK, margin: 0 }}>Edit Design</h2>
              <button onClick={() => setEditDesignId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8573', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <BeadPatternEditor value={editDesignSequence} onChange={setEditDesignSequence} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>Design Name *</label>
                <input value={editDesignName} onChange={e => setEditDesignName(e.target.value)}
                  style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={editDesignDescription} onChange={e => setEditDesignDescription(e.target.value)} rows={2}
                  style={{ ...BODY, width: '100%', fontSize: 12, padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 7, color: DARK, background: '#FAFAF8', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>

            {editDesignError && <p style={{ ...BODY, fontSize: 11, color: '#C0392B', margin: '14px 0 0' }}>{editDesignError}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditDesignId(null)} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: 'transparent', border: '1px solid #E5DDD5', color: '#9A8573', borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveEditDesign} disabled={editDesignSaving} style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 20px', background: DARK, color: '#F6F1EB', border: 'none', borderRadius: 8, cursor: editDesignSaving ? 'not-allowed' : 'pointer', opacity: editDesignSaving ? 0.7 : 1 }}>
                {editDesignSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
