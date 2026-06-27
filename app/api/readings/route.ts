import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabaseAdmin
    .from('energy_quiz_results')
    .select('id, crystal_names, cached_image_url, calculated_weak_element, calculated_strong_element, created_at')
    .eq('user_id', user.id)
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data?.length) return NextResponse.json(data)

  // Already-purchased designs show up in My Orders instead — drop them here
  // so the same bracelet isn't listed twice.
  const { data: purchased } = await supabaseAdmin
    .from('orders')
    .select('result_id')
    .in('result_id', data.map(r => r.id))
    .eq('payment_status', 'paid')

  const purchasedIds = new Set((purchased ?? []).map(o => o.result_id))
  return NextResponse.json(data.filter(r => !purchasedIds.has(r.id)))
}
