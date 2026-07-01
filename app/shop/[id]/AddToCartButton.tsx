'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/cart'

const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

type Product = { id: string; name: string; price: number; image_url: string | null; category: string }

export default function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addToCart({ productId: product.id, name: product.name, price: product.price, imageUrl: product.image_url, category: product.category })
    setAdded(true)
    setTimeout(() => { router.push('/shop/cart') }, 700)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        onClick={handleAdd}
        disabled={added}
        style={{ ...BODY, width: '100%', padding: '15px 28px', borderRadius: 999, background: added ? GOLD : '#4A3A32', border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', cursor: added ? 'default' : 'pointer', transition: 'background 0.3s' }}
      >
        {added ? 'Added — going to cart…' : 'Add to Cart ✦'}
      </button>
    </div>
  )
}
