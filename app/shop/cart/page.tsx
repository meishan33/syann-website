'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CartItem, getCart, removeFromCart, updateQuantity, bindCartToUser } from '@/lib/cart'
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

type AppliedPromo = { code: string; discountCents: number; discountLabel: string }

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  // Session email: undefined = not yet resolved, null = guest, string = logged in
  const [sessionEmail, setSessionEmail] = useState<string | null | undefined>(undefined)
  const [guestEmail, setGuestEmail] = useState('')

  // Promo code
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)

  // Checkout
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [amountCents, setAmountCents] = useState(0)
  const [shippingFeeCents, setShippingFeeCents] = useState(0)
  const [checkoutEmail, setCheckoutEmail] = useState<string | null>(null)
  const [checkoutAddress, setCheckoutAddress] = useState<DeliveryAddress | null>(null)

  // Effective email: logged-in email takes priority, otherwise guest input
  const effectiveEmail = (sessionEmail !== undefined ? sessionEmail : null) ?? (guestEmail.trim() || null)

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
    // Resolve once on mount: string = logged in, null = guest
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionEmail(session?.user?.email ?? null)
      bindCartToUser(session?.user?.id ?? null)
    })
    return () => window.removeEventListener('cart-updated', onUpdate)
  }, [])

  const selectedItems = items.filter(i => checked[i.productId])
  const selectedBracelet = selectedItems.find(i => i.type === 'bracelet')
  const selectedShopItems = selectedItems.filter(i => i.type !== 'bracelet')
  const selectedSubtotalCents = Math.round(selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100)
  const selectedCount = selectedItems.reduce((sum, i) => sum + i.quantity, 0)
  const discountCents = appliedPromo?.discountCents ?? 0
  const displayTotalCents = Math.max(50, selectedSubtotalCents - discountCents)

  function handleRemove(productId: string) { removeFromCart(productId); setAppliedPromo(null) }
  function handleQty(productId: string, qty: number) { updateQuantity(productId, qty); setAppliedPromo(null) }
  function toggleCheck(productId: string) { setChecked(prev => ({ ...prev, [productId]: !prev[productId] })); setAppliedPromo(null) }
  function toggleAll() {
    const allChecked = items.every(i => checked[i.productId])
    const next: Record<string, boolean> = {}
    items.forEach(i => { next[i.productId] = !allChecked })
    setChecked(next)
    setAppliedPromo(null)
  }
  const { format, currency } = useCurrency()
  const allChecked = items.length > 0 && items.every(i => checked[i.productId])
  const someChecked = selectedItems.length > 0

  async function applyPromo() {
    if (!effectiveEmail) {
      setPromoError('Please enter your email address first.')
      return
    }
    setPromoLoading(true)
    setPromoError(null)
    try {
      const res = await fetch('/api/checkout/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, subtotalCents: selectedSubtotalCents, email: effectiveEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setPromoError(data.error); return }
      setAppliedPromo(data)
      setPromoInput('')

      // If the Stripe form is already open, apply the discount to the existing
      // PaymentIntent so the amount the customer pays actually reflects it.
      if (clientSecret) {
        const piId = clientSecret.split('_secret_')[0]
        const applyRes = await fetch('/api/checkout/apply-discount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: piId, code: data.code, email: effectiveEmail }),
        })
        if (applyRes.ok) {
          const applyData = await applyRes.json()
          setAmountCents(applyData.amountCents)
          setShippingFeeCents(applyData.shippingFeeCents)
          // key={amountCents} on EmbeddedPaymentForm triggers clean remount
        } else {
          // PI update failed — close the form so the next "Proceed to Payment"
          // click creates a fresh PI with the correct discounted amount.
          setClientSecret(null)
        }
      }
    } catch { setPromoError('Failed to apply code.') }
    finally { setPromoLoading(false) }
  }

  async function handleCheckout() {
    setCheckoutError(null)
    setCheckoutLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const email = (session?.user?.email ?? guestEmail.trim()) || null
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

      // Bracelet only → route to dedicated payment page
      if (selectedBracelet && selectedShopItems.length === 0) {
        const params = new URLSearchParams({
          result: selectedBracelet.resultId!,
          spacer: selectedBracelet.spacer ?? 'silver',
          includeCharm: String(selectedBracelet.includeCharm !== false),
        })
        if (selectedBracelet.remark) params.set('remark', selectedBracelet.remark)
        router.push(`/payment?${params.toString()}`)
        return
      }

      // Shop only or combined → create intent and show inline form
      let endpoint = '/api/shop/checkout/intent'
      let body: Record<string, unknown> = { items: selectedShopItems, email, userId, savedAddress: addrPayload }

      if (selectedBracelet && selectedShopItems.length > 0) {
        endpoint = '/api/checkout/combined/intent'
        body = {
          resultId: selectedBracelet.resultId, spacer: selectedBracelet.spacer ?? 'silver',
          includeCharm: selectedBracelet.includeCharm !== false, remark: selectedBracelet.remark ?? '',
          shopItems: selectedShopItems, email, userId, savedAddress: addrPayload,
        }
      }

      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')

      // Apply promo code to intent if one is saved
      if (appliedPromo && data.clientSecret) {
        const piId = data.clientSecret.split('_secret_')[0]
        await fetch('/api/checkout/apply-discount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: piId, code: appliedPromo.code, email }),
        })
      }

      setClientSecret(data.clientSecret)
      setAmountCents(appliedPromo ? Math.max(50, data.amountCents - appliedPromo.discountCents) : data.amountCents)
      setShippingFeeCents(data.shippingFeeCents)
      setCheckoutEmail(email)  // now includes guestEmail for guests
      setCheckoutAddress(defaultAddress)
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setCheckoutLoading(false)
    }
  }

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

      <header style={{ maxWidth: 720, margin: '0 auto', padding: '56px 24px 32px', textAlign: 'center' }}>
        <h1 style={{ ...SERIF, fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, color: '#3D2B1F', margin: '0 0 8px' }}>Shopping Cart</h1>
        <p style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>✦ Your Selection</p>
      </header>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Item list */}
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5DDD5', overflow: 'hidden', boxShadow: '0 8px 40px -16px rgba(101,70,46,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderBottom: '1px solid #F0E8DF', background: '#FDFAF7' }}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll}
              style={{ width: 16, height: 16, accentColor: GOLD, cursor: 'pointer', flexShrink: 0 }} />
            <span style={{ ...BODY, fontSize: 11, color: '#9A8573', letterSpacing: '0.06em' }}>{allChecked ? 'Deselect All' : 'Select All'}</span>
          </div>

          {items.map((item, i) => (
            <div key={item.productId} style={{ display: 'flex', gap: 14, padding: '18px 24px', borderTop: i > 0 ? '1px solid #F0E8DF' : 'none', alignItems: 'center' }}>
              <input type="checkbox" checked={!!checked[item.productId]} onChange={() => toggleCheck(item.productId)}
                style={{ width: 16, height: 16, accentColor: GOLD, cursor: 'pointer', flexShrink: 0 }} />
              <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: '#F8F4EF', border: '1px solid #E5DDD5' }}>
                {item.imageUrl
                  ? <Image src={item.imageUrl} alt={item.name} fill sizes="72px" style={{ objectFit: item.type === 'bracelet' ? 'contain' : 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: GOLD, opacity: 0.4 }}>✦</span></div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {item.type === 'bracelet' && <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, margin: '0 0 3px' }}>Custom Crystal Bracelet</p>}
                <p style={{ ...SERIF, fontSize: 17, fontWeight: 300, color: '#3D2B1F', margin: '0 0 4px', lineHeight: 1.3 }}>{item.name}</p>
                {item.type === 'bracelet' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
                    {item.spacer && item.spacer !== 'exclude' && <span style={{ ...BODY, fontSize: 11, color: '#9A8573', textTransform: 'capitalize' }}>Spacer: {item.spacer}</span>}
                    <span style={{ ...BODY, fontSize: 11, color: '#9A8573' }}>Charm: {item.includeCharm !== false ? 'Included' : 'Excluded'}</span>
                    {item.remark && <span style={{ ...BODY, fontSize: 11, color: '#9A8573', width: '100%' }}>Note: {item.remark}</span>}
                  </div>
                )}
              </div>
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

        {/* Order summary + promo + proceed */}
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5DDD5', padding: '24px', boxShadow: '0 8px 40px -16px rgba(101,70,46,0.15)' }}>

          {/* Guest email — only shown after session resolves and user is not logged in */}
          {sessionEmail === null && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 8 }}>Email Address</label>
              <input
                type="email"
                value={guestEmail}
                onChange={e => { setGuestEmail(e.target.value); setPromoError(null) }}
                placeholder="you@example.com"
                style={{ ...BODY, width: '100%', padding: '10px 14px', border: '1px solid #E5DDD5', background: '#FDFAF7', fontSize: 13, color: '#4A3A32', outline: 'none', borderRadius: 8, boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* Promo code */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 8 }}>Promo Code</label>
            {appliedPromo ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F6F1EB', border: '1px solid #E5DDD5', borderRadius: 8 }}>
                <span style={{ ...BODY, fontSize: 12, color: '#4A3A32', fontWeight: 600, letterSpacing: '0.06em' }}>{appliedPromo.code} — {appliedPromo.discountLabel}</span>
                <button type="button" onClick={async () => {
                  setAppliedPromo(null)
                  if (clientSecret) {
                    const piId = clientSecret.split('_secret_')[0]
                    const res = await fetch('/api/checkout/apply-discount', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentIntentId: piId, code: '', email: effectiveEmail }) })
                    if (res.ok) {
                      const d = await res.json()
                      setAmountCents(d.amountCents); setShippingFeeCents(d.shippingFeeCents)
                      // key={amountCents} on EmbeddedPaymentForm triggers clean remount
                    }
                  }
                }} style={{ ...BODY, fontSize: 11, color: '#9A8573', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text" value={promoInput} onChange={e => { setPromoInput(e.target.value); setPromoError(null) }}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                    placeholder="Enter code"
                    style={{ ...BODY, flex: 1, padding: '10px 14px', border: '1px solid #E5DDD5', background: '#FDFAF7', fontSize: 13, color: '#4A3A32', outline: 'none', borderRadius: 8 }}
                  />
                  <button
                    type="button" onClick={applyPromo} disabled={promoLoading || !promoInput.trim() || !someChecked}
                    style={{ ...BODY, padding: '0 20px', borderRadius: 8, border: `1px solid ${GOLD}`, background: 'transparent', color: GOLD, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: promoLoading || !promoInput.trim() ? 'not-allowed' : 'pointer', opacity: promoLoading || !promoInput.trim() ? 0.5 : 1 }}
                  >
                    {promoLoading ? '…' : 'Apply'}
                  </button>
                </div>
                {promoError && <p style={{ ...BODY, fontSize: 11, color: '#C0392B', marginTop: 6 }}>{promoError}</p>}
              </>
            )}
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ ...BODY, fontSize: 12, color: '#7A5B45' }}>Subtotal ({selectedCount} item{selectedCount !== 1 ? 's' : ''})</span>
            <span style={{ ...SERIF, fontSize: 17, color: '#3D2B1F' }}>{format(selectedSubtotalCents / 100)}</span>
          </div>
          {appliedPromo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ ...BODY, fontSize: 12, color: '#7A9A7A' }}>Discount ({appliedPromo.code})</span>
              <span style={{ ...BODY, fontSize: 13, color: '#5A8A5A', fontWeight: 600 }}>−{format(appliedPromo.discountCents / 100)}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid #F0E8DF', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <span style={{ ...SERIF, fontSize: 16, color: '#3D2B1F' }}>Total</span>
              <p style={{ ...BODY, fontSize: 10, color: '#9A8573', marginTop: 3 }}>Free SG/MY delivery · Int&apos;l shipping calculated at checkout</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ ...SERIF, fontSize: 26, fontWeight: 300, color: '#3D2B1F', display: 'block' }}>{format(displayTotalCents / 100)}</span>
              {currency !== 'SGD' && <span style={{ ...BODY, fontSize: 10, color: '#B0A090' }}>Billed in SGD at checkout</span>}
            </div>
          </div>

          {/* Checkout form (shop/combined) or proceed button */}
          {clientSecret ? (
            <EmbeddedPaymentForm
              key={amountCents}
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
              showPromoCode={false}
            />
          ) : (
            <>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || !someChecked}
                style={{ ...BODY, width: '100%', padding: '14px', borderRadius: 999, background: someChecked ? '#4A3A32' : '#C5B8AD', border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', cursor: checkoutLoading || !someChecked ? 'not-allowed' : 'pointer', opacity: checkoutLoading ? 0.6 : 1, transition: 'background 0.25s' }}
              >
                {checkoutLoading ? 'Please wait…' : 'Proceed to Payment ✦'}
              </button>
              {checkoutError && <p style={{ ...BODY, fontSize: 11, color: '#E07070', textAlign: 'center', marginTop: 12 }}>{checkoutError}</p>}
            </>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/shop" style={{ ...BODY, fontSize: 11, color: '#9A8573', textDecoration: 'none' }}>← Continue Shopping</Link>
          <span style={{ color: '#D9CEC5', margin: '0 8px' }}>·</span>
          <Link href="/energy-quiz" style={{ ...BODY, fontSize: 11, color: '#9A8573', textDecoration: 'none' }}>✦ Analyze Your Energy</Link>
        </div>

      </section>
    </main>
  )
}
