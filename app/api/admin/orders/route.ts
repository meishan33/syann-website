import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase'
import { sendEmail, orderStatusUpdateEmail, shippedOrderEmail } from '@/lib/email'

async function isAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return false
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return false
  const { data } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin === true
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, customer_name, customer_email, customer_phone, recommended_crystal_names, total_amount, payment_status, fulfillment_status, created_at, shipping_address, spacer_choice, remark, logo_charm, weak_element, strong_element, analysis_summary, generated_image_url, current_feelings, tracking_number, tracking_url, stripe_payment_intent_id, promo_code, original_amount, discount_amount, shipping_fee')
    .order('created_at', { ascending: false })
    .limit(10000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with shop items + product images (same logic as user orders API)
  const piIds = (data ?? []).filter(o => o.stripe_payment_intent_id).map(o => `${o.stripe_payment_intent_id}_shop`)
  const shopItemsMap: Record<string, { name: string; quantity: number; price: number; image_url?: string | null }[]> = {}

  if (piIds.length > 0) {
    const { data: shopOrders } = await supabaseAdmin
      .from('shop_orders')
      .select('stripe_payment_intent_id, items')
      .in('stripe_payment_intent_id', piIds)

    const allItems: { productId?: string; name: string; quantity: number; price: number }[] =
      shopOrders?.flatMap(so => so.items ?? []) ?? []
    const productIds = [...new Set(allItems.map(i => i.productId).filter(Boolean))] as string[]

    const imageMap: Record<string, string | null> = {}
    if (productIds.length > 0) {
      const { data: products } = await supabaseAdmin
        .from('shop_products')
        .select('id, image_url')
        .in('id', productIds)
      products?.forEach(p => { imageMap[p.id] = p.image_url ?? null })
    }

    shopOrders?.forEach(so => {
      const piId = so.stripe_payment_intent_id.replace('_shop', '')
      shopItemsMap[piId] = (so.items ?? []).map((item: { productId?: string; name: string; quantity: number; price: number }) => ({
        ...item,
        image_url: item.productId ? (imageMap[item.productId] ?? null) : null,
      }))
    })
  }

  const enriched = (data ?? []).map(o => ({
    ...o,
    shop_items: o.stripe_payment_intent_id ? (shopItemsMap[o.stripe_payment_intent_id] ?? []) : [],
  }))

  return NextResponse.json(enriched)
}

export async function PATCH(req: NextRequest) {
  if (!await isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, fulfillment_status, tracking_number, tracking_url } = await req.json()

  const updatePayload: Record<string, unknown> = { fulfillment_status }
  if (tracking_number !== undefined) updatePayload.tracking_number = tracking_number || null
  if (tracking_url !== undefined) updatePayload.tracking_url = tracking_url || null

  const { data: updated, error } = await supabaseAdmin
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select('order_number, customer_name, customer_email, recommended_crystal_names')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (updated?.customer_email) {
    if (fulfillment_status === 'shipped' && tracking_number) {
      const { subject, html } = shippedOrderEmail({
        orderNumber: updated.order_number,
        customerName: updated.customer_name,
        crystalNames: updated.recommended_crystal_names ?? [],
        trackingNumber: tracking_number,
        trackingUrl: tracking_url || null,
      })
      await sendEmail({ to: updated.customer_email, subject, html })
    } else {
      const { subject, html } = orderStatusUpdateEmail({ orderNumber: updated.order_number, status: fulfillment_status })
      await sendEmail({ to: updated.customer_email, subject, html })
    }
  }

  return NextResponse.json({ ok: true })
}
