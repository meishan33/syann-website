import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const { resultId, spacer, remark } = session.metadata ?? {}

    // Look up crystal names from the quiz result
    const { data: result } = await supabaseAdmin
      .from('energy_quiz_results')
      .select('crystal_names, user_name, cached_image_url')
      .eq('id', resultId)
      .single()

    // Avoid duplicate orders if webhook fires more than once
    const { data: existing } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ received: true })
    }

    type ShippingAddr = { line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null }
    const addr = (session as unknown as { shipping_details?: { address?: ShippingAddr } }).shipping_details?.address
    const shippingAddress = addr
      ? [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country]
          .filter(Boolean)
          .join(', ')
      : null

    const { error: insertError } = await supabaseAdmin.from('orders').insert({
      customer_name: session.customer_details?.name || result?.user_name || null,
      customer_email: session.customer_details?.email || null,
      shipping_address: shippingAddress,
      generated_image_url: result?.cached_image_url || null,
      recommended_crystal_names: result?.crystal_names ?? [],
      total_amount: (session.amount_total ?? 0) / 100,
      payment_status: 'paid',
      fulfillment_status: 'processing',
      stripe_session_id: session.id,
      result_id: resultId || null,
      spacer_choice: spacer || null,
      remark: remark || null,
    })

    if (insertError) {
      console.error('Webhook order insert failed:', insertError.message)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
