import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { imageDataUrl } = await req.json()

    if (!imageDataUrl?.startsWith('data:image/png;base64,')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
    }

    const base64 = imageDataUrl.replace('data:image/png;base64,', '')
    const buffer = Buffer.from(base64, 'base64')
    const fileName = `bracelet-${id}.png`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('generated-bracelets')
      .upload(fileName, buffer, { contentType: 'image/png', upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('generated-bracelets')
      .getPublicUrl(fileName)

    await supabaseAdmin
      .from('energy_quiz_results')
      .update({ cached_image_url: publicUrl })
      .eq('id', id)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
