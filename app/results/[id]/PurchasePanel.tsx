'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

type Props = {
  analysisSummary: string
  crystalNames?: string[]
  userName?: string | null
  resultId: string
  imageUrl?: string | null
  weakElement?: string | null
  strongElement?: string | null
}

export default function PurchasePanel({ analysisSummary, crystalNames = [], userName, resultId, imageUrl, weakElement, strongElement }: Props) {
  const [spacerColor, setSpacerColor] = useState<'silver' | 'gold' | 'exclude'>('silver')
  const [includeCharm, setIncludeCharm] = useState(true)
  const [remark, setRemark] = useState<string>('')
  const [measureOpen, setMeasureOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePurchase() {
    setError(null)
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const email = session?.user?.email ?? null
      const userId = session?.user?.id ?? null

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId, spacer: spacerColor, includeCharm, remark,
          email, userId, imageUrl, weakElement, strongElement, analysisSummary,
          savedAddress: null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout session')
      window.location.href = data.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
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

          {/* Spacer Colour */}
          <div className="flex items-center gap-3">
            <span style={{ ...BODY, fontSize: 11, color: '#9A8573', flexShrink: 0, width: 80 }}>Spacer</span>
            <div className="flex gap-2">
              {(['silver', 'gold', 'exclude'] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSpacerColor(option)}
                  style={{
                    ...BODY,
                    width: 72, padding: '5px 0', borderRadius: 999, cursor: 'pointer',
                    border: `1.5px solid ${spacerColor === option ? GOLD : '#E5DDD5'}`,
                    background: spacerColor === option ? '#FEF9F2' : '#fff',
                    fontSize: 11, textAlign: 'center', textTransform: 'capitalize',
                    color: spacerColor === option ? '#4A3A32' : '#9A8573',
                    transition: 'all 0.15s',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

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
                <>All SYANN bracelets use <strong className="font-medium text-[#4A3A32]">8 mm natural crystal beads</strong> for a consistent, premium finish.</>,
                <>The default bracelet size is <strong className="font-medium text-[#4A3A32]">16 cm</strong>. Please include your wrist size in the remarks if you&apos;d like it larger or smaller.{' '}
                  <button
                    type="button"
                    onClick={() => setMeasureOpen(true)}
                    className="text-[#B08B57] underline underline-offset-2 bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
                    style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                  >
                    How to measure your wrist
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

        {/* PURCHASE BUTTON */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#4A3A32] bg-[#4A3A32] px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-white transition-all duration-300 hover:bg-[#B08B57] hover:border-[#B08B57] disabled:opacity-60 disabled:cursor-not-allowed"
            style={BODY}
          >
            {loading ? 'Please wait…' : <><span>Purchase My Bracelet</span><span aria-hidden="true">✦</span></>}
          </button>
          {error && (
            <p className="text-center text-[11px] text-red-400" style={BODY}>{error}</p>
          )}
        </div>

      </div>

      {/* MEASURE WRIST MODAL */}
      {measureOpen && (
        <div
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
                { n: '04', text: "Add your wrist measurement to the Remarks field. The default size is 16 cm — let us know if you'd like it larger or smaller." },
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
    </>
  )
}
