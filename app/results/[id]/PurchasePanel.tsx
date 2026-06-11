'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

type DeliveryAddress = {
  id: string; label: string | null; name: string | null; phone: string | null
  line1: string; line2: string | null; city: string | null; state: string | null
  postal_code: string | null; country: string | null; is_default: boolean
}

type Props = {
  analysisSummary: string
  resultId: string
  suggestedSpacer?: string | null
  imageUrl?: string | null
  weakElement?: string | null
  strongElement?: string | null
}

export default function PurchasePanel({ analysisSummary, resultId, suggestedSpacer, imageUrl, weakElement, strongElement }: Props) {
  const spacer = suggestedSpacer?.toLowerCase().includes('gold') ? 'gold' : 'silver'

  const [remark, setRemark] = useState<string>('')
  const [measureOpen, setMeasureOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [addrPickerOpen, setAddrPickerOpen] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([])
  const [selectedAddrId, setSelectedAddrId] = useState<string | 'new'>('new')

  async function proceedToCheckout(
    email: string | null,
    userId: string | null,
    savedAddress: DeliveryAddress | null
  ) {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId, spacer, remark, email, userId, imageUrl, weakElement, strongElement, analysisSummary,
          savedAddress: savedAddress ? {
            name: savedAddress.name, phone: savedAddress.phone,
            line1: savedAddress.line1, line2: savedAddress.line2,
            city: savedAddress.city, state: savedAddress.state,
            postal_code: savedAddress.postal_code, country: savedAddress.country || 'MY',
          } : null,
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

  async function handlePurchase() {
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const email = session?.user?.email ?? null
      const userId = session?.user?.id ?? null

      if (session?.access_token) {
        setLoading(true)
        const res = await fetch('/api/addresses', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const addrs: DeliveryAddress[] = await res.json()
          if (addrs.length > 0) {
            setSavedAddresses(addrs)
            const def = addrs.find(a => a.is_default)
            setSelectedAddrId(def?.id ?? addrs[0].id)
            setLoading(false)
            setAddrPickerOpen(true)
            return
          }
        }
        setLoading(false)
      }

      await proceedToCheckout(email, userId, null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  async function confirmAddress() {
    setAddrPickerOpen(false)
    const { data: { session } } = await supabase.auth.getSession()
    const email = session?.user?.email ?? null
    const userId = session?.user?.id ?? null
    const addr = selectedAddrId !== 'new'
      ? (savedAddresses.find(a => a.id === selectedAddrId) ?? null)
      : null
    await proceedToCheckout(email, userId, addr)
  }

  return (
    <>
      <div className="flex flex-col gap-5">

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
                <p className="text-[13px] leading-[1.8] text-[#7A5B45] mb-3" style={BODY}>
                  {paragraph}
                </p>
                {bullets.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    {bullets.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-[5px] shrink-0 text-[#B08B57]">
                          <svg width="5" height="5" viewBox="0 0 6 6" aria-hidden="true"><circle cx="3" cy="3" r="3" fill="currentColor" /></svg>
                        </span>
                        <p className="text-[12px] leading-[1.7] text-[#7A5B45] m-0" style={BODY}>{point}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>

        <div className="h-px bg-[#E5DDD5]" />

        {/* REMARK */}
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.32em] text-[#4A3A32]" style={BODY}>
            Remarks
          </p>
          <p className="mb-2.5 text-[11px] text-[#9A8573]" style={BODY}>
            Any special requests or notes for your order?
          </p>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g. wrist size, spacer color preference…"
            rows={3}
            maxLength={300}
            style={BODY}
            className="w-full resize-none rounded-xl border border-[#E5DDD5] bg-[#FDFAF7] px-4 py-3 text-[12px] text-[#4A3A32] placeholder-[#C5B8AD] outline-none transition-colors focus:border-[#B08B57] leading-relaxed"
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
                <>Every bracelet includes <strong className="font-medium text-[#4A3A32]">1 silver SYANN logo charm</strong> as standard. The spacer metal tone is selected to complement your crystals — you may specify a preference or placement in the remarks.</>,
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
                  <p className="text-[11.5px] leading-normal text-[#7A5B45] m-0">{text}</p>
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


      {/* ADDRESS PICKER MODAL */}
      {addrPickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select delivery address"
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
        >
          <div
            className="absolute inset-0 bg-[#2E2118]/50 backdrop-blur-sm"
            onClick={() => setAddrPickerOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-[28px] bg-[#FBF6EE] p-8 shadow-[0_40px_100px_-30px_rgba(74,58,50,0.5)]" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>

            <button
              onClick={() => setAddrPickerOpen(false)}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#9A8573] transition-colors hover:bg-[#E5DDD5] hover:text-[#4A3A32]"
            >
              ✕
            </button>

            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]" style={BODY}>
              Delivery
            </p>
            <h3 style={SERIF} className="mb-6 text-2xl font-light text-[#4A3A32]">
              Ship To
            </h3>

            <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ flex: 1 }}>
              {savedAddresses.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedAddrId(a.id)}
                  style={{
                    ...BODY,
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    border: `1.5px solid ${selectedAddrId === a.id ? GOLD : '#E5DDD5'}`,
                    background: selectedAddrId === a.id ? '#FEF9F2' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: `2px solid ${selectedAddrId === a.id ? GOLD : '#C5B8AD'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {selectedAddrId === a.id && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
                      )}
                    </div>
                    {a.label && (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: GOLD }}>{a.label}</span>
                    )}
                    {a.is_default && (
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, padding: '2px 7px', borderRadius: 999, background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}44` }}>Default</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#4A3A32', margin: '0 0 2px', paddingLeft: 22 }}>{a.name || '—'} {a.phone && `· ${a.phone}`}</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#7A6355', margin: 0, lineHeight: 1.6, paddingLeft: 22 }}>
                    {[a.line1, a.line2, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(', ')}
                  </p>
                </button>
              ))}

              {/* Enter new address option */}
              <button
                type="button"
                onClick={() => setSelectedAddrId('new')}
                style={{
                  ...BODY,
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                  padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                  border: `1.5px solid ${selectedAddrId === 'new' ? GOLD : '#E5DDD5'}`,
                  background: selectedAddrId === 'new' ? '#FEF9F2' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: `2px solid ${selectedAddrId === 'new' ? GOLD : '#C5B8AD'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {selectedAddrId === 'new' && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#4A3A32', margin: '0 0 2px' }}>Enter a new address</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#9A8573', margin: 0 }}>You&apos;ll fill it in on the next step</p>
                </div>
              </button>
            </div>

            <button
              onClick={confirmAddress}
              className="mt-6 w-full rounded-full border border-[#4A3A32] bg-[#4A3A32] py-3.5 text-[11px] font-medium uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#B08B57] hover:border-[#B08B57]"
              style={BODY}
            >
              Continue to Payment ✦
            </button>

          </div>
        </div>
      )}


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
                { n: '04', text: 'Add your wrist measurement to the Remarks field. The default size is 16 cm — let us know if you\'d like it larger or smaller.' },
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
