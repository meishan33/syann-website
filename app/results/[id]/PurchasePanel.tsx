'use client'

import { useState } from 'react'
import Link from 'next/link'

const SIZES = [
  { value: '13-15', label: '13 – 15 cm', fit: 'XS / S · Petite' },
  { value: '16-18', label: '16 – 18 cm', fit: 'M / L · Standard' },
  { value: '19-23', label: '19 – 23 cm', fit: 'XL / XXL · Large' },
]

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }

type Props = {
  weakElement: string
  analysisSummary: string
  resultId: string
}

export default function PurchasePanel({ weakElement, analysisSummary, resultId }: Props) {
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [measureOpen, setMeasureOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-5">

        {/* ELEMENT ANALYSIS */}
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">
            Your Elemental Analysis
          </p>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D9C4A8] bg-[#FBF6EE] px-3 py-1.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#9A8573]">
              Weak Element
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08B57]">
              {weakElement}
            </span>
          </div>

          <p className="text-[13px] leading-[1.8] text-[#7A5B45]">
            {analysisSummary}
          </p>
        </div>

        <div className="h-px bg-[#E5DDD5]" />

        {/* SIZE SELECTOR */}
        <div>
          <p className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.32em] text-[#4A3A32]">
            Select Your Bracelet Size
          </p>

          <div className="flex flex-col gap-2">
            {SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => setSelectedSize(size.value)}
                className={`
                  flex items-center justify-between
                  rounded-xl border px-4 py-3
                  text-left transition-all duration-200
                  ${
                    selectedSize === size.value
                      ? 'border-[#B08B57] bg-[#FBF6EE] shadow-[0_0_0_1px_#B08B57]'
                      : 'border-[#E5DDD5] bg-white hover:border-[#C9AA80]'
                  }
                `}
              >
                <span
                  style={SERIF}
                  className={`text-[17px] font-light ${selectedSize === size.value ? 'text-[#4A3A32]' : 'text-[#6B5848]'}`}
                >
                  {size.label}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#9A8573]">
                  {size.fit}
                </span>
              </button>
            ))}
          </div>

          {/* HOW TO MEASURE LINK */}
          <button
            type="button"
            onClick={() => setMeasureOpen(true)}
            className="mt-2 text-[11px] text-[#B08B57] underline underline-offset-2 transition-opacity hover:opacity-70"
          >
            How do I measure my wrist?
          </button>
        </div>

        {/* 8MM DISCLAIMER */}
        <div className="flex gap-2.5 rounded-xl border border-[#E5DDD5] bg-[#F8F4EF] px-3.5 py-3">
          <span className="mt-0.5 shrink-0 text-[#B08B57]">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </span>
          <p className="text-[11.5px] leading-relaxed text-[#7A5B45]">
            All SYANN bracelets use <strong className="font-medium text-[#4A3A32]">8 mm natural stone beads</strong> —
            one standardized size for a consistent, premium finish.
          </p>
        </div>

        {/* PURCHASE BUTTON */}
        <Link
          href={`/payment?result=${resultId}&size=${selectedSize}`}
          onClick={(e) => { if (!selectedSize) { e.preventDefault(); alert('Please select a bracelet size before continuing.') } }}
          className={`
            inline-flex w-full items-center justify-center gap-2.5
            rounded-full border px-6 py-3.5
            text-[11px] font-medium uppercase tracking-[0.3em]
            transition-all duration-300
            ${
              selectedSize
                ? 'border-[#4A3A32] bg-[#4A3A32] text-white hover:bg-[#B08B57] hover:border-[#B08B57]'
                : 'border-[#C5B8AD] bg-[#C5B8AD] text-white cursor-not-allowed'
            }
          `}
        >
          Purchase My Bracelet
          <span aria-hidden="true">✦</span>
        </Link>

        {!selectedSize && (
          <p className="-mt-3 text-center text-[10px] text-[#9A8573]">
            Please select a size to continue
          </p>
        )}

      </div>


      {/* MEASURE WRIST MODAL */}
      {measureOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="How to measure your wrist"
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#2E2118]/50 backdrop-blur-sm"
            onClick={() => setMeasureOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md rounded-[28px] bg-[#FBF6EE] p-8 shadow-[0_40px_100px_-30px_rgba(74,58,50,0.5)]">

            <button
              onClick={() => setMeasureOpen(false)}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#9A8573] transition-colors hover:bg-[#E5DDD5] hover:text-[#4A3A32]"
            >
              ✕
            </button>

            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">
              Size Guide
            </p>

            <h3
              style={SERIF}
              className="mb-6 text-2xl font-light text-[#4A3A32]"
            >
              How to Measure Your Wrist
            </h3>

            <ol className="flex flex-col gap-5">
              {[
                { n: '01', text: 'Wrap a thin strip of paper or a flexible tape measure around your wrist, just below the wrist bone.' },
                { n: '02', text: 'Mark where the paper meets — this is your wrist circumference.' },
                { n: '03', text: 'Lay the strip flat and measure the length in centimetres.' },
                { n: '04', text: 'Match your measurement to the size guide below. For a relaxed fit, add 1 cm; for a snug fit, use your exact measurement.' },
              ].map(({ n, text }) => (
                <li key={n} className="flex gap-4">
                  <span
                    style={SERIF}
                    className="shrink-0 text-2xl font-light text-[#B08B57] leading-tight"
                  >
                    {n}
                  </span>
                  <p className="text-[13.5px] leading-relaxed text-[#6B5848]">{text}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 grid grid-cols-3 divide-x divide-[#E5DDD5] rounded-2xl border border-[#E5DDD5] bg-white overflow-hidden text-center text-[12px]">
              {SIZES.map((s) => (
                <div key={s.value} className="py-3 px-2">
                  <p className="font-semibold text-[#4A3A32] tracking-wide">{s.label}</p>
                  <p className="mt-0.5 text-[#9A8573] tracking-wider uppercase text-[10px]">{s.fit}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setMeasureOpen(false)}
              className="mt-6 w-full rounded-full border border-[#B08B57] bg-[#B08B57] py-3 text-[12px] font-medium uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#7A5B45] hover:border-[#7A5B45]"
            >
              Got It
            </button>

          </div>
        </div>
      )}
    </>
  )
}
