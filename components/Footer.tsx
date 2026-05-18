import Link from 'next/link'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }

const NAV = [
  { href: '/about',       label: 'About' },
  { href: '/collection',  label: 'Bracelets' },
  { href: '/energy-quiz', label: 'Energy Quiz' },
  { href: '/crystals',    label: 'Crystal Library' },
  { href: '/contact',     label: 'Contact' },
]

export default function Footer() {
  return (
    <footer
      className="w-full"
      style={{ background: '#EDE8E1' }}
    >

      {/* ── UPPER ── */}
      <div className="mx-auto max-w-5xl px-6 pt-20 pb-14 text-center">

        {/* Ornament */}
        <div className="mb-10 flex items-center justify-center gap-5">
          <div className="h-px w-16 bg-[#C9B99E]" />
          <span style={{ color: '#B08B57', fontSize: 13 }} aria-hidden="true">✦</span>
          <div className="h-px w-16 bg-[#C9B99E]" />
        </div>

        {/* Wordmark */}
        <p
          style={{ ...SERIF, letterSpacing: '0.42em', color: '#4A3A32', lineHeight: 1 }}
          className="text-4xl sm:text-5xl font-light mb-7"
        >
          SYANN<span style={{ color: '#B08B57' }}> . </span>CO
        </p>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/NewLogo.png"
            alt=""
            aria-hidden="true"
            style={{ width: 52, height: 52, objectFit: 'contain', opacity: 0.9 }}
          />
        </div>

        {/* Tagline */}
        <p
          style={{ ...SERIF, fontStyle: 'italic', color: '#7A6355', letterSpacing: '0.08em' }}
          className="text-[15px] font-light leading-relaxed"
        >
          Crystal Energy, Uniquely Yours.
        </p>

      </div>


      {/* ── HAIRLINE ── */}
      <div className="mx-auto max-w-3xl px-6">
        <div className="h-px bg-[#D4C5B4]" />
      </div>


      {/* ── NAV + SOCIAL ── */}
      <div className="mx-auto max-w-5xl px-6 py-12 flex flex-col items-center gap-8">

        {/* Navigation */}
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-10 gap-y-4">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{ letterSpacing: '0.24em', color: '#4A3A32' }}
              className="
                text-[11px] font-medium uppercase
                transition-colors duration-200
                hover:text-[#B08B57]
              "
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Social row */}
        <div className="flex items-center gap-6 text-[11px] font-medium uppercase" style={{ letterSpacing: '0.22em', color: '#9A8573' }}>

          <a
            href="https://instagram.com/syann.co"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-[#B08B57]"
            style={{ color: '#9A8573', textDecoration: 'none' }}
          >
            {/* Instagram icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
            Instagram
          </a>

          <span style={{ color: '#C9B99E' }} aria-hidden="true">·</span>

          <a
            href="mailto:hello@syann.co"
            className="transition-colors duration-200 hover:text-[#B08B57]"
            style={{ color: '#9A8573', textDecoration: 'none' }}
          >
            hello@syann.co
          </a>

        </div>

      </div>


      {/* ── BOTTOM ── */}
      <div className="mx-auto max-w-3xl px-6">
        <div className="h-px bg-[#D4C5B4]" />
      </div>

      <div className="py-8 text-center">
        <p
          style={{ letterSpacing: '0.26em', color: '#A8998C' }}
          className="text-[10px] font-medium uppercase"
        >
          © 2026 SYANN.CO — Energy · Beauty · You.
        </p>
      </div>

    </footer>
  )
}
