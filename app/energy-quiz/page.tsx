'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type FormState = {
  fullName: string
  birthDate: string
  birthTime: string
  gender: string
  intention: string
}

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

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }

export default function EnergyQuizPage() {
  const router = useRouter()

  const [formData, setFormData] = useState<FormState>({
    fullName: '',
    birthDate: '',
    birthTime: '',
    gender: '',
    intention: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])

  /* Cycle the loading copy every 2.5s while submitting */
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
    <main className="min-h-screen bg-[#F6F1EB] text-[#4A3A32]">

      <section className="mx-auto max-w-3xl px-5 pt-20 pb-6 sm:px-8 lg:pt-28">

        {/* ── HERO ─────────────────────────────────────── */}
        <header className="text-center">

          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">
            ✦ Energy Quiz
          </p>

          <h1
            style={SERIF}
            className="text-3xl font-light leading-[1.15] text-[#4A3A32] sm:text-4xl lg:text-5xl"
          >
            Discover the crystals
            <br className="hidden sm:block" />{' '}
            aligned with your energy
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[#7A5B45] sm:text-[15px]">
            Personalized through Five Elements wisdom and AI-powered
            crystal curation.
          </p>

        </header>

      </section>


      {/* ── FORM CARD ─────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-5 pb-24 sm:px-8">

        <form
          onSubmit={handleSubmit}
          className="
            rounded-[28px] border border-[#E5DDD5]
            bg-[#FBF6EE]
            p-7 sm:p-10
            shadow-[0_30px_80px_-50px_rgba(101,70,46,0.45)]
          "
          noValidate
        >

          {/* Full Name */}
          <Field id="fullName" label="Full Name" hint="Optional">
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="How shall we address you?"
              className={inputClass}
              disabled={loading}
            />
          </Field>

          {/* Birth Date + Birth Time */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">

            <Field id="birthDate" label="Birth Date" hint="Required">
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                value={formData.birthDate}
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </Field>

            <Field id="birthTime" label="Birth Time" hint="Optional, increases accuracy">
              <input
                id="birthTime"
                name="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </Field>

          </div>

          {/* Gender + Intention */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">

            <Field id="gender" label="Gender" hint="Optional">
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={selectClass}
                disabled={loading}
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="intention" label="Current Intention" hint="Optional">
              <select
                id="intention"
                name="intention"
                value={formData.intention}
                onChange={handleChange}
                className={selectClass}
                disabled={loading}
              >
                <option value="">Choose your focus</option>
                {INTENTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </Field>

          </div>


          {/* Error */}
          {error && (
            <p className="mt-7 rounded-2xl border border-[#E5C7A8] bg-[#FBEDD9] px-4 py-3 text-[13px] leading-relaxed text-[#7A5B45]">
              {error}
            </p>
          )}


          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              group mt-9 inline-flex w-full items-center justify-center gap-3
              rounded-full
              border border-[#B08B57]
              bg-[#B08B57] px-8 py-4
              text-[12px] font-medium uppercase tracking-[0.32em] text-white
              transition-all duration-300
              hover:bg-[#7A5B45] hover:border-[#7A5B45]
              disabled:cursor-not-allowed disabled:opacity-70
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08B57]/40
            "
          >
            {loading ? (
              <>
                <Spinner />
                <span className="normal-case tracking-[0.06em] text-[12.5px]">
                  {loadingMessage}
                </span>
              </>
            ) : (
              <>
                Analyze My Energy
                <span aria-hidden="true" className="text-[13px]">✦</span>
              </>
            )}
          </button>


          {/* Privacy footnote */}
          <p className="mt-5 text-center text-[11px] leading-relaxed text-[#9A8573]">
            Your details remain private and are used only to personalize
            your crystal recommendation.
          </p>

        </form>

      </section>

    </main>
  )
}


/* ─────────────────────────────────────────────────────────
   Reusable field row
   ────────────────────────────────────────────────────────*/

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-baseline justify-between gap-3"
      >
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#4A3A32]">
          {label}
        </span>
        {hint && (
          <span className="text-[10px] italic tracking-[0.08em] text-[#9A8573]">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  )
}


/* ─────────────────────────────────────────────────────────
   Input + Select shared classes
   ────────────────────────────────────────────────────────*/

const inputClass = `
  w-full rounded-2xl border border-[#E5DDD5] bg-white
  px-4 py-3.5 text-[14px] text-[#4A3A32] placeholder:text-[#B6A491]
  outline-none transition-all duration-200
  focus:border-[#B08B57] focus:ring-4 focus:ring-[#B08B57]/15
  disabled:cursor-not-allowed disabled:opacity-60
`

const selectClass = inputClass + ' appearance-none pr-10'


/* ─────────────────────────────────────────────────────────
   Inline spinner
   ────────────────────────────────────────────────────────*/

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
