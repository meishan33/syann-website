'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CartItem, getCart, removeFromCart, updateQuantity, cartTotal, cartCount } from '@/lib/cart'
import { useCurrency } from '@/context/CurrencyContext'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

type Props = { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { format, currency } = useCurrency()

  useEffect(() => {
    setItems(getCart())
    const onUpdate = () => setItems(getCart())
    window.addEventListener('cart-updated', onUpdate)
    return () => window.removeEventListener('cart-updated', onUpdate)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const total = cartTotal(items)
  const count = cartCount(items)

  async function handleCheckout() {
    setError(null)
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          email: session?.user?.email ?? null,
          userId: session?.user?.id ?? null,
          savedAddress: null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout session')
      window.location.href = data.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

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

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 401,
          width: '100%', maxWidth: 400,
          background: '#FBF8F4',
          boxShadow: '-8px 0 40px rgba(74,46,20,0.15)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
          ...BODY,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #E5DDD5' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD, margin: '0 0 2px' }}>Your Selection</p>
            <h2 style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: '#3D2B1F', margin: 0 }}>Shopping Cart</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#F0E8DF', cursor: 'pointer', fontSize: 14, color: '#7A5B45', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 0' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16, opacity: 0.4 }}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p style={{ ...SERIF, fontSize: 20, fontWeight: 300, color: '#3D2B1F', margin: '0 0 6px' }}>Your cart is empty</p>
              <p style={{ fontSize: 11, color: '#9A8573', margin: '0 0 20px' }}>Explore our crystal collection.</p>
              <Link href="/shop" onClick={onClose}
                style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 24px', background: '#4A3A32', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', textDecoration: 'none' }}
              >
                Browse Shop
              </Link>
            </div>
          ) : items.map((item, i) => (
            <div key={item.productId} style={{ display: 'flex', gap: 12, padding: '14px 0', borderTop: i > 0 ? '1px solid #F0E8DF' : 'none', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: '#F8F4EF', border: '1px solid #E5DDD5' }}>
                {item.imageUrl
                  ? <Image src={item.imageUrl} alt={item.name} fill sizes="60px" style={{ objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: GOLD, opacity: 0.4 }}>✦</span></div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ ...SERIF, fontSize: 15, fontWeight: 300, color: '#3D2B1F', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, margin: '0 0 8px' }}>{item.category}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #E5DDD5', background: '#FDFAF7', cursor: 'pointer', fontSize: 13, color: '#4A3A32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#3D2B1F', minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #E5DDD5', background: '#FDFAF7', cursor: 'pointer', fontSize: 13, color: '#4A3A32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <p style={{ ...SERIF, fontSize: 16, fontWeight: 300, color: '#3D2B1F', margin: '0 0 4px' }}>{format(item.price * item.quantity)}</p>
                <button onClick={() => removeFromCart(item.productId)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#C5B8AD', letterSpacing: '0.1em', fontFamily: 'inherit' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px 24px 28px', borderTop: '1px solid #E5DDD5', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#7A5B45' }}>Total ({count} item{count !== 1 ? 's' : ''})</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: '#3D2B1F' }}>{format(total)}</span>
                {currency !== 'SGD' && <p style={{ fontSize: 9, color: '#B0A090', margin: 0 }}>Billed in SGD at checkout</p>}
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{ width: '100%', padding: '13px', borderRadius: 999, background: '#4A3A32', border: 'none', color: '#fff', fontSize: 10, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'background 0.25s', fontFamily: 'inherit' }}
            >
              {loading ? 'Please wait…' : 'Proceed to Payment ✦'}
            </button>
            <Link
              href="/shop/cart"
              onClick={onClose}
              style={{ display: 'block', textAlign: 'center', fontSize: 11, color: '#9A8573', textDecoration: 'none', letterSpacing: '0.06em' }}
            >
              View Shopping Cart →
            </Link>
            {error && <p style={{ fontSize: 10, color: '#E07070', textAlign: 'center', margin: 0 }}>{error}</p>}
          </div>
        )}
      </div>
    </>
  )
}
