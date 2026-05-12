'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
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
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault()

    try {

      setLoading(true)

      console.log(formData)

      // NEXT STEP:
      // Send data to AI API route

      alert('Energy analysis submitted!')

    } catch (error) {

      console.error(error)

      alert('Something went wrong.')

    } finally {

      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="energy-page">

        {/* HERO SECTION */}
        <section className="hero-banner">

          <img
            src="/energy-banner.jpg"
            alt="Energy Banner"
            className="hero-banner-image"
          />

          <div className="hero-overlay">

            <p className="hero-subtitle">
              ✧ AI-POWERED ENERGY ANALYSIS
            </p>

            <h1 className="hero-title">
              Personalized Energy Analysis
            </h1>

            <p className="hero-description">
              Tell us more about yourself and let Syann AI
              recommend crystals specially matched to your energy.
            </p>

          </div>
        </section>


        {/* MAIN CONTENT */}
        <section className="content-wrapper">

          {/* LEFT FORM CARD */}
          <div className="form-card">

            <div className="form-header">

              <h2>
                Your Information
              </h2>

              <p>
                This helps us understand your unique energy.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="energy-form"
            >

              {/* NAME */}
              <div className="form-group">

                <label>
                  Your Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* BIRTHDATE + GENDER */}
              <div className="form-group-row">

                <div className="form-group">

                  <label>
                    Birthdate
                  </label>

                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select gender
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="male">
                      Male
                    </option>

                  </select>

                </div>

              </div>


              {/* GOAL */}
              <div className="form-group">

                <label>
                  Main Goal
                </label>

                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select your main goal
                  </option>

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


              {/* FEELINGS */}
              <div className="form-group">

                <label>
                  Current Feelings
                </label>

                <textarea
                  name="feeling"
                  rows={5}
                  placeholder="How are you feeling lately? Share anything you'd like us to know..."
                  value={formData.feeling}
                  onChange={handleChange}
                />

              </div>


              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="generate-button"
              >

                {loading
                  ? 'Analyzing Your Energy...'
                  : 'GENERATE MY BRACELET ✨'}

              </button>

              <p className="security-text">
                🔒 Your information is safe and private with us.
              </p>

            </form>

          </div>


          {/* RIGHT PREVIEW CARD */}
          <div className="preview-card">

            <img
              src="/bracelet-preview.jpg"
              alt="Bracelet Preview"
              className="preview-image"
            />

            <div className="preview-content">

              <p className="preview-subtitle">
                AI ENERGY MATCHED
              </p>

              <h2>
                Your Personalized Bracelet
              </h2>

              <p className="preview-description">
                Your bracelet recommendation will be generated
                based on your zodiac, emotions, intentions,
                and five-element energy balance.
              </p>


              <div className="feature-grid">

                <div className="feature-box">
                  <div className="feature-icon">
                    ✧
                  </div>

                  <p>
                    Crystal Analysis
                  </p>
                </div>

                <div className="feature-box">
                  <div className="feature-icon">
                    ☾
                  </div>

                  <p>
                    Personalized Energy Reading
                  </p>
                </div>

                <div className="feature-box">
                  <div className="feature-icon">
                    ◎
                  </div>

                  <p>
                    AI Generated Bracelet Design
                  </p>
                </div>

                <div className="feature-box">
                  <div className="feature-icon">
                    ♡
                  </div>

                  <p>
                    Tailored For Your Energy
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

      </main>
    </>
  )
}