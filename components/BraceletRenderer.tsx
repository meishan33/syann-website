const RADIUS_PCT = 28

type Props = {
  sequence: string[]
  imageMap: Record<string, string[]>
  className?: string
}

export default function BraceletRenderer({ sequence, imageMap, className }: Props) {
  const N = sequence.length
  if (N === 0) return <div className={className} style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#F5F0EB', borderRadius: 20 }} />

  const ARC_PCT     = Number((2 * RADIUS_PCT * Math.sin(Math.PI / N)).toFixed(4))
  const CRYSTAL_PCT = Number((ARC_PCT * 1.0).toFixed(4))

  function crystalAngle(i: number): number {
    return (i / N) * 2 * Math.PI - Math.PI / 2
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

      {/* Crystal beads */}
      {sequence.map((name, i) => {
        const a  = crystalAngle(i)
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
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
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
