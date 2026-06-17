import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user?.id ?? null
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('delivery_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { label, name, phone, line1, line2, city, state, postal_code, country, is_default } = body

  if (!line1) return NextResponse.json({ error: 'Address line 1 is required' }, { status: 400 })

  // If setting as default, unset all others first
  if (is_default) {
    await supabaseAdmin.from('delivery_addresses').update({ is_default: false }).eq('user_id', userId)
  }

  // If this is the first address, make it default
  const { count } = await supabaseAdmin.from('delivery_addresses').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  const makeDefault = is_default || count === 0

  const { data, error } = await supabaseAdmin.from('delivery_addresses').insert({
    user_id: userId, label: label || null, name: name || null, phone: phone || null,
    line1, line2: line2 || null, city: city || null, state: state || null,
    postal_code: postal_code || null, country: country || 'MY', is_default: makeDefault,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, is_default, label, name, phone, line1, line2, city, state, postal_code, country } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  if (is_default) {
    await supabaseAdmin.from('delivery_addresses').update({ is_default: false }).eq('user_id', userId)
  }

  const { error } = await supabaseAdmin.from('delivery_addresses')
    .update({ label, name, phone, line1, line2, city, state, postal_code, country, ...(is_default !== undefined ? { is_default } : {}) })
    .eq('id', id).eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { data: deleted } = await supabaseAdmin.from('delivery_addresses').select('is_default').eq('id', id).eq('user_id', userId).single()

  const { error } = await supabaseAdmin.from('delivery_addresses').delete().eq('id', id).eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If deleted address was default, promote the next one
  if (deleted?.is_default) {
    const { data: next } = await supabaseAdmin.from('delivery_addresses').select('id').eq('user_id', userId).order('created_at').limit(1).single()
    if (next) await supabaseAdmin.from('delivery_addresses').update({ is_default: true }).eq('id', next.id)
  }

  return NextResponse.json({ ok: true })
}
