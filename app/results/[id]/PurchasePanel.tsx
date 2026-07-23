'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addBraceletToCart } from '@/lib/cart'

function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    if (focusable.length) focusable[0].focus()
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

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

type SpacerOption = {
  name: string
  bead_image_url: string | null
  bead_image_urls: string[] | null
}

type Props = {
  analysisSummary: string
  crystalNames?: string[]
  userName?: string | null
  resultId: string
  imageUrl?: string | null
  weakElement?: string | null
  strongElement?: string | null
  wristCm: number
  onWristChange: (v: number) => void
  beadCount: number
  adjustedSequence: string[]
  spacers: SpacerOption[]
  spacerGaps: (string | null)[]
  selectedSpacer: string | null
  onSpacerChange: (name: string | null) => void
  onClearSpacers: () => void
}

export default function PurchasePanel({ analysisSummary, crystalNames = [], userName, resultId, imageUrl, wristCm, onWristChange, beadCount, adjustedSequence, spacers, spacerGaps, selectedSpacer, onSpacerChange, onClearSpacers }: Props) {
  const router = useRouter()
  const spacerCount = spacerGaps.filter(Boolean).length
  const spacerForOrder = spacerGaps.some(g => g?.toLowerCase().includes('gold')) ? 'gold'
    : spacerGaps.some(g => g?.toLowerCase().includes('silver')) ? 'silver'
    : ('exclude' as const)
  const [includeCharm, setIncludeCharm] = useState(true)
  const [remark, setRemark] = useState<string>('')
  const [measureOpen, setMeasureOpen] = useState(false)
  const [packagingOpen, setPackagingOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const measureRef = useFocusTrap(measureOpen)
  const packagingRef = useFocusTrap(packagingOpen)

  async function generateWristImage(): Promise<string | null> {
    try {
      const res = await fetch('/api/results/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, beadSequence: adjustedSequence }),
      })
      if (!res.ok) return null
      const data = await res.json()
      return data.imageUrl ?? null
    } catch {
      return null
    }
  }

  async function handlePurchase() {
    setLoading(true)
    const fullRemark = `Wrist: ${wristCm.toFixed(1)} cm${remark ? ` | ${remark}` : ''}`
    await generateWristImage()
    const params = new URLSearchParams({ result: resultId, spacer: spacerForOrder, includeCharm: String(includeCharm), remark: fullRemark })
    router.push(`/payment?${params.toString()}`)
  }

  async function handleAddToCart() {
    const fullRemark = `Wrist: ${wristCm.toFixed(1)} cm${remark ? ` | ${remark}` : ''}`
    const generatedUrl = await generateWristImage()
    addBraceletToCart({ resultId, spacer: spacerForOrder, includeCharm, remark: fullRemark, imageUrl: generatedUrl ?? imageUrl ?? null, crystalNames })
    setAddedToCart(true)
    setTimeout(() => router.push('/shop/cart'), 600)
  }

  return (
    <>
      <div className="flex flex-col gap-3">

        {/* ANALYSIS */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.32em] text-[#4A3A32]" style={BODY}>
            Your Elemental Analysis
          </p>
          {(() => {
            const [paragraph, bulletBlock] = analysisSummary.split('\n\n')
            const bullets = bulletBlock
              ? bulletBlock.split('\n').filter(l => l.trim().startsWith('•')).map(l => l.replace(/^•\s*/, '').trim())
              : []
            return (
              <>
                <p className="text-[12px] leading-[1.8] text-[#7A5B45] mb-3" style={BODY}>
                  {userName && paragraph.startsWith(userName)
                    ? <>Dear <strong className="font-semibold text-[#4A3A32]">{userName}</strong>{paragraph.slice(userName.length)}</>
                    : paragraph}
                </p>
                {bullets.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    {bullets.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-[5px] shrink-0 text-[#B08B57]">
                          <svg width="5" height="5" viewBox="0 0 6 6" aria-hidden="true"><circle cx="3" cy="3" r="3" fill="currentColor" /></svg>
                        </span>
                        <p className="text-[12px] leading-[1.8] text-[#7A5B45] m-0" style={BODY}>
                          {(() => {
                            const match = crystalNames.find(n => point.startsWith(n))
                            return match
                              ? <><strong className="font-semibold text-[#4A3A32]">{match}</strong>{point.slice(match.length)}</>
                              : point
                          })()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>

        <div className="h-px bg-[#E5DDD5]" />

        {/* BRACELET OPTIONS */}
        <div className="flex flex-col gap-2.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#4A3A32]" style={BODY}>
            Bracelet Options
          </p>

          {/* Spacer */}
          {spacers.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9A8573' }}>Spacer</span>
                {spacerCount > 0 && (
                  <button type="button" onClick={onClearSpacers}
                    style={{ ...BODY, fontSize: 9, color: '#B0A090', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, letterSpacing: '0.06em' }}>
                    Clear {spacerCount} spacer{spacerCount > 1 ? 's' : ''}
                  </button>
                )}
              </div>
              <p style={{ ...BODY, fontSize: 9, color: '#B0A090', margin: '0 0 8px', lineHeight: 1.5 }}>
                {selectedSpacer
                  ? `Tap between beads on the bracelet to place · tap here to deselect`
                  : 'Select a spacer type, then tap the gaps between beads'}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {spacers.map(s => {
                  const imgUrl = s.bead_image_urls?.[0] ?? s.bead_image_url
                  const isSelected = selectedSpacer === s.name
                  const hasPlaced = spacerGaps.some(g => g === s.name)
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => onSpacerChange(isSelected ? null : s.name)}
                      title={isSelected ? `${s.name} selected — tap gaps on bracelet` : s.name}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
                        border: `2px solid ${isSelected ? GOLD : hasPlaced ? '#C8B89A' : '#E5DDD5'}`,
                        boxShadow: isSelected ? `0 0 0 3px #F5E8D0` : 'none',
                        background: '#F6F1EB', transition: 'all 0.15s',
                      }}>
                        {imgUrl
                          ? <img src={imgUrl} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(2.2)', display: 'block' }} />
                          : <div style={{ width: '100%', height: '100%', background: '#DDD0C4' }} />
                        }
                      </div>
                      <span style={{ ...BODY, fontSize: 9, letterSpacing: '0.08em', color: isSelected ? GOLD : hasPlaced ? '#4A3A32' : '#9A8573', fontWeight: isSelected ? 700 : 400 }}>
                        {s.name.replace(' Spacer', '')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Logo Charm */}
          <div className="flex items-center gap-3">
            <span style={{ ...BODY, fontSize: 11, color: '#9A8573', flexShrink: 0, width: 80 }}>Logo Charm</span>
            <div className="flex gap-2">
              {[
                { value: true,  label: 'Include' },
                { value: false, label: 'Exclude' },
              ].map(option => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => setIncludeCharm(option.value)}
                  style={{
                    ...BODY,
                    width: 72, padding: '5px 0', borderRadius: 999, cursor: 'pointer',
                    border: `1.5px solid ${includeCharm === option.value ? GOLD : '#E5DDD5'}`,
                    background: includeCharm === option.value ? '#FEF9F2' : '#fff',
                    fontSize: 11, textAlign: 'center',
                    color: includeCharm === option.value ? '#4A3A32' : '#9A8573',
                    transition: 'all 0.15s',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wrist Size */}
          <div style={{ background: '#F8F4EF', borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: '#9A8573' }}>Wrist Size</span>
              <button type="button" onClick={() => setMeasureOpen(true)} style={{ ...BODY, fontSize: 10, color: GOLD, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', padding: 0 }}>
                How to measure →
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #E5DDD5', borderRadius: 10, padding: '6px 10px' }}>
              <button
                type="button"
                onClick={() => onWristChange(Math.max(12, parseFloat((wristCm - 0.5).toFixed(1))))}
                style={{ ...BODY, width: 24, height: 24, borderRadius: '50%', border: '1px solid #E5DDD5', background: '#F6F1EB', fontSize: 14, color: '#7A5B45', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >−</button>
              <input
                type="number"
                value={wristCm}
                min={12} max={22} step={0.5}
                onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= 12 && v <= 22) onWristChange(v) }}
                style={{ ...BODY, width: '100%', textAlign: 'center', fontSize: 18, fontWeight: 600, color: '#4A3A32', border: 'none', outline: 'none', background: 'transparent' }}
              />
              <span style={{ ...BODY, fontSize: 11, color: '#9A8573', flexShrink: 0 }}>cm</span>
              <button
                type="button"
                onClick={() => onWristChange(Math.min(22, parseFloat((wristCm + 0.5).toFixed(1))))}
                style={{ ...BODY, width: 24, height: 24, borderRadius: '50%', border: '1px solid #E5DDD5', background: '#F6F1EB', fontSize: 14, color: '#7A5B45', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >+</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#B0A090', margin: '0 0 2px' }}>Elastic Fit Range</p>
                <p style={{ ...SERIF, fontSize: 14, fontWeight: 400, color: '#4A3A32', margin: 0 }}>
                  {((beadCount * 8 - 15) / 10).toFixed(1)} – {((beadCount * 8 + 10) / 10).toFixed(1)} cm
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#B0A090', margin: '0 0 2px' }}>Beads</p>
                <p style={{ ...SERIF, fontSize: 14, color: '#4A3A32', margin: 0 }}>{beadCount} × 8mm</p>
              </div>
            </div>
          </div>

        </div>

        <div className="h-px bg-[#E5DDD5]" />

        {/* REMARK */}
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.32em] text-[#4A3A32]" style={BODY}>
            Remarks
          </p>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Any special requests or notes for your order?"
            rows={2}
            maxLength={300}
            style={BODY}
            className="w-full resize-none rounded-xl border border-[#E5DDD5] bg-transparent px-4 py-3 text-[12px] text-[#4A3A32] placeholder-[#C5B8AD] outline-none transition-colors focus:border-[#B08B57] leading-relaxed"
          />
          {remark.length > 0 && (
            <p className="mt-1 text-right text-[10px] text-[#C5B8AD]" style={BODY}>
              {remark.length}/300
            </p>
          )}
        </div>

        <div className="h-px bg-[#E5DDD5]" />

        {/* INFO */}
        <div className="rounded-xl border border-[#E5DDD5] bg-[#F8F4EF] px-4 py-4" style={BODY}>
          <div className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 text-[#B08B57]">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </span>
            <div className="flex flex-col gap-3">
              {[
                <>Handcrafted with <strong className="font-medium text-[#4A3A32]">8 mm natural crystal beads</strong>. Your selected wrist size (<strong className="font-medium text-[#4A3A32]">{wristCm.toFixed(1)} cm · {beadCount} beads</strong>) will be noted for your order.</>,
                <>Every order arrives in a <strong className="font-medium text-[#4A3A32]">premium gift box</strong> with a crystal care card.{' '}
                  <button
                    type="button"
                    onClick={() => setPackagingOpen(true)}
                    className="text-[#B08B57] underline underline-offset-2 bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
                    style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                  >
                    See packaging example
                  </button>
                </>,
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
          <div className="flex items-start justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B08B57]">Your Quiz Bracelet</p>
            <div className="text-right shrink-0">
              <p style={SERIF} className="text-[22px] font-light text-[#4A3A32] leading-none">S$59.00</p>
              <p style={BODY} className="text-[10px] text-[#9A8573] mt-1">Free SG/MY delivery</p>
            </div>
          </div>
        </div>

        {/* PURCHASE / ADD TO CART BUTTONS */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePurchase}
            disabled={loading || addedToCart}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#4A3A32] bg-[#4A3A32] px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-white transition-all duration-300 hover:bg-[#B08B57] hover:border-[#B08B57] disabled:opacity-60 disabled:cursor-not-allowed"
            style={BODY}
          >
            {loading ? 'Please wait…' : <><span>Purchase Now</span><span aria-hidden="true">✦</span></>}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={loading || addedToCart}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#B08B57] bg-transparent px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#B08B57] transition-all duration-300 hover:bg-[#B08B57] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            style={BODY}
          >
            {addedToCart ? 'Added — going to cart…' : 'Add to Cart'}
          </button>
        </div>

      </div>

      {/* MEASURE WRIST MODAL */}
      {measureOpen && (
        <div
          ref={measureRef}
          role="dialog"
          aria-modal="true"
          aria-label="How to measure your wrist"
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
        >
          <div
            className="absolute inset-0 bg-[#2E2118]/50 backdrop-blur-sm"
            onClick={() => setMeasureOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-[28px] bg-[#FBF6EE] p-8 shadow-[0_40px_100px_-30px_rgba(74,58,50,0.5)]">

            <button
              onClick={() => setMeasureOpen(false)}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#9A8573] transition-colors hover:bg-[#E5DDD5] hover:text-[#4A3A32]"
            >
              ✕
            </button>

            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]" style={BODY}>
              Size Guide
            </p>
            <h3 style={SERIF} className="mb-6 text-2xl font-light text-[#4A3A32]">
              How to Measure Your Wrist
            </h3>

            <ol className="flex flex-col gap-5">
              {[
                { n: '01', text: 'Wrap a thin strip of paper or a flexible tape measure around your wrist, just below the wrist bone.' },
                { n: '02', text: 'Mark where the paper meets — this is your wrist circumference.' },
                { n: '03', text: 'Lay the strip flat and measure the length in centimetres.' },
                { n: '04', text: "Enter your wrist measurement into the Wrist Size field in the options panel. The bracelet bead count will adjust automatically for a perfect elastic fit." },
              ].map(({ n, text }) => (
                <li key={n} className="flex gap-4">
                  <span style={SERIF} className="shrink-0 text-2xl font-light text-[#B08B57] leading-tight">{n}</span>
                  <p className="text-[13.5px] leading-relaxed text-[#6B5848]" style={BODY}>{text}</p>
                </li>
              ))}
            </ol>

            <button
              onClick={() => setMeasureOpen(false)}
              className="mt-6 w-full rounded-full border border-[#B08B57] bg-[#B08B57] py-3 text-[12px] font-medium uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#7A5B45] hover:border-[#7A5B45]"
              style={BODY}
            >
              Got It
            </button>

          </div>
        </div>
      )}

      {/* PACKAGING MODAL */}
      {packagingOpen && (
        <div
          ref={packagingRef}
          role="dialog"
          aria-modal="true"
          aria-label="Sample packaging"
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
        >
          <div className="absolute inset-0 bg-[#2E2118]/50 backdrop-blur-sm" onClick={() => setPackagingOpen(false)} />
          <div className="relative w-full max-w-md rounded-[28px] bg-[#FBF6EE] p-6 shadow-[0_40px_100px_-30px_rgba(74,58,50,0.5)]">
            <button
              onClick={() => setPackagingOpen(false)}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#9A8573] transition-colors hover:bg-[#E5DDD5] hover:text-[#4A3A32]"
            >
              ✕
            </button>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]" style={BODY}>Packaging</p>
            <div className="overflow-hidden rounded-2xl border border-[#E5DDD5]">
              <img src="/SamplePackaging.webp" alt="Sample packaging" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-[#7A6355]" style={BODY}>
              Every SYANN bracelet arrives in a premium gift box with a crystal care card, degaussing crystal, and a pouch — beautifully presented and ready to gift.
            </p>
            <button
              onClick={() => setPackagingOpen(false)}
              className="mt-5 w-full rounded-full border border-[#B08B57] bg-[#B08B57] py-3 text-[12px] font-medium uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#7A5B45] hover:border-[#7A5B45]"
              style={BODY}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  )
}
