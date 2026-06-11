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
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/shop/products')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = category === 'all' ? products : products.filter(p => p.category === category)

  function handleAddToCart(p: Product) {
    addToCart({ productId: p.id, name: p.name, price: p.price, imageUrl: p.image_url, category: p.category })
    setAddedId(p.id)
    setTimeout(() => setAddedId(null), 1800)
  }

  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', ...BODY }}>


      {/* CRYSTAL COLLECTION BANNER */}
      <section style={{ background: '#FDFAF7', borderBottom: '1px solid #E5DDD5', padding: '24px 24px 20px', textAlign: 'center' }}>
        <p style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', margin: '0 0 10px' }}>
          ✦ Crystal Collection
        </p>
        <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', margin: '0 auto', lineHeight: 1.8, whiteSpace: 'nowrap' }}>
          Handcrafted crystal pieces and curated accessories for your energy journey.
        </p>
      </section>

      {/* CATEGORY TABS */}
      <section style={{ background: '#FDFAF7', borderBottom: '1px solid #E5DDD5', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              style={{
                ...BODY, background: 'none', border: 'none', cursor: 'pointer',
                padding: '16px 20px', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: category === c.key ? '#3D2B1F' : '#9A8573',
                borderBottom: category === c.key ? `2px solid ${GOLD}` : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <CurrencySelector />
      </section>


      {/* GRID */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {filtered.map(p => (
              <div
                key={p.id}
                style={{
                  background: '#fff', borderRadius: 24, border: '1px solid #E5DDD5',
                  overflow: 'hidden', boxShadow: '0 8px 32px -12px rgba(101,70,46,0.15)',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', aspectRatio: '1', background: '#F8F4EF' }}>
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.name} fill sizes="320px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 40, color: GOLD, opacity: 0.3 }}>✦</span>
                    </div>
                  )}
                  {/* Category badge */}
                  <span style={{
                    position: 'absolute', top: 12, left: 12,
                    ...BODY, fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
                    background: 'rgba(253,250,247,0.92)', color: GOLD, padding: '4px 10px', borderRadius: 999,
                    border: `1px solid ${GOLD}44`,
                  }}>
                    {p.category}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <h3 style={{ ...SERIF, fontSize: 20, fontWeight: 300, color: '#3D2B1F', margin: 0 }}>{p.name}</h3>
                  {p.description && (
                    <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#7A6355', lineHeight: 1.7, margin: 0 }}>
                      {p.description}
                    </p>
                  )}
                  <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: '#3D2B1F' }}>
                      {format(p.price)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(p)}
                      style={{
                        ...BODY, flex: 1, padding: '10px 16px', borderRadius: 999,
                        background: addedId === p.id ? GOLD : '#4A3A32',
                        border: 'none', color: '#fff', fontSize: 10, fontWeight: 600,
                        letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
                        transition: 'all 0.25s',
                      }}
                    >
                      {addedId === p.id ? 'Added ✦' : 'Add to Cart'}
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
