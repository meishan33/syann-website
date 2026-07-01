'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.32em', color: '#B08B57', textTransform: 'uppercase', marginBottom: 12 }}>
          Something went wrong
        </p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: '#3D2B1F', marginBottom: 16 }}>
          We hit an unexpected error
        </h2>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: '#9A8573', lineHeight: 1.75, marginBottom: 28 }}>
          Please try again. If the issue persists, contact us at hello@syann.co
        </p>
        <button
          onClick={reset}
          style={{ fontFamily: "'Montserrat', sans-serif", padding: '12px 32px', background: '#4A3A32', color: '#fff', border: 'none', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          Try Again
        </button>
      </div>
    </main>
  )
}
