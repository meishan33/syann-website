import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function isAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return false
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return false
  const { data } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin === true
}

function validateType(discount_type: unknown): string | null {
  if (discount_type !== 'fixed' && discount_type !== 'percent') {
    return 'discount_type must be "fixed" or "percent"'
  }
  return null
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('discount_codes')
    .select('id, code, discount_type, discount_value, active, max_redemptions_per_customer, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, discount_type, discount_value, active, max_redemptions_per_customer } = await req.json()
  if (!code?.trim()) return NextResponse.json({ error: 'Code is required' }, { status: 400 })

  const typeError = validateType(discount_type)
  if (typeError) return NextResponse.json({ error: typeError }, { status: 400 })

  if (typeof discount_value !== 'number' || discount_value <= 0) {
    return NextResponse.json({ error: 'discount_value must be a positive number' }, { status: 400 })
  }
  if (discount_type === 'percent' && discount_value > 100) {
    return NextResponse.json({ error: 'Percentage discount cannot exceed 100' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('discount_codes')
    .insert({
      code: code.trim().toUpperCase(),
      discount_type,
      discount_value,
      active: active ?? true,
      max_redemptions_per_customer: max_redemptions_per_customer ?? 1,
    })
    .select('id, code, discount_type, discount_value, active, max_redemptions_per_customer, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, code, discount_type, discount_value, active, max_redemptions_per_customer } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (code !== undefined) {
    if (!code.trim()) return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    update.code = code.trim().toUpperCase()
  }
  if (discount_type !== undefined) {
    const typeError = validateType(discount_type)
    if (typeError) return NextResponse.json({ error: typeError }, { status: 400 })
    update.discount_type = discount_type
  }
  if (discount_value !== undefined) {
    if (typeof discount_value !== 'number' || discount_value <= 0) {
      return NextResponse.json({ error: 'discount_value must be a positive number' }, { status: 400 })
    }
    update.discount_value = discount_value
  }
  if (active !== undefined) update.active = active
  if (max_redemptions_per_customer !== undefined) update.max_redemptions_per_customer = max_redemptions_per_customer

  const { error } = await supabaseAdmin.from('discount_codes').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('discount_codes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
