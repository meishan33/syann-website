'use client'

import { useState, useMemo, useEffect, type ReactNode } from 'react'
import BraceletRenderer from '@/components/BraceletRenderer'
import PurchasePanel from './PurchasePanel'

const BEAD_MM = 8
function calcN(wristCm: number): number {
  return Math.round((wristCm + 0.8) * 10 / BEAD_MM)
}

type SpacerOption = {
  name: string
  bead_image_url: string | null
  bead_image_urls: string[] | null
}

type Props = {
  beadSequence: string[]
  imageMap: Record<string, string[]>
  cachedImageUrl: string | null
  analysisSummary: string
  crystalNames: string[]
  userName: string | null
  resultId: string
  weakElement: string | null
  strongElement: string | null
  spacers: SpacerOption[]
}

export default function ResultsClient({
  beadSequence, imageMap, cachedImageUrl,
  analysisSummary, crystalNames, userName,
  resultId, weakElement, strongElement, spacers,
}: Props) {
  const [wristCm, setWristCm] = useState(16.0)
  const [selectedSpacer, setSelectedSpacer] = useState<string | null>(null)
  const [packagingOpen, setPackagingOpen] = useState(false)

  const N = calcN(wristCm)

  const [spacerGaps, setSpacerGaps] = useState<(string | null)[]>(Array(calcN(16.0)).fill(null))

  useEffect(() => {
    setSpacerGaps(prev => {
      if (prev.length === N) return prev
      if (prev.length < N) return [...prev, ...Array(N - prev.length).fill(null)]
      return prev.slice(0, N)
    })
  }, [N])

  function handleGapClick(idx: number) {
    setSpacerGaps(prev => {
      const next = [...prev]
      if (next[idx]) {
        next[idx] = null           // always allow removing a placed spacer
      } else if (selectedSpacer) {
        next[idx] = selectedSpacer // place only when in placement mode
      }
      return next
    })
  }

  // Crystal-only sequence — spacers rendered by BraceletRenderer via spacerGaps
  const adjustedSequence = useMemo(() => {
    if (!beadSequence.length) return []
    return Array.from({ length: N }, (_, i) => beadSequence[i % beadSequence.length])
  }, [beadSequence, N])

  // Merge spacer images into the imageMap so BraceletRenderer can look them up
  const imageMapWithSpacer = useMemo(() => {
    const extra: Record<string, string[]> = {}
    for (const s of spacers) {
      const urls = s.bead_image_urls?.length ? s.bead_image_urls : s.bead_image_url ? [s.bead_image_url] : []
      if (urls.length) extra[s.name] = urls
    }
    return { ...imageMap, ...extra }
  }, [imageMap, spacers])

  return (
    <>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-11 lg:gap-8 lg:items-start">

      {/* ── LEFT: BRACELET IMAGE + ANALYSIS ── */}
      <div className="lg:col-span-6">
        <div className="overflow-hidden rounded-[28px] border border-[#E5DDD5] bg-white p-8 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.3)] sm:p-10 flex flex-col gap-6">

          <div className="w-full">
            <BraceletRenderer
              sequence={adjustedSequence}
              spacerGaps={spacerGaps}
              selectedSpacerName={selectedSpacer}
              onGapClick={handleGapClick}
              imageMap={imageMapWithSpacer}
            />
          </div>

          <div className="px-2 text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B08B57] mb-1">
              AI-curated · Five Elements · Handcrafted
            </p>
            <p className="text-[11px] leading-relaxed text-[#C5B8AD]">
              Every crystal bead is a genuine natural gemstone — no two are exactly alike. Your actual handcrafted bracelet may have slight variations in color, tone, and texture, making it beautifully one-of-a-kind.
            </p>
          </div>

          {/* INFO BOX */}
          <div className="rounded-xl border border-[#E5DDD5] bg-[#F8F4EF] px-4 py-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <div className="flex gap-2.5">
              <span className="mt-0.5 shrink-0 text-[#B08B57]">
                <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="flex flex-col gap-3">
                {([
                  <span key="a">Handcrafted with <strong className="font-medium text-[#4A3A32]">8 mm natural crystal beads</strong>. Your selected wrist size (<strong className="font-medium text-[#4A3A32]">{wristCm.toFixed(1)} cm · {N} beads</strong>) will be noted for your order.</span>,
                  <span key="b">Every order arrives in a <strong className="font-medium text-[#4A3A32]">premium gift box</strong> with a crystal care card.{' '}
                    <button type="button" onClick={() => setPackagingOpen(true)} className="text-[#B08B57] underline underline-offset-2 bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70" style={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
                      See packaging example
                    </button>
                  </span>,
                ] as ReactNode[]).map((text, i) => (
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

        </div>
      </div>

      {/* ── RIGHT: OPTIONS + PURCHASE (narrower) ── */}
      <div className="rounded-[28px] border border-[#E5DDD5] bg-white p-5 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.2)] sm:p-6 lg:col-span-5">
        <PurchasePanel
          analysisSummary={analysisSummary}
          crystalNames={crystalNames}
          crystalImageMap={Object.fromEntries(crystalNames.map(n => [n, imageMap[n]?.[0]]).filter((e): e is [string, string] => !!e[1]))}
          userName={userName}
          resultId={resultId}
          imageUrl={cachedImageUrl}
          weakElement={weakElement}
          strongElement={strongElement}
          wristCm={wristCm}
          onWristChange={setWristCm}
          beadCount={N}
          adjustedSequence={adjustedSequence}
          spacers={spacers}
          spacerGaps={spacerGaps}
          selectedSpacer={selectedSpacer}
          onSpacerChange={setSelectedSpacer}
          onClearSpacers={() => { setSpacerGaps(Array(N).fill(null)); setSelectedSpacer(null) }}
        />
      </div>

    </div>

      {packagingOpen && (
        <div role="dialog" aria-modal="true" aria-label="Sample packaging" className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-[#2E2118]/50 backdrop-blur-sm" onClick={() => setPackagingOpen(false)} />
          <div className="relative w-full max-w-md rounded-[28px] bg-[#FBF6EE] p-6 shadow-[0_40px_100px_-30px_rgba(74,58,50,0.5)]">
            <button onClick={() => setPackagingOpen(false)} aria-label="Close" className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#9A8573] transition-colors hover:bg-[#E5DDD5] hover:text-[#4A3A32]">✕</button>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]" style={{ fontFamily: "'Montserrat', sans-serif" }}>Packaging</p>
            <div className="overflow-hidden rounded-2xl border border-[#E5DDD5]">
              <img src="/SamplePackaging.webp" alt="Sample packaging" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-[#7A6355]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Every SYANN bracelet arrives in a premium gift box with a crystal care card, degaussing crystal, and a pouch — beautifully presented and ready to gift.
            </p>
            <button onClick={() => setPackagingOpen(false)} className="mt-5 w-full rounded-full border border-[#B08B57] bg-[#B08B57] py-3 text-[12px] font-medium uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#7A5B45] hover:border-[#7A5B45]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  )
}
