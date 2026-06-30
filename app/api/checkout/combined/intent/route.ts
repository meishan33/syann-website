import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getShippingFeeCents } from '@/lib/shipping'

const BRACELET_BASE_CENTS = 5900

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })

  try {
    const { resultId, spacer, includeCharm, remark: rawRemark, shopItems, email, userId, savedAddress } = await req.json()
    const remark = (rawRemark || '').slice(0, 300)

    // Prevent re-purchasing an already-paid bracelet design
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('result_id', resultId)
      .eq('payment_status', 'paid')
      .maybeSingle()
    if (existingOrder) {
      return NextResponse.json({ error: 'This bracelet design has already been purchased.' }, { status: 409 })
    }

    // Validate shop item prices server-side
    let shopSubtotalCents = 0
    let resolvedShopItems: { productId: string; name: string; price: number; quantity: number }[] = []
    if (shopItems && shopItems.length > 0) {
      const productIds = shopItems.map((i: { productId: string }) => i.productId)
      const { data: products } = await supabaseAdmin
        .from('shop_products')
        .select('id, name, price')
        .in('id', productIds)
        .eq('active', true)

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
    const baseAmountCents = BRACELET_BASE_CENTS + shopSubtotalCents
    const totalCents = baseAmountCents + shippingFeeCents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'sgd',
      ...(email ? { receipt_email: email } : {}),
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_type: 'combined',
        resultId, spacer, includeCharm: String(includeCharm !== false),
        remark: remark || '',
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
