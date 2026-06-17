import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { openai } from '@/lib/openai'

const PILLARS = {
  product:      'Product Showcase — highlight a specific crystal or bracelet',
  education:    'Spiritual Education — teach followers about crystal energy or Five Elements',
  quiz:         'AI Quiz CTA — invite followers to discover their crystal bracelet',
  social_proof: 'Social Proof — share a customer journey or transformation story',
  brand:        'Behind the Brand — share the SYANN story, values, or process',
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { pillar, crystalFocus, context, tone } = await req.json()

  const pillarDescription = PILLARS[pillar as keyof typeof PILLARS] ?? PILLARS.product

  const toneGuide = {
    luxury:      'elegant, refined, premium — reads like a high-end jewellery brand',
    warm:        'nurturing, personal, heartfelt — like a trusted friend who understands energy healing',
    mystical:    'ethereal, poetic, spiritually evocative — moonlit and enchanting',
    educational: 'clear, informative, accessible — teaches without being dry',
  }[tone as string] ?? 'warm and luxurious'

  const systemPrompt = `You are the Instagram content writer for SYANN — a luxury crystal bracelet brand from Southeast Asia. SYANN creates AI-powered, personalized crystal bracelets based on Ba Zi Five Elements (Wood, Fire, Earth, Metal, Water) energy analysis. Every bracelet is handcrafted with genuine natural crystal beads.

Brand voice: ${toneGuide}
Website: syann.co

You will write one complete Instagram post. Output ONLY valid JSON in this exact structure:
{
  "caption": "Full Instagram caption with line breaks (\\n) where appropriate. Include a hook first line, body, and a soft CTA at the end.",
  "hashtags": "30 relevant hashtags as a single string separated by spaces, starting with #",
  "imageNote": "One sentence describing the ideal photo or visual that would pair best with this post — styled flat lay, mood, props, lighting."
}`

  const userPrompt = `Content pillar: ${pillarDescription}
${crystalFocus ? `Crystal focus: ${crystalFocus}` : ''}
${context ? `Additional context / notes: ${context}` : ''}

Write an Instagram post for SYANN that fits this pillar. Make it feel authentic, on-brand, and scroll-stopping.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    })

    const result = JSON.parse(response.choices[0]?.message?.content ?? '{}')
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
