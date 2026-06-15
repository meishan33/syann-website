import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const PRICE_BASE_CENTS = 18800   // SGD 188.00 — update before going live

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  })

  try {
    const { resultId, spacer, includeCharm, remark, email, userId, imageUrl, analysisSummary, savedAddress } = await req.json()

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
                analysisSummary && analysisSummary.slice(0, 200),
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
      mode: 'payment',
      phone_number_collection: { enabled: true },
      // Only collect shipping if user didn't pick a saved address
      ...(!savedAddress ? { shipping_address_collection: { allowed_countries: ['SG'] } } : {}),
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
