'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addBraceletToCart } from '@/lib/cart'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY:  React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

const DESIGN_PRICE = 79
const N       = 21
const BEAD_R  = 15
const RING_R  = 100
const CANVAS  = 280
const CX      = CANVAS / 2

type Crystal = { id: number; name: string; bead_image_url: string | null }

function slotPos(i: number) {
  const a = (i / N) * 2 * Math.PI - Math.PI / 2
  return { left: CX + RING_R * Math.cos(a) - BEAD_R, top: CX + RING_R * Math.sin(a) - BEAD_R }
}

// Mirrors the focus-trap used in PurchasePanel
function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
    focusable[0]?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !focusable.length) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus() } }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [active])
  return ref
}

export default function DesignPage() {
  const router = useRouter()
  const [crystals, setCrystals]         = useState<Crystal[]>([])
  const [beads, setBeads]               = useState<(string | null)[]>(Array(N).fill(null))
  const [activeSlot, setActiveSlot]     = useState<number>(0)
  const [spacer, setSpacer]             = useState<'silver' | 'gold' | 'exclude'>('silver')
  const [includeCharm, setIncludeCharm] = useState(true)
  const [notes, setNotes]               = useState('')
  const [saving, setSaving]             = useState(false)
  const [saveError, setSaveError]       = useState<string | null>(null)
  const [addedToCart, setAddedToCart]   = useState(false)
  const [measureOpen, setMeasureOpen]   = useState(false)
  const [packagingOpen, setPackagingOpen] = useState(false)
  const measureRef   = useFocusTrap(measureOpen)
  const packagingRef = useFocusTrap(packagingOpen)

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

  async function handleAddToCart() {
    if (filledCount === 0 || saving) return
    try {
      const { resultId, imageUrl } = await saveDesign()
      addBraceletToCart({ resultId, spacer, includeCharm, remark: notes, imageUrl, crystalNames: uniqueCrystals, price: DESIGN_PRICE })
      setAddedToCart(true)
      setTimeout(() => router.push('/shop/cart'), 600)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setSaving(false) }
  }

  const canAct = filledCount > 0 && !saving

  // Pill button style — mirrors PurchasePanel exactly
  function pillStyle(active: boolean): React.CSSProperties {
    return {
      ...BODY,
      width: 72, padding: '5px 0', borderRadius: 999, cursor: 'pointer',
      border: `1.5px solid ${active ? GOLD : '#E5DDD5'}`,
      background: active ? '#FEF9F2' : '#fff',
      fontSize: 11, textAlign: 'center', textTransform: 'capitalize',
      color: active ? '#4A3A32' : '#9A8573',
      transition: 'all 0.15s',
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F1EB] text-[#4A3A32]">

      {/* PAGE HEADER — mirrors results page */}
      <header className="mx-auto max-w-[1280px] px-6 pt-16 pb-12 text-center">
        <p style={BODY} className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">
          ✦ Custom Bracelet Builder
        </p>
        <h1 style={SERIF} className="text-4xl font-light leading-tight text-[#4A3A32] sm:text-5xl">
          Design Your Bracelet
        </h1>
        <div className="mx-auto mt-6 h-px w-20 bg-[#D9C4A8]" />
      </header>

      {/* TWO-COLUMN LAYOUT — mirrors results page grid exactly */}
      <section className="mx-auto max-w-[1280px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8 lg:items-stretch">

          {/* ── LEFT: Interactive bracelet (3/5) ── */}
          <div className="lg:col-span-3 lg:h-full">
            <div className="overflow-hidden rounded-[28px] border border-[#E5DDD5] bg-white p-8 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.3)] sm:p-10 lg:flex lg:flex-col lg:h-full">

              {/* Bracelet circle — fills the same role as the bracelet image */}
              <div className="w-full lg:flex-1 flex items-center justify-center">
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
                        {img && <Image src={img} alt={bead!} fill sizes="30px" style={{ objectFit: 'cover', transform: 'scale(2.2)', transformOrigin: 'center' }} />}
                        {bead && !img && <span style={{ fontSize: 7, color: GOLD, position: 'relative', zIndex: 1 }}>✦</span>}
                        {!bead && <span style={{ fontSize: 8, fontWeight: 700, color: isActive ? GOLD : 'rgba(140,100,60,0.3)', position: 'relative', zIndex: 1 }}>{i + 1}</span>}
                        {isActive && bead && (
                          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(46,33,24,0.68)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
                            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1 }}>×</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Counter + hint — below circle */}
              <div className="mt-4 text-center" style={BODY}>
                <p className="text-[13px] text-[#7A5B45]">
                  <strong style={{ color: filledCount === N ? GOLD : '#3D2B1F' }}>{filledCount}</strong>
                  <span className="text-[#9A8573]"> / {N} beads filled</span>
                </p>
                <p className="text-[11px] text-[#9A8573] mt-1">
                  {beads[activeSlot]
                    ? `Slot ${activeSlot + 1} selected — tap again to clear`
                    : `Slot ${activeSlot + 1} active — pick a crystal on the right →`}
                </p>
                {filledCount > 0 && (
                  <button
                    onClick={() => { setBeads(Array(N).fill(null)); setActiveSlot(0); setAddedToCart(false) }}
                    style={BODY}
                    className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#C5B8AD] underline underline-offset-2 bg-transparent border-none cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Footer — mirrors results page footer text */}
              <div className="mt-6 px-2 text-center" style={BODY}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B08B57] mb-1">
                  Your Design · 21 Beads · Handcrafted
                </p>
                <p className="text-[11px] leading-relaxed text-[#C5B8AD]">
                  Each crystal bead is a genuine natural gemstone. Your handcrafted bracelet may have slight variations in colour and texture, making it beautifully one-of-a-kind.
                </p>
              </div>

            </div>
          </div>

          {/* ── RIGHT: Crystal palette + Options + Purchase (2/5) ── */}
          <div className="rounded-[28px] border border-[#E5DDD5] bg-white p-5 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.2)] sm:p-6 lg:col-span-2">
            <div className="flex flex-col gap-3">

              {/* CRYSTAL PALETTE — replaces "Your Elemental Analysis" */}
              <div>
                <p style={BODY} className="mb-2 text-[10px] font-bold uppercase tracking-[0.32em] text-[#4A3A32]">
                  Crystal Palette
                </p>
                {uniqueCrystals.length > 0 ? (
                  <p style={BODY} className="text-[12px] leading-[1.8] text-[#7A5B45] mb-3">
                    <strong style={{ color: GOLD }}>{filledCount}</strong> / {N} beads filled · {uniqueCrystals.join(' · ')}
                  </p>
                ) : (
                  <p style={BODY} className="text-[12px] leading-[1.8] text-[#7A5B45] mb-3">
                    Tap a numbered slot on the left, then select a crystal below to place it.
                  </p>
                )}

                {/* Crystal grid — 4 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, maxHeight: 300, overflowY: 'auto', padding: '2px 1px' }}>
                  {crystals.map(c => {
                    const inUse = uniqueCrystals.includes(c.name)
                    return (
                      <button
                        key={c.id}
                        onClick={() => assignCrystal(c.name)}
                        title={c.name}
                        style={{
                          ...BODY,
                          background: '#fff',
                          border: `1.5px solid ${inUse ? GOLD : '#E5DDD5'}`,
                          borderRadius: 10, padding: '7px 3px 5px', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = '#FDFAF7' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = inUse ? GOLD : '#E5DDD5'; e.currentTarget.style.background = '#fff' }}
                      >
                        <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', background: '#F0EBE4', position: 'relative', flexShrink: 0 }}>
                          {c.bead_image_url
                            ? <Image src={c.bead_image_url} alt={c.name} fill sizes="42px" style={{ objectFit: 'cover', transform: 'scale(2.2)', transformOrigin: 'center' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: GOLD, opacity: 0.3, fontSize: 16 }}>✦</span></div>
                          }
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 500, color: '#4A3A32', textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word', width: '100%' }}>
                          {c.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="h-px bg-[#E5DDD5]" />

              {/* BRACELET OPTIONS — exact copy of PurchasePanel */}
              <div className="flex flex-col gap-2.5">
                <p style={BODY} className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#4A3A32]">
                  Bracelet Options
                </p>

                <div className="flex items-center gap-3">
                  <span style={{ ...BODY, fontSize: 11, color: '#9A8573', flexShrink: 0, width: 80 }}>Spacer</span>
                  <div className="flex gap-2">
                    {(['silver', 'gold', 'exclude'] as const).map(opt => (
                      <button key={opt} type="button" onClick={() => setSpacer(opt)} style={pillStyle(spacer === opt)}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span style={{ ...BODY, fontSize: 11, color: '#9A8573', flexShrink: 0, width: 80 }}>Logo Charm</span>
                  <div className="flex gap-2">
                    {([{ value: true, label: 'Include' }, { value: false, label: 'Exclude' }] as const).map(opt => (
                      <button key={String(opt.value)} type="button" onClick={() => setIncludeCharm(opt.value)} style={pillStyle(includeCharm === opt.value)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#E5DDD5]" />

              {/* REMARKS — exact copy */}
              <div>
                <p style={BODY} className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.32em] text-[#4A3A32]">
                  Remarks
                </p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special requests or notes for your order?"
                  rows={2}
                  maxLength={300}
                  style={BODY}
                  className="w-full resize-none rounded-xl border border-[#E5DDD5] bg-transparent px-4 py-3 text-[12px] text-[#4A3A32] placeholder-[#C5B8AD] outline-none transition-colors focus:border-[#B08B57] leading-relaxed"
                />
                {notes.length > 0 && (
                  <p style={BODY} className="mt-1 text-right text-[10px] text-[#C5B8AD]">{notes.length}/300</p>
                )}
              </div>

              <div className="h-px bg-[#E5DDD5]" />

              {/* INFO BULLETS — exact copy */}
              <div className="rounded-xl border border-[#E5DDD5] bg-[#F8F4EF] px-4 py-4" style={BODY}>
                <div className="flex gap-2.5">
                  <span className="mt-0.5 shrink-0 text-[#B08B57]">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div className="flex flex-col gap-3">
                    {[
                      <span key="a">All SYANN bracelets use <strong className="font-medium text-[#4A3A32]">8 mm natural crystal beads</strong> for a consistent, premium finish.</span>,
                      <span key="b">Every order arrives in a <strong className="font-medium text-[#4A3A32]">premium gift box</strong> with a crystal care card.{' '}
                        <button type="button" onClick={() => setPackagingOpen(true)} style={{ fontFamily: 'inherit', fontSize: 'inherit' }} className="text-[#B08B57] underline underline-offset-2 bg-transparent border-none cursor-pointer hover:opacity-70">
                          See packaging example
                        </button>
                      </span>,
                      <span key="c">The default bracelet size is <strong className="font-medium text-[#4A3A32]">16 cm</strong>. Please include your wrist size in the remarks if you&apos;d like it larger or smaller.{' '}
                        <button type="button" onClick={() => setMeasureOpen(true)} style={{ fontFamily: 'inherit', fontSize: 'inherit' }} className="text-[#B08B57] underline underline-offset-2 bg-transparent border-none cursor-pointer hover:opacity-70">
                          How to measure your wrist
                        </button>
                      </span>,
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-[3px] shrink-0 text-[#B08B57]">
                          <svg width="5" height="5" viewBox="0 0 6 6" aria-hidden="true"><circle cx="3" cy="3" r="3" fill="currentColor" /></svg>
                        </span>
                        <p className="text-[12px] leading-normal text-[#7A5B45] m-0">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PRICE */}
              <div style={BODY}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B08B57] mb-1">Custom Design Bracelet</p>
                <p style={SERIF} className="text-[36px] font-light text-[#4A3A32] leading-none">S$79.00</p>
                <p className="text-[11px] text-[#9A8573] mt-1">+ shipping · free local delivery</p>
              </div>

              {/* BUTTONS — exact copy of PurchasePanel */}
              <div className="flex flex-col gap-3">
                {saveError && <p style={BODY} className="text-[11px] text-[#C0392B] text-center">{saveError}</p>}
                <button
                  onClick={handleBuyNow}
                  disabled={!canAct}
                  style={BODY}
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#4A3A32] bg-[#4A3A32] px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-white transition-all duration-300 hover:bg-[#B08B57] hover:border-[#B08B57] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : <><span>Purchase Now</span><span aria-hidden="true">✦</span></>}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!canAct}
                  style={BODY}
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#B08B57] bg-transparent px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#B08B57] transition-all duration-300 hover:bg-[#B08B57] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addedToCart ? 'Added — going to cart…' : 'Add to Cart'}
                </button>
                {!canAct && !saving && (
                  <p style={BODY} className="text-[11px] text-[#9A8573] text-center">
                    Select at least one crystal to continue
                  </p>
                )}
              </div>

              <p style={BODY} className="text-center text-[11px]">
                <Link href="/energy-quiz" className="text-[#9A8573] no-underline hover:opacity-70">
                  ✦ Let the quiz recommend crystals for you
                </Link>
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* MEASURE WRIST MODAL — exact copy */}
      {measureOpen && (
        <div ref={measureRef} role="dialog" aria-modal="true" aria-label="How to measure your wrist" className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-[#2E2118]/50 backdrop-blur-sm" onClick={() => setMeasureOpen(false)} />
          <div className="relative w-full max-w-md rounded-[28px] bg-[#FBF6EE] p-8 shadow-[0_40px_100px_-30px_rgba(74,58,50,0.5)]">
            <button onClick={() => setMeasureOpen(false)} aria-label="Close" className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#9A8573] hover:bg-[#E5DDD5] hover:text-[#4A3A32]">✕</button>
            <p style={BODY} className="mb-1 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">Size Guide</p>
            <h3 style={SERIF} className="mb-6 text-2xl font-light text-[#4A3A32]">How to Measure Your Wrist</h3>
            <ol className="flex flex-col gap-5">
              {[
                { n: '01', text: 'Wrap a thin strip of paper or a flexible tape measure around your wrist, just below the wrist bone.' },
                { n: '02', text: 'Mark where the paper meets — this is your wrist circumference.' },
                { n: '03', text: 'Lay the strip flat and measure the length in centimetres.' },
                { n: '04', text: "Add your wrist measurement to the Remarks field. The default size is 16 cm — let us know if you'd like it larger or smaller." },
              ].map(({ n, text }) => (
                <li key={n} className="flex gap-4">
                  <span style={SERIF} className="shrink-0 text-2xl font-light text-[#B08B57] leading-tight">{n}</span>
                  <p style={BODY} className="text-[13.5px] leading-relaxed text-[#6B5848]">{text}</p>
                </li>
              ))}
            </ol>
            <button onClick={() => setMeasureOpen(false)} style={BODY} className="mt-6 w-full rounded-full border border-[#B08B57] bg-[#B08B57] py-3 text-[12px] font-medium uppercase tracking-[0.28em] text-white hover:bg-[#7A5B45] hover:border-[#7A5B45]">Got It</button>
          </div>
        </div>
      )}

      {/* PACKAGING MODAL — exact copy */}
      {packagingOpen && (
        <div ref={packagingRef} role="dialog" aria-modal="true" aria-label="Sample packaging" className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-[#2E2118]/50 backdrop-blur-sm" onClick={() => setPackagingOpen(false)} />
          <div className="relative w-full max-w-md rounded-[28px] bg-[#FBF6EE] p-6 shadow-[0_40px_100px_-30px_rgba(74,58,50,0.5)]">
            <button onClick={() => setPackagingOpen(false)} aria-label="Close" className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#9A8573] hover:bg-[#E5DDD5] hover:text-[#4A3A32]">✕</button>
            <p style={BODY} className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">Packaging</p>
            <div className="overflow-hidden rounded-2xl border border-[#E5DDD5]">
              <img src="/SamplePackaging.webp" alt="Sample packaging" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
            </div>
            <p style={BODY} className="mt-4 text-[12px] leading-relaxed text-[#7A6355]">
              Every SYANN bracelet arrives in a premium gift box with a crystal care card, degaussing crystal, and a pouch — beautifully presented and ready to gift.
            </p>
            <button onClick={() => setPackagingOpen(false)} style={BODY} className="mt-5 w-full rounded-full border border-[#B08B57] bg-[#B08B57] py-3 text-[12px] font-medium uppercase tracking-[0.28em] text-white hover:bg-[#7A5B45] hover:border-[#7A5B45]">Got It</button>
          </div>
        </div>
      )}

    </main>
  )
}
