'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import EmbeddedPaymentForm from '@/components/EmbeddedPaymentForm'

const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

type Props = {
  resultId: string
  spacer: string
  remark: string
  includeCharm: boolean
}

type SavedAddress = {
  name: string | null; phone: string | null
  line1: string; line2: string | null
  city: string | null; state: string | null
  postal_code: string | null; country: string | null
} | null

export default function CheckoutButton({ resultId, spacer, remark, includeCharm }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [amountCents, setAmountCents] = useState(0)
  const [shippingFeeCents, setShippingFeeCents] = useState(0)
  const [email, setEmail] = useState<string | null>(null)
  const [savedAddress, setSavedAddress] = useState<SavedAddress>(null)

  useEffect(() => {
    let cancelled = false

    async function createIntent() {
      setLoading(true)
      setError(null)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const sessionEmail = session?.user?.email ?? null
        const userId = session?.user?.id ?? null

        let address: SavedAddress = null
        if (session?.access_token) {
          const res = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${session.access_token}` } })
          if (res.ok) {
            const addrs = await res.json()
            if (addrs.length > 0) {
              const def = addrs.find((a: { is_default: boolean }) => a.is_default) ?? addrs[0]
              address = {
                name: def.name, phone: def.phone,
                line1: def.line1, line2: def.line2,
                city: def.city, state: def.state,
                postal_code: def.postal_code, country: def.country || 'MY',
              }
            }
          }
        }

        const res = await fetch('/api/checkout/intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resultId, spacer, includeCharm, remark, email: sessionEmail, userId, savedAddress: address }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to start checkout')
        if (cancelled) return

        setClientSecret(data.clientSecret)
        setAmountCents(data.amountCents)
        setShippingFeeCents(data.shippingFeeCents)
        setEmail(sessionEmail)
        setSavedAddress(address)
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    createIntent()
    return () => { cancelled = true }
  }, [resultId, spacer, includeCharm, remark])

  if (loading) {
    return <p style={{ ...BODY, fontSize: 11, letterSpacing: '0.28em', color: GOLD, textTransform: 'uppercase', textAlign: 'center', padding: '20px 0' }}>Preparing checkout…</p>
  }

  if (error) {
    return <p style={{ ...BODY, fontSize: 12, color: '#C0392B', textAlign: 'center' }}>{error}</p>
  }

  if (!clientSecret) return null

  return (
    <EmbeddedPaymentForm
      clientSecret={clientSecret}
      initialAmountCents={amountCents}
      initialShippingFeeCents={shippingFeeCents}
      defaultEmail={email}
      defaultAddress={savedAddress}
      returnUrlPath={`/payment/success?result=${resultId}`}
    />
  )
}
