import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase'

async function isAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return false
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return false
  const { data } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin === true
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('crystals')
    .select('id, name, slug, element, primary_element, color_family, meaning, active, price_tier, luxury_score, energy_tags, bead_image_url, bead_image_urls')
    .order('name')
    .limit(10000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, slug, element, primary_element, color_family, meaning, price_tier, luxury_score, energy_tags, bead_image_urls, active } = body
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const urls: string[] = Array.isArray(bead_image_urls) ? bead_image_urls.filter(Boolean) : []

  const { data, error } = await supabaseAdmin
    .from('crystals')
    .insert({
      name,
      slug: slug || null,
      element: element || null,
      primary_element: primary_element || null,
      color_family: color_family || null,
      meaning: meaning || null,
      price_tier: price_tier || null,
      luxury_score: luxury_score !== '' ? Number(luxury_score) : null,
      energy_tags: energy_tags ? energy_tags.split(',').map((t: string) => t.trim()).filter(Boolean) : null,
      bead_image_url: urls[0] || null,
      bead_image_urls: urls.length ? urls : null,
      active: active ?? true,
    })
    .select('id, name, slug, element, primary_element, color_family, meaning, active, price_tier, luxury_score, energy_tags, bead_image_url, bead_image_urls')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, active, bead_image_urls } = body
  const update: Record<string, unknown> = {}
  if (active !== undefined) update.active = active
  if (bead_image_urls !== undefined) {
    const urls: string[] = Array.isArray(bead_image_urls) ? bead_image_urls.filter(Boolean) : []
    update.bead_image_urls = urls.length ? urls : null
    update.bead_image_url = urls[0] || null
  }
  const { error } = await supabaseAdmin.from('crystals').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
