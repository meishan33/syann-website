export type CartItem = {
  productId: string
  name: string
  price: number
  imageUrl: string | null
  category: string
  quantity: number
  // Bracelet-specific (type === 'bracelet')
  type?: 'shop' | 'bracelet'
  resultId?: string
  spacer?: string
  includeCharm?: boolean
  remark?: string
}

export const BRACELET_PRICE = 59.00

const CART_KEY = 'syann_shop_cart'
const CART_OWNER_KEY = 'syann_cart_owner'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cart-updated'))
}

// Call when auth resolves. Clears the cart if a different user is now active
// so carts never leak between accounts.
export function bindCartToUser(userId: string | null) {
  if (typeof window === 'undefined') return
  const owner = userId ?? 'guest'
  const stored = localStorage.getItem(CART_OWNER_KEY)
  if (stored !== null && stored !== owner) {
    clearCart()
  }
  localStorage.setItem(CART_OWNER_KEY, owner)
}

export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const cart = getCart()
  const existing = cart.find(i => i.productId === item.productId)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ ...item, quantity: 1 })
  }
  saveCart(cart)
  window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { name: item.name } }))
}

// Adds a bracelet to the cart, replacing any existing bracelet (one per cart).
export function addBraceletToCart(opts: {
  resultId: string
  spacer: string
  includeCharm: boolean
  remark: string
  imageUrl: string | null
  crystalNames: string[]
}) {
  const cart = getCart().filter(i => i.type !== 'bracelet')
  const label = opts.crystalNames.length ? opts.crystalNames.join(' · ') : 'Custom Crystal Bracelet'
  cart.push({
    productId: `bracelet-${opts.resultId}`,
    name: label,
    price: BRACELET_PRICE,
    imageUrl: opts.imageUrl,
    category: 'Crystal Bracelet',
    quantity: 1,
    type: 'bracelet',
    resultId: opts.resultId,
    spacer: opts.spacer,
    includeCharm: opts.includeCharm,
    remark: opts.remark,
  })
  saveCart(cart)
  window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { name: label } }))
}

export function removeFromCart(productId: string) {
  saveCart(getCart().filter(i => i.productId !== productId))
}

export function updateQuantity(productId: string, quantity: number) {
  if (quantity <= 0) { removeFromCart(productId); return }
  const cart = getCart()
  const item = cart.find(i => i.productId === productId)
  if (item) item.quantity = quantity
  saveCart(cart)
}

export function clearCart() {
  saveCart([])
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}
