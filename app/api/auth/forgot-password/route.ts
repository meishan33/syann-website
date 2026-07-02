import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail, resetPasswordEmail } from '@/lib/email'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://syann.co'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email: string }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    // Generate the reset link server-side — Supabase does NOT send an email
    // when using generateLink; we send our own branded one below.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim().toLowerCase(),
      options: { redirectTo: `${SITE_URL}/account/reset-password` },
    })

    if (error) {
      // Don't reveal whether the email exists — always return success to the client
      console.error('generateLink error:', error.message)
      return NextResponse.json({ ok: true })
    }

    const resetUrl = data.properties?.action_link
    if (resetUrl) {
      const { subject, html } = resetPasswordEmail({ resetUrl })
      await sendEmail({ to: email.trim(), subject, html })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('forgot-password error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
