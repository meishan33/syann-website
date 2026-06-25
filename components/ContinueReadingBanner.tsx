'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getLastReading, clearLastReading } from '@/lib/last-reading'

const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

export default function ContinueReadingBanner() {
  const [resultId, setResultId] = useState<string | null>(null)

  useEffect(() => {
    setResultId(getLastReading()?.id ?? null)
  }, [])

  if (!resultId) return null

  return (
    <div
      style={{
        ...BODY,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        flexWrap: 'wrap',
        background: '#FBF6EE', borderBottom: '1px solid #E8D9C0',
        padding: '12px 20px', textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 12, color: '#7A5B45', margin: 0 }}>
        ✦ Pick up where you left off — your most recent bracelet design is still here.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link
          href={`/results/${resultId}`}
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: GOLD, textDecoration: 'underline' }}
        >
          Continue Your Reading →
        </Link>
        <button
          onClick={() => { clearLastReading(); setResultId(null) }}
          aria-label="Dismiss"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C5B8AD', fontSize: 14, padding: 0, lineHeight: 1 }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
