'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CartItem, getCart, removeFromCart, updateQuantity } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import { useCurrency } from '@/context/CurrencyContext'
import EmbeddedPaymentForm from '@/components/EmbeddedPaymentForm'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

type DeliveryAddress = {
  id: string; label: string | null; name: string | null; phone: string | null
  line1: string; line2: string | null; city: string | null; state: string | null
  postal_code: string | null; country: string | null; is_default: boolean
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addrPickerOpen, setAddrPickerOpen] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([])
  const [selectedAddrId, setSelectedAddrId] = useState<string | 'new'>('new')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [amountCents, setAmountCents] = useState(0)
  const [shippingFeeCents, setShippingFeeCents] = useState(0)
  const [checkoutEmail, setCheckoutEmail] = useState<string | null>(null)
  const [checkoutAddress, setCheckoutAddress] = useState<DeliveryAddress | null>(null)

  useEffect(() => {
    const cart = getCart()
    setItems(cart)
    // Default: all items checked
    const init: Record<string, boolean> = {}
    cart.forEach(i => { init[i.productId] = true })
    setChecked(init)
    const onUpdate = () => {
      const updated = getCart()
      setItems(updated)
      setChecked(prev => {
        const next = { ...prev }
        updated.forEach(i => { if (!(i.productId in next)) next[i.productId] = true })
        return next
      })
    }
    window.addEventListener('cart-updated', onUpdate)
    return () => window.removeEventListener('cart-updated', onUpdate)
  }, [])

  function handleRemove(productId: string) { removeFromCart(productId) }
  function handleQty(productId: string, qty: number) { updateQuantity(productId, qty) }
  function toggleCheck(productId: string) {
    setChecked(prev => ({ ...prev, [productId]: !prev[productId] }))
  }
  function toggleAll() {
    const allChecked = items.every(i => checked[i.productId])
    const next: Record<string, boolean> = {}
    items.forEach(i => { next[i.productId] = !allChecked })
    setChecked(next)
  }

  const selectedItems = items.filter(i => checked[i.productId])
  const selectedBracelet = selectedItems.find(i => i.type === 'bracelet')
  const selectedShopItems = selectedItems.filter(i => i.type !== 'bracelet')
  const selectedTotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const selectedCount = selectedItems.reduce((sum, i) => sum + i.quantity, 0)

  async function handleCheckout() {
    setError(null)
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const email = session?.user?.email ?? null
      const userId = session?.user?.id ?? null

      // Combined bracelet + shop checkout
      if (selectedBracelet && selectedShopItems.length > 0) {
        let savedAddress = null
        if (session?.access_token) {
          const res = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${session.access_token}` } })
          if (res.ok) {
            const addrs: DeliveryAddress[] = await res.json()
            if (addrs.length > 0) {
              setSavedAddresses(addrs)
              const def = addrs.find(a => a.is_default)
              setSelectedAddrId(def?.id ?? addrs[0].id)
              setLoading(false)
              setAddrPickerOpen(true)
              return
            }
          }
        }
        await proceedToCombinedCheckout(email, userId, savedAddress)
        return
      }

      // Bracelet-only: route to payment page
      if (selectedBracelet) {
        const params = new URLSearchParams({
          result: selectedBracelet.resultId!,
          spacer: selectedBracelet.spacer ?? 'silver',
          includeCharm: String(selectedBracelet.includeCharm !== false),
        })
        if (selectedBracelet.remark) params.set('remark', selectedBracelet.remark)
        router.push(`/payment?${params.toString()}`)
        return
      }

      // Shop-only checkout
      if (session?.access_token) {
        const res = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${session.access_token}` } })
        if (res.ok) {
          const addrs: DeliveryAddress[] = await res.json()
          if (addrs.length > 0) {
            setSavedAddresses(addrs)
            const def = addrs.find(a => a.is_default)
            setSelectedAddrId(def?.id ?? addrs[0].id)
            setLoading(false)
            setAddrPickerOpen(true)
            return
          }
        }
        setLoading(false)
      }

      await proceedToShopCheckout(email, userId, null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  async function proceedToShopCheckout(email: string | null, userId: string | null, savedAddress: DeliveryAddress | null) {
    setLoading(true)
    try {
      const addrPayload = savedAddress ? {
        name: savedAddress.name, phone: savedAddress.phone,
        line1: savedAddress.line1, line2: savedAddress.line2,
        city: savedAddress.city, state: savedAddress.state,
        postal_code: savedAddress.postal_code, country: savedAddress.country || 'MY',
      } : null

      const res = await fetch('/api/shop/checkout/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: selectedShopItems, email, userId, savedAddress: addrPayload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')

      setClientSecret(data.clientSecret)
      setAmountCents(data.amountCents)
      setShippingFeeCents(data.shippingFeeCents)
      setCheckoutEmail(email)
      setCheckoutAddress(savedAddress)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function proceedToCombinedCheckout(email: string | null, userId: string | null, savedAddress: DeliveryAddress | null) {
    setLoading(true)
    if (!selectedBracelet) return
    try {
      const addrPayload = savedAddress ? {
        name: savedAddress.name, phone: savedAddress.phone,
        line1: savedAddress.line1, line2: savedAddress.line2,
        city: savedAddress.city, state: savedAddress.state,
        postal_code: savedAddress.postal_code, country: savedAddress.country || 'MY',
      } : null

      const res = await fetch('/api/checkout/combined/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId: selectedBracelet.resultId,
          spacer: selectedBracelet.spacer ?? 'silver',
          includeCharm: selectedBracelet.includeCharm !== false,
          remark: selectedBracelet.remark ?? '',
          shopItems: selectedShopItems,
          email, userId, savedAddress: addrPayload,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')

      setClientSecret(data.clientSecret)
      setAmountCents(data.amountCents)
      setShippingFeeCents(data.shippingFeeCents)
      setCheckoutEmail(email)
      setCheckoutAddress(savedAddress)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function confirmAddress() {
    setAddrPickerOpen(false)
    const { data: { session } } = await supabase.auth.getSession()
    const email = session?.user?.email ?? null
    const userId = session?.user?.id ?? null
    const addr = selectedAddrId !== 'new' ? (savedAddresses.find(a => a.id === selectedAddrId) ?? null) : null
    if (selectedBracelet && selectedShopItems.length > 0) {
      await proceedToCombinedCheckout(email, userId, addr)
    } else {
      await proceedToShopCheckout(email, userId, addr)
    }
  }

  const { format, currency } = useCurrency()
  const allChecked = items.length > 0 && items.every(i => checked[i.productId])
  const someChecked = items.some(i => checked[i.productId])

  if (items.length === 0) {
    return (
      <main style={{ background: '#F6F1EB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20, opacity: 0.5 }}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <h2 style={{ ...SERIF, fontSize: 32, fontWeight: 300, color: '#3D2B1F', marginBottom: 8 }}>Your cart is empty</h2>
          <p style={{ ...BODY, fontSize: 12, color: '#9A8573', marginBottom: 28 }}>Explore our crystal collection to get started.</p>
          <Link href="/shop" style={{ ...BODY, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#4A3A32', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Browse Shop ✦
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <main style={{ background: '#F6F1EB', minHeight: '100vh', ...BODY }}>

        <header style={{ maxWidth: 800, margin: '0 auto', padding: '56px 24px 32px', textAlign: 'center' }}>
          <p style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', marginBottom: 12 }}>✦ Your Selection</p>
          <h1 style={{ ...SERIF, fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, color: '#3D2B1F', margin: '0 0 8px' }}>Shopping Cart</h1>
          <p style={{ ...BODY, fontSize: 12, color: '#9A8573' }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </header>

        <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Unified item list */}
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5DDD5', overflow: 'hidden', boxShadow: '0 8px 40px -16px rgba(101,70,46,0.15)' }}>

            {/* Select-all row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderBottom: '1px solid #F0E8DF', background: '#FDFAF7' }}>
              <button
                onClick={toggleAll}
                style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${allChecked ? GOLD : '#D9CEC5'}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
              >
                {allChecked && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5" stroke="#3D2B1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <span style={{ ...BODY, fontSize: 11, color: '#9A8573', letterSpacing: '0.06em' }}>
                {allChecked ? 'Deselect All' : 'Select All'}
              </span>
            </div>

            {/* Items */}
            {items.map((item, i) => (
              <div key={item.productId} style={{ display: 'flex', gap: 14, padding: '18px 24px', borderTop: i > 0 ? '1px solid #F0E8DF' : 'none', alignItems: 'center' }}>

                {/* Checkbox */}
                <button
                  onClick={() => toggleCheck(item.productId)}
                  style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked[item.productId] ? GOLD : '#D9CEC5'}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
                >
                  {checked[item.productId] && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5" stroke="#3D2B1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>

                {/* Image */}
                <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: '#F8F4EF', border: '1px solid #E5DDD5' }}>
                  {item.imageUrl
                    ? <Image src={item.imageUrl} alt={item.name} fill sizes="72px" style={{ objectFit: item.type === 'bracelet' ? 'contain' : 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: GOLD, opacity: 0.4 }}>✦</span></div>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.type === 'bracelet' && (
                    <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, margin: '0 0 3px' }}>Custom Crystal Bracelet</p>
                  )}
                  <p style={{ ...SERIF, fontSize: 17, fontWeight: 300, color: '#3D2B1F', margin: '0 0 4px', lineHeight: 1.3 }}>{item.name}</p>
                  {item.type === 'bracelet' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px', marginTop: 4 }}>
                      {item.spacer && item.spacer !== 'exclude' && (
                        <span style={{ ...BODY, fontSize: 11, color: '#9A8573', textTransform: 'capitalize' }}>Spacer: {item.spacer}</span>
                      )}
                      <span style={{ ...BODY, fontSize: 11, color: '#9A8573' }}>Charm: {item.includeCharm !== false ? 'Included' : 'Excluded'}</span>
                      {item.remark && <span style={{ ...BODY, fontSize: 11, color: '#9A8573', width: '100%' }}>Note: {item.remark}</span>}
                    </div>
                  ) : null}
                </div>

                {/* Qty (shop only) + price + remove */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <p style={{ ...SERIF, fontSize: 18, fontWeight: 300, color: '#3D2B1F', margin: 0 }}>{format(item.price * item.quantity)}</p>
                  {item.type !== 'bracelet' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => handleQty(item.productId, item.quantity - 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #E5DDD5', background: '#FDFAF7', cursor: 'pointer', fontSize: 14, color: '#4A3A32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ ...BODY, fontSize: 13, fontWeight: 500, color: '#3D2B1F', minWidth: 18, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => handleQty(item.productId, item.quantity + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #E5DDD5', background: '#FDFAF7', cursor: 'pointer', fontSize: 14, color: '#4A3A32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  )}
                  <button onClick={() => handleRemove(item.productId)} style={{ ...BODY, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#C5B8AD', letterSpacing: '0.1em' }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary & checkout */}
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5DDD5', padding: '24px', boxShadow: '0 8px 40px -16px rgba(101,70,46,0.15)' }}>
            {clientSecret ? (
              <EmbeddedPaymentForm
                clientSecret={clientSecret}
                initialAmountCents={amountCents}
                initialShippingFeeCents={shippingFeeCents}
                defaultEmail={checkoutEmail}
                defaultAddress={checkoutAddress ? {
                  name: checkoutAddress.name, phone: checkoutAddress.phone,
                  line1: checkoutAddress.line1, line2: checkoutAddress.line2,
                  city: checkoutAddress.city, state: checkoutAddress.state,
                  postal_code: checkoutAddress.postal_code, country: checkoutAddress.country || 'MY',
                } : null}
                returnUrlPath="/payment/success"
              />
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ ...BODY, fontSize: 12, color: '#7A5B45' }}>
                    Subtotal ({selectedCount} item{selectedCount !== 1 ? 's' : ''} selected)
                  </span>
                  <span style={{ ...SERIF, fontSize: 18, color: '#3D2B1F' }}>{format(selectedTotal)}</span>
                </div>
                <div style={{ borderTop: '1px solid #E5DDD5', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <span style={{ ...SERIF, fontSize: 16, color: '#3D2B1F' }}>Total</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ ...SERIF, fontSize: 26, fontWeight: 300, color: '#3D2B1F', display: 'block' }}>{format(selectedTotal)}</span>
                    {currency !== 'SGD' && (
                      <span style={{ ...BODY, fontSize: 10, color: '#B0A090', letterSpacing: '0.06em' }}>Billed in SGD at checkout</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || !someChecked}
                  style={{ ...BODY, width: '100%', padding: '14px', borderRadius: 999, background: someChecked ? '#4A3A32' : '#C5B8AD', border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', cursor: loading || !someChecked ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'background 0.25s' }}
                >
                  {loading ? 'Please wait…' : 'Proceed to Payment ✦'}
                </button>
                {error && <p style={{ ...BODY, fontSize: 11, color: '#E07070', textAlign: 'center', marginTop: 12 }}>{error}</p>}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Link href="/shop" style={{ ...BODY, fontSize: 11, color: '#9A8573', textDecoration: 'none' }}>← Continue Shopping</Link>
                  <span style={{ color: '#D9CEC5', margin: '0 8px' }}>·</span>
                  <Link href="/energy-quiz" style={{ ...BODY, fontSize: 11, color: '#9A8573', textDecoration: 'none' }}>✦ Analyze Your Energy</Link>
                </div>
              </>
            )}
          </div>

        </section>
      </main>

      {/* ADDRESS PICKER MODAL */}
      {addrPickerOpen && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(46,33,24,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setAddrPickerOpen(false)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 440, background: '#FBF6EE', borderRadius: 28, padding: '40px 32px', boxShadow: '0 40px 100px -30px rgba(74,58,50,0.5)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => setAddrPickerOpen(false)} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#9A8573' }}>✕</button>
            <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', marginBottom: 6 }}>Delivery</p>
            <h3 style={{ ...SERIF, fontSize: 24, fontWeight: 300, color: '#3D2B1F', marginBottom: 24 }}>Ship To</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}>
              {savedAddresses.map(a => (
                <button key={a.id} onClick={() => setSelectedAddrId(a.id)} style={{ ...BODY, display: 'block', width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 12, cursor: 'pointer', border: `1.5px solid ${selectedAddrId === a.id ? GOLD : '#E5DDD5'}`, background: selectedAddrId === a.id ? '#FEF9F2' : '#fff', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${selectedAddrId === a.id ? GOLD : '#C5B8AD'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selectedAddrId === a.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />}
                    </div>
                    {a.label && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: GOLD }}>{a.label}</span>}
                    {a.is_default && <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, padding: '2px 7px', borderRadius: 999, background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}44` }}>Default</span>}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#4A3A32', margin: '0 0 2px', paddingLeft: 22 }}>{a.name || '—'} {a.phone && `· ${a.phone}`}</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#7A6355', margin: 0, lineHeight: 1.6, paddingLeft: 22 }}>
                    {[a.line1, a.line2, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(', ')}
                  </p>
                </button>
              ))}
              <button onClick={() => setSelectedAddrId('new')} style={{ ...BODY, display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 12, cursor: 'pointer', border: `1.5px solid ${selectedAddrId === 'new' ? GOLD : '#E5DDD5'}`, background: selectedAddrId === 'new' ? '#FEF9F2' : '#fff', transition: 'all 0.15s' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${selectedAddrId === 'new' ? GOLD : '#C5B8AD'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selectedAddrId === 'new' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#4A3A32', margin: '0 0 2px' }}>Enter a new address</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#9A8573', margin: 0 }}>You&apos;ll fill it in on the next step</p>
                </div>
              </button>
            </div>
            <button onClick={confirmAddress} style={{ ...BODY, marginTop: 20, width: '100%', padding: '14px', borderRadius: 999, background: '#4A3A32', border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Continue to Payment ✦
            </button>
          </div>
        </div>
      )}
    </>
  )
}
