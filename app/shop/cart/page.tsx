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
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [amountCents, setAmountCents] = useState(0)
  const [shippingFeeCents, setShippingFeeCents] = useState(0)
  const [checkoutEmail, setCheckoutEmail] = useState<string | null>(null)
  const [checkoutAddress, setCheckoutAddress] = useState<DeliveryAddress | null>(null)

  useEffect(() => {
    const cart = getCart()
    setItems(cart)
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

  const selectedItems = items.filter(i => checked[i.productId])
  const selectedBracelet = selectedItems.find(i => i.type === 'bracelet')
  const selectedShopItems = selectedItems.filter(i => i.type !== 'bracelet')
  const selectedTotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const selectedCount = selectedItems.reduce((sum, i) => sum + i.quantity, 0)
  // Stable key — re-run whenever selection changes
  const selectedKey = selectedItems.map(i => `${i.productId}:${i.quantity}`).sort().join(',')

  useEffect(() => {
    if (selectedItems.length === 0) { setClientSecret(null); return }
    setClientSecret(null)
    const timer = setTimeout(() => { void initCheckout() }, 600)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey])

  async function initCheckout() {
    setFormLoading(true)
    setFormError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const email = session?.user?.email ?? null
      const userId = session?.user?.id ?? null
      let defaultAddress: DeliveryAddress | null = null
      if (session?.access_token) {
        const res = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${session.access_token}` } })
        if (res.ok) {
          const addrs: DeliveryAddress[] = await res.json()
          defaultAddress = addrs.find(a => a.is_default) ?? addrs[0] ?? null
        }
      }

      const addrPayload = defaultAddress ? {
        name: defaultAddress.name, phone: defaultAddress.phone,
        line1: defaultAddress.line1, line2: defaultAddress.line2,
        city: defaultAddress.city, state: defaultAddress.state,
        postal_code: defaultAddress.postal_code, country: defaultAddress.country || 'SG',
      } : null

      let endpoint = '/api/shop/checkout/intent'
      let body: Record<string, unknown> = { items: selectedShopItems, email, userId, savedAddress: addrPayload }

      if (selectedBracelet && selectedShopItems.length > 0) {
        // Combined bracelet + shop
        endpoint = '/api/checkout/combined/intent'
        body = {
          resultId: selectedBracelet.resultId, spacer: selectedBracelet.spacer ?? 'silver',
          includeCharm: selectedBracelet.includeCharm !== false, remark: selectedBracelet.remark ?? '',
          shopItems: selectedShopItems, email, userId, savedAddress: addrPayload,
        }
      } else if (selectedBracelet && selectedShopItems.length === 0) {
        // Bracelet only
        endpoint = '/api/checkout/intent'
        body = {
          resultId: selectedBracelet.resultId, spacer: selectedBracelet.spacer ?? 'silver',
          includeCharm: selectedBracelet.includeCharm !== false, remark: selectedBracelet.remark ?? '',
          email, userId, savedAddress: addrPayload,
        }
      }

      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')
      setClientSecret(data.clientSecret)
      setAmountCents(data.amountCents)
      setShippingFeeCents(data.shippingFeeCents)
      setCheckoutEmail(email)
      setCheckoutAddress(defaultAddress)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setFormLoading(false)
    }
  }

  function handleBraceletCheckout() {
    if (!selectedBracelet) return
    const params = new URLSearchParams({
      result: selectedBracelet.resultId!,
      spacer: selectedBracelet.spacer ?? 'silver',
      includeCharm: String(selectedBracelet.includeCharm !== false),
    })
    if (selectedBracelet.remark) params.set('remark', selectedBracelet.remark)
    router.push(`/payment?${params.toString()}`)
  }

  function handleRemove(productId: string) { removeFromCart(productId) }
  function handleQty(productId: string, qty: number) { updateQuantity(productId, qty) }
  function toggleCheck(productId: string) { setChecked(prev => ({ ...prev, [productId]: !prev[productId] })) }
  function toggleAll() {
    const allChecked = items.every(i => checked[i.productId])
    const next: Record<string, boolean> = {}
    items.forEach(i => { next[i.productId] = !allChecked })
    setChecked(next)
  }

  const { format, currency } = useCurrency()
  const allChecked = items.length > 0 && items.every(i => checked[i.productId])

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
    <main style={{ background: '#F6F1EB', minHeight: '100vh', ...BODY }}>

      <header style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 32px', textAlign: 'center' }}>
        <h1 style={{ ...SERIF, fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, color: '#3D2B1F', margin: 0 }}>Shopping Cart</h1>
      </header>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="cart-two-col">

          {/* ── LEFT: items + total ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Item list */}
            <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5DDD5', overflow: 'hidden', boxShadow: '0 8px 40px -16px rgba(101,70,46,0.15)' }}>
              {/* Select-all row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderBottom: '1px solid #F0E8DF', background: '#FDFAF7' }}>
                <button onClick={toggleAll} style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${allChecked ? '#C9B08A' : '#D9CEC5'}`, background: allChecked ? '#C9B08A' : '#fff', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }} />
                <span style={{ ...BODY, fontSize: 11, color: '#9A8573', letterSpacing: '0.06em' }}>{allChecked ? 'Deselect All' : 'Select All'}</span>
              </div>

              {items.map((item, i) => (
                <div key={item.productId} style={{ display: 'flex', gap: 14, padding: '18px 24px', borderTop: i > 0 ? '1px solid #F0E8DF' : 'none', alignItems: 'center' }}>
                  {/* Checkbox */}
                  <button onClick={() => toggleCheck(item.productId)} style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked[item.productId] ? '#C9B08A' : '#D9CEC5'}`, background: checked[item.productId] ? '#C9B08A' : '#fff', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }} />
                  {/* Image */}
                  <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: '#F8F4EF', border: '1px solid #E5DDD5' }}>
                    {item.imageUrl
                      ? <Image src={item.imageUrl} alt={item.name} fill sizes="72px" style={{ objectFit: item.type === 'bracelet' ? 'contain' : 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: GOLD, opacity: 0.4 }}>✦</span></div>}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {item.type === 'bracelet' && <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, margin: '0 0 3px' }}>Custom Crystal Bracelet</p>}
                    <p style={{ ...SERIF, fontSize: 17, fontWeight: 300, color: '#3D2B1F', margin: '0 0 4px', lineHeight: 1.3 }}>{item.name}</p>
                    {item.type === 'bracelet' ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
                        {item.spacer && item.spacer !== 'exclude' && <span style={{ ...BODY, fontSize: 11, color: '#9A8573', textTransform: 'capitalize' }}>Spacer: {item.spacer}</span>}
                        <span style={{ ...BODY, fontSize: 11, color: '#9A8573' }}>Charm: {item.includeCharm !== false ? 'Included' : 'Excluded'}</span>
                        {item.remark && <span style={{ ...BODY, fontSize: 11, color: '#9A8573', width: '100%' }}>Note: {item.remark}</span>}
                      </div>
                    ) : null}
                  </div>
                  {/* Qty + price + remove */}
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

            {/* Subtotal + Total */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5DDD5', padding: '20px 24px', boxShadow: '0 4px 20px -8px rgba(101,70,46,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ ...BODY, fontSize: 12, color: '#7A5B45' }}>Subtotal ({selectedCount} item{selectedCount !== 1 ? 's' : ''} selected)</span>
                <span style={{ ...SERIF, fontSize: 18, color: '#3D2B1F' }}>{format(selectedTotal)}</span>
              </div>
              <div style={{ borderTop: '1px solid #F0E8DF', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ ...SERIF, fontSize: 15, color: '#3D2B1F' }}>Total (excl. shipping)</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ ...SERIF, fontSize: 24, fontWeight: 300, color: '#3D2B1F', display: 'block' }}>{format(selectedTotal)}</span>
                  {currency !== 'SGD' && <span style={{ ...BODY, fontSize: 10, color: '#B0A090' }}>Billed in SGD at checkout</span>}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href="/shop" style={{ ...BODY, fontSize: 11, color: '#9A8573', textDecoration: 'none' }}>← Continue Shopping</Link>
              <span style={{ color: '#D9CEC5', margin: '0 8px' }}>·</span>
              <Link href="/energy-quiz" style={{ ...BODY, fontSize: 11, color: '#9A8573', textDecoration: 'none' }}>✦ Analyze Your Energy</Link>
            </div>
          </div>

          {/* ── RIGHT: checkout form (always shown for any selection) ── */}
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5DDD5', padding: '28px', boxShadow: '0 8px 40px -16px rgba(101,70,46,0.15)', position: 'sticky', top: 24 }}>
            {selectedItems.length === 0 ? (
              <p style={{ ...BODY, fontSize: 12, color: '#9A8573', textAlign: 'center', padding: '20px 0' }}>Select items above to checkout</p>
            ) : formLoading ? (
              <p style={{ ...BODY, fontSize: 11, letterSpacing: '0.28em', color: GOLD, textTransform: 'uppercase', textAlign: 'center', padding: '24px 0' }}>Preparing checkout…</p>
            ) : formError ? (
              <p style={{ ...BODY, fontSize: 12, color: '#C0392B', textAlign: 'center' }}>{formError}</p>
            ) : clientSecret ? (
              <EmbeddedPaymentForm
                clientSecret={clientSecret}
                initialAmountCents={amountCents}
                initialShippingFeeCents={shippingFeeCents}
                defaultEmail={checkoutEmail}
                defaultAddress={checkoutAddress ? {
                  name: checkoutAddress.name, phone: checkoutAddress.phone,
                  line1: checkoutAddress.line1, line2: checkoutAddress.line2,
                  city: checkoutAddress.city, state: checkoutAddress.state,
                  postal_code: checkoutAddress.postal_code, country: checkoutAddress.country || 'SG',
                } : null}
                returnUrlPath={selectedBracelet ? `/payment/success?result=${selectedBracelet.resultId}` : '/payment/success'}
              />
            ) : null}
          </div>

        </div>
      </section>
    </main>
  )
}
