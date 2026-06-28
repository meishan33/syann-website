import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join } from 'path'

// Mirrors components/BraceletRenderer.tsx's layout math exactly, so the
// server-generated photo and the live fallback render look the same.
const SIZE = 1024
const RADIUS_PCT = 28

// Vercel's serverless environment has no system fonts and its librsvg build
// doesn't support @font-face-embedded fonts either, so any <text> element in
// the rasterized SVG renders as nothing (no error, just blank) there even
// though it works fine locally. The watermark text never changes, so instead
// of rendering it at request time, it's pre-rendered once to a transparent
// PNG (lib/assets/bracelet-watermark.png) and composited as a plain image —
// composing bitmaps has no font dependency at all.
const watermarkBuffer = readFileSync(join(process.cwd(), 'lib/assets/bracelet-watermark.png'))

// Source crystal bead photos are uploaded at full camera resolution (some are
// 1.5MB+) — embedding several of those as base64 inside one SVG bloats it
// enough to overwhelm the rasterizer in the serverless environment. Each bead
// only ever displays at a few hundred px in the final composition, so resize
// down before embedding regardless of the source size.
async function toBase64DataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const resized = await sharp(buf).resize(300, 300, { fit: 'cover' }).png().toBuffer()
    return `data:image/png;base64,${resized.toString('base64')}`
  } catch {
    return null
  }
}

export async function generateBraceletImage(
  sequence: string[],
  imageMap: Record<string, string[]>
): Promise<Buffer> {
  const n = sequence.length
  if (n === 0) throw new Error('Cannot generate a bracelet image with an empty sequence')

  const beadPct = 2 * RADIUS_PCT * Math.sin(Math.PI / n)
  const beadR = beadPct / 2

  // Resolve + base64-encode each distinct bead image URL once, not once per bead.
  const urlCache = new Map<string, string | null>()
  async function resolveDataUri(url: string): Promise<string | null> {
    if (!urlCache.has(url)) urlCache.set(url, await toBase64DataUri(url))
    return urlCache.get(url) ?? null
  }

  const beadParts = await Promise.all(sequence.map(async (crystal, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    const cx = Number((50 + RADIUS_PCT * Math.cos(angle)).toFixed(4))
    const cy = Number((50 + RADIUS_PCT * Math.sin(angle)).toFixed(4))
    const urls = imageMap[crystal] ?? []
    const url = urls.length ? urls[i % urls.length] : null
    const dataUri = url ? await resolveDataUri(url) : null

    if (!dataUri) {
      return `<circle cx="${cx}" cy="${cy}" r="${beadR}" fill="#DDD0C4" />`
    }
    // Source bead photos have padding around the actual bead — zoom in like
    // BraceletRenderer's scale(2.2) so the bead fills the circle with no
    // background halo showing through.
    const zoomedR = beadR * 2.2
    return `
      <clipPath id="clip${i}"><circle cx="${cx}" cy="${cy}" r="${beadR}" /></clipPath>
      <image href="${dataUri}" x="${cx - zoomedR}" y="${cy - zoomedR}" width="${zoomedR * 2}" height="${zoomedR * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip${i})" />
      <circle cx="${cx}" cy="${cy}" r="${beadR}" fill="none" stroke="rgba(80,50,20,0.12)" stroke-width="0.25" />`
  }))

  const svg = `
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="4" fill="#F5F0EB" />
  <circle cx="50" cy="50" r="${RADIUS_PCT}" fill="none" stroke="rgba(140,100,60,0.18)" stroke-width="0.15" stroke-dasharray="0.6 0.5" />
  ${beadParts.join('\n')}
</svg>`.trim()

  const pngBuffer = await sharp(Buffer.from(svg))
    .composite([{ input: watermarkBuffer, top: 0, left: 0 }])
    .png()
    .toBuffer()

  // Verify the output actually decodes before handing it back — a corrupted
  // render must never reach the caller's upload/save step.
  const outputMeta = await sharp(pngBuffer).metadata()
  if (!outputMeta.width || !outputMeta.height) {
    throw new Error('Generated bracelet image failed to validate (no decodable dimensions)')
  }

  return pngBuffer
}
