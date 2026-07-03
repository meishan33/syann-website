'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addBraceletToCart } from '@/lib/cart'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

const N = 21
const RING_R = 100 // px from center of 280×280 canvas
const BEAD_R = 14  // px radius of each slot
const CANVAS = 280
const CX = CANVAS / 2 // 140

type Crystal = {
  id: number
  name: string
  bead_image_url: string | null
}

function slotPos(i: number) {
  const angle = (i / N) * 2 * Math.PI - Math.PI / 2
  return {
    left: CX + RING_R * Math.cos(angle) - BEAD_R,
    top: CX + RING_R * Math.sin(angle) - BEAD_R,
  }
}

export default function DesignPage() {
  const router = useRouter()
  const [crystals, setCrystals] = useState<Crystal[]>([])
  const [search, setSearch] = useState('')
  const [beads, setBeads] = useState<(string | null)[]>(Array(N).fill(null))
  const [activeSlot, setActiveSlot] = useState<number>(0)
  const [spacer, setSpacer] = useState('silver')
  const [includeCharm, setIncludeCharm] = useState(true)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch('/api/crystals')
      .then(r => r.json())
      .then(data => setCrystals(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const filtered = search
    ? crystals.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : crystals

  const filledCount = beads.filter(Boolean).length
  const uniqueCrystals = [...new Set(beads.filter(Boolean) as string[])]

  function handleBeadClick(i: number) {
    // Clicking an active filled slot clears it; otherwise just selects the slot
    if (activeSlot === i && beads[i]) {
      const next = [...beads]
      next[i] = null
      setBeads(next)
    } else {
      setActiveSlot(i)
    }
  }

  function assignCrystal(crystalName: string) {
    const next = [...beads]
    next[activeSlot] = crystalName
    setBeads(next)
    // Advance to next empty slot (wrap around), or stay if all filled
    const startSearch = activeSlot + 1
    for (let k = 0; k < N; k++) {
      const idx = (startSearch + k) % N
      if (!next[idx]) { setActiveSlot(idx); return }
    }
    // All filled — stay on current
  }

  function clearAll() {
    setBeads(Array(N).fill(null))
    setActiveSlot(0)
  }

  async function handleAddToCart() {
    if (filledCount === 0 || saving || done) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/bracelet-builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beadSequence: beads.map(b => b ?? ''),
          crystalNames: uniqueCrystals,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save design.')

      addBraceletToCart({
        resultId: data.resultId,
        spacer,
        includeCharm,
        remark: notes,
        imageUrl: data.imageUrl,
        crystalNames: uniqueCrystals,
      })

      setDone(true)
      setTimeout(() => router.push('/shop/cart'), 700)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const crystalMap = Object.fromEntries(crystals.map(c => [c.name, c]))

  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', ...BODY }}>

      {/* Page header */}
      <section style={{ background: '#FDFAF7', borderBottom: '1px solid #E5DDD5', padding: '32px 24px 28px', textAlign: 'center' }}>
        <p style={{ ...BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.32em', color: GOLD, textTransform: 'uppercase', margin: '0 0 10px' }}>
          ✦ Custom Bracelet Builder
        </p>
        <h1 style={{ ...SERIF, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 300, color: '#3D2B1F', margin: '0 0 10px', lineHeight: 1.2 }}>
          Design Your Bracelet
        </h1>
        <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', margin: '0 auto', lineHeight: 1.8, maxWidth: 480 }}>
          Place crystals into each of the 21 bead positions. Click a slot, then pick a crystal.
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Builder: bracelet circle + crystal picker */}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>

          {/* ── Bracelet circle ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, flexShrink: 0 }}>

            <div style={{ position: 'relative', width: CANVAS, height: CANVAS }}>
              {/* Background + thread ring */}
              <svg
                width={CANVAS} height={CANVAS}
                viewBox={`0 0 ${CANVAS} ${CANVAS}`}
                style={{ position: 'absolute', inset: 0, borderRadius: 20, background: '#FBF8F4' }}
              >
                <rect width={CANVAS} height={CANVAS} rx="20" fill="#FBF8F4" />
                <circle
                  cx={CX} cy={CX} r={RING_R}
                  fill="none" stroke="rgba(140,100,60,0.2)" strokeWidth="1.2"
                  strokeDasharray="3 2.5"
                />
              </svg>

              {/* Bead slots */}
              {beads.map((bead, i) => {
                const { left, top } = slotPos(i)
                const isActive = activeSlot === i
                const crystal = bead ? crystalMap[bead] : null
                return (
                  <div
                    key={i}
                    onClick={() => handleBeadClick(i)}
                    title={bead ? `Slot ${i + 1}: ${bead} — click to clear` : `Slot ${i + 1}: empty`}
                    style={{
                      position: 'absolute',
                      left, top,
                      width: BEAD_R * 2,
                      height: BEAD_R * 2,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      background: bead ? '#DDD0C4' : '#EDE6DD',
                      border: isActive
                        ? `2px solid ${GOLD}`
                        : bead
                        ? '1.5px solid rgba(140,100,60,0.28)'
                        : '1.5px dashed rgba(140,100,60,0.28)',
                      boxShadow: isActive ? `0 0 0 3px ${GOLD}44` : 'none',
                      transition: 'border 0.15s, box-shadow 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                      zIndex: isActive ? 2 : 1,
                    }}
                  >
                    {crystal?.bead_image_url ? (
                      <Image
                        src={crystal.bead_image_url}
                        alt={bead!}
                        fill
                        sizes="28px"
                        style={{ objectFit: 'cover', transform: 'scale(2.2)', transformOrigin: 'center' }}
                      />
                    ) : bead ? (
                      <span style={{ fontSize: 8, color: GOLD, position: 'relative', zIndex: 1 }}>✦</span>
                    ) : (
                      <span style={{
                        fontSize: 8, fontWeight: 600,
                        color: isActive ? GOLD : 'rgba(140,100,60,0.35)',
                        fontFamily: "'Montserrat', sans-serif",
                        position: 'relative', zIndex: 1,
                      }}>
                        {i + 1}
                      </span>
                    )}
                    {/* Clear overlay when active + filled */}
                    {isActive && bead && (
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'rgba(46,33,24,0.65)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 3,
                      }}>
                        <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>×</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Slot counter + clear */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ ...BODY, fontSize: 12, color: '#7A5B45', margin: 0 }}>
                <span style={{ fontWeight: 700, color: filledCount === N ? GOLD : '#3D2B1F' }}>{filledCount}</span>
                <span style={{ color: '#9A8573' }}> / {N} beads</span>
              </p>
              <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: '3px 0 0' }}>
                Slot {activeSlot + 1} active — pick a crystal below
              </p>
            </div>

            {filledCount > 0 && (
              <button
                onClick={clearAll}
                style={{ ...BODY, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#C5B8AD', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'underline', padding: 0 }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* ── Crystal picker ── */}
          <div style={{ flex: 1, minWidth: 260, maxWidth: 560 }}>
            <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 12px' }}>
              Crystal Palette
            </p>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="#9A8573" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="9" cy="9" r="7"/><path d="M15 15l3 3"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search crystals…"
                style={{ ...BODY, width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #E5DDD5', borderRadius: 999, fontSize: 12, color: '#4A3A32', background: '#FDFAF7', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Crystal grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
              gap: 8,
              maxHeight: 340,
              overflowY: 'auto',
              padding: '2px 2px 8px',
            }}>
              {filtered.map(c => {
                const inUse = uniqueCrystals.includes(c.name)
                return (
                  <button
                    key={c.id}
                    onClick={() => assignCrystal(c.name)}
                    title={c.name}
                    style={{
                      background: '#fff',
                      border: `1.5px solid ${inUse ? GOLD : '#E5DDD5'}`,
                      borderRadius: 12,
                      padding: '8px 4px 6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = '#FDFAF7' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = inUse ? GOLD : '#E5DDD5'; e.currentTarget.style.background = '#fff' }}
                  >
                    <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', background: '#F0EBE4', flexShrink: 0, position: 'relative' }}>
                      {c.bead_image_url ? (
                        <Image
                          src={c.bead_image_url}
                          alt={c.name}
                          fill
                          sizes="46px"
                          style={{ objectFit: 'cover', transform: 'scale(2.2)', transformOrigin: 'center' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: GOLD, opacity: 0.3, fontSize: 18 }}>✦</span>
                        </div>
                      )}
                    </div>
                    <span style={{ ...BODY, fontSize: 9, fontWeight: 500, color: '#4A3A32', letterSpacing: '0.03em', textAlign: 'center', lineHeight: 1.4, wordBreak: 'break-word', width: '100%' }}>
                      {c.name}
                    </span>
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <p style={{ ...BODY, fontSize: 12, color: '#9A8573', gridColumn: '1 / -1', margin: '20px 0', textAlign: 'center' }}>
                  No crystals found
                </p>
              )}
            </div>

            {/* In-use legend */}
            {uniqueCrystals.length > 0 && (
              <div style={{ marginTop: 14, padding: '12px 14px', background: '#FBF8F4', borderRadius: 10, border: '1px solid #E5DDD5' }}>
                <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 6px' }}>
                  In Your Design
                </p>
                <p style={{ ...SERIF, fontSize: 14, fontWeight: 300, color: '#4A3A32', margin: 0, lineHeight: 1.7 }}>
                  {uniqueCrystals.join(' · ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Options ── */}
        <div style={{ marginTop: 40, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto', background: '#fff', borderRadius: 20, border: '1px solid #E5DDD5', padding: '24px', boxShadow: '0 4px 24px -8px rgba(101,70,46,0.1)' }}>
          <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 20px' }}>
            Customise Your Order
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {/* Spacer */}
            <div>
              <label style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 8 }}>
                Spacer Beads
              </label>
              <select
                value={spacer}
                onChange={e => setSpacer(e.target.value)}
                style={{ ...BODY, width: '100%', padding: '10px 12px', border: '1px solid #E5DDD5', borderRadius: 8, fontSize: 12, color: '#4A3A32', background: '#FDFAF7', cursor: 'pointer', outline: 'none' }}
              >
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="rosegold">Rose Gold</option>
                <option value="exclude">No Spacer</option>
              </select>
            </div>

            {/* Charm */}
            <div>
              <label style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 8 }}>
                Logo Charm
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {([true, false] as const).map(val => (
                  <button
                    key={String(val)}
                    onClick={() => setIncludeCharm(val)}
                    style={{
                      ...BODY, flex: 1, padding: '10px 0', borderRadius: 8,
                      border: `1px solid ${includeCharm === val ? GOLD : '#E5DDD5'}`,
                      background: includeCharm === val ? '#FAF5EE' : '#FDFAF7',
                      color: includeCharm === val ? GOLD : '#9A8573',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {val ? 'Include' : 'Exclude'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 8 }}>
              Special Requests
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any special instructions or notes for your order…"
              rows={2}
              style={{ ...BODY, width: '100%', padding: '10px 12px', border: '1px solid #E5DDD5', borderRadius: 8, fontSize: 12, color: '#4A3A32', background: '#FDFAF7', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* ── Price + Add to Cart ── */}
        <div style={{ marginTop: 24, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: '0 0 2px', letterSpacing: '0.06em' }}>Custom Crystal Bracelet</p>
            <p style={{ ...SERIF, fontSize: 34, fontWeight: 300, color: '#3D2B1F', margin: 0 }}>S$59.00</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <button
              onClick={handleAddToCart}
              disabled={saving || filledCount === 0 || done}
              style={{
                ...BODY,
                padding: '14px 36px', borderRadius: 999,
                background: done ? '#5C8B5C' : filledCount === 0 ? '#C5B8AD' : '#4A3A32',
                border: 'none', color: '#fff',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase',
                cursor: saving || filledCount === 0 || done ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'all 0.25s',
              }}
            >
              {done ? 'Added to Cart ✓' : saving ? 'Saving Design…' : 'Add to Cart ✦'}
            </button>
            {filledCount === 0 && (
              <p style={{ ...BODY, fontSize: 11, color: '#9A8573', margin: 0 }}>
                Select at least one crystal to continue
              </p>
            )}
            {saveError && (
              <p style={{ ...BODY, fontSize: 11, color: '#C0392B', margin: 0 }}>{saveError}</p>
            )}
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/energy-quiz" style={{ ...BODY, fontSize: 11, color: '#9A8573', textDecoration: 'none' }}>
            ✦ Let our quiz recommend crystals for you instead
          </Link>
        </div>

      </section>
    </main>
  )
}
