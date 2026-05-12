import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const {
      name,
      birthdate,
      gender,
      goal,
      feeling
    } = body


    /* FETCH CRYSTALS FROM SUPABASE */

    const { data: crystals } = await supabase
      .from('crystals')
      .select('*')


    /* CREATE AI PROMPT */

    const prompt = `
You are a luxury crystal energy master for a premium spiritual jewelry brand called SYANN.

Analyze the user based on:
- zodiac
- five elements
- emotional energy
- intention
- personality energy

USER INFO:

Name: ${name}
Birthdate: ${birthdate}
Gender: ${gender}
Goal: ${goal}
Feelings: ${feeling}

AVAILABLE CRYSTALS:
${JSON.stringify(crystals)}

TASK:
1. Choose the BEST 3-5 crystals
2. Explain why each crystal matches
3. Suggest bracelet energy theme
4. Suggest bracelet bead arrangement
5. Create elegant luxury bracelet description

Return JSON format:
{
  "theme": "",
  "summary": "",
  "crystals": [],
  "bracelet_design": "",
  "image_prompt": ""
}
`


    /* SEND TO OPENAI */

    const completion = await openai.chat.completions.create({

      model: 'gpt-4.1-mini',

      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],

      temperature: 0.8
    })


    const result =
      completion.choices[0].message.content


    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json({
      success: false,
      error: 'Something went wrong'
    })
  }
}