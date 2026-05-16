'use client'

import { useState } from 'react'
import './home.css'

const SELLING_POINTS = [
  {
    label: 'Natural Crystal',
    description:
      'Hand-selected genuine gemstones, ethically sourced and energetically cleansed.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4 L26 12 L22 26 H10 L6 12 Z" />
        <path d="M16 4 L22 26" />
        <path d="M16 4 L10 26" />
        <path d="M6 12 H26" />
      </svg>
    ),
  },
  {
    label: 'AI Energy Analysis',
    description:
      'Your zodiac, five elements, and intentions translated into a bespoke crystal blueprint.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 5 L18 14 L27 16 L18 18 L16 27 L14 18 L5 16 L14 14 Z" />
        <circle cx="24" cy="8" r="1.4" fill="currentColor" />
        <circle cx="8" cy="24" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Made With Intention',
    description:
      'Every bracelet is hand-knotted, blessed, and finished with quiet, mindful care.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 26 C8 20 5 15 8 11 C10.5 8 14 9 16 12 C18 9 21.5 8 24 11 C27 15 24 20 16 26 Z" />
      </svg>
    ),
  },
  {
    label: 'Designed Uniquely For You',
    description:
      'No two SYANN bracelets are alike — each one is composed for your singular energy.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="11" />
        <path d="M16 7 L18.2 13.8 L25 16 L18.2 18.2 L16 25 L13.8 18.2 L7 16 L13.8 13.8 Z" />
      </svg>
    ),
  },
]

const BRACELETS = [
  {
    image: '/love.png',
    title: 'Love & Harmony',
    description: 'Open the heart, soften connection, invite tender devotion.',
  },
  {
    image: '/study.png',
    title: 'Wealth & Abundance',
    description: 'Magnetize opportunity, prosperity, and creative flow.',
  },
  {
    image: '/black.png',
    title: 'Protection & Grounding',
    description: 'Shield your aura, root your energy, walk in steady calm.',
  },
  {
    image: '/blue.png',
    title: 'Calm & Balance',
    description: 'Quiet the noise, restore balance, return to inner stillness.',
  },
]

const GOALS = [
  { value: 'love', label: 'Love & Relationships' },
  { value: 'wealth', label: 'Wealth & Abundance' },
  { value: 'career', label: 'Career Success' },
  { value: 'calmness', label: 'Calmness & Healing' },
  { value: 'protection', label: 'Protection & Grounding' },
  { value: 'confidence', label: 'Confidence & Motivation' },
]

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
    birthtime: '',
    gender: '',
    goal: '',
    feeling: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch('/api/generate-bracelet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!data.success) {
        alert('Failed to generate bracelet.')
      } else {
        window.location.href = '/energy-quiz'
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="home">

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="home-hero">

        <img
          src="/banner.png"
          alt=""
          className="home-hero-bg"
        />

        <div className="home-hero-overlay">

          <div className="home-hero-content">


            <h1 className="home-hero-title">
              Personalized Crystal Bracelets
              <br />
              Designed For Your Energy
            </h1>

            <p className="home-hero-subtitle">
              AI-POWERED · ENERGY ALIGNED · MADE FOR YOU
            </p>

            <a href="#energy-quiz" className="home-hero-cta">
              Discover Your Bracelet
              <span className="home-hero-cta-icon" aria-hidden="true">✦</span>
            </a>

          </div>

        </div>

      </section>


      {/* ─── SELLING POINTS ───────────────────────────────── */}
      <section className="home-points">

        {SELLING_POINTS.map((point) => (
          <article key={point.label} className="home-point">

            <div className="home-point-icon" aria-hidden="true">
              {point.icon}
            </div>

            <h3 className="home-point-title">{point.label}</h3>

            <p className="home-point-description">{point.description}</p>

          </article>
        ))}

      </section>


      {/* ─── SLOGAN ───────────────────────────────────────── */}
      <section className="home-slogan">
        <span className="home-slogan-rule" aria-hidden="true" />
        <p className="home-slogan-text">
          Wear Your Energy
          <span className="home-slogan-divider" aria-hidden="true">✦</span>
          Embrace Your Journey
        </p>
        <span className="home-slogan-rule" aria-hidden="true" />
      </section>


      {/* ─── BRACELET DISPLAY ─────────────────────────────── */}
      <section className="home-collection">

        <div className="home-collection-header">
          <p className="home-collection-eyebrow">Our Collection</p>
          <h2 className="home-collection-title">
            Crystals Aligned To Every Intention
          </h2>
        </div>

        <div className="home-collection-grid">

          {BRACELETS.map((b) => (
            <article key={b.title} className="home-bracelet-card">

              <div className="home-bracelet-image-wrap">
                <img
                  src={b.image}
                  alt={b.title}
                  className="home-bracelet-image"
                />
              </div>

              <div className="home-bracelet-content">
                <h3 className="home-bracelet-title">{b.title}</h3>
                <p className="home-bracelet-description">{b.description}</p>
              </div>

            </article>
          ))}

        </div>

      </section>


      {/* ─── ENERGY QUIZ FORM ─────────────────────────────── */}
      <section id="energy-quiz" className="home-quiz">

        <div className="home-quiz-header">
          <p className="home-quiz-eyebrow">✦ Personalized Energy Analysis</p>
          <h2 className="home-quiz-title">
            Discover The Bracelet
            <br />
            Designed For You
          </h2>
          <p className="home-quiz-description">
            Share a little about yourself and let our AI craft a bracelet
            tuned to your zodiac, intentions, and energetic balance.
          </p>
        </div>

        <form className="home-quiz-form" onSubmit={handleSubmit}>

          <div className="home-quiz-grid">

            <div className="home-quiz-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="home-quiz-field">
              <label htmlFor="birthdate">Birthday</label>
              <input
                id="birthdate"
                name="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="home-quiz-field">
              <label htmlFor="birthtime">
                Birth Time
                <span className="home-quiz-field-hint">
                  Optional, increases accuracy
                </span>
              </label>
              <input
                id="birthtime"
                name="birthtime"
                type="time"
                value={formData.birthtime}
                onChange={handleChange}
              />
            </div>

            <div className="home-quiz-field">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="nonbinary">Non-binary</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>

            <div className="home-quiz-field home-quiz-field-wide">
              <label htmlFor="goal">Main Goal</label>
              <select
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                required
              >
                <option value="">Select your main goal</option>
                {GOALS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="home-quiz-field home-quiz-field-wide">
              <label htmlFor="feeling">Current Feelings</label>
              <textarea
                id="feeling"
                name="feeling"
                rows={5}
                value={formData.feeling}
                onChange={handleChange}
                placeholder="How are you feeling lately? Share anything you'd like us to know…"
              />
            </div>

          </div>

          <button
            type="submit"
            className="home-quiz-submit"
            disabled={loading}
          >
            {loading ? 'Analyzing Your Energy…' : 'Generate My Bracelet'}
            <span className="home-quiz-submit-icon" aria-hidden="true">✦</span>
          </button>

          <p className="home-quiz-security">
            Your information is kept private and is used only to personalize
            your bracelet.
          </p>

        </form>

      </section>

    </main>
  )
}
