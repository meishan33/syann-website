import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AddToCartButton from './AddToCartButton'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'

type Product = { id: string; name: string; description: string | null; price: number; category: string; image_url: string | null; stock_count: number; product_url: string | null }

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await supabase.from('shop_products').select('*').eq('id', id).eq('active', true).single()
  return data ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description ?? `${product.name} — available at SYANN.CO`,
    openGraph: { title: `${product.name} | SYANN.CO`, images: product.image_url ? [product.image_url] : [] },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  return (
    <main style={{ background: '#F6F1EB', minHeight: '100vh', ...BODY }}>

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px 0' }}>
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/shop" style={{ ...BODY, fontSize: 11, color: '#9A8573', textDecoration: 'none' }}>Shop</Link>
          <span style={{ color: '#D9CEC5', fontSize: 11 }}>›</span>
          <span style={{ ...BODY, fontSize: 11, color: '#4A3A32' }}>{product.name}</span>
        </nav>
      </div>

      {/* Product layout */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,480px)', gap: 48, alignItems: 'start' }} className="product-detail-grid">

          {/* Image */}
          <div style={{ position: 'relative', aspectRatio: '1', borderRadius: 28, overflow: 'hidden', background: '#F8F4EF', border: '1px solid #E5DDD5', boxShadow: '0 20px 60px -20px rgba(101,70,46,0.2)' }}>
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill sizes="(max-width:900px) 100vw, 560px" style={{ objectFit: 'cover' }} priority />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 60, color: GOLD, opacity: 0.2 }}>✦</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 24 }}>

            {/* Category + name */}
            <div>
              <span style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: GOLD }}>{product.category}</span>
              <h1 style={{ ...SERIF, fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 300, color: '#3D2B1F', margin: '8px 0 0', lineHeight: 1.2 }}>{product.name}</h1>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ ...SERIF, fontSize: 32, fontWeight: 300, color: '#3D2B1F' }}>S${product.price.toFixed(2)}</span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#E5DDD5' }} />

            {/* Description */}
            {product.description && (
              <div>
                <p style={{ ...BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 10px' }}>About This Piece</p>
                <p style={{ ...BODY, fontSize: 13, fontWeight: 300, color: '#7A6355', lineHeight: 1.9, margin: 0 }}>{product.description}</p>
              </div>
            )}

            {/* External product link */}
            {product.product_url && (
              <a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...BODY, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: GOLD, textDecoration: 'none', letterSpacing: '0.04em' }}
              >
                View Product Details ↗
              </a>
            )}

            {/* Add to cart */}
            <AddToCartButton product={{ id: product.id, name: product.name, price: product.price, image_url: product.image_url, category: product.category, stock_count: product.stock_count }} />

            {/* Back link */}
            <Link href="/shop" style={{ ...BODY, fontSize: 11, color: '#9A8573', textDecoration: 'none', textAlign: 'center' }}>← Back to Shop</Link>
          </div>

        </div>
      </section>
    </main>
  )
}
