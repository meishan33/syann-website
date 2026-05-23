import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

// ── Pricing (in sen — smallest MYR unit) — update before going live ──────────
const PRICE_BASE_CENTS = 18800   // RM 188.00
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
  }

  try {
    const { resultId, spacer, remark } = await req.json()

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: 'SYANN Crystal Bracelet',
              description: `Spacer: ${spacer}${remark ? ` · Note: ${remark}` : ''}`,
            },
            unit_amount: PRICE_BASE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: { resultId, spacer, remark: remark || '' },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment?result=${resultId}&spacer=${spacer}${remark ? `&remark=${encodeURIComponent(remark)}` : ''}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('Stripe checkout error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
