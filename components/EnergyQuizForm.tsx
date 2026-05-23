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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
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
            <p style={{ ...BODY, fontSize: 12, fontWeight: 300, color: '#9A8573', textAlign: 'center', lineHeight: 1.75, marginBottom: 28 }}>
              {mode === 'signup'
                ? 'Create a free account to unlock your personalized crystal reading.'
                : 'Sign in to continue generating your crystal reading.'}
            </p>

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
  const [birthDateDisplay, setBirthDateDisplay] = useState('')
  const [birthDateError, setBirthDateError] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [showAuthModal, setShowAuthModal] = useState(false)

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

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4)
    else if (digits.length > 2) formatted = digits.slice(0, 2) + '/' + digits.slice(2)
    setBirthDateDisplay(formatted)
    setBirthDateError(false)
    if (digits.length === 8) {
      const iso = `${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`
      setFormData(prev => ({ ...prev, birthDate: iso }))
    } else {
      setFormData(prev => ({ ...prev, birthDate: '' }))
    }
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

      localStorage.setItem(LS_KEY, 'true')
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

    // Check if already generated before
    const hasGenerated = localStorage.getItem(LS_KEY) === 'true'
    if (hasGenerated) {
      // Check if logged in
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
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

      <form className="home-quiz-form" onSubmit={handleSubmit} noValidate>

        <div className="home-quiz-grid">

          <div className="home-quiz-field home-quiz-field-wide">
            <label htmlFor="fullName">
              Name
              <span className="home-quiz-field-hint">Optional</span>
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
            <label htmlFor="birthDate">Birth Date</label>
            <input
              id="birthDate"
              name="birthDate"
              type="text"
              inputMode="numeric"
              placeholder="DD / MM / YYYY"
              value={birthDateDisplay}
              onChange={handleBirthDateChange}
              disabled={loading}
              style={birthDateError ? { borderColor: '#C0392B', boxShadow: '0 0 0 3px rgba(192,57,43,0.1)' } : undefined}
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
