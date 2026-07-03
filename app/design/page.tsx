'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addBraceletToCart } from '@/lib/cart'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY:  React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

const DESIGN_PRICE = 79
const N       = 21
const BEAD_R  = 15   // px — chord ≈ diameter → beads touch
const RING_R  = 100  // px from canvas centre
const CANVAS  = 280
const CX      = CANVAS / 2  // 140

// Card style mirrors the payment page exactly
const CARD: React.CSSProperties = {
  borderRadius: 28,
  border: '1px solid #E5DDD5',
  background: '#fff',
  padding: 32,
  boxShadow: '0 20px 60px -30px rgba(101,70,46,0.2)',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
}
const DIVIDER: React.CSSProperties = { height: 1, background: '#E5DDD5', flexShrink: 0 }
const LABEL:   React.CSSProperties = { ...BODY, fontSize: 12, color: '#7A5B45', margin: 0 }
const VALUE:   React.CSSProperties = { ...BODY, fontSize: 12, fontWeight: 500, color: '#4A3A32', margin: 0 }
const ROW:     React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }
const SEC_HDR: React.CSSProperties = { ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD, margin: 0 }

type Crystal = { id: number; name: string; bead_image_url: string | null }

function slotPos(i: number) {
  const angle = (i / N) * 2 * Math.PI - Math.PI / 2
  return { left: CX + RING_R * Math.cos(angle) - BEAD_R, top: CX + RING_R * Math.sin(angle) - BEAD_R }
}

const SPACER_OPTS = [
  { value: 'silver',   label: 'Silver' },
  { value: 'gold',     label: 'Gold' },
  { value: 'rosegold', label: 'Rose Gold' },
  { value: 'exclude',  label: 'None' },
]

