// Variable-slot layout: each placed spacer gets its own angular slot between
// the flanking crystals. Crystal SIZE stays fixed (based on N), so adjacent
// crystals without a spacer overlap slightly → look touching. Crystals
// flanking a spacer have a small natural gap where the spacer bead sits.

const RADIUS_PCT   = 28
const SPACER_RATIO = 0.50  // spacer diameter as fraction of crystal diameter

type Props = {
  sequence: string[]
  spacerGaps?: (string | null)[] | null
  selectedSpacerName?: string | null
  onGapClick?: (idx: number) => void
  imageMap: Record<string, string[]>
  className?: string
}

export default function BraceletRenderer({ sequence, spacerGaps, selectedSpacerName, onGapClick, imageMap, className }: Props) {
  const N = sequence.length
  if (N === 0) return <div className={className} style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#F5F0EB', borderRadius: 20 }} />

  const gaps = spacerGaps ?? []
  const spacerCount = gaps.filter(Boolean).length

  // Total slots = N crystals + K placed spacers.
  // Crystal SIZE is always based on N so crystals don't shrink as spacers are added.
  // Adjacent crystals (1 slot apart, no spacer) → slightly overlap → look touching.
  // Crystal flanking a spacer (1 slot apart) → small visible gap around the spacer.
  const totalSlots  = N + spacerCount
  const CRYSTAL_PCT = Number((2 * RADIUS_PCT * Math.sin(Math.PI / N)).toFixed(4))
  const SPACER_PCT  = Number((CRYSTAL_PCT * SPACER_RATIO).toFixed(4))

  // Crystal i occupies slot: i + (spacers placed in gaps 0..i-1)
  function crystalSlot(i: number) {
    return i + gaps.slice(0, i).filter(Boolean).length
  }
  function slotAngle(slot: number) {
    return (slot / totalSlots) * 2 * Math.PI - Math.PI / 2
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative', width: '100%', aspectRatio: '1',
        background: '#F5F0EB', borderRadius: 20, overflow: 'hidden',
        containerType: 'inline-size',
      }}
    >
      {/* Thread ring */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
      >
        <circle cx="50" cy="50" r={RADIUS_PCT} fill="none"
          stroke="rgba(140,100,60,0.18)" strokeWidth="0.6" strokeDasharray="2.5 2" />
      </svg>

      {/* Spacer gaps — below crystals in z-order */}
      {gaps.map((gap, i) => {
        const cs    = crystalSlot(i)
        // Placed spacer at slot cs+1; empty gap hint at midpoint cs+0.5
        const slot  = gap ? cs + 1 : cs + 0.5
        const a     = slotAngle(slot)
        const cx    = Number((50 + RADIUS_PCT * Math.cos(a)).toFixed(4))
        const cy    = Number((50 + RADIUS_PCT * Math.sin(a)).toFixed(4))
        const urls  = gap ? (imageMap[gap] ?? []) : []
        const url   = urls.length ? urls[i % urls.length] : null
        const active  = !!onGapClick && (!!gap || !!selectedSpacerName)
        const visible = !!gap || !!selectedSpacerName
        return (
          <div
            key={`g${i}`}
            onClick={active ? () => onGapClick!(i) : undefined}
            title={gap ? `${gap} — tap to remove` : selectedSpacerName ? `Place ${selectedSpacerName} here` : undefined}
            style={{
              position: 'absolute',
              left: `${cx}%`, top: `${cy}%`,
              width: `${SPACER_PCT}%`, height: `${SPACER_PCT}%`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%', overflow: 'hidden',
              background: gap ? '#C8B89A' : 'transparent',
              cursor: active ? 'pointer' : 'default',
              border: !gap && selectedSpacerName ? '0.5px dashed rgba(176,139,87,0.7)' : 'none',
              boxShadow: gap ? '0 1px 3px rgba(50,30,10,0.30)' : undefined,
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.2s',
              zIndex: 1,
            }}
          >
            {url && <img src={url} alt={gap!} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scale(2.2)' }} />}
            {!url && gap && <div style={{ width: '100%', height: '100%', background: '#DDD0C4' }} />}
          </div>
        )
      })}

      {/* Crystal beads — size based on N, positions based on N+K slots */}
      {sequence.map((name, i) => {
        const a  = slotAngle(crystalSlot(i))
        const cx = Number((50 + RADIUS_PCT * Math.cos(a)).toFixed(4))
        const cy = Number((50 + RADIUS_PCT * Math.sin(a)).toFixed(4))
        const urls = imageMap[name] ?? []
        const url  = urls.length ? urls[i % urls.length] : null
        return (
          <div
            key={`c${i}`}
            title={name}
            style={{
              position: 'absolute',
              left: `${cx}%`, top: `${cy}%`,
              width: `${CRYSTAL_PCT}%`, height: `${CRYSTAL_PCT}%`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%', overflow: 'hidden',
              background: '#F5F0EB',
              boxShadow: '0 1px 4px rgba(50,30,10,0.22)',
              zIndex: 2,
            }}
          >
            {url
              ? <img src={url} alt={name} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scale(2.2)' }} />
              : <div style={{ width: '100%', height: '100%', background: '#DDD0C4' }} />
            }
          </div>
        )
      })}

      {/* Watermark */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
      }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3cqw', fontWeight: 400, letterSpacing: '0.22em', color: 'rgba(74,46,20,0.45)', textTransform: 'uppercase' }}>
          SYANN.CO
        </span>
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.2cqw', fontWeight: 500, letterSpacing: '0.3em', color: 'rgba(74,46,20,0.35)', textTransform: 'uppercase' }}>
          CRYSTALS · ENERGY · YOU
        </span>
      </div>
    </div>
  )
}
