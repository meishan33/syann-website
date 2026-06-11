'use client'

import { useEffect, useRef, useState } from 'react'
import { CURRENCIES, CurrencyCode } from '@/lib/currency'
import { useCurrency } from '@/context/CurrencyContext'

const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'
const DARK = '#4A2E14'

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...BODY, background: 'none', border: '1px solid rgba(176,139,87,0.3)',
          borderRadius: 6, cursor: 'pointer', color: DARK,
          fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
          padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 4,
          transition: 'border-color 0.2s',
        }}
        aria-label="Change currency"
      >
        {currency}
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: '#fff', border: '1px solid rgba(200,165,115,0.25)',
          borderRadius: 10, boxShadow: '0 8px 28px rgba(74,46,20,0.1)',
          minWidth: 210, zIndex: 300, overflow: 'hidden',
        }}>
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code as CurrencyCode); setOpen(false) }}
              style={{
                ...BODY, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 12, color: currency === c.code ? GOLD : DARK,
                fontWeight: currency === c.code ? 600 : 400, textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FAF2E6')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span>{c.label}</span>
              {currency === c.code && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
