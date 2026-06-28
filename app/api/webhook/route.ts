import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail, orderConfirmationEmail, newOrderAdminEmail, notifyAdmins } from '@/lib/email'

// Discount redemption is recorded here (payment succeeded), not at apply-time,
// so an abandoned checkout never burns a customer's one-time use of a code.
async function recordDiscountRedemption(paymentIntent: Stripe.PaymentIntent) {
  const discountCode = paymentIntent.metadata?.discountCode
  const email = paymentIntent.receipt_email
  if (!discountCode || !email) return

  const { data: discountRow } = await supabaseAdmin.from('discount_codes').select('id').eq('code', discountCode).maybeSingle()
  if (!discountRow) return

  await supabaseAdmin.from('discount_code_redemptions').insert({
    code_id: discountRow.id,
    email: email.toLowerCase(),
    user_id: paymentIntent.metadata?.userId || null,
    stripe_payment_intent_id: paymentIntent.id,
  })
}

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

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const { order_type, resultId, spacer, remark, includeCharm, userId, items: itemsJson, savedAddress: savedAddressJson } = paymentIntent.metadata ?? {}

    type ShippingAddr = { name?: string | null; phone?: string | null; line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null }

    let savedAddress: ShippingAddr | null = null
    try { if (savedAddressJson) savedAddress = JSON.parse(savedAddressJson) } catch {}

    // Prefer the address actually collected via AddressElement at confirm time;
    // fall back to a pre-picked saved address if the customer skipped re-entering one.
    const collected = paymentIntent.shipping
    const addr: ShippingAddr | null = collected
      ? { name: collected.name, phone: collected.phone, line1: collected.address?.line1, line2: collected.address?.line2, city: collected.address?.city, state: collected.address?.state, postal_code: collected.address?.postal_code, country: collected.address?.country }
      : savedAddress

    // ── Shop order ──────────────────────────────────────────────────────────
    if (order_type === 'shop') {
      const { data: existingShop } = await supabaseAdmin
        .from('shop_orders')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .maybeSingle()

      if (existingShop) return NextResponse.json({ received: true })

      const orderNumber = await supabaseAdmin.rpc('nextval', { seq: 'shop_order_number_seq' }).then(r => r.data, () => null)
      const parsedItems: { name: string; quantity: number }[] = itemsJson ? JSON.parse(itemsJson) : []
      const totalAmount = (paymentIntent.amount ?? 0) / 100

      await supabaseAdmin.from('shop_orders').insert({
        order_number: orderNumber,
        customer_name: addr?.name || null,
        customer_email: paymentIntent.receipt_email || null,
        customer_phone: addr?.phone || null,
        shipping_address: addr ?? null,
        items: parsedItems,
        total_amount: totalAmount,
        payment_status: 'paid',
        fulfillment_status: 'unfulfilled',
        stripe_payment_intent_id: paymentIntent.id,
      })

      const itemsSummary = parsedItems.map(i => `${i.name} × ${i.quantity}`).join(', ')

      if (paymentIntent.receipt_email) {
        const { subject, html } = orderConfirmationEmail({
          orderNumber,
          customerName: addr?.name || null,
          items: itemsSummary,
          totalAmount,
          shippingAddress: addr ? [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(', ') : null,
        })
        await sendEmail({ to: paymentIntent.receipt_email, subject, html })
      }

      const { subject: adminSubject, html: adminHtml } = newOrderAdminEmail({
        orderType: 'shop', orderNumber, customerName: addr?.name || null, customerEmail: paymentIntent.receipt_email || null, items: itemsSummary, totalAmount,
      })
      await notifyAdmins({ subject: adminSubject, html: adminHtml })
      await recordDiscountRedemption(paymentIntent)

      return NextResponse.json({ received: true })
    }

    // ── Bracelet order ───────────────────────────────────────────────────────
    const { data: result } = await supabaseAdmin
      .from('energy_quiz_results')
      .select('crystal_names, user_name, cached_image_url, calculated_weak_element, calculated_strong_element, analysis_summary, current_feelings')
      .eq('id', resultId)
      .single()

    const { data: existing } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .maybeSingle()

    if (existing) return NextResponse.json({ received: true })

    const shippingAddress = addr
      ? [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(', ')
      : null
    const totalAmount = (paymentIntent.amount ?? 0) / 100

    const { data: insertedOrder, error: insertError } = await supabaseAdmin.from('orders').insert({
      customer_name: addr?.name || result?.user_name || null,
      customer_email: paymentIntent.receipt_email || null,
      customer_phone: addr?.phone || null,
      shipping_address: shippingAddress,
      generated_image_url: result?.cached_image_url || null,
      weak_element: result?.calculated_weak_element || null,
      strong_element: result?.calculated_strong_element || null,
      analysis_summary: result?.analysis_summary || null,
      recommended_crystal_names: result?.crystal_names ?? [],
      total_amount: totalAmount,
      payment_status: 'paid',
      fulfillment_status: 'processing',
      stripe_payment_intent_id: paymentIntent.id,
      result_id: resultId || null,
      spacer_choice: spacer || null,
      remark: remark || null,
      logo_charm: includeCharm !== 'false',
      current_feelings: result?.current_feelings || null,
    }).select('order_number').single()

    if (insertError) {
      console.error('Webhook order insert failed:', insertError.message)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const braceletItems = (result?.crystal_names ?? []).join(' · ')

    if (paymentIntent.receipt_email) {
      const { subject, html } = orderConfirmationEmail({
        orderNumber: insertedOrder?.order_number ?? null,
        customerName: addr?.name || result?.user_name || null,
        items: braceletItems,
        totalAmount,
        shippingAddress,
      })
      await sendEmail({ to: paymentIntent.receipt_email, subject, html })
    }

    const { subject: adminSubject, html: adminHtml } = newOrderAdminEmail({
      orderType: 'bracelet', orderNumber: insertedOrder?.order_number ?? null, customerName: addr?.name || result?.user_name || null, customerEmail: paymentIntent.receipt_email || null, items: braceletItems, totalAmount,
    })
    await notifyAdmins({ subject: adminSubject, html: adminHtml })
    await recordDiscountRedemption(paymentIntent)

    // Auto-save new Stripe-collected address to delivery_addresses (only if user didn't pick a saved one)
    if (userId && addr && !savedAddress) {
      const { count } = await supabaseAdmin
        .from('delivery_addresses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (count === 0) {
        await supabaseAdmin.from('delivery_addresses').insert({
          user_id: userId,
          name: addr.name || null,
          phone: addr.phone || null,
          line1: addr.line1 || null,
          line2: addr.line2 || null,
          city: addr.city || null,
          state: addr.state || null,
          postal_code: addr.postal_code || null,
          country: addr.country || 'MY',
          is_default: true,
        })
      }
    }

    return NextResponse.json({ received: true })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const { order_type, resultId, spacer, remark, userId, savedAddress: savedAddressJson, items: itemsJson } = session.metadata ?? {}

    // ── Shop order ──────────────────────────────────────────────────────────
    if (order_type === 'shop') {
      const { data: existingShop } = await supabaseAdmin
        .from('shop_orders')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle()

      if (existingShop) return NextResponse.json({ received: true })

      type ShippingAddr = { name?: string | null; phone?: string | null; line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null }
      type SessionExt = { shipping_details?: { address?: ShippingAddr }; collected_information?: { shipping_details?: { address?: ShippingAddr } } }

      let savedAddr: ShippingAddr | null = null
      try { if (savedAddressJson) savedAddr = JSON.parse(savedAddressJson) } catch {}

      const sessionExt = session as unknown as SessionExt
      const addr: ShippingAddr | null | undefined = savedAddr ?? sessionExt.collected_information?.shipping_details?.address ?? sessionExt.shipping_details?.address

      const orderNumber = await supabaseAdmin.rpc('nextval', { seq: 'shop_order_number_seq' }).then(r => r.data, () => null)

      await supabaseAdmin.from('shop_orders').insert({
        order_number: orderNumber,
        customer_name: addr?.name || session.customer_details?.name || null,
        customer_email: session.customer_details?.email || null,
        customer_phone: addr?.phone || session.customer_details?.phone || null,
        shipping_address: addr ?? null,
        items: itemsJson ? JSON.parse(itemsJson) : [],
        total_amount: (session.amount_total ?? 0) / 100,
        payment_status: 'paid',
        fulfillment_status: 'unfulfilled',
        stripe_session_id: session.id,
      })

      return NextResponse.json({ received: true })
    }

    // ── Bracelet order ───────────────────────────────────────────────────────

    // Look up crystal names from the quiz result
    const { data: result } = await supabaseAdmin
      .from('energy_quiz_results')
      .select('crystal_names, user_name, cached_image_url, calculated_weak_element, calculated_strong_element, analysis_summary, current_feelings')
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

    type ShippingAddr = { name?: string | null; phone?: string | null; line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null }
    type SessionExt = { shipping_details?: { address?: ShippingAddr }; collected_information?: { shipping_details?: { address?: ShippingAddr } } }

    // If user picked a saved address, it's in metadata; otherwise read from Stripe's collected shipping
    let savedAddress: ShippingAddr | null = null
    try { if (savedAddressJson) savedAddress = JSON.parse(savedAddressJson) } catch {}

    const sessionExt = session as unknown as SessionExt
    // dahlia API version uses collected_information.shipping_details; fall back to shipping_details for older versions
    const addr: ShippingAddr | null | undefined = savedAddress ?? sessionExt.collected_information?.shipping_details?.address ?? sessionExt.shipping_details?.address
    const shippingAddress = addr
      ? [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country]
          .filter(Boolean)
          .join(', ')
      : null

    const { error: insertError } = await supabaseAdmin.from('orders').insert({
      customer_name: session.customer_details?.name || result?.user_name || null,
      customer_email: session.customer_details?.email || null,
      customer_phone: session.customer_details?.phone || null,
      shipping_address: shippingAddress,
      generated_image_url: result?.cached_image_url || null,
      weak_element: result?.calculated_weak_element || null,
      strong_element: result?.calculated_strong_element || null,
      analysis_summary: result?.analysis_summary || null,
      recommended_crystal_names: result?.crystal_names ?? [],
      total_amount: (session.amount_total ?? 0) / 100,
      payment_status: 'paid',
      fulfillment_status: 'processing',
      stripe_session_id: session.id,
      result_id: resultId || null,
      spacer_choice: spacer || null,
      remark: remark || null,
      current_feelings: result?.current_feelings || null,
    })

    if (insertError) {
      console.error('Webhook order insert failed:', insertError.message)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Auto-save new Stripe-collected address to delivery_addresses (only if user didn't pick a saved one)
    if (userId && addr && !savedAddress) {
      const { count } = await supabaseAdmin
        .from('delivery_addresses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (count === 0) {
        await supabaseAdmin.from('delivery_addresses').insert({
          user_id: userId,
          name: session.customer_details?.name || null,
          phone: session.customer_details?.phone || null,
          line1: addr.line1 || null,
          line2: addr.line2 || null,
          city: addr.city || null,
          state: addr.state || null,
          postal_code: addr.postal_code || null,
          country: addr.country || 'MY',
          is_default: true,
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
