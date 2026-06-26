import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getShippingFeeCents, ALL_SHIPPING_COUNTRIES } from '@/lib/shipping'

const PRICE_BASE_CENTS = 5900   // SGD 59.00

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  })

  try {
    const { resultId, spacer, includeCharm, remark: rawRemark, email, userId, imageUrl, savedAddress } = await req.json()
    const remark = (rawRemark || '').slice(0, 300)

    // Prevent buying the same bracelet design twice (e.g. user pays, goes back,
    // pays again on a fresh Stripe session before the first one expires)
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('result_id', resultId)
      .eq('payment_status', 'paid')
      .maybeSingle()
    if (existingOrder) {
      return NextResponse.json({ error: 'This bracelet design has already been purchased.' }, { status: 409 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Prefer the known destination (saved address) over IP-detected browsing location
    const geoCountry = req.headers.get('x-vercel-ip-country')
    const shippingCountry = savedAddress?.country || geoCountry
    const shippingFeeCents = getShippingFeeCents(shippingCountry)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      ...(email ? { customer_email: email } : {}),
      line_items: [
        {
          price_data: {
            currency: 'sgd',
            product_data: {
              name: 'SYANN Crystal Bracelet',
              description: [
                `Spacer: ${spacer}`,
                `Charm: ${includeCharm === false ? 'excluded' : 'included'}`,
                remark && `Note: ${remark}`,
              ].filter(Boolean).join(' · '),
              ...(imageUrl ? { images: [imageUrl] } : {}),
            },
            unit_amount: PRICE_BASE_CENTS,
          },
          quantity: 1,
        },
      ],
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: shippingFeeCents, currency: 'sgd' },
          display_name: shippingFeeCents === 0 ? 'Free Shipping' : 'Standard Shipping',
        },
      }],
      mode: 'payment',
      phone_number_collection: { enabled: true },
      // Only collect shipping if user didn't pick a saved address
      ...(!savedAddress ? { shipping_address_collection: { allowed_countries: ALL_SHIPPING_COUNTRIES } } : {}),
      metadata: {
        resultId, spacer, includeCharm: String(includeCharm !== false),
        remark: remark || '', userId: userId || '',
        savedAddress: savedAddress ? JSON.stringify(savedAddress) : '',
      },
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
