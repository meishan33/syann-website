'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#E5DDD5',
  background: '#fff',
  fontSize: 13,
  color: '#4A3A32',
  outline: 'none',
  fontFamily: "'Montserrat', sans-serif",
  transition: 'border-color 0.25s',
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.36em', color: GOLD, textTransform: 'uppercase', margin: 0 }}>
        {children}
      </p>
      <svg width="8" height="8" viewBox="0 0 8 8" fill={GOLD} aria-hidden="true">
        <polygon points="4,0 8,4 4,8 0,4" />
      </svg>
      <div style={{ flex: 1, maxWidth: 40, height: 1, background: GOLD, opacity: 0.5 }} />
    </div>
  )
}

export default function ContactPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [focused, setFocused] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ subject?: boolean; message?: boolean }>({});
  const [honeypot, setHoneypot] = useState('')
  const [loadedAt] = useState(() => Date.now())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return
      const meta = session.user.user_metadata ?? {}
      const name = meta.full_name || meta.name || ''
      const email = session.user.email || ''
      setForm(prev => ({
        ...prev,
        ...(name && { name }),
        ...(email && { email }),
      }))
    })
  }, [])

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) setErrors(prev => ({ ...prev, [name]: false }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = {
      subject: !form.subject.trim(),
      message: !form.message.trim(),
    }
    setErrors(newErrors)
    if (newErrors.subject || newErrors.message) return

    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, honeypot, elapsedMs: Date.now() - loadedAt }),
    })

    router.push('/contact/success')
  }

  const focusStyle = (name: string): React.CSSProperties => {
    const hasError = errors[name as keyof typeof errors]
    if (focused === name) return { ...INPUT_STYLE, borderColor: GOLD, boxShadow: `0 0 0 3px rgba(176,139,87,0.1)` }
    if (hasError) return { ...INPUT_STYLE, borderColor: '#C0392B', boxShadow: `0 0 0 3px rgba(192,57,43,0.08)` }
    return INPUT_STYLE
  }

  return (
    <main style={{ background: '#F6F1EB', color: '#4A3A32', ...BODY }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 280, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>

        {/* Background image */}
        <img
          src="/ContactBanner.webp"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />

        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(246,241,235,0.72)' }} />

        {/* Text content */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'clamp(48px, 6vw, 80px) 24px' }}>

          <SectionEyebrow>Let's Connect</SectionEyebrow>

          <h1 style={{ ...SERIF, fontSize: 'clamp(38px, 5vw, 58px)', fontWeight: 300, lineHeight: 1.15, color: '#3D2B1F', margin: '0 0 20px' }}>
            We're Here to Help
          </h1>

          <p style={{ ...BODY, fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: '#7A6355', margin: 0 }}>
            Have a question about your crystal bracelet, your order, or our energy quiz?
            <br />We'd love to hear from you.
          </p>

        </div>

      </section>


      {/* ── FORM + CONTACT INFO ───────────────────────────────── */}
      <section style={{ background: '#FDFAF7', padding: 'clamp(48px, 6vw, 72px) clamp(24px, 6vw, 48px)' }}>
        <div className="contact-layout-grid" style={{ maxWidth: 1000, margin: '0 auto' }}>

          {/* LEFT — Form */}
          <div>
            <SectionEyebrow>Send Us a Message</SectionEyebrow>

            <form onSubmit={handleSubmit} noValidate>

                {/* Honeypot — invisible to humans, most bots fill it automatically */}
                <input
                  type="text"
                  name="company"
                  value={honeypot}
                  onChange={e => setHoneypot(e.target.value)}
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
                />

                {/* Name + Email row */}
                <div className="contact-name-email-row">
                  <input
                    name="name" type="text" placeholder="Your Name"
                    value={form.name} onChange={handle}
                    onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                    style={focusStyle('name')}
                  />
                  <input
                    name="email" type="email" placeholder="Email Address"
                    value={form.email} onChange={handle}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    style={focusStyle('email')}
                  />
                </div>

                {/* Subject */}
                <div style={{ marginBottom: 12 }}>
                  <input
                    name="subject" type="text" placeholder="Subject *"
                    value={form.subject} onChange={handle}
                    onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)}
                    style={focusStyle('subject')}
                  />
                  {errors.subject && <p style={{ ...BODY, fontSize: 11, color: '#C0392B', margin: '5px 0 0', letterSpacing: '0.04em' }}>Subject is required.</p>}
                </div>

                {/* Message */}
                <div style={{ marginBottom: 20 }}>
                  <textarea
                    name="message" placeholder="Your Message *"
                    rows={6} value={form.message} onChange={handle}
                    onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
                    style={{ ...focusStyle('message'), resize: 'vertical', lineHeight: 1.7 }}
                  />
                  {errors.message && <p style={{ ...BODY, fontSize: 11, color: '#C0392B', margin: '5px 0 0', letterSpacing: '0.04em' }}>Message is required.</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  style={{
                    ...BODY,
                    width: '100%',
                    padding: '15px 24px',
                    background: GOLD,
                    border: `1px solid ${GOLD}`,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.32em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    transition: 'background 0.3s',
                  }}
                >
                  Send Message
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>


              </form>
          </div>

          {/* CENTER — gold diamond ornament */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 52 }}>
            <svg width="12" height="12" viewBox="0 0 10 10" aria-hidden="true">
              <polygon points="5,0 10,5 5,10 0,5" fill={GOLD} opacity="0.55" />
            </svg>
          </div>

          {/* RIGHT — Contact info */}
          <div>
            <SectionEyebrow>Other Ways to Reach Us</SectionEyebrow>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

              {[
                {
                  label: 'Email',
                  value: 'hello@syann.co',
                  sub: null,
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  ),
                },
                {
                  label: 'Instagram',
                  value: '@syann.co_official',
                  sub: null,
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                    </svg>
                  ),
                },
                {
                  label: 'Business Hours',
                  value: 'Mon – Fri: 10AM – 6PM (GMT+8)',
                  sub: 'Closed on weekends & public holidays',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  ),
                },
              ].map(({ label, value, sub, icon }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #E5DDD5', background: '#F8F4EF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#4A3A32', margin: '0 0 3px' }}>
                      {label}
                    </p>
                    <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', margin: 0 }}>
                      {value}
                    </p>
                    {sub && (
                      <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#9A8573', margin: '2px 0 0' }}>
                        {sub}
                      </p>
                    )}
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </section>

    </main>
  )
}
