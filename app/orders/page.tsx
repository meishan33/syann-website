'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useCurrency } from '@/context/CurrencyContext'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'
const DARK = '#4A3A32'

type Order = {
  id: string
  order_number: number | null
  customer_name: string
  recommended_crystal_names: string[]
  total_amount: number
  payment_status: string
  fulfillment_status: string
  created_at: string
  generated_image_url: string | null
  weak_element: string | null
  strong_element: string | null
  spacer_choice: string | null
  logo_charm: boolean | null
  shipping_address: string | null
  customer_phone: string | null
  remark: string | null
  analysis_summary: string | null
  current_feelings: string | null
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999, background: color + '22', color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const { format } = useCurrency()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.refreshSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/account'); return }

      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) setOrders(await res.json())
      setLoading(false)
    })
  }, [router])

  const fulfillmentColor = (s: string) =>
    s === 'fulfilled' ? '#7CB98A' : s === 'processing' ? GOLD : '#9A8573'

  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', ...BODY }}>

      {/* Banner */}
      <section style={{ background: '#FDFAF7', borderBottom: '1px solid #EDE8DF', padding: '48px 24px 40px', textAlign: 'center' }}>
        <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.36em', color: GOLD, textTransform: 'uppercase', margin: '0 0 12px' }}>My Account</p>
        <h1 style={{ ...SERIF, fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 300, color: DARK, margin: '0 0 10px', lineHeight: 1 }}>My Orders</h1>
        <div style={{ width: 32, height: 1.5, background: GOLD, margin: '0 auto' }} />
      </section>

      {/* Content */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 72px' }}>
        {loading ? (
          <p style={{ ...BODY, fontSize: 11, letterSpacing: '0.28em', color: GOLD, textTransform: 'uppercase', textAlign: 'center', paddingTop: 60 }}>Loading…</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C4B5A8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20 }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <p style={{ ...SERIF, fontSize: 24, fontWeight: 300, color: DARK, margin: '0 0 10px' }}>No Orders Yet</p>
            <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#9A8573', margin: '0 0 28px', lineHeight: 1.7 }}>
              Your crystal bracelet orders will appear here once you've made a purchase.
            </p>
            <Link href="/energy-quiz"
              style={{ ...BODY, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: DARK, color: '#F6F1EB', borderRadius: 999, textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase' }}>
              Discover Your Bracelet
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order, idx) => (
              <div key={order.id} style={{ background: '#FDFAF7', border: '1px solid #E5DDD5', borderRadius: 16, padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>

                  {/* Left */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {order.generated_image_url && (
                    <div style={{ position: 'relative', width: 72, height: 72, borderRadius: 12, overflow: 'hidden', border: '1px solid #E5DDD5', flexShrink: 0 }}>
                      <Image src={order.generated_image_url} alt="Crystal bracelet" fill sizes="72px" style={{ objectFit: 'contain' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ ...BODY, fontSize: 10, fontWeight: 700, color: '#C4B5A8', letterSpacing: '0.1em' }}>#{orders.length - idx}</span>
                      <span style={{ ...BODY, fontSize: 10, color: '#B0A090', letterSpacing: '0.06em' }}>
                        {new Date(order.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p style={{ ...SERIF, fontSize: 18, fontWeight: 300, color: DARK, margin: 0 }}>
                      Crystal Bracelet
                    </p>

                    <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#7A6355', margin: 0, lineHeight: 1.6 }}>
                      {order.recommended_crystal_names?.join(' · ') || '—'}
                    </p>
                    {(order.weak_element || order.strong_element) && (
                      <p style={{ ...BODY, fontSize: 11, color: '#B08B57', margin: 0, letterSpacing: '0.04em' }}>
                        Weak: {order.weak_element || '—'} · Strong: {order.strong_element || '—'}
                      </p>
                    )}
                    <p style={{ ...BODY, fontSize: 11, color: '#7A6355', margin: 0, letterSpacing: '0.04em' }}>
                      {order.spacer_choice && <span style={{ textTransform: 'capitalize' }}>Spacer: {order.spacer_choice}</span>}
                      {order.spacer_choice && ' · '}
                      Logo Charm: {order.logo_charm === false ? 'Excluded' : 'Included'}
                    </p>
                  </div>
                  </div>

                  {/* Right */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <p style={{ ...SERIF, fontSize: 20, fontWeight: 400, color: DARK, margin: 0 }}>
                      {format(Number(order.total_amount))}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <StatusBadge
                        label={order.payment_status}
                        color={order.payment_status === 'paid' ? '#7CB98A' : '#C0392B'}
                      />
                      <StatusBadge
                        label={order.fulfillment_status}
                        color={fulfillmentColor(order.fulfillment_status)}
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery + remarks */}
                {(order.shipping_address || order.customer_phone || order.remark) && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #EDE8DF', display: 'flex', flexWrap: 'wrap', gap: '10px 32px' }}>
                    {order.shipping_address && (
                      <div>
                        <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 3px' }}>Delivery Address</p>
                        <p style={{ ...BODY, fontSize: 12, color: DARK, margin: 0 }}>{order.shipping_address}</p>
                      </div>
                    )}
                    {order.customer_phone && (
                      <div>
                        <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 3px' }}>Phone</p>
                        <p style={{ ...BODY, fontSize: 12, color: DARK, margin: 0 }}>{order.customer_phone}</p>
                      </div>
                    )}
                    {order.remark && (
                      <div>
                        <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 3px' }}>Remarks</p>
                        <p style={{ ...BODY, fontSize: 12, color: DARK, margin: 0 }}>{order.remark}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Elemental analysis */}
                {order.analysis_summary && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #EDE8DF' }}>
                    <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 6px' }}>Your Elemental Analysis</p>
                    {order.analysis_summary.split('\n\n').map((block, i) => {
                      const lines = block.split('\n').filter(Boolean)
                      const isBulletBlock = lines.length > 0 && lines.every(l => l.trim().startsWith('•'))
                      if (isBulletBlock) {
                        return (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                            {lines.map((l, j) => (
                              <p key={j} style={{ ...BODY, fontSize: 12, lineHeight: 1.7, color: '#7A6355', margin: 0 }}>{l.replace(/^•\s*/, '• ')}</p>
                            ))}
                          </div>
                        )
                      }
                      return <p key={i} style={{ ...BODY, fontSize: 12, lineHeight: 1.7, color: '#7A6355', margin: 0 }}>{block}</p>
                    })}
                  </div>
                )}

                {/* How they were feeling */}
                {order.current_feelings && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #EDE8DF' }}>
                    <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 6px' }}>How You Were Feeling</p>
                    <p style={{ ...BODY, fontSize: 12, lineHeight: 1.7, color: '#7A6355', margin: 0 }}>{order.current_feelings}</p>
                  </div>
                )}

                {/* Order ID */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #EDE8DF' }}>
                  <p style={{ ...BODY, fontSize: 10, color: '#C4B5A8', margin: 0, letterSpacing: '0.06em' }}>
                    Order ID: <span style={{ fontWeight: 500, color: '#9A8573' }}>#{order.order_number ?? order.id}</span>
                  </p>
                </div>
              </div>
            ))}

            <p style={{ ...BODY, fontSize: 11, color: '#B0A090', textAlign: 'center', letterSpacing: '0.1em', paddingTop: 8 }}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
            </p>
          </div>
        )}
      </section>

    </main>
  )
}
