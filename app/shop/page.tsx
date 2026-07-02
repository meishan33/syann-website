'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { addToCart } from '@/lib/cart'
import { useCurrency } from '@/context/CurrencyContext'
import CurrencySelector from '@/components/CurrencySelector'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  active: boolean
  stock_count: number
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'bracelet', label: 'Bracelets' },
  { key: 'crystal', label: 'Crystals' },
  { key: 'accessory', label: 'Accessories' },
]

export default function ShopPage() {
  const { format } = useCurrency()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/shop/products')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = products
    .filter(p => category === 'all' || p.category === category)
    .filter(p => !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))

  function handleAddToCart(p: Product) {
    addToCart({ productId: p.id, name: p.name, price: p.price, imageUrl: p.image_url, category: p.category })
    setAddedId(p.id)
    setTimeout(() => setAddedId(null), 1800)
  }

  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', ...BODY }}>
      <style>{`
        .shop-filter-bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .shop-tabs { display: flex; gap: 0; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; flex-shrink: 0; }
        .shop-tabs::-webkit-scrollbar { display: none; }
        .shop-search-row { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        @media (max-width: 540px) {
          .shop-filter-bar { flex-direction: column; align-items: stretch; padding: 0 !important; }
          .shop-tabs { border-bottom: 1px solid #E5DDD5; padding: 0 16px; }
          .shop-search-row { padding: 10px 16px 12px; }
          .shop-search-input { width: 100% !important; }
        }
      `}</style>

      {/* CRYSTAL COLLECTION BANNER */}
      <section style={{ background: '#FDFAF7', borderBottom: '1px solid #E5DDD5', padding: '24px 24px 20px', textAlign: 'center' }}>
        <p style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', margin: '0 0 10px' }}>
          ✦ Crystal Collection
        </p>
        <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', margin: '0 auto', lineHeight: 1.8, maxWidth: 480 }}>
          Handcrafted crystal pieces and curated accessories for your energy journey.
        </p>
      </section>

      {/* CATEGORY TABS + SEARCH */}
      <section style={{ background: '#FDFAF7', borderBottom: '1px solid #E5DDD5', padding: '0 24px' }} className="shop-filter-bar">
        <div className="shop-tabs">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              style={{
                ...BODY, background: 'none', border: 'none', cursor: 'pointer',
                padding: '14px 16px', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                color: category === c.key ? '#3D2B1F' : '#9A8573',
                borderBottom: category === c.key ? `2px solid ${GOLD}` : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="shop-search-row">
          <div style={{ position: 'relative', flex: 1 }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="#9A8573" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="9" cy="9" r="7"/><path d="M15 15l3 3"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="shop-search-input"
              style={{ ...BODY, paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #E5DDD5', borderRadius: 999, fontSize: 12, color: '#4A3A32', background: '#FDFAF7', outline: 'none', width: 160 }}
            />
          </div>
          <CurrencySelector />
        </div>
      </section>


      {/* GRID */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px' }}>
        {!loading && filtered.length > 0 && (
          <p style={{ ...BODY, fontSize: 11, color: '#9A8573', marginBottom: 20, letterSpacing: '0.06em' }}>
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            {search && <> matching &ldquo;{search}&rdquo;</>}
          </p>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A8573', ...BODY, fontSize: 13 }}>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ ...SERIF, fontSize: 28, fontWeight: 300, color: '#3D2B1F', marginBottom: 8 }}>Coming Soon</p>
            <p style={{ ...BODY, fontSize: 12, color: '#9A8573' }}>New pieces are being prepared for you.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 45%), 1fr))', gap: 16 }}>
            {filtered.map(p => (
              <div
                key={p.id}
                style={{
                  background: '#fff', borderRadius: 16, border: '1px solid #E5DDD5',
                  overflow: 'hidden', boxShadow: '0 4px 20px -8px rgba(101,70,46,0.12)',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {/* Rectangular image */}
                <Link href={`/shop/${p.id}`} style={{ display: 'block', position: 'relative', aspectRatio: '4/3', background: '#F8F4EF', textDecoration: 'none' }}>
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.name} fill sizes="280px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 32, color: GOLD, opacity: 0.3 }}>✦</span>
                    </div>
                  )}
                  {/* Category badge */}
                  <span style={{
                    position: 'absolute', top: 10, left: 10,
                    ...BODY, fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
                    background: 'rgba(253,250,247,0.92)', color: GOLD, padding: '3px 8px', borderRadius: 999,
                    border: `1px solid ${GOLD}44`,
                  }}>
                    {p.category}
                  </span>
                  {p.stock_count === 0 && (
                    <span style={{
                      position: 'absolute', top: 10, right: 10,
                      ...BODY, fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
                      background: 'rgba(220,38,38,0.9)', color: '#fff', padding: '3px 8px', borderRadius: 999,
                    }}>
                      Out of Stock
                    </span>
                  )}
                </Link>

                {/* Info — title only, no description */}
                <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  <Link href={`/shop/${p.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ ...SERIF, fontSize: 15, fontWeight: 300, color: '#3D2B1F', margin: 0, lineHeight: 1.4 }}>{p.name}</h3>
                  </Link>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ ...SERIF, fontSize: 17, fontWeight: 300, color: '#3D2B1F' }}>
                      {format(p.price)}
                    </span>
                    <button
                      onClick={() => p.stock_count > 0 && handleAddToCart(p)}
                      disabled={p.stock_count === 0}
                      style={{
                        ...BODY, padding: '7px 14px', borderRadius: 999,
                        background: p.stock_count === 0 ? '#E5DDD5' : addedId === p.id ? GOLD : '#4A3A32',
                        border: 'none', color: p.stock_count === 0 ? '#9A8573' : '#fff', fontSize: 9, fontWeight: 600,
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        cursor: p.stock_count === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.25s', whiteSpace: 'nowrap',
                      }}
                    >
                      {p.stock_count === 0 ? 'Out of Stock' : addedId === p.id ? 'Added ✦' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  )
}
