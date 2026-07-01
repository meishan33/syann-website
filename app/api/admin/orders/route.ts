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
    .select('id, order_number, customer_name, customer_email, customer_phone, recommended_crystal_names, total_amount, payment_status, fulfillment_status, created_at, shipping_address, spacer_choice, remark, logo_charm, weak_element, strong_element, analysis_summary, generated_image_url, current_feelings, tracking_number, tracking_url')
    .order('created_at', { ascending: false })
    .limit(10000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
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
