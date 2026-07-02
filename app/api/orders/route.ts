import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, customer_name, recommended_crystal_names, total_amount, payment_status, fulfillment_status, created_at, generated_image_url, weak_element, strong_element, analysis_summary, shipping_address, spacer_choice, remark, customer_phone, logo_charm, current_feelings, stripe_payment_intent_id')
    .eq('customer_email', user.email)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch related shop items for combined orders (stored as pi_id + '_shop')
  const piIds = (data ?? []).filter(o => o.stripe_payment_intent_id).map(o => `${o.stripe_payment_intent_id}_shop`)
  const shopItemsMap: Record<string, { productId?: string; name: string; quantity: number; price: number; image_url?: string | null }[]> = {}

  if (piIds.length > 0) {
    const { data: shopOrders } = await supabaseAdmin
      .from('shop_orders')
      .select('stripe_payment_intent_id, items')
      .in('stripe_payment_intent_id', piIds)

    // Collect all unique productIds so we can fetch their images in one query
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
