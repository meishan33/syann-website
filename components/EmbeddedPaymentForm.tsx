'use client'

import { useCallback, useRef, useState } from 'react'
import {
  Elements,
  AddressElement,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import { getStripe } from '@/lib/stripe-client'
import { useCurrency } from '@/context/CurrencyContext'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

type DefaultAddress = {
  name?: string | null; phone?: string | null
  line1?: string | null; line2?: string | null
  city?: string | null; state?: string | null
  postal_code?: string | null; country?: string | null
} | null

type Props = {
  clientSecret: string
  initialAmountCents: number
  initialShippingFeeCents: number
  defaultEmail?: string | null
  defaultAddress?: DefaultAddress
  returnUrlPath: string
}

const LABEL: React.CSSProperties = { ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }
const INPUT: React.CSSProperties = { ...BODY, width: '100%', padding: '13px 16px', border: '1px solid #E5DDD5', background: '#FDFAF7', fontSize: 13, color: '#4A3A32', outline: 'none', borderRadius: 8, boxSizing: 'border-box' }

export default function EmbeddedPaymentForm(props: Props) {
  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret: props.clientSecret,
        // Stripe Elements render inside a sandboxed iframe, so the page's own
        // @import'd font isn't visible to it — it has to be passed explicitly.
        fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap' }],
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: GOLD,
            colorText: '#4A3A32',
            colorTextSecondary: '#9A8573',
            colorBackground: '#FDFAF7',
            colorDanger: '#C0392B',
            fontFamily: "'Montserrat', sans-serif",
            fontSizeBase: '13px',
            spacingUnit: '3px',
            borderRadius: '8px',
          },
          rules: {
            '.Label': { fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A8573', marginBottom: '4px' },
            '.Input': { padding: '10px 12px', border: '1px solid #E5DDD5', boxShadow: 'none' },
            '.Input:focus': { border: '1px solid #B08B57', boxShadow: '0 0 0 1px rgba(176,139,87,0.2)' },
            '.Tab': { padding: '8px 12px', border: '1px solid #E5DDD5' },
          },
        },
      }}
    >
      <PaymentFormInner {...props} />
    </Elements>
  )
}

function PaymentFormInner({ clientSecret, initialAmountCents, initialShippingFeeCents, defaultEmail, defaultAddress, returnUrlPath }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const { format } = useCurrency()

  const [amountCents, setAmountCents] = useState(initialAmountCents)
  const [shippingFeeCents, setShippingFeeCents] = useState(initialShippingFeeCents)
  const [updatingShipping, setUpdatingShipping] = useState(false)
  const [email, setEmail] = useState(defaultEmail || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const paymentIntentId = clientSecret.split('_secret_')[0]
  const baseAmountCents = amountCents - shippingFeeCents

  const handleAddressChange = useCallback((event: StripeAddressElementChangeEvent) => {
    const country = event.value?.address?.country
    if (!country) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setUpdatingShipping(true)
      try {
        const res = await fetch('/api/checkout/update-shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId, country }),
        })
        const data = await res.json()
        if (res.ok) {
          setAmountCents(data.amountCents)
          setShippingFeeCents(data.shippingFeeCents)
        }
      } catch {
        // Non-fatal — keeps the last known amount; Stripe's own confirm step
        // will still use whatever amount is currently set on the PaymentIntent.
      } finally {
        setUpdatingShipping(false)
      }
    }, 500)
  }, [paymentIntentId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    if (!defaultEmail && !email.trim()) {
      setError('Email is required.')
      return
    }
    setSubmitting(true)
    setError(null)

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${returnUrlPath}`,
        ...(email ? { receipt_email: email } : {}),
      },
    })

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.')
      setSubmitting(false)
    }
    // On success Stripe redirects to return_url — nothing further to do here.
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!defaultEmail && (
        <div>
          <label style={LABEL}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={INPUT} />
        </div>
      )}

      <div>
        <label style={LABEL}>Shipping Address</label>
        <AddressElement
          options={{
            mode: 'shipping',
            fields: { phone: 'always' },
            ...(defaultAddress ? {
              defaultValues: {
                name: defaultAddress.name || '',
                phone: defaultAddress.phone || '',
                address: {
                  line1: defaultAddress.line1 || '',
                  line2: defaultAddress.line2 || '',
                  city: defaultAddress.city || '',
                  state: defaultAddress.state || '',
                  postal_code: defaultAddress.postal_code || '',
                  country: defaultAddress.country || 'SG',
                },
              },
            } : {}),
          }}
          onChange={handleAddressChange}
        />
      </div>

      <div>
        <label style={LABEL}>Payment Details</label>
        <PaymentElement />
      </div>

      {/* Price breakdown */}
      <div style={{ background: '#F6F1EB', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ ...BODY, fontSize: 12, color: '#7A5B45' }}>Subtotal</span>
          <span style={{ ...BODY, fontSize: 12, color: '#4A3A32' }}>{format(baseAmountCents / 100)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ ...BODY, fontSize: 12, color: '#7A5B45' }}>Shipping</span>
          <span style={{ ...BODY, fontSize: 12, color: '#4A3A32' }}>
            {updatingShipping ? 'Calculating…' : shippingFeeCents === 0 ? 'Free' : format(shippingFeeCents / 100)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #E5DDD5' }}>
          <span style={{ ...SERIF, fontSize: 15, fontWeight: 400, color: '#4A3A32' }}>Total</span>
          <span style={{ ...SERIF, fontSize: 18, fontWeight: 400, color: '#4A3A32' }}>{format(amountCents / 100)}</span>
        </div>
      </div>

      {error && <p style={{ ...BODY, fontSize: 12, color: '#C0392B', margin: 0 }}>{error}</p>}

      <button
        type="submit"
        disabled={!stripe || !elements || submitting || updatingShipping}
        style={{
          ...BODY, padding: '14px', borderRadius: 999, background: '#4A3A32', border: 'none', color: '#fff',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase',
          cursor: (!stripe || submitting) ? 'not-allowed' : 'pointer', opacity: (!stripe || submitting) ? 0.6 : 1,
        }}
      >
        {submitting ? 'Processing…' : `Pay ${format(amountCents / 100)}`}
      </button>
    </form>
  )
}
