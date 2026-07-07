import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ALLOWED: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
}

async function isAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return false
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return false
  const { data } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin === true
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const contentType = ALLOWED[ext]
  if (!contentType) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })

  const fileName = `instagram/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage.from('generated-bracelets').upload(fileName, buffer, { contentType, upsert: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from('generated-bracelets').getPublicUrl(fileName)
  return NextResponse.json({ url: data.publicUrl })
}
