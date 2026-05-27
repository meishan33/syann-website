'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

const INTENTIONS = [
  'Love & Relationships',
  'Wealth & Abundance',
  'Career Growth',
  'Emotional Balance',
  'Protection & Grounding',
  'Confidence & Motivation',
]

const LOADING_MESSAGES = [
  'Analyzing your elemental balance…',
  'Reading your Five Elements profile…',
  'Selecting crystals aligned with your energy…',
  'Crafting your personalized bracelet…',
  'Generating your bracelet visualization — this may take a moment…',
  'Almost there, please hold on…',
  'Your bracelet is nearly ready — thank you for your patience…',
]

const LS_KEY = 'syann_has_generated'

function todayStr() { return new Date().toISOString().slice(0, 10) }

function getDailyCount(userId: string): number {
  const countKey = `syann_daily_count_${userId}`
  const dateKey  = `syann_daily_date_${userId}`
  if (localStorage.getItem(dateKey) !== todayStr()) {
    localStorage.setItem(dateKey, todayStr())
    localStorage.setItem(countKey, '0')
    return 0
  }
  return parseInt(localStorage.getItem(countKey) || '0', 10)
}

function incrementDailyCount(userId: string) {
  const countKey = `syann_daily_count_${userId}`
  const dateKey  = `syann_daily_date_${userId}`
  localStorage.setItem(dateKey, todayStr())
  localStorage.setItem(countKey, String(getDailyCount(userId) + 1))
}

/* ── Sign-up / Log-in modal ───────────────────────────────────────────── */

