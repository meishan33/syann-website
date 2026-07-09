// Renders a bracelet in a circular layout using real crystal bead images.
// imageMap accepts multiple URLs per crystal — beads cycle through them for visual variety.

const RADIUS_PCT = 28   // circle radius as % of container width

type Props = {
  sequence: string[]
  imageMap: Record<string, string[]>
  className?: string
}

export default function BraceletRenderer({ sequence, imageMap, className }: Props) {
  // Bead diameter sized to fill the ring with no gaps, regardless of bead count
  // (chord length between adjacent bead centers on the circle). Rounded to a
  // short fixed precision so the server-rendered and client-hydrated percentage
  // strings always match exactly (long floats can get re-serialized slightly
  // differently by the browser, causing a harmless but noisy hydration warning).
  const BEAD_PCT = sequence.length > 0 ? Number((2 * RADIUS_PCT * Math.sin(Math.PI / sequence.length)).toFixed(4)) : 0

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

      {/* Beads */}
      {sequence.map((crystal, i) => {
        const angle = (i / sequence.length) * 2 * Math.PI - Math.PI / 2
        const cx = Number((50 + RADIUS_PCT * Math.cos(angle)).toFixed(4))
        const cy = Number((50 + RADIUS_PCT * Math.sin(angle)).toFixed(4))
        const urls = imageMap[crystal] ?? []
        const url = urls.length ? urls[i % urls.length] : null

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
              background: '#F5F0EB',
              boxShadow: '0 1px 4px rgba(50,30,10,0.22)',
              outline: '1.5px solid rgba(80,50,20,0.12)',
            }}
          >
            {url
              ? <img src={url} alt={crystal} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scale(2.2)' }} />
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
