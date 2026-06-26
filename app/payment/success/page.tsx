import Stripe from 'stripe'
import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'
const GOLD_FAINT = 'rgba(176,139,87,0.35)'

type Props = {
  searchParams: Promise<{ session_id?: string; payment_intent?: string; result?: string }>
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { session_id, payment_intent, result } = await searchParams

  let customerName: string | null = null
  let crystalNames: string[] = []
  let totalAmount: number | null = null

  if ((session_id || payment_intent) && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })
      let resultId: string | null | undefined = result

      if (payment_intent) {
        const intent = await stripe.paymentIntents.retrieve(payment_intent)
        if (intent.status === 'succeeded') {
          customerName = intent.shipping?.name ?? null
          totalAmount = intent.amount ? intent.amount / 100 : null
          resultId = resultId || intent.metadata?.resultId
        }
      } else if (session_id) {
        // Legacy Checkout Session flow — kept as a safety net for any sessions
        // created just before this app switched to embedded PaymentIntent checkout.
        const session = await stripe.checkout.sessions.retrieve(session_id)
        if (session.payment_status === 'paid') {
          customerName = session.customer_details?.name ?? null
          totalAmount = session.amount_total ? session.amount_total / 100 : null
          resultId = resultId || session.metadata?.resultId
        }
      }

      if (resultId) {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SECRET_KEY!
        )
        const { data } = await supabase
          .from('energy_quiz_results')
          .select('crystal_names')
          .eq('id', resultId)
          .single()
        crystalNames = data?.crystal_names ?? []
      }
    } catch {
      // Non-fatal — still show success page
    }
  }

  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>

        {/* Gold diamond */}
        <svg style={{ margin: '0 auto 28px', display: 'block' }} width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <polygon points="16,0 32,16 16,32 0,16" fill={GOLD} opacity="0.75" />
        </svg>

        <p style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: GOLD, margin: '0 0 16px' }}>
          Order Confirmed
        </p>

        <h1 style={{ ...SERIF, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 300, lineHeight: 1.2, color: '#4A3A32', margin: '0 0 20px' }}>
          Thank You{customerName ? `, ${customerName.split(' ')[0]}` : ''}
        </h1>

        {/* Ornamental divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ height: 1, width: 48, background: `linear-gradient(to right, transparent, ${GOLD_FAINT})` }} />
          <svg width="6" height="6" viewBox="0 0 8 8" aria-hidden="true">
            <polygon points="4,0 8,4 4,8 0,4" fill={GOLD} opacity="0.65" />
          </svg>
          <div style={{ height: 1, width: 48, background: `linear-gradient(to left, transparent, ${GOLD_FAINT})` }} />
        </div>

        {/* Crystal names */}
        {crystalNames.length > 0 && (
          <div style={{ background: '#FDFAF7', border: '1px solid #E5DDD5', borderRadius: 16, padding: '16px 24px', marginBottom: 24 }}>
            <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD, margin: '0 0 6px' }}>
              Your Crystals
            </p>
            <p style={{ ...SERIF, fontSize: 16, fontWeight: 300, color: '#4A3A32', margin: 0 }}>
              {crystalNames.join(' · ')}
            </p>
            {totalAmount && (
              <p style={{ ...BODY, fontSize: 12, color: '#9A8573', margin: '8px 0 0' }}>
                S$ {totalAmount.toFixed(2)} — paid
              </p>
            )}
          </div>
        )}

        <p style={{ ...BODY, fontSize: 13, lineHeight: 1.85, color: '#7A5B45', margin: '0 0 8px' }}>
          Your crystal bracelet is being prepared with care.
        </p>
        <p style={{ ...BODY, fontSize: 13, lineHeight: 1.85, color: '#7A5B45', margin: '0 0 36px' }}>
          We'll be in touch soon with your order update.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/account?tab=orders"
            style={{ ...BODY, display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, background: '#4A3A32', padding: '12px 28px', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#fff', textDecoration: 'none' }}
          >
            View My Orders
          </Link>
          <Link
            href="/"
            style={{ ...BODY, display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, border: '1px solid #D9C4A8', padding: '12px 28px', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#4A3A32', textDecoration: 'none', background: 'transparent' }}
          >
            Return Home
          </Link>
        </div>

      </div>
    </main>
  )
}
