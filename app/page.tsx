'use client'

import { useState } from 'react'
import './home.css'

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

      {/* HERO BANNER — mirrors public/banner-section.png */}
      <section className="home-hero">

        <img
          src="/banner-section.png"
          alt=""
          className="home-hero-bg"
        />

        <div className="home-hero-overlay">

          <div className="home-hero-content">

            <div className="home-hero-brand">
              <img
                src="/S_brown_icon.png"
                alt=""
                className="home-hero-brand-icon"
              />
              <span className="home-hero-brand-text">SYANN</span>
            </div>

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


      {/* ENERGY QUIZ FORM */}
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
