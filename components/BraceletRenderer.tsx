// Renders a 20-bead bracelet in a circular layout using real crystal bead images.

const RADIUS_PCT = 38   // circle radius as % of container width
const BEAD_PCT   = 12.2 // bead diameter as % of container width

type Props = {
  sequence: string[]
  imageMap: Record<string, string>
  className?: string
}

export default function BraceletRenderer({ sequence, imageMap, className }: Props) {
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

      {/* Beads */}
      {sequence.map((crystal, i) => {
        const angle = (i / sequence.length) * 2 * Math.PI - Math.PI / 2
        const cx = 50 + RADIUS_PCT * Math.cos(angle)
        const cy = 50 + RADIUS_PCT * Math.sin(angle)

        return (
          <div
            key={i}
            title={crystal}
            style={{
              position: 'absolute',
              left: `${cx}%`,
              top: `${cy}%`,
              width: `${BEAD_PCT}%`,
              height: `${BEAD_PCT}%`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(50,30,10,0.28), inset 0 1px 3px rgba(255,255,255,0.35)',
            }}
          >
            {imageMap[crystal]
              ? <img src={imageMap[crystal]} alt={crystal} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scale(1.6)' }} />
              : <div style={{ width: '100%', height: '100%', background: '#DDD0C4' }} />
            }
          </div>
        )
      })}

      {/* Watermark */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', gap: 5,
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(10px, 1.8vw, 14px)',
          fontWeight: 400, letterSpacing: '0.22em',
          color: 'rgba(74,46,20,0.22)', textTransform: 'uppercase',
        }}>
          SYANN.CO
        </span>
        <span style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 'clamp(5px, 0.7vw, 7px)',
          fontWeight: 500, letterSpacing: '0.3em',
          color: 'rgba(74,46,20,0.16)', textTransform: 'uppercase',
        }}>
          CRYSTALS · ENERGY · YOU
        </span>
      </div>
    </div>
  )
}
