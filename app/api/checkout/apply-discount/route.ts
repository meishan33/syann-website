import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const MIN_AMOUNT_CENTS = 50

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  })

  try {
    const { paymentIntentId, code, email } = await req.json() as {
      paymentIntentId: string
      code: string
      email: string | null
    }

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId is required' }, { status: 400 })
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
    const baseAmountCents = parseInt(intent.metadata?.baseAmountCents || '0', 10)
    const existingDiscountCents = parseInt(intent.metadata?.discountCents || '0', 10)
    // Reconstruct the live shipping fee from the current amount — this stays
    // correct no matter whether shipping or a discount was last applied.
    const shippingFeeCents = intent.amount - baseAmountCents + existingDiscountCents
    const subtotalCents = baseAmountCents + shippingFeeCents

    // Clearing the code (empty string) — just remove the discount.
    if (!code || !code.trim()) {
      const amount = Math.max(MIN_AMOUNT_CENTS, subtotalCents)
      await stripe.paymentIntents.update(paymentIntentId, {
        amount,
        metadata: { ...intent.metadata, discountCents: '0', discountCode: '' },
      })
      return NextResponse.json({ amountCents: amount, shippingFeeCents, discountCents: 0, discountCode: null })
    }

    if (!email) {
      return NextResponse.json({ error: 'Please enter your email before applying a code.' }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()
    const { data: discountRow } = await supabaseAdmin
      .from('discount_codes')
      .select('id, code, discount_type, discount_value, active, max_redemptions_per_customer')
      .eq('code', normalizedCode)
      .maybeSingle()

    if (!discountRow || !discountRow.active) {
      return NextResponse.json({ error: 'This code is invalid or no longer active.' }, { status: 400 })
    }

    const { count } = await supabaseAdmin
      .from('discount_code_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('code_id', discountRow.id)
      .eq('email', email.toLowerCase())

    if ((count ?? 0) >= discountRow.max_redemptions_per_customer) {
      return NextResponse.json({ error: 'You\'ve already used this code.' }, { status: 400 })
    }

    const rawDiscountCents = discountRow.discount_type === 'fixed'
      ? Math.round(Number(discountRow.discount_value) * 100)
      : Math.round((Number(discountRow.discount_value) / 100) * subtotalCents)

    const discountCents = Math.min(rawDiscountCents, subtotalCents - MIN_AMOUNT_CENTS)
    if (discountCents <= 0) {
      return NextResponse.json({ error: 'This code can\'t be applied to this order.' }, { status: 400 })
    }

    const amount = subtotalCents - discountCents

    await stripe.paymentIntents.update(paymentIntentId, {
      amount,
      metadata: { ...intent.metadata, discountCents: String(discountCents), discountCode: discountRow.code },
    })

    return NextResponse.json({ amountCents: amount, shippingFeeCents, discountCents, discountCode: discountRow.code })
  } catch (err: unknown) {
    console.error('Apply discount error:', err)
    const message = err instanceof Error ? err.message : 'Failed to apply discount'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
