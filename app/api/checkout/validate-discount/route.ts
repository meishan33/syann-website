import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { code, subtotalCents, email } = await req.json()
    const normalizedCode = (code || '').trim().toUpperCase()
    if (!normalizedCode) return NextResponse.json({ error: 'Enter a promo code.' }, { status: 400 })

    const { data: row } = await supabaseAdmin
      .from('discount_codes')
      .select('id, code, discount_type, discount_value, active, max_redemptions_per_customer')
      .eq('code', normalizedCode)
      .maybeSingle()

    if (!row || !row.active) {
      return NextResponse.json({ error: 'This code is invalid or no longer active.' }, { status: 400 })
    }

    if (email) {
      const { count } = await supabaseAdmin
        .from('discount_code_redemptions')
        .select('id', { count: 'exact', head: true })
        .eq('code_id', row.id)
        .eq('email', email.toLowerCase())
      if ((count ?? 0) >= row.max_redemptions_per_customer) {
        return NextResponse.json({ error: "You've already used this code." }, { status: 400 })
      }
    }

    const rawDiscountCents = row.discount_type === 'fixed'
      ? Math.round(Number(row.discount_value) * 100)
      : Math.round((Number(row.discount_value) / 100) * subtotalCents)

    const discountCents = Math.min(rawDiscountCents, subtotalCents - 50)
    if (discountCents <= 0) {
      return NextResponse.json({ error: "This code can't be applied to this order." }, { status: 400 })
    }

    const discountLabel = row.discount_type === 'fixed'
      ? `S$${Number(row.discount_value).toFixed(2)} off`
      : `${row.discount_value}% off`

    return NextResponse.json({ code: row.code, discountCents, discountLabel })
  } catch {
    return NextResponse.json({ error: 'Failed to validate code.' }, { status: 500 })
  }
}
