import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getShippingFeeCents } from '@/lib/shipping'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  })

  try {
    const { paymentIntentId, country } = await req.json()
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId is required' }, { status: 400 })
    }

    // Re-derive the base price server-side from the PaymentIntent's own metadata —
    // never trust a client-supplied base amount.
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
    const baseAmountCents = parseInt(intent.metadata?.baseAmountCents || '0', 10)
    const shippingFeeCents = getShippingFeeCents(country)
    const amount = baseAmountCents + shippingFeeCents

    const updated = await stripe.paymentIntents.update(paymentIntentId, { amount })

    return NextResponse.json({
      amountCents: updated.amount,
      baseAmountCents,
      shippingFeeCents,
    })
  } catch (err: unknown) {
    console.error('Update shipping error:', err)
    const message = err instanceof Error ? err.message : 'Failed to update shipping'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
