'use client'

import { useEffect, useState } from 'react'

type Crystal = {
  id: number | string
  name: string
  slug: string
  element: string
  meaning: string
  bead_image_url: string | null
  luxury_score?: number
}

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }

export default function CrystalsPage() {
  const [crystals, setCrystals] = useState<Crystal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/api/crystals')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (Array.isArray(data)) {
          setCrystals(data)
        } else {
          setError(data?.error ?? 'Unable to load the crystal library.')
        }
      })
      .catch(() => {
        if (cancelled) return
        setError('Unable to load the crystal library.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#F6F1EB] text-[#4A3A32]">

      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">

        {/* HEADER */}
        <header className="text-center mb-16 lg:mb-20">

          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">
            ✦ Crystal Library
          </p>

          <h1
            style={SERIF}
            className="text-4xl lg:text-5xl font-light leading-tight text-[#4A3A32]"
          >
            The SYANN Crystal Collection
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#6F625B]">
            Each stone is hand-selected for its purity, energetic signature,
            and quiet beauty — curated to align with the rhythm of your intention.
          </p>

        </header>


        {/* STATES */}
        {error && (
          <div className="py-20 text-center text-sm text-[#9A8573]">
            {error}
          </div>
        )}

        {loading && !error && <CrystalGridSkeleton />}

        {!loading && !error && crystals.length === 0 && (
          <div className="py-20 text-center text-sm text-[#9A8573]">
            No crystals to display yet.
          </div>
        )}

        {!loading && !error && crystals.length > 0 && (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
            {crystals.map((c) => (
              <CrystalCard key={c.id} crystal={c} />
            ))}
          </div>
        )}

      </section>

    </main>
  )
}


/* ─── CARD ────────────────────────────────────────────── */

function CrystalCard({ crystal }: { crystal: Crystal }) {
  return (
    <article
      className="
        group flex flex-col
        rounded-3xl border border-[#E5DDD5]
        bg-white/70 p-5 lg:p-7
        transition-all duration-500
        hover:-translate-y-1
        hover:shadow-[0_24px_60px_-30px_rgba(101,70,46,0.4)]
      "
    >

      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-[#F8F4EF]">
        {crystal.bead_image_url ? (
          <img
            src={crystal.bead_image_url}
            alt={crystal.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="text-3xl text-[#B08B57] opacity-40">✦</span>
        )}
      </div>

      <div className="pt-5 text-center lg:pt-6">

        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#B08B57]">
          {crystal.element}
        </p>

        <h3
          style={SERIF}
          className="mb-3 text-xl font-light leading-tight text-[#4A3A32] lg:text-2xl"
        >
          {crystal.name}
        </h3>

        <p className="line-clamp-3 text-[13px] leading-relaxed text-[#6F625B]">
          {crystal.meaning}
        </p>

      </div>

    </article>
  )
}


/* ─── SKELETON ────────────────────────────────────────── */

function CrystalGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-3xl border border-[#E5DDD5] bg-white/60 p-5 lg:p-7"
        >
          <div className="aspect-square w-full rounded-2xl bg-[#EFE7DE]" />
          <div className="space-y-3 pt-5 lg:pt-6">
            <div className="mx-auto h-2 w-1/3 rounded bg-[#EFE7DE]" />
            <div className="mx-auto h-4 w-2/3 rounded bg-[#EFE7DE]" />
            <div className="mx-auto h-2 w-full rounded bg-[#EFE7DE]" />
            <div className="mx-auto h-2 w-5/6 rounded bg-[#EFE7DE]" />
          </div>
        </div>
      ))}
    </div>
  )
}
