'use client'

import { useState } from 'react'
import './energy-quiz.css'

export default function EnergyQuizPage() {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
    gender: '',
    goal: '',
    feeling: ''
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      console.log(formData)

      // Later:
      // send formData to API route

      alert('Energy analysis submitted!')
    } catch (error) {
      console.error(error)
      alert('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bracelet-page">
      <div className="bracelet-container">

        {/* HERO */}
        <div className="hero-section">
          <p className="hero-subtitle">
            AI-Powered Energy Analysis
          </p>

          <h1 className="hero-title">
            Discover The Bracelet
            <br />
            Designed For You
          </h1>

          <p className="hero-description">
            Our AI analyzes your zodiac, five elements, emotional energy,
            intentions, and personal goals to create a bracelet uniquely aligned
            with your energy.
          </p>
        </div>

        {/* MAIN CONTENT */}
        <div className="content-grid">

          {/* LEFT FORM */}
          <div className="form-card">

            <div className="form-header">
              <h2>Personalized Energy Analysis</h2>

              <p>
                Tell us more about yourself and let Syann AI recommend crystals
                specially matched to your energy.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="energy-form">

              {/* NAME */}
              <div className="form-group">
                <label>Your Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* BIRTHDATE */}
              <div className="form-group">
                <label>Birthdate</label>

                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* GENDER */}
              <div className="form-group">
                <label>Gender</label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              {/* GOAL */}
              <div className="form-group">
                <label>Main Goal</label>

                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Your Main Goal</option>

                  <option value="love">
                    Love & Relationships
                  </option>

                  <option value="wealth">
                    Wealth & Abundance
                  </option>

                  <option value="career">
                    Career Success
                  </option>

                  <option value="calmness">
                    Calmness & Healing
                  </option>

                  <option value="protection">
                    Protection & Grounding
                  </option>

                  <option value="confidence">
                    Confidence & Motivation
                  </option>
                </select>
              </div>

              {/* FEELING */}
              <div className="form-group">
                <label>Current Feelings</label>

                <textarea
                  name="feeling"
                  value={formData.feeling}
                  onChange={handleChange}
                  placeholder="Example: Feeling emotionally drained lately and struggling with overthinking..."
                  rows={5}
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading
                  ? 'Analyzing Your Energy...'
                  : 'Generate My Bracelet ✦'}
              </button>
            </form>
          </div>

          {/* RIGHT PREVIEW */}
          <div className="preview-section">

            <div className="preview-card">

              <img
                src="/bracelet-preview.jpg"
                alt="Bracelet Preview"
                className="preview-image"
              />

              <div className="preview-content">

                <p className="preview-subtitle">
                  AI Energy Matched
                </p>

                <h3>Your Personalized Bracelet</h3>

                <p className="preview-description">
                  Your bracelet recommendation will be generated based on your
                  zodiac, emotions, intentions, and five-element energy balance.
                </p>

                <div className="feature-grid">

                  <div className="feature-box">
                    <p className="feature-label">Includes</p>
                    <p className="feature-value">
                      Crystal Analysis
                    </p>
                  </div>

                  <div className="feature-box">
                    <p className="feature-label">Personalized</p>
                    <p className="feature-value">
                      Energy Reading
                    </p>
                  </div>

                  <div className="feature-box">
                    <p className="feature-label">AI Generated</p>
                    <p className="feature-value">
                      Bracelet Design
                    </p>
                  </div>

                  <div className="feature-box">
                    <p className="feature-label">Tailored For</p>
                    <p className="feature-value">
                      Your Energy
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}