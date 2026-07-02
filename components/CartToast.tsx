'use client'

import { useEffect, useState } from 'react'

type Toast = { id: number; name: string }

export default function CartToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const name = (e as CustomEvent<{ name: string }>).detail?.name ?? 'Item'
      const id = Date.now()
      setToasts(prev => [...prev, { id, name }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }
    window.addEventListener('cart-item-added', handler)
    return () => window.removeEventListener('cart-item-added', handler)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#4A3A32', color: '#F6F1EB',
            padding: '14px 20px', borderRadius: 14,
            boxShadow: '0 8px 32px rgba(74,58,50,0.35)',
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 12, fontWeight: 500, letterSpacing: '0.04em',
            animation: 'cart-toast-in 0.3s ease',
            maxWidth: 320,
          }}
        >
          {/* Cart icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B08B57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B08B57' }}>Added to Cart</p>
            <p style={{ margin: 0, fontSize: 12, color: '#F6F1EB', lineHeight: 1.4 }}>{toast.name}</p>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 16, color: '#B08B57', flexShrink: 0 }}>✦</span>
        </div>
      ))}
      <style>{`
        @keyframes cart-toast-in {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  )
}
