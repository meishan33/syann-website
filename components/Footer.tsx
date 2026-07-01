'use client'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }

const LINK_COLOR = '#8B7060'
const LINK_HOVER = '#B08B57'
const GOLD       = '#B08B57'
const GOLD_FAINT = 'rgba(176,139,87,0.35)'

export default function Footer() {
  return (
    <footer
      style={{
        width: '100%',
        backgroundImage: "url('/footerbanner3.webp')",
        backgroundSize: '100% 100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        ...BODY,
      }}
    >
      <div style={{ background: 'rgba(245, 238, 228, 0.72)' }}>

        {/* ── MAIN BODY ── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'inline-block' }}>
              <p style={{ ...SERIF, fontSize: 34, fontWeight: 300, letterSpacing: '0.22em', color: '#5C4030', lineHeight: 1, margin: '0 0 4px' }}>
                SYANN.CO
              </p>
              <p style={{ ...BODY, fontSize: 7.5, fontWeight: 600, letterSpacing: '0.38em', color: GOLD, textTransform: 'uppercase', margin: '0 auto 8px', width: '88%', textAlign: 'justify', textAlignLast: 'justify' }}>
                Crystals · Energy · You
              </p>
            </div>

            {/* Ornament */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 6 }}>
              <div style={{ width: 36, height: 1, background: `linear-gradient(to right, transparent, ${GOLD_FAINT})` }} />
              <svg width="6" height="6" viewBox="0 0 8 8" aria-hidden="true">
                <polygon points="4,0 8,4 4,8 0,4" fill={GOLD} opacity="0.65" />
              </svg>
              <div style={{ width: 36, height: 1, background: `linear-gradient(to left, transparent, ${GOLD_FAINT})` }} />
            </div>

            <p style={{ ...SERIF, fontSize: 12, fontStyle: 'italic', color: '#9A8070', lineHeight: 1.5, letterSpacing: '0.02em', margin: 0 }}>
              Personalized crystal bracelets, designed by AI. Aligned with your energy.
            </p>
          </div>

          {/* Social links — centered row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px 24px' }}>

            <a
              href="https://instagram.com/syann.co_official"
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: LINK_COLOR, textDecoration: 'none', transition: 'color 0.2s', ...BODY }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = LINK_HOVER)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = LINK_COLOR)}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', border: `1px solid ${GOLD_FAINT}`, flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </span>
              <span style={{ fontSize: 11, letterSpacing: '0.16em', fontWeight: 500 }}>@syann.co_official</span>
            </a>

            <a
              href="https://tiktok.com/@syann.co"
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: LINK_COLOR, textDecoration: 'none', transition: 'color 0.2s', ...BODY }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = LINK_HOVER)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = LINK_COLOR)}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', border: `1px solid ${GOLD_FAINT}`, flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7.04a4.85 4.85 0 0 1-1.01-.35z"/>
                </svg>
              </span>
              <span style={{ fontSize: 11, letterSpacing: '0.16em', fontWeight: 500 }}>@syann.co</span>
            </a>

            <a
              href="mailto:hello@syann.co"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: LINK_COLOR, textDecoration: 'none', transition: 'color 0.2s', ...BODY }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = LINK_HOVER)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = LINK_COLOR)}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', border: `1px solid ${GOLD_FAINT}`, flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <span style={{ fontSize: 11, letterSpacing: '0.16em', fontWeight: 500 }}>hello@syann.co</span>
            </a>

          </div>

        </div>

        {/* ── BOTTOM DIVIDER + COPYRIGHT ── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 20px' }}>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD_FAINT})` }} />
            <svg width="11" height="11" viewBox="0 0 12 12" style={{ margin: '0 16px', flexShrink: 0 }} aria-hidden="true">
              <polygon points="6,0 12,6 6,12 0,6" fill={GOLD} opacity="0.55" />
            </svg>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD_FAINT})` }} />
          </div>

          <p style={{ ...BODY, textAlign: 'center', fontSize: 10, fontWeight: 400, letterSpacing: '0.26em', color: '#AE9C8A', textTransform: 'uppercase', margin: 0 }}>
            © 2026 SYANN.CO — Crystals · Energy · You.
          </p>

        </div>

      </div>
    </footer>
  )
}
