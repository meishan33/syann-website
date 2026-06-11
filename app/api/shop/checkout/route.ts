import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { CartItem } from '@/lib/cart'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  })

  try {
    const { items, email, userId, savedAddress } = await req.json() as {
      items: CartItem[]
      email: string | null
      userId: string | null
      savedAddress: object | null
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      ...(email ? { customer_email: email } : {}),
      line_items: items.map(item => ({
        price_data: {
          currency: 'sgd',
          product_data: {
            name: item.name,
            ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      phone_number_collection: { enabled: true },
      ...(!savedAddress ? { shipping_address_collection: { allowed_countries: ['SG'] } } : {}),
      metadata: {
        order_type: 'shop',
        userId: userId || '',
        items: JSON.stringify(items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity }))),
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
