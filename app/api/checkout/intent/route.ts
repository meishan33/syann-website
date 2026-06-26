import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getShippingFeeCents } from '@/lib/shipping'

const PRICE_BASE_CENTS = 5900   // SGD 59.00

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  })

  try {
    const { resultId, spacer, includeCharm, remark: rawRemark, email, userId, savedAddress } = await req.json()
    const remark = (rawRemark || '').slice(0, 300)

    // Prevent buying the same bracelet design twice (e.g. user pays, goes back,
    // pays again before the first attempt completes)
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('result_id', resultId)
      .eq('payment_status', 'paid')
      .maybeSingle()
    if (existingOrder) {
      return NextResponse.json({ error: 'This bracelet design has already been purchased.' }, { status: 409 })
    }

    const geoCountry = req.headers.get('x-vercel-ip-country')
    const shippingCountry = savedAddress?.country || geoCountry
    const shippingFeeCents = getShippingFeeCents(shippingCountry)
    const amount = PRICE_BASE_CENTS + shippingFeeCents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'sgd',
      ...(email ? { receipt_email: email } : {}),
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_type: 'bracelet',
        resultId, spacer, includeCharm: String(includeCharm !== false),
        remark: remark || '', userId: userId || '',
        baseAmountCents: String(PRICE_BASE_CENTS),
        savedAddress: savedAddress ? JSON.stringify(savedAddress) : '',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amountCents: amount,
      baseAmountCents: PRICE_BASE_CENTS,
      shippingFeeCents,
    })
  } catch (err: unknown) {
    console.error('Stripe intent error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create payment intent'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
