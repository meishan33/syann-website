import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const TOTAL_BEADS = 24
const REQUIRED_COUNTS = { 0: 10, 1: 8, 2: 6 }

async function isAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return false
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return false
  const { data } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin === true
}

function validateSequence(sequence: unknown): string | null {
  if (!Array.isArray(sequence) || sequence.length !== TOTAL_BEADS) {
    return `Sequence must have exactly ${TOTAL_BEADS} beads.`
  }
  const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0 }
  for (const v of sequence) {
    if (v !== 0 && v !== 1 && v !== 2) return 'Each bead must be 0 (primary), 1 (secondary), or 2 (accent).'
    counts[v]++
  }
  for (const [type, required] of Object.entries(REQUIRED_COUNTS)) {
    if (counts[Number(type)] !== required) {
      return `Expected ${required} beads of type ${type}, got ${counts[Number(type)]}.`
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('bracelet_designs')
    .select('id, name, description, sequence, active, created_at')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, sequence, active } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const seqError = validateSequence(sequence)
  if (seqError) return NextResponse.json({ error: seqError }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('bracelet_designs')
    .insert({ name, description: description || null, sequence, active: active ?? true })
    .select('id, name, description, sequence, active, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, name, description, sequence, active } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    update.name = name
  }
  if (description !== undefined) update.description = description || null
  if (sequence !== undefined) {
    const seqError = validateSequence(sequence)
    if (seqError) return NextResponse.json({ error: seqError }, { status: 400 })
    update.sequence = sequence
  }
  if (active !== undefined) update.active = active

  const { error } = await supabaseAdmin.from('bracelet_designs').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('bracelet_designs').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
