'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  resultId: string
  spacer: string
  remark: string
  imageUrl: string | null
  weakElement: string | null
  strongElement: string | null
  analysisSummary: string | null
}

export default function CheckoutButton({ resultId, spacer, remark, imageUrl, weakElement, strongElement, analysisSummary }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const email = session?.user?.email ?? null
      const userId = session?.user?.id ?? null

      // Reuse saved default address if available
      let savedAddress = null
      if (session?.access_token) {
        const res = await fetch('/api/addresses', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const addrs = await res.json()
          if (addrs.length > 0) {
            const def = addrs.find((a: { is_default: boolean }) => a.is_default) ?? addrs[0]
            savedAddress = {
              name: def.name, phone: def.phone,
              line1: def.line1, line2: def.line2,
              city: def.city, state: def.state,
              postal_code: def.postal_code, country: def.country || 'MY',
            }
          }
        }
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId, spacer, remark, email, userId, imageUrl,
          weakElement, strongElement, analysisSummary, savedAddress,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout session')
      window.location.href = data.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{ fontFamily: "'Montserrat', sans-serif" }}
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#4A3A32] bg-[#4A3A32] px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-white transition-all duration-300 hover:bg-[#B08B57] hover:border-[#B08B57] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirecting to Payment…' : <>Confirm &amp; Pay <span aria-hidden="true">✦</span></>}
      </button>
      {error && (
        <p className="text-center text-[11px] text-red-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  )
}
