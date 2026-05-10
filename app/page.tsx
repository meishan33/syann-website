export default function Home() {
  return (
    <main className="website">

      <div className="container">

        {/* HERO SECTION */}
<section className="hero-section">

  {/* FULL BANNER IMAGE */}
  <img
    src="/banner.png"
    alt="SYANN Banner"
    className="hero-banner"
  />

  {/* OVERLAY CONTENT */}
  <div className="hero-overlay">

    {/* LOGO ROW */}
    <div className="hero-logo-row">

      <img
        src="/icon.png"
        alt="SYANN"
        className="hero-logo-icon"
      />

      <div className="hero-logo-text">
        SYANN.CO
      </div>

    </div>

    {/* TITLE */}
    <h1 className="hero-title">
      Personalized Crystal Bracelets
      Designed For Your Energy
    </h1>

    {/* SUBTITLE */}
    <p className="hero-subtitle">
      AI-POWERED • ENERGY ALIGNED • MADE FOR YOU
    </p>

    {/* BUTTON */}
    <button className="hero-button">
      DISCOVER YOUR BRACELET ✦
    </button>

  </div>

</section>

        {/* FEATURE STRIP */}
        <section className="feature-strip">

          <div className="feature-item">

            <div className="feature-icon">✧</div>

            <div>
              <h3 className="feature-title">
                Natural Crystals
              </h3>

              <p className="feature-description">
                Carefully selected,
                high quality gemstones
              </p>
            </div>

          </div>

          <div className="feature-item">

            <div className="feature-icon">✦</div>

            <div>
              <h3 className="feature-title">
                AI Energy Analysis
              </h3>

              <p className="feature-description">
                Personalized recommendations
                based on your unique energy
              </p>
            </div>

          </div>

          <div className="feature-item">

            <div className="feature-icon">♡</div>

            <div>
              <h3 className="feature-title">
                Made With Intention
              </h3>

              <p className="feature-description">
                Each bracelet is cleansed
                and handcrafted with care
              </p>
            </div>

          </div>

          <div className="ai-box">

            <h3 className="ai-box-title">
              Designed By AI
              Just For You
            </h3>

            <ul className="ai-list">
              <li>✓ Birth chart & zodiac analysis</li>
              <li>✓ Five elements balance</li>
              <li>✓ Energy & intention matching</li>
              <li>✓ Personalized crystal selection</li>
            </ul>

            <button className="secondary-button">
              Discover Your Energy
            </button>

          </div>

        </section>

        {/* STATEMENT */}
        <section className="statement-section">

          <p className="statement-text">
            Wear Your Energy · Embrace Your Journey.
          </p>

          <div className="statement-line"></div>

        </section>

        {/* PRODUCT GRID */}
        <section className="product-grid">

          <div className="product-card">

            <img
              src="/love.png"
              alt="Love Bracelet"
              className="product-image"
            />

            <div className="product-content">

              <h3 className="product-title">
                Love & Harmony
              </h3>

              <p className="product-description">
                Attract love and deepen
                emotional connection
              </p>

            </div>

          </div>

          <div className="product-card">

            <img
              src="/work.png"
              alt="Work Bracelet"
              className="product-image"
            />

            <div className="product-content">

              <h3 className="product-title">
                Wealth & Abundance
              </h3>

              <p className="product-description">
                Boost confidence and
                attract opportunities
              </p>

            </div>

          </div>

          <div className="product-card">

            <img
              src="/protection.png"
              alt="Protection Bracelet"
              className="product-image"
            />

            <div className="product-content">

              <h3 className="product-title">
                Protection & Grounding
              </h3>

              <p className="product-description">
                Shield your energy and
                stay grounded
              </p>

            </div>

          </div>

          <div className="product-card">

            <img
              src="/calm.png"
              alt="Calm Bracelet"
              className="product-image"
            />

            <div className="product-content">

              <h3 className="product-title">
                Calm & Balance
              </h3>

              <p className="product-description">
                Relieve stress and bring
                inner peace
              </p>

            </div>

          </div>

          <div className="side-image-card">

            <img
              src="/hand.png"
              alt="Lifestyle"
              className="side-image"
            />

          </div>

        </section>

        {/* QUIZ SECTION */}
        <section className="quiz-section">

          <div className="quiz-header">

            <p className="quiz-label">
              Personalized Energy Analysis
            </p>

            <h2 className="quiz-title">
              Discover The Bracelet
              Designed For You
            </h2>

            <p className="quiz-description">
              Our AI analyzes your zodiac, five elements,
              emotional energy, and intentions.
            </p>

          </div>

          <div className="quiz-form-container">

            <div className="form-grid">

              <input type="text" placeholder="Your Name" className="form-input" />

              <input type="date" className="form-input" />

              <select className="form-input">
                <option>Gender</option>
                <option>Female</option>
                <option>Male</option>
              </select>

              <select className="form-input">
                <option>Main Goal</option>
                <option>Love</option>
                <option>Career</option>
                <option>Protection</option>
                <option>Calmness</option>
              </select>

            </div>

            <textarea
              placeholder="How are you feeling lately?"
              className="form-textarea"
            />

            <div className="quiz-button-wrapper">

              <button className="primary-button">
                Generate My Bracelet ✦
              </button>

            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="footer">

          <div className="footer-grid">

            <div>

              <div className="logo-row footer-logo">

                <img
                  src="/logo.png"
                  alt="SYANN"
                  className="footer-logo-image"
                />

                <div className="footer-logo-text">
                  SYANN
                </div>

              </div>

              <p className="footer-description">
                Personalized crystal bracelets designed with intention,
                energy alignment, and AI-powered recommendations.
              </p>

            </div>

            <div>

              <h3 className="footer-heading">Explore</h3>

              <ul className="footer-list">
                <li>About</li>
                <li>Bracelets</li>
                <li>Energy Quiz</li>
                <li>Contact</li>
              </ul>

            </div>

            <div>

              <h3 className="footer-heading">Collections</h3>

              <ul className="footer-list">
                <li>Love & Harmony</li>
                <li>Career & Success</li>
                <li>Protection & Grounding</li>
                <li>Calm & Balance</li>
              </ul>

            </div>

            <div>

              <h3 className="footer-heading">Connect</h3>

              <ul className="footer-list">
                <li>hello@syann.co</li>
                <li>@syann.co</li>
                <li>Singapore</li>
              </ul>

            </div>

          </div>

        </footer>

      </div>

    </main>
  )
}