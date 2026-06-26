import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getShippingFeeCents } from '@/lib/shipping'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  })

  try {
    const { items, email, userId, savedAddress } = await req.json() as {
      items: { productId: string; quantity: number }[]
      email: string | null
      userId: string | null
      savedAddress: { country?: string } | null
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Look up prices from the database — never trust client-supplied prices
    const productIds = items.map(i => i.productId)
    const { data: products, error: productError } = await supabaseAdmin
      .from('shop_products')
      .select('id, name, price, image_url')
      .in('id', productIds)
      .eq('active', true)

    if (productError || !products) {
      return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
    }

    const productMap = Object.fromEntries(products.map(p => [p.id, p]))

    let baseAmountCents = 0
    for (const item of items) {
      const product = productMap[item.productId]
      if (!product) return NextResponse.json({ error: `Product ${item.productId} not found or inactive` }, { status: 400 })
      baseAmountCents += Math.round(product.price * 100) * item.quantity
    }

    const geoCountry = req.headers.get('x-vercel-ip-country')
    const shippingCountry = savedAddress?.country || geoCountry
    const shippingFeeCents = getShippingFeeCents(shippingCountry)
    const amount = baseAmountCents + shippingFeeCents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'sgd',
      ...(email ? { receipt_email: email } : {}),
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_type: 'shop',
        userId: userId || '',
        baseAmountCents: String(baseAmountCents),
        items: JSON.stringify(items.map(i => ({
          productId: i.productId,
          name: productMap[i.productId]?.name ?? '',
          price: productMap[i.productId]?.price ?? 0,
          quantity: i.quantity,
        }))),
        savedAddress: savedAddress ? JSON.stringify(savedAddress) : '',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amountCents: amount,
      baseAmountCents,
      shippingFeeCents,
    })
  } catch (err: unknown) {
    console.error('Shop intent error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create payment intent'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
