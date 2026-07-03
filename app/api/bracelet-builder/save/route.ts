import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateBraceletImage } from '@/lib/bracelet-image'

export async function POST(req: NextRequest) {
  try {
    const { beadSequence, crystalNames }: {
      beadSequence: string[]
      crystalNames: string[]
    } = await req.json()

    if (!Array.isArray(beadSequence) || beadSequence.length === 0) {
      return NextResponse.json({ error: 'No bead sequence provided' }, { status: 400 })
    }

    const filledBeads = beadSequence.filter(b => b && b.length > 0)
    if (filledBeads.length < 1) {
      return NextResponse.json({ error: 'Please select at least one crystal.' }, { status: 400 })
    }

    const uniqueCrystals = (crystalNames ?? []).filter(Boolean)

    // Store the design as a quiz result row.
    // crystal_explanations holds the full bead sequence so the image generator
    // (and any future display logic) can reconstruct exactly what the user built.
    const { data: result, error: insertError } = await supabaseAdmin
      .from('energy_quiz_results')
      .insert({
        crystal_names: uniqueCrystals,
        crystal_explanations: { beadSequence },
        calculated_weak_element: 'custom',
        calculated_strong_element: 'custom',
        analysis_summary: 'Custom design bracelet',
        user_name: null,
        user_id: null,
        birth_date: null,
        birth_time: null,
        main_goal: null,
        current_feelings: null,
      })
      .select('id')
      .single()

    if (insertError || !result?.id) {
      console.error('Bracelet builder DB insert error:', insertError)
      return NextResponse.json({ error: insertError?.message ?? 'Failed to save design.' }, { status: 500 })
    }

    const resultId: string = result.id
    let imageUrl: string | null = null

    try {
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

      const fileName = `bracelet-${resultId}.png`
      const { error: uploadError } = await supabaseAdmin.storage
        .from('generated-bracelets')
        .upload(fileName, pngBuffer, { contentType: 'image/png', upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage
          .from('generated-bracelets')
          .getPublicUrl(fileName)
        imageUrl = urlData.publicUrl ?? null

        await supabaseAdmin
          .from('energy_quiz_results')
          .update({ cached_image_url: imageUrl })
          .eq('id', resultId)
      }
    } catch (imgErr) {
      // Image generation is non-fatal — the bracelet can still be ordered
      // and the payment page will fall back to the live renderer.
      console.error('Bracelet builder image generation failed (non-fatal):', imgErr)
    }

    return NextResponse.json({ resultId, imageUrl })
  } catch (err) {
    console.error('Bracelet builder save error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
