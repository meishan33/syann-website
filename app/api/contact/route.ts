import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Simple in-memory rate limiter: max 3 contact submissions per IP per 10 minutes
const ipHits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 })
    return true
  }
  if (entry.count >= 3) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
    }

    const { name, email, subject, message, honeypot, elapsedMs } = await req.json()

    // Bot signals: honeypot filled in, or form submitted implausibly fast.
    // Pretend success so spam tools don't notice and adapt — just skip the save.
    if (honeypot || (typeof elapsedMs === 'number' && elapsedMs < 2500)) {
      return NextResponse.json({ ok: true })
    }

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 })
    }

    if (subject.length > 200) {
      return NextResponse.json({ error: 'Subject must be under 200 characters.' }, { status: 400 })
    }
    if (message.length > 3000) {
      return NextResponse.json({ error: 'Message must be under 3000 characters.' }, { status: 400 })
    }
    if (name && name.length > 100) {
      return NextResponse.json({ error: 'Name must be under 100 characters.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: name?.slice(0, 100) || null,
        email: email?.slice(0, 254) || null,
        subject: subject.slice(0, 200),
        message: message.slice(0, 3000),
      })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save submission.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
