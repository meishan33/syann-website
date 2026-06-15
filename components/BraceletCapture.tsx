'use client'

import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
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

    // Wait for all bead images to load before capturing
    const imgs = ref.current.querySelectorAll('img')
    const promises = Array.from(imgs).map(img =>
      img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res })
    )

    Promise.all(promises).then(() => {
      if (!ref.current) return
      toPng(ref.current, { cacheBust: true, pixelRatio: 2 })
        .then(dataUrl => fetch(`/api/results/${resultId}/save-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageDataUrl: dataUrl }),
        }))
        .then(() => setCaptured(true))
        .catch(() => {}) // silent — display is unaffected if save fails
    })
  }, [sequence, resultId, captured])

  return (
    <div ref={ref}>
      <BraceletRenderer sequence={sequence} imageMap={imageMap} className={className} />
    </div>
  )
}