export default function DesignPage() {
  const router = useRouter()
  const [crystals, setCrystals]         = useState<Crystal[]>([])
  const [beads, setBeads]               = useState<(string | null)[]>(Array(N).fill(null))
  const [activeSlot, setActiveSlot]     = useState<number>(0)
  const [spacer, setSpacer]             = useState('silver')
  const [includeCharm, setIncludeCharm] = useState(true)
  const [notes, setNotes]               = useState('')
  const [saving, setSaving]             = useState(false)
  const [saveError, setSaveError]       = useState<string | null>(null)
  const [addedToCart, setAddedToCart]   = useState(false)

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
      const p = new URLSearchParams({ result: resultId, spacer, includeCharm: String(includeCharm) })
      if (notes) p.set('remark', notes)
      router.push(`/payment?${p.toString()}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  const canAct = filledCount > 0 && !saving

  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', ...BODY }}>
      <style>{`
        .design-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
        .crystal-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; max-height: 360px; overflow-y: auto; padding: 2px; }
        @media (max-width: 860px) {
          .design-cols { grid-template-columns: 1fr; }
          .crystal-grid { grid-template-columns: repeat(5, 1fr); max-height: 240px; }
        }
        @media (max-width: 480px) {
          .crystal-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      {/* ── Page header ── mirrors payment page header */}
      <header style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 40px', textAlign: 'center' }}>
        <p style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: GOLD, margin: '0 0 16px' }}>
          ✦ Custom Bracelet Builder
        </p>
        <h1 style={{ ...SERIF, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 300, lineHeight: 1.2, color: '#4A3A32', margin: '0 0 0' }}>
          Design Your Bracelet
        </h1>
        <div style={{ height: 1, width: 80, background: '#D9C4A8', margin: '24px auto 0' }} />
      </header>

      {/* ── Two-column layout ── mirrors payment page section */}
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="design-cols">

          {/* ── LEFT CARD — bracelet circle + order details ── */}
          <div style={CARD}>

            {/* SYANN.CO label */}
            <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: GOLD, margin: 0, textAlign: 'center' }}>
              SYANN.CO
            </p>

            {/* Interactive bracelet circle — the "product image" */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', width: CANVAS, height: CANVAS }}>
                <svg width={CANVAS} height={CANVAS} viewBox={`0 0 ${CANVAS} ${CANVAS}`} style={{ position: 'absolute', inset: 0 }}>
                  <rect width={CANVAS} height={CANVAS} rx="20" fill="#FBF8F4" />
                  <circle cx={CX} cy={CX} r={RING_R} fill="none" stroke="rgba(140,100,60,0.18)" strokeWidth="1.5" strokeDasharray="3.5 3" />
                </svg>
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
                        borderRadius: '50%', overflow: 'hidden', cursor: 'pointer',
                        background: bead ? '#D8CCB8' : '#EDE6DD',
                        border: isActive ? `2px solid ${GOLD}` : bead ? '1.5px solid rgba(120,85,45,0.25)' : '1.5px dashed rgba(140,100,60,0.3)',
                        boxShadow: isActive ? `0 0 0 3px ${GOLD}44` : undefined,
                        transition: 'border 0.15s, box-shadow 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        userSelect: 'none', zIndex: isActive ? 3 : 1,
                      }}
                    >
                      {img && (
                        <Image src={img} alt={bead!} fill sizes="30px"
                          style={{ objectFit: 'cover', transform: 'scale(2.2)', transformOrigin: 'center' }} />
                      )}
                      {bead && !img && <span style={{ fontSize: 7, color: GOLD, position: 'relative', zIndex: 1 }}>✦</span>}
                      {!bead && (
                        <span style={{ fontSize: 8, fontWeight: 700, color: isActive ? GOLD : 'rgba(140,100,60,0.3)', position: 'relative', zIndex: 1 }}>
                          {i + 1}
                        </span>
                      )}
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
                  <strong style={{ fontWeight: 700, color: filledCount === N ? GOLD : '#3D2B1F' }}>{filledCount}</strong>
                  <span style={{ color: '#9A8573' }}> / {N} beads filled</span>
                </p>
                <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: '4px 0 0' }}>
                  {beads[activeSlot] ? `Slot ${activeSlot + 1} selected — tap to clear` : `Slot ${activeSlot + 1} — choose a crystal →`}
                </p>
              </div>

              {filledCount > 0 && (
                <button
                  onClick={() => { setBeads(Array(N).fill(null)); setActiveSlot(0); setAddedToCart(false) }}
                  style={{ ...BODY, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#C5B8AD', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'underline', padding: 0 }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Crystal names summary (mirrors payment page crystal names below image) */}
            {uniqueCrystals.length > 0 && (
              <>
                <div style={{ ...DIVIDER, marginTop: -8 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD, margin: 0 }}>
                    Your Design
                  </p>
                  <p style={{ ...SERIF, fontSize: 20, fontWeight: 300, color: '#4A3A32', margin: 0, lineHeight: 1.3 }}>
                    Your Custom Bracelet
                  </p>
                  <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: 0, lineHeight: 1.6 }}>
                    {uniqueCrystals.join(' · ')}
                  </p>
                </div>
              </>
            )}

            <div style={DIVIDER} />

            {/* Order details — same layout as payment page */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={SEC_HDR}>Order Details</p>

              {/* Spacer Colour */}
              <div style={ROW}>
                <span style={LABEL}>Spacer Colour</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {SPACER_OPTS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSpacer(opt.value)}
                      style={{
                        ...BODY, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                        fontSize: 12, fontWeight: spacer === opt.value ? 600 : 400,
                        color: spacer === opt.value ? GOLD : '#9A8573',
                        textDecoration: spacer === opt.value ? 'underline' : 'none',
                        textUnderlineOffset: 3, transition: 'color 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Charm */}
              <div style={ROW}>
                <span style={LABEL}>Logo Charm</span>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  {([true, false] as const).map(val => (
                    <button
                      key={String(val)}
                      onClick={() => setIncludeCharm(val)}
                      style={{
                        ...BODY, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                        fontSize: 12, fontWeight: includeCharm === val ? 600 : 400,
                        color: includeCharm === val ? GOLD : '#9A8573',
                        textDecoration: includeCharm === val ? 'underline' : 'none',
                        textUnderlineOffset: 3, transition: 'color 0.15s',
                      }}
                    >
                      {val ? 'Included' : 'Excluded'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special requests */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={LABEL}>Special Requests</span>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any special instructions or notes for your order…"
                  rows={2}
                  style={{ ...BODY, width: '100%', padding: '9px 12px', border: '1px solid #E5DDD5', borderRadius: 8, fontSize: 12, color: '#4A3A32', background: '#FDFAF7', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT CARD — crystal palette + price + actions ── */}
          <div style={CARD}>
            <p style={SEC_HDR}>Crystal Palette</p>
            <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: '-16px 0 -4px', lineHeight: 1.6 }}>
              Click a bead slot on the left, then tap a crystal to place it. Tap an active slot to clear it.
            </p>

            {/* Crystal grid */}
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
                      borderRadius: 10, padding: '7px 4px 6px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = '#FDFAF7' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = inUse ? GOLD : '#E5DDD5'; e.currentTarget.style.background = '#fff' }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#F0EBE4', position: 'relative', flexShrink: 0 }}>
                      {c.bead_image_url ? (
                        <Image src={c.bead_image_url} alt={c.name} fill sizes="44px"
                          style={{ objectFit: 'cover', transform: 'scale(2.2)', transformOrigin: 'center' }} />
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

            <div style={DIVIDER} />

            {/* Price + action buttons — mirrors the checkout button section in the payment page */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD, margin: '0 0 6px' }}>
                  Custom Design Bracelet
                </p>
                <p style={{ ...SERIF, fontSize: 40, fontWeight: 300, color: '#4A3A32', margin: 0, lineHeight: 1 }}>
                  S$79.00
                </p>
                <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: '6px 0 0' }}>
                  + shipping · free local delivery
                </p>
              </div>

              {addedToCart ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ ...BODY, fontSize: 12, color: '#5C8B5C', fontWeight: 600, margin: 0 }}>
                    ✓ Added to cart successfully
                  </p>
                  <Link
                    href="/shop/cart"
                    style={{ ...BODY, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '14px', borderRadius: 999, background: '#4A3A32', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', textDecoration: 'none', boxSizing: 'border-box' }}
                  >
                    View Cart ✦
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={handleBuyNow}
                    disabled={!canAct}
                    style={{
                      ...BODY, width: '100%', padding: '14px', borderRadius: 999,
                      background: canAct ? '#4A3A32' : '#C5B8AD',
                      border: 'none', color: '#fff',
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase',
                      cursor: canAct ? 'pointer' : 'not-allowed', transition: 'background 0.25s',
                    }}
                  >
                    {saving ? 'Saving Design…' : 'Purchase Now ✦'}
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={!canAct}
                    style={{
                      ...BODY, width: '100%', padding: '13px', borderRadius: 999,
                      background: 'transparent',
                      border: `1px solid ${canAct ? '#4A3A32' : '#C5B8AD'}`,
                      color: canAct ? '#4A3A32' : '#C5B8AD',
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase',
                      cursor: canAct ? 'pointer' : 'not-allowed', transition: 'all 0.25s',
                    }}
                  >
                    {saving ? '…' : 'Add to Cart'}
                  </button>
                  {!canAct && !saving && (
                    <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: 0, textAlign: 'center' }}>
                      Select at least one crystal to continue
                    </p>
                  )}
                  {saveError && (
                    <p style={{ ...BODY, fontSize: 11, color: '#C0392B', margin: 0, textAlign: 'center' }}>{saveError}</p>
                  )}
                </div>
              )}
            </div>

            <p style={{ ...BODY, textAlign: 'center', marginTop: -8 }}>
              <Link href="/energy-quiz" style={{ fontSize: 11, color: '#9A8573', textDecoration: 'none' }}>
                ✦ Let the quiz recommend crystals for you
              </Link>
            </p>
          </div>

        </div>
      </section>
    </main>
  )
}
