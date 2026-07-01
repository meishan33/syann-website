import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase
    .from('shop_products')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json(data)
}
