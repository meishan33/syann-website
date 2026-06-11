import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function isAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return false
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return false
  const { data } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin === true
}

// Public — list active products
export async function GET() {
  const { data, error } = await supabase
    .from('shop_products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Admin — create product
export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { name, description, price, category, image_url } = body
  const { data, error } = await supabaseAdmin
    .from('shop_products')
    .insert([{ name, description, price, category, image_url }])
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Admin — update product
export async function PATCH(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...fields } = await req.json()
  const { error } = await supabaseAdmin.from('shop_products').update(fields).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Admin — delete product
export async function DELETE(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('shop_products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
