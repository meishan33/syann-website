'use client'

import { LAYOUTS } from '@/lib/design-engine'

const RADIUS = 110
const BEAD_R = 15
const SIZE   = 280
const CX     = SIZE / 2
const CY     = SIZE / 2

// Placeholder colors — Primary / Secondary / Accent
const COLORS = ['#C4A460', '#9E7DA8', '#6A9BAE']
const LABELS = ['Primary (10 beads)', 'Secondary (8 beads)', 'Accent (6 beads)']

type B = 0 | 1 | 2

const DESIGN_META: { name: string; description: string }[] = [
  { name: 'Banded',    description: 'Three continuous arcs — each crystal type has its own section of the ring.' },
  { name: 'Symmetric', description: 'Primary anchors the top and bottom; secondary and accent fill both sides.' },
  { name: 'Cardinal',  description: 'Accent anchors four compass points; primary and secondary cluster between them.' },
  { name: 'Crown',     description: 'Accent beads form a crown at the top; primary and secondary fill the rest in groups.' },
  { name: 'Pinwheel',  description: 'Two repeating PPPPP-SSSS-AAA groups rotate around the bracelet.' },
  { name: 'Heartbeat', description: 'Accent beads act as separators between four rhythmic crystal sections.' },
  { name: 'Crescent',  description: 'Primary fills one full half; secondary and accent form a crescent on the other.' },
]

const DESIGNS: { name: string; description: string; seq: B[] }[] = DESIGN_META.map((meta, i) => ({
  ...meta,
  seq: LAYOUTS[i] as B[],
}))

function MiniBracelet({ seq }: { seq: B[] }) {
  const n = seq.length
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <circle
        cx={CX} cy={CY} r={RADIUS}
        fill="none"
        stroke="rgba(140,100,60,0.15)"
        strokeWidth="1"
        strokeDasharray="3 2.5"
      />
      {seq.map((type, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        const x = CX + RADIUS * Math.cos(angle)
        const y = CY + RADIUS * Math.sin(angle)
        return (
          <circle
            key={i}
            cx={x} cy={y} r={BEAD_R}
            fill={COLORS[type]}
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.5"
          />
        )
      })}
    </svg>
  )
}

export default function BraceletDesignsPage() {
  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', padding: '52px 24px 72px', fontFamily: "'Montserrat', sans-serif" }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#B08B57', margin: '0 0 14px' }}>
            ✦ Bracelet Design Layouts
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: '#3D2B1F', margin: '0 0 24px', lineHeight: 1.1 }}>
            Placement Designs
          </h1>
          <p style={{ fontSize: 12.5, color: '#9A8573', margin: '0 0 28px', lineHeight: 1.8, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Each design places the 24 beads differently around the ring.<br />
            One is chosen per reading based on the result ID.
          </p>

          {/* Legend */}
          <div style={{ display: 'inline-flex', gap: 24, alignItems: 'center', background: '#FBF8F4', border: '1px solid #E5DDD5', borderRadius: 40, padding: '10px 24px' }}>
            {LABELS.map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#7A6355', letterSpacing: '0.02em' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 28 }}>
          {DESIGNS.map((design) => (
            <div
              key={design.name}
              style={{
                background: '#FDFAF7',
                borderRadius: 24,
                border: '1px solid #E5DDD5',
                padding: '28px 24px 22px',
                textAlign: 'center',
                boxShadow: '0 4px 20px -8px rgba(101,70,46,0.12)',
              }}
            >
              <MiniBracelet seq={design.seq} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: '#3D2B1F', margin: '18px 0 8px' }}>
                {design.name}
              </h3>
              <p style={{ fontSize: 12, color: '#9A8573', lineHeight: 1.75, margin: 0 }}>
                {design.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
