import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateBraceletImage } from '@/lib/bracelet-image'

export async function POST(req: NextRequest) {
  try {
    const { resultId, beadSequence }: { resultId: string; beadSequence: string[] } = await req.json()

    if (!resultId || !Array.isArray(beadSequence) || beadSequence.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const uniqueCrystals = [...new Set(beadSequence.filter(Boolean))]

    const { data: crystalRows } = await supabaseAdmin
      .from('crystals')
      .select('name, bead_image_url, bead_image_urls')
      .in('name', uniqueCrystals)

    const imageMap: Record<string, string[]> = {}
    for (const c of crystalRows ?? []) {
      if (c.bead_image_urls?.length) imageMap[c.name] = c.bead_image_urls
      else if (c.bead_image_url) imageMap[c.name] = [c.bead_image_url]
    }

    const pngBuffer = await generateBraceletImage(beadSequence, imageMap)
    const n = beadSequence.length
    const fileName = `bracelet-${resultId}-${n}beads.png`

    const pngBlob = new Blob([new Uint8Array(pngBuffer)], { type: 'image/png' })
    const { error: uploadError } = await supabaseAdmin.storage
      .from('generated-bracelets')
      .upload(fileName, pngBlob, { contentType: 'image/png', upsert: true })

    if (uploadError) {
      return NextResponse.json({ imageUrl: null })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('generated-bracelets')
      .getPublicUrl(fileName)

    const imageUrl = urlData.publicUrl ?? null

    // Update cached_image_url so the webhook reads the wrist-correct image
    if (imageUrl) {
      await supabaseAdmin
        .from('energy_quiz_results')
        .update({ cached_image_url: imageUrl })
        .eq('id', resultId)
    }

    return NextResponse.json({ imageUrl })
  } catch (err) {
    console.error('Result image generation error:', err)
    return NextResponse.json({ imageUrl: null })
  }
}
