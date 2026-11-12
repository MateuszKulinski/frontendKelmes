import type { AiChatCartAction } from './aiChatApi'

type Cart = { id: number; items: { product_id: number; quantity: number }[] }
type HostCart = {
  cart: Cart | null
  carts: { id: number; name: string | null }[]
  error: string | null
  addItem: (id: number, quantity: number) => Promise<Cart | null>
  updateQuantity: (id: number, quantity: number) => Promise<Cart | null>
  removeItem: (id: number) => Promise<Cart | null>
  selectCart: (id: number) => Promise<Cart | null>
  createCart: (name: string) => Promise<Cart | null>
  fetchCarts: () => Promise<void>
  loadActiveCart: () => Promise<Cart | null>
}
type Receipt = { fingerprint: string; status: 'started' | 'done' | 'uncertain' }
const receipts = new Map<string, Receipt>()
const positive = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0

function valid(action: AiChatCartAction) {
  return action != null && typeof action === 'object' && /^[a-f0-9]{64}$/.test(action.id) && positive(action.product_id)
    && ['add', 'set', 'remove', 'replace'].includes(action.action)
    && (action.action !== 'add' || positive(action.quantity))
    && (action.action !== 'set' || Number.isSafeInteger(action.quantity) && Number(action.quantity) >= 0)
    && (action.action !== 'replace' || positive(action.replacement_product_id)
      && action.replacement_product_id !== action.product_id
      && (action.quantity == null || positive(action.quantity)))
    && (action.cart_id == null || positive(action.cart_id))
    && (action.cart_name == null || typeof action.cart_name === 'string' && action.cart_name.length <= 50)
    && (action.expected_quantity == null || Number.isSafeInteger(action.expected_quantity) && action.expected_quantity >= 0)
}

function readReceipt(id: string): Receipt | undefined {
  try {
    const raw = sessionStorage.getItem(`ai-chat-cart-command:${id}`)
    if (raw) return JSON.parse(raw)
  } catch { /* In-memory protection also works when browser storage is unavailable. */ }
  return receipts.get(id)
}

function saveReceipt(id: string, value: Receipt) {
  receipts.set(id, value)
  try { sessionStorage.setItem(`ai-chat-cart-command:${id}`, JSON.stringify(value)) } catch { /* See above. */ }
}

export async function executeCartActions(actions: AiChatCartAction[], cart: HostCart, active = () => true) {
  let completed = 0
  let changed = false
  const seen = new Map<string, string>()
  // Validate the complete batch before any host cart operation.
  for (const action of actions) {
    if (!valid(action)) return { ok: false, completed, changed }
    const fingerprint = JSON.stringify(action)
    if (seen.has(action.id) && seen.get(action.id) !== fingerprint) return { ok: false, completed, changed }
    seen.set(action.id, fingerprint)
    const receipt = readReceipt(action.id)
    if (receipt && (receipt.fingerprint !== fingerprint || receipt.status !== 'done')) return { ok: false, completed, changed }
  }
  for (const action of actions) {
    if (!active()) return { ok: false, completed, changed }
    if (readReceipt(action.id)?.status === 'done') continue
    const fingerprint = JSON.stringify(action)
    // Record BEFORE sending: an interrupted response must never retry an
    // additive operation automatically, including after a widget reload.
    saveReceipt(action.id, { fingerprint, status: 'started' })
    try {
      let target = action.cart_id
      if (!target && action.cart_name) {
        await cart.fetchCarts()
        const matches = cart.carts.filter(row => row.name?.toLocaleLowerCase() === action.cart_name!.toLocaleLowerCase())
        if (matches.length > 1 || !active()) throw new Error('Cart selection required')
        if (matches.length) target = matches[0].id
        else if (!await cart.createCart(action.cart_name)) throw new Error('Cart creation failed')
      }
      if (target && cart.cart?.id !== target) {
        if (!active() || !await cart.selectCart(target)) throw new Error('Cart selection failed')
      }
      if (!active()) throw new Error('Chat no longer active')
      if (action.action === 'add') {
        if (!await cart.addItem(action.product_id, action.quantity!)) throw new Error('Cart add failed')
        changed = true
      } else {
        const current = await cart.loadActiveCart()
        const source = current?.items.find(row => row.product_id === action.product_id)
        if (!source || action.expected_quantity != null && source.quantity !== action.expected_quantity || !active()) {
          throw new Error('Cart item changed')
        }
        if (action.action === 'replace') {
          if (!await cart.addItem(action.replacement_product_id!, action.quantity ?? source.quantity)) throw new Error('Replacement add failed')
          changed = true
          if (!active() || !await cart.removeItem(action.product_id)) throw new Error('Replacement removal failed')
        } else if (action.action === 'remove' || action.quantity === 0) {
          if (!await cart.removeItem(action.product_id)) throw new Error('Cart removal failed')
          changed = true
        } else {
          if (!await cart.updateQuantity(action.product_id, action.quantity!)) throw new Error('Cart quantity failed')
          changed = true
        }
      }
      saveReceipt(action.id, { fingerprint, status: 'done' })
      completed += 1
    } catch {
      saveReceipt(action.id, { fingerprint, status: 'uncertain' })
      return { ok: false, completed, changed }
    }
  }
  return { ok: true, completed, changed }
}
