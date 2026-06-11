export type CartItem = {
  productId: string
  name: string
  price: number
  imageUrl: string | null
  category: string
  quantity: number
}

const CART_KEY = 'syann_shop_cart'

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

export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const cart = getCart()
  const existing = cart.find(i => i.productId === item.productId)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ ...item, quantity: 1 })
  }
  saveCart(cart)
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