function AuthModal({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [done, setDone] = useState(false)

  const INPUT: React.CSSProperties = {
    ...BODY,
    width: '100%',
    padding: '13px 16px',
    border: '1px solid #E5DDD5',
    background: '#FDFAF7',
    fontSize: 13,
    color: '#4A3A32',
    outline: 'none',
    borderRadius: 8,
  }

  const handleGoogleSignIn = async () => {
    setAuthError(null)
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/energy-quiz` },
    })
    if (error) {
      setAuthError(error.message)
      setAuthLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) {
          if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
            setAuthError('An account with this email already exists. Please sign in instead.')
            setMode('login')
          } else {
            throw error
          }
          return
        }
        setDone(true)
        setTimeout(() => onSuccess(), 1800)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onSuccess()
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(46,33,24,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Card */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, background: '#FBF6EE', borderRadius: 28, padding: '40px 36px', boxShadow: '0 40px 100px -20px rgba(74,58,50,0.45)' }}>

        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#9A8573', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ✕
        </button>

        {/* Diamond ornament */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill={GOLD} opacity={0.7} aria-hidden="true">
            <polygon points="7,0 14,7 7,14 0,7" />
          </svg>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ ...SERIF, fontSize: 26, fontWeight: 300, color: '#3D2B1F', marginBottom: 10 }}>
              Account Created ✦
            </h3>
            <p style={{ ...BODY, fontSize: 13, color: '#7A6355', lineHeight: 1.75 }}>
              Welcome to SYANN. Your reading is being prepared…
            </p>
          </div>
        ) : (
          <>
            <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>
              {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
            </p>
            <h3 style={{ ...SERIF, fontSize: 26, fontWeight: 300, color: '#3D2B1F', textAlign: 'center', marginBottom: 6 }}>
              {mode === 'signup' ? 'Continue Your Journey' : 'Sign In to Continue'}
            </h3>
            <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#9A8573', textAlign: 'center', lineHeight: 1.75, marginBottom: 24 }}>
              {mode === 'signup'
                ? 'Create a free account to unlock your personalized crystal reading.'
                : 'Sign in to continue generating your crystal reading.'}
            </p>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              style={{ ...BODY, width: '100%', padding: '13px', background: '#fff', border: '1px solid #E5DDD5', borderRadius: 999, color: '#4A3A32', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', cursor: authLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16, transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.93c-.56 2.95-2.26 5.45-4.81 7.12v5.91h7.79c4.55-4.19 7.17-10.36 7.17-16.99z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.15 15.9-5.84l-7.79-5.91c-2.15 1.45-4.9 2.3-8.11 2.3-6.23 0-11.51-4.21-13.4-9.87H2.54v6.09C6.49 42.62 14.72 48 24 48z"/>
                <path fill="#FBBC05" d="M10.6 28.68A14.95 14.95 0 0 1 9.6 24c0-1.64.28-3.23.8-4.68V13.23H2.54A23.96 23.96 0 0 0 0 24c0 3.88.92 7.55 2.54 10.77l8.06-6.09z"/>
                <path fill="#EA4335" d="M24 9.45c3.51 0 6.66 1.21 9.14 3.57l6.86-6.86C35.91 2.38 30.47 0 24 0 14.72 0 6.49 5.38 2.54 13.23l8.06 6.09C12.49 13.66 17.77 9.45 24 9.45z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: '#E5DDD5' }} />
              <span style={{ ...BODY, fontSize: 10, color: '#C4B5A8', letterSpacing: '0.14em', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#E5DDD5' }} />
            </div>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={INPUT}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={INPUT}
              />

              {authError && (
                <p style={{ ...BODY, fontSize: 12, color: '#C0392B', margin: 0 }}>{authError}</p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                style={{ ...BODY, marginTop: 4, padding: '14px', background: authLoading ? '#C9A96E' : '#4A3A32', border: 'none', borderRadius: 999, color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', cursor: authLoading ? 'not-allowed' : 'pointer', transition: 'background 0.3s' }}
              >
                {authLoading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <p style={{ ...BODY, fontSize: 12, textAlign: 'center', color: '#9A8573', marginTop: 20 }}>
              {mode === 'signup' ? 'Already have an account? ' : 'New to SYANN? '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setAuthError(null) }}
                style={{ ...BODY, background: 'none', border: 'none', color: GOLD, fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                {mode === 'signup' ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  )
}

/* ── Main form ────────────────────────────────────────────────────────── */

export default function EnergyQuizForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    birthTime: '',
    intention: '',
    feeling: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [birthDateError, setBirthDateError] = useState(false)
  const [birthDateLocked, setBirthDateLocked] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDailyLimit, setShowDailyLimit] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return
      const meta = session.user.user_metadata ?? {}

      const name = meta.full_name || meta.name || ''
      const savedBirthDate: string = meta.syann_birth_date || ''
      const savedBirthTime: string = meta.syann_birth_time || ''

      setFormData(prev => ({
        ...prev,
        ...(name         && { fullName: name }),
        ...(savedBirthDate && { birthDate: savedBirthDate }),
        ...(savedBirthTime && { birthTime: savedBirthTime }),
      }))

      if (savedBirthDate) {
        setBirthDateLocked(true)
      }
    })
  }, [])

  useEffect(() => {
    if (!loading) return
    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[i])
    }, 2500)
    return () => clearInterval(id)
  }, [loading])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }


  const runAnalysis = async () => {
    setLoading(true)
    setLoadingMessage(LOADING_MESSAGES[0])
    setError(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('We could not complete your analysis. Please try again.')

      const data = await res.json()
      if (!data?.id) throw new Error('Your analysis is missing a reference id.')

      const prev = parseInt(localStorage.getItem(LS_KEY) || '0', 10)
      localStorage.setItem(LS_KEY, String(prev + 1))
      // Save birth date & time to user metadata for future auto-fill
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        incrementDailyCount(session.user.id)
        await supabase.auth.updateUser({
          data: {
            syann_birth_date: formData.birthDate,
            ...(formData.birthTime && { syann_birth_time: formData.birthTime }),
          },
        })
      }

      router.push(`/results/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something unexpected happened. Please try again.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!formData.birthDate) {
      setBirthDateError(true)
      return
    }
    setBirthDateError(false)

    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      // Logged-in: 3 attempts per 24 hours, keyed by user ID
      if (getDailyCount(session.user.id) >= 3) {
        setShowDailyLimit(true)
        return
      }
    } else {
      // Guest: 2 free attempts then prompt to login
      const attemptCount = parseInt(localStorage.getItem(LS_KEY) || '0', 10)
      if (attemptCount >= 2) {
        setShowAuthModal(true)
        return
      }
    }

    await runAnalysis()
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    runAnalysis()
  }

  return (
    <>
      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showDailyLimit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowDailyLimit(false)}>
          <div style={{ background: '#FDFAF7', borderRadius: 20, padding: '40px 36px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B08B57" strokeWidth="1.2" strokeLinecap="round" style={{ marginBottom: 16 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, color: '#3D2B1F', margin: '0 0 12px' }}>Daily Limit Reached</h2>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 300, color: '#7A6355', lineHeight: 1.75, margin: '0 0 24px' }}>
              You've used all 3 readings for today.<br />Come back tomorrow to discover more.
            </p>
            <button
              onClick={() => setShowDailyLimit(false)}
              style={{ fontFamily: "'Montserrat', sans-serif", padding: '13px 32px', background: '#4A3A32', border: 'none', borderRadius: 999, color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Got It
            </button>
          </div>
        </div>
      )}

      <form className="home-quiz-form" onSubmit={handleSubmit} noValidate>

        <div className="home-quiz-grid">

          <div className="home-quiz-field home-quiz-field-wide">
            <label htmlFor="fullName">
              Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="How shall we address you?"
              disabled={loading}
            />
          </div>

          <div className="home-quiz-field">
            <label htmlFor="birthDate">
              Birth Date
              {birthDateLocked
                ? <span className="home-quiz-field-hint">Locked to your profile</span>
                : <span style={{ color: '#C0392B', fontWeight: 500 }}>*</span>
              }
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={e => {
                setFormData(prev => ({ ...prev, birthDate: e.target.value }))
                setBirthDateError(false)
              }}
              disabled={loading || birthDateLocked}
              style={{
                borderColor: birthDateError ? '#C0392B' : undefined,
                boxShadow: birthDateError ? '0 0 0 3px rgba(192,57,43,0.1)' : undefined,
                ...(birthDateLocked ? { background: '#F4EFE8', color: '#9A8573', cursor: 'not-allowed' } : {}),
              }}
            />
            {birthDateError && (
              <span style={{ fontSize: 11, color: '#C0392B', letterSpacing: '0.04em', marginTop: -4 }}>
                Please enter your birth date to continue.
              </span>
            )}
          </div>

          <div className="home-quiz-field">
            <label htmlFor="birthTime">
              Birth Time
              <span className="home-quiz-field-hint">Optional to increase accuracy</span>
            </label>
            <input
              id="birthTime"
              name="birthTime"
              type="time"
              value={formData.birthTime}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="home-quiz-field home-quiz-field-wide">
            <label htmlFor="intention">Current Intention</label>
            <select
              id="intention"
              name="intention"
              value={formData.intention}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Choose your focus</option>
              {INTENTIONS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div className="home-quiz-field home-quiz-field-wide">
            <label htmlFor="feeling">
              How Are You Feeling Lately?
              <span className="home-quiz-field-hint">Optional</span>
            </label>
            <textarea
              id="feeling"
              name="feeling"
              rows={4}
              value={formData.feeling}
              onChange={handleChange}
              placeholder="Share anything you'd like us to know…"
              disabled={loading}
            />
          </div>

        </div>

        {error && (
          <p
            role="alert"
            style={{ marginTop: 28, padding: '12px 16px', background: '#FBEDD9', border: '1px solid #E5C7A8', color: '#7A5B45', fontSize: 13, lineHeight: 1.6, borderRadius: 10 }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className={`home-quiz-submit${loading ? ' home-quiz-submit--loading' : ''}`}
          disabled={loading}
        >
          {loading ? loadingMessage : 'Analyze My Energy'}
          <span className="home-quiz-submit-icon" aria-hidden="true">✦</span>
        </button>

        <p className="home-quiz-security">
          Your details remain private and are used only to personalize your crystal recommendation.
        </p>

      </form>
    </>
  )
}
