export default function Home() {
  return (
    <main className="bg-[#F7F3EF] min-h-screen">

      {/* NAVBAR */}
      <nav className="max-w-[1200px] mx-auto px-8 py-8 flex items-center justify-between">

        <div className="text-[#3A2F2A] text-2xl tracking-[6px] font-serif">
          SYANN
        </div>

        <div className="hidden md:flex gap-10 text-[#6F625B] text-sm">
          <a href="#">About</a>
          <a href="#">Bracelets</a>
          <a href="#">Energy Quiz</a>
          <a href="#">Contact</a>
        </div>

      </nav>

      {/* HERO SECTION */}
      <section className="max-w-[1200px] mx-auto px-8 py-20 flex flex-col md:flex-row items-center justify-between gap-16">

        {/* LEFT */}
        <div className="max-w-[520px]">

          <p className="tracking-[4px] text-sm text-[#B08B57] mb-6">
            PERSONALIZED ENERGY JEWELRY
          </p>

          <h1 className="text-[42px] md:text-[68px] leading-[1.02] text-[#3A2F2A] font-serif mb-6">
            Crystal Bracelets
            Designed For
            Your Energy
          </h1>

          <p className="text-[#7A6E66] text-lg leading-relaxed mb-8">
            AI-powered crystal recommendations based on your zodiac,
            five elements, and emotional energy.
          </p>

          <button className="border border-[#C8A97E] px-8 py-4 rounded-full text-[#3A2F2A] hover:bg-[#C8A97E] hover:text-white transition duration-300">
            Discover Your Bracelet
          </button>

        </div>

        {/* RIGHT IMAGE */}
        <div className="flex-1">
          <img
            src="/banner.png"
            alt="Crystal Bracelet"
            className="w-full rounded-[36px] object-cover shadow-2xl"
          />
        </div>

      </section>

      {/* FEATURE SECTION */}
      <section className="bg-white py-24 px-8">

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">

          <div>
            <h3 className="text-2xl font-serif text-[#3A2F2A] mb-4">
              Personalized Energy
            </h3>

            <p className="text-[#7A6E66] leading-relaxed">
              Every bracelet is uniquely matched to your personal energy profile.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-serif text-[#3A2F2A] mb-4">
              AI Crystal Analysis
            </h3>

            <p className="text-[#7A6E66] leading-relaxed">
              Combining zodiac, five elements, and emotional balance analysis.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-serif text-[#3A2F2A] mb-4">
              Crafted With Intention
            </h3>

            <p className="text-[#7A6E66] leading-relaxed">
              Designed to support confidence, calmness, focus, and abundance.
            </p>
          </div>

        </div>

      </section>

      {/* PRODUCT SECTION */}
      <section className="max-w-[1200px] mx-auto px-8 py-24">

        <div className="mb-16 text-center">

          <p className="tracking-[4px] text-sm text-[#B08B57] mb-4">
            SIGNATURE COLLECTION
          </p>

          <h2 className="text-[42px] text-[#3A2F2A] font-serif">
            Energy Bracelet Collection
          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* LOVE */}
          <div className="bg-white rounded-[28px] overflow-hidden shadow-lg">

            <img
              src="/love.png"
              alt="Love Bracelet"
              className="w-full h-[320px] object-cover"
            />

            <div className="p-6">

              <h3 className="text-2xl font-serif text-[#3A2F2A] mb-3">
                Love & Harmony
              </h3>

              <p className="text-[#7A6E66] leading-relaxed">
                Designed to attract emotional balance and deeper connections.
              </p>

            </div>

          </div>

          {/* CALM */}
          <div className="bg-white rounded-[28px] overflow-hidden shadow-lg">

            <img
              src="/calm.png"
              alt="Calm Bracelet"
              className="w-full h-[320px] object-cover"
            />

            <div className="p-6">

              <h3 className="text-2xl font-serif text-[#3A2F2A] mb-3">
                Calm & Balance
              </h3>

              <p className="text-[#7A6E66] leading-relaxed">
                Gentle crystal combinations for emotional clarity and peace.
              </p>

            </div>

          </div>

          {/* WORK */}
          <div className="bg-white rounded-[28px] overflow-hidden shadow-lg">

            <img
              src="/work.png"
              alt="Work Bracelet"
              className="w-full h-[320px] object-cover"
            />

            <div className="p-6">

              <h3 className="text-2xl font-serif text-[#3A2F2A] mb-3">
                Career & Success
              </h3>

              <p className="text-[#7A6E66] leading-relaxed">
                Crafted to support motivation, focus, and abundance.
              </p>

            </div>

          </div>

          {/* STUDY */}
          <div className="bg-white rounded-[28px] overflow-hidden shadow-lg">

            <img
              src="/study.png"
              alt="Study Bracelet"
              className="w-full h-[320px] object-cover"
            />

            <div className="p-6">

              <h3 className="text-2xl font-serif text-[#3A2F2A] mb-3">
                Study & Focus
              </h3>

              <p className="text-[#7A6E66] leading-relaxed">
                Energy crystals curated for clarity, concentration, and learning.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* QUIZ SECTION */}
      <section className="bg-white py-28 px-8">

        <div className="max-w-[800px] mx-auto text-center">

          <p className="tracking-[4px] text-sm text-[#B08B57] mb-4">
            PERSONALIZED ENERGY ANALYSIS
          </p>

          <h2 className="text-[42px] md:text-[56px] text-[#3A2F2A] font-serif mb-6 leading-[1.1]">
            Discover The Bracelet
            Designed For You
          </h2>

          <p className="text-[#7A6E66] text-lg leading-relaxed mb-16">
            Our AI analyzes your zodiac, five elements,
            emotional energy, and intentions to recommend
            your personalized crystal bracelet.
          </p>

        </div>

        <div className="max-w-[700px] mx-auto bg-[#F7F3EF] rounded-[32px] p-10 shadow-lg">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <input
              type="text"
              placeholder="Your Name"
              className="p-4 rounded-xl border border-[#E5DDD5] bg-white"
            />

            <input
              type="date"
              className="p-4 rounded-xl border border-[#E5DDD5] bg-white"
            />

            <select className="p-4 rounded-xl border border-[#E5DDD5] bg-white">

              <option>Gender</option>
              <option>Female</option>
              <option>Male</option>

            </select>

            <select className="p-4 rounded-xl border border-[#E5DDD5] bg-white">

              <option>Main Goal</option>
              <option>Love</option>
              <option>Career</option>
              <option>Calmness</option>
              <option>Protection</option>
              <option>Study</option>

            </select>

          </div>

          <textarea
            placeholder="How are you feeling lately?"
            className="w-full mt-6 p-4 rounded-xl border border-[#E5DDD5] bg-white min-h-[140px]"
          />

          <button className="w-full mt-8 bg-[#C8A97E] text-white py-5 rounded-full text-lg hover:opacity-90 transition">
            Generate My Bracelet
          </button>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="py-16 px-8 text-center">

        <div className="text-[#3A2F2A] text-2xl tracking-[6px] font-serif mb-4">
          SYANN
        </div>

        <p className="text-[#7A6E66]">
          Personalized energy jewelry designed with intention.
        </p>

      </footer>

    </main>
  )
}