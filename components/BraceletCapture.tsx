'use client'

import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { supabase } from '@/lib/supabase'
import BraceletRenderer from './BraceletRenderer'

type Props = {
  sequence: string[]
  imageMap: Record<string, string[]>
  resultId: string
  alreadySaved: boolean
  className?: string
}

export default function BraceletCapture({ sequence, imageMap, resultId, alreadySaved, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [captured, setCaptured] = useState(alreadySaved)

  useEffect(() => {
    if (captured || !ref.current || sequence.length === 0) return

    const imgs = ref.current.querySelectorAll('img')
    const promises = Array.from(imgs).map(img =>
      img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res })
    )

    Promise.all(promises).then(async () => {
      if (!ref.current) return
      try {
        const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 2 })
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token ?? null
        await fetch(`/api/results/${resultId}/save-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ imageDataUrl: dataUrl }),
        })
        setCaptured(true)
      } catch (err) {
        // Display is unaffected if save fails — the caller always has a live
        // fallback render — but log it so silent capture failures (e.g. canvas
        // tainting from cross-origin bead images) are actually diagnosable.
        console.error('Bracelet image capture/save failed:', err)
      }
    })
  }, [sequence, resultId, captured])

  return (
    <div ref={ref}>
      <BraceletRenderer sequence={sequence} imageMap={imageMap} className={className} />
    </div>
  )
}
