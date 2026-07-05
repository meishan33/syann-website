import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getShippingFeeCents } from '@/lib/shipping'

const QUIZ_BRACELET_CENTS   = 5900  // SGD 59.00 — Energy Quiz bracelet
const DESIGN_BRACELET_CENTS = 7900  // SGD 79.00 — Custom Design bracelet

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })

  try {
    const body = await req.json()
    const { shopItems, email, userId, savedAddress } = body

    // Accept new format (bracelets array) or legacy format (single resultId)
    const braceletInputs: { resultId: string; spacer: string; includeCharm: boolean; remark: string }[] =
      body.bracelets ?? (body.resultId
        ? [{ resultId: body.resultId, spacer: body.spacer ?? 'silver', includeCharm: body.includeCharm !== false, remark: body.remark ?? '' }]
        : [])

    if (!braceletInputs.length) {
      return NextResponse.json({ error: 'No bracelets specified.' }, { status: 400 })
    }

    // Validate each bracelet + compute price server-side
    let braceletSubtotalCents = 0
    const braceletDetails: { resultId: string; priceCents: number; spacer: string; includeCharm: boolean; remark: string }[] = []

    for (const b of braceletInputs) {
      const { data: existingOrder } = await supabaseAdmin
        .from('orders').select('id').eq('result_id', b.resultId).eq('payment_status', 'paid').maybeSingle()
      if (existingOrder) {
        return NextResponse.json({ error: 'One or more bracelet designs have already been purchased.' }, { status: 409 })
      }

      // Custom builder designs store beadSequence in crystal_explanations; quiz designs do not
      const { data: resultRow } = await supabaseAdmin
        .from('energy_quiz_results').select('crystal_explanations').eq('id', b.resultId).single()
      const isCustom = !!(resultRow?.crystal_explanations as { beadSequence?: unknown } | null)?.beadSequence
      const priceCents = isCustom ? DESIGN_BRACELET_CENTS : QUIZ_BRACELET_CENTS
      braceletSubtotalCents += priceCents
      braceletDetails.push({
        resultId: b.resultId,
        priceCents,
        spacer: b.spacer ?? 'silver',
        includeCharm: b.includeCharm !== false,
        remark: (b.remark || '').slice(0, 200),
      })
    }

    // Validate shop item prices server-side
    let shopSubtotalCents = 0
    let resolvedShopItems: { productId: string; name: string; price: number; quantity: number }[] = []
    if (shopItems && shopItems.length > 0) {
      const productIds = shopItems.map((i: { productId: string }) => i.productId)
      const { data: products } = await supabaseAdmin
        .from('shop_products').select('id, name, price').in('id', productIds).eq('active', true)

      const productMap = Object.fromEntries((products ?? []).map(p => [p.id, p]))
      for (const item of shopItems) {
        const product = productMap[item.productId]
        if (!product) return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
        shopSubtotalCents += Math.round(product.price * 100) * item.quantity
        resolvedShopItems.push({ productId: item.productId, name: product.name, price: product.price, quantity: item.quantity })
      }
    }

    const geoCountry = req.headers.get('x-vercel-ip-country')
    const shippingCountry = savedAddress?.country || geoCountry
    const shippingFeeCents = getShippingFeeCents(shippingCountry)
    const baseAmountCents = braceletSubtotalCents + shopSubtotalCents
    const totalCents = baseAmountCents + shippingFeeCents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'sgd',
      ...(email ? { receipt_email: email } : {}),
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_type: 'combined',
        braceletDetails: JSON.stringify(braceletDetails),
        // Legacy single-bracelet fields kept for backward compat
        resultId: braceletDetails.length === 1 ? braceletDetails[0].resultId : '',
        spacer: braceletDetails.length === 1 ? braceletDetails[0].spacer : '',
        includeCharm: braceletDetails.length === 1 ? String(braceletDetails[0].includeCharm) : '',
        remark: braceletDetails.length === 1 ? braceletDetails[0].remark : '',
        userId: userId || '',
        baseAmountCents: String(baseAmountCents),
        items: JSON.stringify(resolvedShopItems),
        savedAddress: savedAddress ? JSON.stringify(savedAddress) : '',
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, amountCents: totalCents, baseAmountCents, shippingFeeCents })
  } catch (err: unknown) {
    console.error('Combined intent error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to create payment intent' }, { status: 500 })
  }
}
