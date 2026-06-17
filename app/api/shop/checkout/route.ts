import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

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
      savedAddress: object | null
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

    const lineItems = items.map(item => {
      const product = productMap[item.productId]
      if (!product) throw new Error(`Product ${item.productId} not found or inactive`)
      return {
        price_data: {
          currency: 'sgd',
          product_data: {
            name: product.name,
            ...(product.image_url ? { images: [product.image_url] } : {}),
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      ...(email ? { customer_email: email } : {}),
      line_items: lineItems,
      mode: 'payment',
      phone_number_collection: { enabled: true },
      ...(!savedAddress ? { shipping_address_collection: { allowed_countries: ['SG'] } } : {}),
      metadata: {
        order_type: 'shop',
        userId: userId || '',
        items: JSON.stringify(items.map(i => ({
          productId: i.productId,
          name: productMap[i.productId]?.name ?? '',
          price: productMap[i.productId]?.price ?? 0,
          quantity: i.quantity,
        }))),
        savedAddress: savedAddress ? JSON.stringify(savedAddress) : '',
      },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop/cart`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('Shop checkout error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
