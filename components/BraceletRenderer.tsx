// Renders a bracelet in a circular layout using real crystal bead images.
// When spacerName is provided, spacer beads are placed at the midpoints
// between crystal beads and rendered at a smaller size — matching how real
// rondelle spacers look on a crystal bracelet.

const RADIUS_PCT  = 28   // ring radius as % of container width
const SPACER_RATIO = 0.38 // spacer diameter as fraction of crystal diameter
const CRYSTAL_FILL = 0.90 // crystal fills 90% of its arc slot when spacers present

type Props = {
  sequence: string[]
  spacerName?: string | null
  imageMap: Record<string, string[]>
  className?: string
}

export default function BraceletRenderer({ sequence, spacerName, imageMap, className }: Props) {
  const N = sequence.length

  // When spacers are present, size crystals slightly smaller than touching so
  // spacers visually fit between them without looking crammed.
  const CRYSTAL_PCT = N > 0
    ? Number((2 * RADIUS_PCT * Math.sin(Math.PI / N) * (spacerName ? CRYSTAL_FILL : 1)).toFixed(4))
    : 0
  const SPACER_PCT = Number((CRYSTAL_PCT * SPACER_RATIO).toFixed(4))

  // Build bead list: crystals at their positions, spacers at midpoints.
  type Bead = { key: string; cx: number; cy: number; pct: number; name: string; urlIdx: number; isSpacer: boolean }
  const beads: Bead[] = []

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2
    beads.push({
      key: `c${i}`,
      cx: Number((50 + RADIUS_PCT * Math.cos(angle)).toFixed(4)),
      cy: Number((50 + RADIUS_PCT * Math.sin(angle)).toFixed(4)),
      pct: CRYSTAL_PCT,
      name: sequence[i],
      urlIdx: i,
      isSpacer: false,
    })

    if (spacerName) {
      const midAngle = angle + Math.PI / N
      beads.push({
        key: `s${i}`,
        cx: Number((50 + RADIUS_PCT * Math.cos(midAngle)).toFixed(4)),
        cy: Number((50 + RADIUS_PCT * Math.sin(midAngle)).toFixed(4)),
        pct: SPACER_PCT,
        name: spacerName,
        urlIdx: i,
        isSpacer: true,
      })
    }
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        background: '#F5F0EB',
        borderRadius: 20,
        overflow: 'hidden',
        containerType: 'inline-size',
      }}
    >
      {/* Elastic thread ring */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle
          cx="50" cy="50"
          r={RADIUS_PCT}
          fill="none"
          stroke="rgba(140,100,60,0.18)"
          strokeWidth="0.6"
          strokeDasharray="2.5 2"
        />
      </svg>

      {/* Beads — spacers rendered below crystals so crystals sit on top */}
      {[...beads.filter(b => b.isSpacer), ...beads.filter(b => !b.isSpacer)].map(bead => {
        const urls = imageMap[bead.name] ?? []
        const url = urls.length ? urls[bead.urlIdx % urls.length] : null
        return (
          <div
            key={bead.key}
            title={bead.name}
            style={{
              position: 'absolute',
              left: `${bead.cx}%`,
              top: `${bead.cy}%`,
              width: `${bead.pct}%`,
              height: `${bead.pct}%`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#F5F0EB',
              boxShadow: bead.isSpacer
                ? '0 1px 3px rgba(50,30,10,0.30)'
                : '0 1px 4px rgba(50,30,10,0.22)',
              outline: bead.isSpacer
                ? '1px solid rgba(80,50,20,0.18)'
                : '1.5px solid rgba(80,50,20,0.12)',
              zIndex: bead.isSpacer ? 1 : 2,
            }}
          >
            {url
              ? <img src={url} alt={bead.name} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scale(2.2)' }} />
              : <div style={{ width: '100%', height: '100%', background: '#DDD0C4' }} />
            }
          </div>
        )
      })}

      {/* Watermark */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', gap: 5, zIndex: 3,
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '3cqw',
          fontWeight: 400, letterSpacing: '0.22em',
          color: 'rgba(74,46,20,0.45)', textTransform: 'uppercase',
        }}>
          SYANN.CO
        </span>
        <span style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '1.2cqw',
          fontWeight: 500, letterSpacing: '0.3em',
          color: 'rgba(74,46,20,0.35)', textTransform: 'uppercase',
        }}>
          CRYSTALS · ENERGY · YOU
        </span>
      </div>
    </div>
  )
}
