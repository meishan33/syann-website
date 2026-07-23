'use client'

import { useState, useMemo, useEffect } from 'react'
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8 lg:items-stretch">

      {/* ── LEFT: BRACELET IMAGE (2/5) ── */}
      <div className="lg:col-span-2 lg:h-full">
        <div className="overflow-hidden rounded-[28px] border border-[#E5DDD5] bg-white p-8 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.3)] sm:p-10 lg:flex lg:flex-col lg:h-full">

          <div className="w-full lg:flex-1">
            <BraceletRenderer
              sequence={adjustedSequence}
              spacerGaps={spacerGaps}
              selectedSpacerName={selectedSpacer}
              onGapClick={handleGapClick}
              imageMap={imageMapWithSpacer}
            />
          </div>

          <div className="mt-3 px-2 text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B08B57] mb-1">
              AI-curated · Five Elements · Handcrafted
            </p>
            <p className="text-[11px] leading-relaxed text-[#C5B8AD]">
              Every crystal bead is a genuine natural gemstone — no two are exactly alike. Your actual handcrafted bracelet may have slight variations in color, tone, and texture, making it beautifully one-of-a-kind.
            </p>
          </div>

        </div>
      </div>

      {/* ── RIGHT: ANALYSIS + OPTIONS + PURCHASE (3/5) ── */}
      <div className="rounded-[28px] border border-[#E5DDD5] bg-white p-5 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.2)] sm:p-6 lg:col-span-3">
        <PurchasePanel
          analysisSummary={analysisSummary}
          crystalNames={crystalNames}
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
  )
}
