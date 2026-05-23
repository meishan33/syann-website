'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!formData.birthDate) {
      setBirthDateError(true)
      return
    }

    setBirthDateError(false)
    setLoading(true)
    setLoadingMessage(LOADING_MESSAGES[0])

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('We could not complete your analysis. Please try again.')
      }

      const data = await res.json()

      if (!data?.id) {
        throw new Error('Your analysis is missing a reference id.')
      }

      router.push(`/results/${data.id}`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something unexpected happened. Please try again.'
      )
      setLoading(false)
    }
  }

  return (
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
          style={{
            marginTop: 28,
            padding: '12px 16px',
            background: '#FBEDD9',
            border: '1px solid #E5C7A8',
            color: '#7A5B45',
            fontSize: 13,
            lineHeight: 1.6,
            borderRadius: 10,
          }}
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
  )
}
