'use client'

import { BEAD_COUNTS, TOTAL_BEADS } from '@/lib/bracelet-config'

const SIZE = 240
const CX = SIZE / 2
const CY = SIZE / 2
const RADIUS = 95
const BEAD_R = 13

const COLORS = ['#C4A460', '#9E7DA8', '#6A9BAE']
const TYPE_LABELS = ['Primary', 'Secondary', 'Accent']
const REQUIRED = BEAD_COUNTS

const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }

type Props = {
  value: number[]
  onChange: (next: number[]) => void
}

export default function BeadPatternEditor({ value, onChange }: Props) {
  const counts = [0, 0, 0]
  for (const v of value) counts[v]++

  function cycleBead(i: number) {
    const next = [...value]
    next[i] = (next[i] + 1) % 3
    onChange(next)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ display: 'block' }}>
        <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="rgba(140,100,60,0.15)" strokeWidth="1" strokeDasharray="3 2.5" />
        {value.map((type, i) => {
          const angle = (i / value.length) * 2 * Math.PI - Math.PI / 2
          const x = CX + RADIUS * Math.cos(angle)
          const y = CY + RADIUS * Math.sin(angle)
          return (
            <circle
              key={i}
              cx={x} cy={y} r={BEAD_R}
              fill={COLORS[type]}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.5"
              style={{ cursor: 'pointer' }}
              onClick={() => cycleBead(i)}
            />
          )
        })}
      </svg>
      <p style={{ ...BODY, fontSize: 10, color: '#B0A090', margin: 0, textAlign: 'center' }}>
        Click a bead to cycle Primary → Secondary → Accent
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        {TYPE_LABELS.map((label, i) => {
          const ok = counts[i] === REQUIRED[i]
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
              <span style={{ ...BODY, fontSize: 11, color: ok ? '#5A9B6A' : '#C0392B', fontWeight: 600 }}>
                {label}: {counts[i]}/{REQUIRED[i]} {ok ? '✓' : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function isValidPattern(value: number[]): boolean {
  if (value.length !== TOTAL_BEADS) return false
  const counts = [0, 0, 0]
  for (const v of value) counts[v]++
  return counts[0] === REQUIRED[0] && counts[1] === REQUIRED[1] && counts[2] === REQUIRED[2]
}

export function defaultPattern(): number[] {
  // A reasonable alternating starting point — not yet a valid 10/8/6 split,
  // admin clicks beads to redistribute toward the required counts.
  return Array.from({ length: TOTAL_BEADS }, (_, i) => i % 3)
}
