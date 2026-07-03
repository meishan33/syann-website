'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addBraceletToCart } from '@/lib/cart'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

const DESIGN_PRICE = 79
const N = 21
// Bead radius and ring radius tuned so adjacent beads nearly touch (chord ≈ diameter)
const BEAD_R  = 15   // px
const RING_R  = 100  // px from canvas centre  →  chord = 2×100×sin(π/21) ≈ 29.8 ≈ BEAD_R×2
const CANVAS  = 280
const CX      = CANVAS / 2  // 140

type Crystal = { id: number; name: string; bead_image_url: string | null }

function slotPos(i: number) {
  const angle = (i / N) * 2 * Math.PI - Math.PI / 2
  return {
    left: CX + RING_R * Math.cos(angle) - BEAD_R,
    top:  CX + RING_R * Math.sin(angle) - BEAD_R,
  }
}

export default function DesignPage() {
  const router = useRouter()
  const [crystals, setCrystals]       = useState<Crystal[]>([])
  const [beads, setBeads]             = useState<(string | null)[]>(Array(N).fill(null))
  const [activeSlot, setActiveSlot]   = useState<number>(0)
  const [spacer, setSpacer]           = useState('silver')
  const [includeCharm, setIncludeCharm] = useState(true)
  const [notes, setNotes]             = useState('')
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    fetch('/api/crystals')
      .then(r => r.json())
      .then(data => setCrystals(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const filledCount    = beads.filter(Boolean).length
  const uniqueCrystals = [...new Set(beads.filter(Boolean) as string[])]
  const crystalMap     = Object.fromEntries(crystals.map(c => [c.name, c]))

  function handleBeadClick(i: number) {
    // Tap an active+filled slot → clear it; otherwise just select it
    if (activeSlot === i && beads[i]) {
      const next = [...beads]; next[i] = null; setBeads(next)
    } else {
      setActiveSlot(i)
    }
  }

  function assignCrystal(name: string) {
    const next = [...beads]
    next[activeSlot] = name
    setBeads(next)
    // Advance to next empty slot (wrapping), or stay if full
    for (let k = 1; k <= N; k++) {
      const idx = (activeSlot + k) % N
      if (!next[idx]) { setActiveSlot(idx); return }
    }
  }

  async function saveDesign() {
    setSaving(true); setSaveError(null)
    const res = await fetch('/api/bracelet-builder/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beadSequence: beads.map(b => b ?? ''), crystalNames: uniqueCrystals }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to save design.')
    return data as { resultId: string; imageUrl: string | null }
  }

  async function handleAddToCart() {
    if (filledCount === 0 || saving) return
    try {
      const { resultId, imageUrl } = await saveDesign()
      addBraceletToCart({ resultId, spacer, includeCharm, remark: notes, imageUrl, crystalNames: uniqueCrystals, price: DESIGN_PRICE })
      setAddedToCart(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setSaving(false) }
  }

  async function handleBuyNow() {
    if (filledCount === 0 || saving) return
    try {
      const { resultId, imageUrl } = await saveDesign()
      addBraceletToCart({ resultId, spacer, includeCharm, remark: notes, imageUrl, crystalNames: uniqueCrystals, price: DESIGN_PRICE })
      const params = new URLSearchParams({ result: resultId, spacer, includeCharm: String(includeCharm) })
      if (notes) params.set('remark', notes)
      router.push(`/payment?${params.toString()}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  const canCheckout = filledCount > 0 && !saving

  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', ...BODY }}>
      <style>{`
        .design-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
        .crystal-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; max-height: 320px; overflow-y: auto; padding: 2px; }
        @media (max-width: 860px) {
          .design-grid { grid-template-columns: 1fr; }
          .crystal-grid { grid-template-columns: repeat(5, 1fr); max-height: 260px; }
        }
        @media (max-width: 480px) {
          .crystal-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      {/* Header */}
      <section style={{ background: '#FDFAF7', borderBottom: '1px solid #E5DDD5', padding: '28px 24px 24px', textAlign: 'center' }}>
        <p style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', margin: '0 0 8px' }}>
          ✦ Custom Bracelet Builder
        </p>
        <h1 style={{ ...SERIF, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 300, color: '#3D2B1F', margin: '0 0 8px', lineHeight: 1.2 }}>
          Design Your Bracelet
        </h1>
        <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', margin: '0 auto', lineHeight: 1.7, maxWidth: 460 }}>
          Select each crystal bead for all 21 positions. Click a slot, then choose a crystal.
        </p>
      </section>

      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* ── Two-column builder ── */}
        <div className="design-grid">

          {/* LEFT — Interactive bracelet */}
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5DDD5', padding: '28px 20px', boxShadow: '0 8px 40px -16px rgba(101,70,46,0.14)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

            <div style={{ position: 'relative', width: CANVAS, height: CANVAS }}>
              {/* Thread ring SVG */}
              <svg width={CANVAS} height={CANVAS} viewBox={`0 0 ${CANVAS} ${CANVAS}`} style={{ position: 'absolute', inset: 0 }}>
                <rect width={CANVAS} height={CANVAS} rx="20" fill="#FBF8F4" />
                <circle cx={CX} cy={CX} r={RING_R} fill="none" stroke="rgba(140,100,60,0.18)" strokeWidth="1.5" strokeDasharray="3.5 3" />
              </svg>

              {/* Bead slots */}
              {beads.map((bead, i) => {
                const { left, top } = slotPos(i)
                const isActive = activeSlot === i
                const img = bead ? crystalMap[bead]?.bead_image_url : null
                return (
                  <div
                    key={i}
                    onClick={() => handleBeadClick(i)}
                    title={bead ? `Slot ${i + 1}: ${bead} — tap to clear` : `Slot ${i + 1}`}
                    style={{
                      position: 'absolute', left, top,
                      width: BEAD_R * 2, height: BEAD_R * 2,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: bead ? '#D8CCB8' : '#EDE6DD',
                      border: isActive
                        ? `2px solid ${GOLD}`
                        : bead
                        ? '1.5px solid rgba(120,85,45,0.25)'
                        : '1.5px dashed rgba(140,100,60,0.3)',
                      boxShadow: isActive ? `0 0 0 3px ${GOLD}44` : undefined,
                      transition: 'border 0.15s, box-shadow 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      userSelect: 'none', zIndex: isActive ? 3 : 1,
                    }}
                  >
                    {img && (
                      <Image
                        src={img} alt={bead!} fill sizes="30px"
                        style={{ objectFit: 'cover', transform: 'scale(2.2)', transformOrigin: 'center' }}
                      />
                    )}
                    {bead && !img && (
                      <span style={{ fontSize: 7, color: GOLD, position: 'relative', zIndex: 1 }}>✦</span>
                    )}
                    {!bead && (
                      <span style={{ fontSize: 8, fontWeight: 700, color: isActive ? GOLD : 'rgba(140,100,60,0.3)', position: 'relative', zIndex: 1 }}>
                        {i + 1}
                      </span>
                    )}
                    {/* Clear overlay when slot is active + filled */}
                    {isActive && bead && (
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(46,33,24,0.68)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
                        <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1 }}>×</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Counter */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ ...BODY, fontSize: 13, color: '#7A5B45', margin: 0 }}>
                <strong style={{ color: filledCount === N ? GOLD : '#3D2B1F', fontWeight: 700 }}>{filledCount}</strong>
                <span style={{ color: '#9A8573' }}> / {N} beads</span>
              </p>
              <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: '4px 0 0' }}>
                {beads[activeSlot] ? `Slot ${activeSlot + 1} — tap to clear` : `Slot ${activeSlot + 1} — pick a crystal`}
              </p>
            </div>

            {filledCount > 0 && (
              <button
                onClick={() => { setBeads(Array(N).fill(null)); setActiveSlot(0) }}
                style={{ ...BODY, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#C5B8AD', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'underline', padding: 0 }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* RIGHT — Crystals + Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Crystal picker */}
            <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5DDD5', padding: '20px', boxShadow: '0 8px 40px -16px rgba(101,70,46,0.14)' }}>
              <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 14px' }}>
                Crystal Palette
              </p>

              <div className="crystal-grid">
                {crystals.map(c => {
                  const inUse = uniqueCrystals.includes(c.name)
                  return (
                    <button
                      key={c.id}
                      onClick={() => assignCrystal(c.name)}
                      title={c.name}
                      style={{
                        background: '#fff', border: `1.5px solid ${inUse ? GOLD : '#E5DDD5'}`,
                        borderRadius: 10, padding: '6px 4px 5px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = '#FDFAF7' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = inUse ? GOLD : '#E5DDD5'; e.currentTarget.style.background = '#fff' }}
                    >
                      <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', background: '#F0EBE4', position: 'relative', flexShrink: 0 }}>
                        {c.bead_image_url ? (
                          <Image src={c.bead_image_url} alt={c.name} fill sizes="42px" style={{ objectFit: 'cover', transform: 'scale(2.2)', transformOrigin: 'center' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: GOLD, opacity: 0.3, fontSize: 16 }}>✦</span>
                          </div>
                        )}
                      </div>
                      <span style={{ ...BODY, fontSize: 8, fontWeight: 500, color: '#4A3A32', textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word', width: '100%' }}>
                        {c.name}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* In-use summary */}
              {uniqueCrystals.length > 0 && (
                <div style={{ marginTop: 14, padding: '10px 12px', background: '#FBF8F4', borderRadius: 8, border: '1px solid #EDE6DD' }}>
                  <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 4px' }}>In Your Design</p>
                  <p style={{ ...SERIF, fontSize: 13, fontWeight: 300, color: '#4A3A32', margin: 0, lineHeight: 1.7 }}>
                    {uniqueCrystals.join(' · ')}
                  </p>
                </div>
              )}
            </div>

            {/* Options */}
            <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5DDD5', padding: '20px', boxShadow: '0 8px 40px -16px rgba(101,70,46,0.14)' }}>
              <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 16px' }}>
                Customise Your Order
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {/* Spacer */}
                <div>
                  <label style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 7 }}>Spacer</label>
                  <select
                    value={spacer} onChange={e => setSpacer(e.target.value)}
                    style={{ ...BODY, width: '100%', padding: '9px 10px', border: '1px solid #E5DDD5', borderRadius: 8, fontSize: 11, color: '#4A3A32', background: '#FDFAF7', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="rosegold">Rose Gold</option>
                    <option value="exclude">No Spacer</option>
                  </select>
                </div>

                {/* Charm */}
                <div>
                  <label style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 7 }}>Logo Charm</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {([true, false] as const).map(val => (
                      <button
                        key={String(val)} onClick={() => setIncludeCharm(val)}
                        style={{
                          ...BODY, flex: 1, padding: '9px 0', borderRadius: 8,
                          border: `1px solid ${includeCharm === val ? GOLD : '#E5DDD5'}`,
                          background: includeCharm === val ? '#FAF5EE' : '#FDFAF7',
                          color: includeCharm === val ? GOLD : '#9A8573',
                          fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {val ? 'Include' : 'Exclude'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 7 }}>
                  Special Requests
                </label>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any special instructions or notes…"
                  rows={2}
                  style={{ ...BODY, width: '100%', padding: '9px 10px', border: '1px solid #E5DDD5', borderRadius: 8, fontSize: 11, color: '#4A3A32', background: '#FDFAF7', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Price + Action buttons ── */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: '#fff', borderRadius: 20, border: '1px solid #E5DDD5', padding: '20px 24px', boxShadow: '0 4px 24px -8px rgba(101,70,46,0.1)' }}>
          <div>
            <p style={{ ...BODY, fontSize: 10, color: '#9A8573', margin: '0 0 2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Custom Design Bracelet</p>
            <p style={{ ...SERIF, fontSize: 36, fontWeight: 300, color: '#3D2B1F', margin: 0, lineHeight: 1.1 }}>S$79.00</p>
            <p style={{ ...BODY, fontSize: 10, color: '#9A8573', margin: '3px 0 0' }}>+ shipping · Free local delivery</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            {addedToCart ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <span style={{ ...BODY, fontSize: 12, color: '#5C8B5C', fontWeight: 600 }}>✓ Added to cart</span>
                <Link
                  href="/shop/cart"
                  style={{ ...BODY, padding: '12px 28px', borderRadius: 999, background: '#4A3A32', color: '#fff', fontSize: 10, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', textDecoration: 'none' }}
                >
                  View Cart ✦
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleAddToCart}
                  disabled={!canCheckout}
                  style={{
                    ...BODY, padding: '12px 24px', borderRadius: 999,
                    border: `1px solid ${canCheckout ? '#4A3A32' : '#C5B8AD'}`,
                    background: 'transparent',
                    color: canCheckout ? '#4A3A32' : '#C5B8AD',
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase',
                    cursor: canCheckout ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  }}
                >
                  {saving ? 'Saving…' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!canCheckout}
                  style={{
                    ...BODY, padding: '12px 28px', borderRadius: 999,
                    background: canCheckout ? '#4A3A32' : '#C5B8AD',
                    border: 'none', color: '#fff',
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase',
                    cursor: canCheckout ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  }}
                >
                  {saving ? 'Saving…' : 'Purchase Now ✦'}
                </button>
              </div>
            )}
            {!canCheckout && !saving && (
              <p style={{ ...BODY, fontSize: 10, color: '#9A8573', margin: 0 }}>Select at least one crystal to continue</p>
            )}
            {saveError && (
              <p style={{ ...BODY, fontSize: 11, color: '#C0392B', margin: 0 }}>{saveError}</p>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/energy-quiz" style={{ ...BODY, fontSize: 11, color: '#9A8573', textDecoration: 'none' }}>
            ✦ Prefer crystal recommendations? Take the Energy Quiz
          </Link>
        </div>

      </section>
    </main>
  )
}
