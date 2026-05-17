'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import '../home.css'

const INTENTIONS = [
  'Emotional Balance',
  'Confidence',
  'Career Growth',
  'Love & Relationships',
  'Protection',
  'Inner Calm',
]

const GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'nonbinary', label: 'Non-binary' },
  { value: 'prefer-not', label: 'Prefer not to say' },
]

const LOADING_MESSAGES = [
  'Analyzing your elemental balance…',
  'Curating crystals aligned with your energy…',
]

export default function EnergyQuizPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    birthTime: '',
    gender: '',
    intention: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])


  /* Cycle loading copy every 2.5s while submitting */
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError(null)
    setLoading(true)
    setLoadingMessage(LOADING_MESSAGES[0])

    try {

      console.log("FORM DATA:");
      console.log(formData);

      console.log("JSON:");
      console.log(
      JSON.stringify({
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      gender: formData.gender,
      intention: formData.intention,
      fullName: formData.fullName,
  })
);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          gender: formData.gender,
          intention: formData.intention,
          fullName: formData.fullName,
        }),
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
    <main>

      <section className="home-quiz">

        <div className="home-quiz-header">
          <p className="home-quiz-eyebrow">✦ Energy Quiz</p>
          <h2 className="home-quiz-title">
            Discover the crystals aligned with your energy
          </h2>
          <p className="home-quiz-description">
            Personalized through Five Elements wisdom and AI-powered
            crystal curation.
          </p>
        </div>

        <form className="home-quiz-form" onSubmit={handleSubmit} noValidate>

          <div className="home-quiz-grid">

            <div className="home-quiz-field home-quiz-field-wide">
              <label htmlFor="fullName">
                Full Name
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
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="home-quiz-field">
              <label htmlFor="birthTime">
                Birth Time
                <span className="home-quiz-field-hint">
                  Optional, increases accuracy
                </span>
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

            <div className="home-quiz-field">
              <label htmlFor="gender">
                Gender
                <span className="home-quiz-field-hint">Optional</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="home-quiz-field">
              <label htmlFor="intention">
                Current Intention
                <span className="home-quiz-field-hint">Optional</span>
              </label>
              <select
                id="intention"
                name="intention"
                value={formData.intention}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Choose your focus</option>
                {INTENTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
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
            className="home-quiz-submit"
            disabled={loading}
          >
            {loading ? loadingMessage : 'Analyze My Energy'}
            <span className="home-quiz-submit-icon" aria-hidden="true">✦</span>
          </button>


          <p className="home-quiz-security">
            Your details remain private and are used only to personalize
            your crystal recommendation.
          </p>

        </form>

      </section>

    </main>
  )
}
