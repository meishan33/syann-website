'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import BraceletRenderer from '@/components/BraceletRenderer'
import PurchasePanel from './PurchasePanel'

const BEAD_MM = 8
const DEFAULT_WRIST = 16.0

function calcN(wristCm: number): number {
  return Math.round((wristCm + 0.8) * 10 / BEAD_MM)
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
}

export default function ResultsClient({
  beadSequence, imageMap, cachedImageUrl,
  analysisSummary, crystalNames, userName,
  resultId, weakElement, strongElement,
}: Props) {
  const [wristCm, setWristCm] = useState(DEFAULT_WRIST)

  const N = calcN(wristCm)
  const isDefault = wristCm === DEFAULT_WRIST

  const adjustedSequence = useMemo(() => {
    if (!beadSequence.length) return []
    return Array.from({ length: N }, (_, i) => beadSequence[i % beadSequence.length])
  }, [beadSequence, N])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8 lg:items-stretch">

      {/* ── LEFT: BRACELET IMAGE (3/5) ── */}
      <div className="lg:col-span-3 lg:h-full">
        <div className="overflow-hidden rounded-[28px] border border-[#E5DDD5] bg-white p-8 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.3)] sm:p-10 lg:flex lg:flex-col lg:h-full">

          <div className="w-full lg:flex-1">
            {cachedImageUrl && isDefault ? (
              <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: 1 }}>
                <Image
                  src={cachedImageUrl}
                  alt="Your crystal bracelet"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <BraceletRenderer sequence={adjustedSequence} imageMap={imageMap} />
            )}
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

      {/* ── RIGHT: ANALYSIS + OPTIONS + PURCHASE (2/5) ── */}
      <div className="rounded-[28px] border border-[#E5DDD5] bg-white p-5 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.2)] sm:p-6 lg:col-span-2">
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
        />
      </div>

    </div>
  )
}
