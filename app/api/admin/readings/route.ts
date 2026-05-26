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
    .from('energy_quiz_results')
    .select('id, user_name, birth_date, main_goal, calculated_weak_element, calculated_strong_element, crystal_names, cached_image_url, analysis_summary, suggested_spacer, created_at')
    .order('created_at', { ascending: false })
    .limit(10000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
