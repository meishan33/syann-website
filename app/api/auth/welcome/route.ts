import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail, welcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()
    if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 })

    const { data: discount } = await supabaseAdmin
      .from('discount_codes')
      .select('code, discount_type, discount_value')
      .eq('code', 'WELCOME5')
      .eq('active', true)
      .maybeSingle()

    const discountLabel = discount
      ? (discount.discount_type === 'fixed' ? `S$${Number(discount.discount_value).toFixed(2)}` : `${discount.discount_value}%`)
      : null

    const { subject, html } = welcomeEmail({ name: name || null, code: discount?.code ?? null, discountLabel })
    await sendEmail({ to: email, subject, html })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Welcome email error:', err)
    return NextResponse.json({ ok: true })
  }
}
