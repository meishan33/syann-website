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

    const imgs = Array.from(ref.current.querySelectorAll('img'))
    const promises = imgs.map(img =>
      img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res })
    )

    Promise.all(promises).then(async () => {
      if (!ref.current) return

      // onload and onerror both resolve the same promise above, so a failed
      // bead image load (e.g. a transient network blip or CORS hiccup) was
      // previously treated as "ready" — capturing and permanently saving a
      // bracelet photo with blank beads. Verify every image actually decoded
      // real pixel data before capturing; otherwise skip silently and let a
      // future visit retry, rather than baking in a broken photo forever.
      const allLoaded = imgs.every(img => img.naturalWidth > 0)
      if (!allLoaded) {
        console.error('Bracelet image capture skipped — one or more bead images failed to load')
        return
      }

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
