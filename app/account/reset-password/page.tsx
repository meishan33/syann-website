'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'
const INPUT: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
  width: '100%', padding: '13px 16px',
  border: '1px solid #E5DDD5', background: '#FDFAF7',
  fontSize: 13, color: '#4A3A32', outline: 'none', borderRadius: 8,
  boxSizing: 'border-box',
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)  // true once we have a recovery session
  const [invalid, setInvalid] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Supabase reads the token/code from the URL automatically on auth state change.
    // PASSWORD_RECOVERY fires when the reset link is valid.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Also exchange code if present in the URL (PKCE flow)
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setInvalid(true)
        else setReady(true)
      })
    } else {
      // Give the onAuthStateChange listener a moment to fire
      const timer = setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) setInvalid(true)
          else setReady(true)
        })
      }, 1000)
      return () => clearTimeout(timer)
    }

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    setSaving(true)
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (err) { setError(err.message); return }
    setDone(true)
    setTimeout(() => router.push('/account'), 3000)
  }

  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>

        <svg style={{ margin: '0 auto 24px', display: 'block' }} width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
          <polygon points="14,0 28,14 14,28 0,14" fill={GOLD} opacity="0.75" />
        </svg>

        <h1 style={{ ...SERIF, fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 300, color: '#3D2B1F', margin: '0 0 8px' }}>
          Reset Password
        </h1>
        <p style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, margin: '0 0 36px' }}>
          SYANN.CO
        </p>

        <div style={{ background: '#FDFAF7', border: '1px solid #E5DDD5', borderRadius: 20, padding: '36px' }}>

          {invalid && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ ...BODY, fontSize: 13, color: '#C0392B', lineHeight: 1.8, margin: '0 0 20px' }}>
                This reset link is invalid or has expired. Please request a new one.
              </p>
              <button
                onClick={() => router.push('/account')}
                style={{ ...BODY, padding: '12px 28px', background: '#4A3A32', border: 'none', borderRadius: 999, color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Back to Sign In
              </button>
            </div>
          )}

          {!invalid && !ready && (
            <p style={{ ...BODY, fontSize: 11, letterSpacing: '0.28em', color: GOLD, textTransform: 'uppercase', textAlign: 'center' }}>
              Verifying…
            </p>
          )}

          {ready && !done && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
              <p style={{ ...BODY, fontSize: 13, color: '#7A6355', lineHeight: 1.7, margin: 0, textAlign: 'center' }}>
                Choose a new password for your account.
              </p>
              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setError(null) }}
                  placeholder="Min. 8 characters"
                  required
                  style={INPUT}
                />
              </div>
              <div>
                <label style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 6 }}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(null) }}
                  placeholder="Re-enter new password"
                  required
                  style={INPUT}
                />
              </div>
              {error && <p style={{ ...BODY, fontSize: 12, color: '#C0392B', margin: 0 }}>{error}</p>}
              <button
                type="submit"
                disabled={saving}
                style={{ ...BODY, marginTop: 4, padding: '14px', background: saving ? '#C9A96E' : '#4A3A32', border: 'none', borderRadius: 999, color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.3s' }}
              >
                {saving ? 'Saving…' : 'Set New Password'}
              </button>
            </form>
          )}

          {done && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ ...BODY, fontSize: 13, color: '#7CB98A', lineHeight: 1.8, margin: '0 0 8px' }}>
                Your password has been updated successfully.
              </p>
              <p style={{ ...BODY, fontSize: 11, color: '#9A8573' }}>Redirecting you to your account…</p>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
