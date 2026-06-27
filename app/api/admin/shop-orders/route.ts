import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail, orderStatusUpdateEmail } from '@/lib/email'

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
    .from('shop_orders')
    .select('id, order_number, customer_name, customer_email, customer_phone, shipping_address, items, total_amount, payment_status, fulfillment_status, created_at')
    .order('created_at', { ascending: false })
    .limit(10000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!await isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, fulfillment_status } = await req.json()
  const { data: updated, error } = await supabaseAdmin
    .from('shop_orders')
    .update({ fulfillment_status })
    .eq('id', id)
    .select('order_number, customer_email')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (updated?.customer_email) {
    const { subject, html } = orderStatusUpdateEmail({ orderNumber: updated.order_number, status: fulfillment_status })
    await sendEmail({ to: updated.customer_email, subject, html })
  }

  return NextResponse.json({ ok: true })
}
