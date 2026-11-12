import api from '@/core/api/axios'
import type { UrlObject } from '@/composables/useUrlResolver'

export type AiChatProduct = {
  id: number
  name?: string | null
  catalog_number?: string | null
  indeks?: string | null
  image?: string | null
  url?: UrlObject
  net_price?: string | null
  gross_price?: string | null
}

type StartChatResponse = {
  session_id: string
  message: string
}

type MessageResponse = {
  response: string
  cart_updated: boolean
  cart_actions?: AiChatCartAction[]
  product_ids: number[]
  groups?: ProductResultGroup[]
  has_more: boolean
  order_ids: number[]
  clarification?: AiChatClarification | null
  task_plan?: AiChatTaskPlan | null
}

export type AiChatTaskPlan = {
  id: string
  revision: number
  status: 'running' | 'completed' | 'waiting_user' | 'waiting_platform' | 'partial' | 'failed' | 'cancelled'
  steps: Array<{
    id: number
    description: string
    status: 'pending' | 'running' | 'completed' | 'waiting_user' | 'handed_off' | 'failed' | 'uncertain'
  }>
}

export type AiChatCallbacks = {
  onText: (text: string) => void
  onProducts?: (products: AiChatProduct[], groups: AiChatProductGroup[]) => void
}

type ProductResultGroup = {
  id: string
  query: string
  product_ids: number[]
  status: 'ok' | 'empty' | 'clarification' | 'incomplete' | 'error'
  has_more: boolean
  message?: string | null
}

export type AiChatProductGroup = {
  id: string
  query: string
  products: AiChatProduct[]
  status: ProductResultGroup['status']
  hasMore: boolean
  message?: string | null
}

type MessageContext = {
  product_id?: number
  compare_product_ids?: number[]
  page_context?: 'porownania/index'
}

export type AiChatClarification = {
  id: string
  prompt: string
  kind?: string | null
  product_label?: string | null
  item_index?: number | null
  allow_text?: boolean
  options: AiChatClarificationOption[]
  groups?: AiChatClarificationGroup[]
}

export type AiChatClarificationOption = {
  id: string
  label: string
  product_id?: number | null
  quantity?: number | null
  availability_description?: string | null
  read_availability?: boolean
  // Hydrated locally from /ai-chat/products (Laravel), never from Python/LLM.
  product?: AiChatProduct | null
}

export type AiChatClarificationGroup = {
  id: string
  label: string
  parent_id?: string | null
  parent_label?: string | null
  options: { id: string; label: string }[]
}

type ProductsResponse = {
  products: AiChatProduct[]
}

export type AiChatReply = {
  response: string
  cartUpdated: boolean
  cartActions: AiChatCartAction[]
  hasMore: boolean
  products: AiChatProduct[]
  groups: AiChatProductGroup[]
  productsUnavailable: boolean
  orderIds: number[]
  clarification: AiChatClarification | null
  taskPlan?: AiChatTaskPlan | null
}

export type AiChatCartAction = {
  id: string
  action: 'add' | 'set' | 'remove' | 'replace'
  product_id: number
  quantity?: number | null
  replacement_product_id?: number | null
  expected_quantity?: number | null
  cart_id?: number | null
  cart_name?: string | null
}

export async function startAiChat(): Promise<StartChatResponse> {
  const { data } = await api.post<StartChatResponse>('/ai-chat/start')
  return data
}

export async function sendAiChatMessage(
  sessionId: string,
  message: string,
  productId?: number,
  callbacks?: AiChatCallbacks,
  signal?: AbortSignal,
): Promise<AiChatReply> {
  return postAiChatReply(sessionId, { message }, productId === undefined ? {} : { product_id: productId }, callbacks, signal)
}

export async function compareAiChatProducts(
  sessionId: string,
  productIds: number[],
  message: string,
  callbacks?: AiChatCallbacks,
  signal?: AbortSignal,
): Promise<AiChatReply> {
  if (productIds.length < 2 || productIds.length > 4 || new Set(productIds).size !== productIds.length
      || productIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    throw new Error('Select 2–4 distinct products to compare')
  }
  return postAiChatReply(sessionId, { message }, {
    compare_product_ids: [...productIds], page_context: 'porownania/index',
  }, callbacks, signal)
}

export async function chooseAiChatClarification(
  sessionId: string,
  clarificationId: string,
  optionId: string,
  productId?: number,
  callbacks?: AiChatCallbacks,
  signal?: AbortSignal,
): Promise<AiChatReply> {
  return postAiChatReply(sessionId, {
    clarification_id: clarificationId,
    option_id: optionId,
  }, productId === undefined ? {} : { product_id: productId }, callbacks, signal)
}

async function postAiChatReply(
  sessionId: string,
  payload: { message: string } | { clarification_id: string; option_id: string },
  context: MessageContext,
  callbacks?: AiChatCallbacks,
  signal?: AbortSignal,
): Promise<AiChatReply> {
  const { data: stream } = await api.post<ReadableStream<Uint8Array>>('/ai-chat/message/stream', {
    session_id: sessionId,
    ...payload,
    request_id: crypto.randomUUID(),
    ...context,
  }, { signal, adapter: 'fetch', responseType: 'stream' })
  let data: MessageResponse | undefined
  let text = ''
  const unavailableProductIds = new Set<number>()
  let productsRevision = 0
  const pendingProducts = new Map<string, Promise<AiChatProduct[]>>()

  const loadProducts = (input: number[]) => {
    const ids = [...new Set(input)].filter((id) => Number.isSafeInteger(id) && id > 0)
    const key = [...ids].sort((left, right) => left - right).join(',')
    if (!pendingProducts.has(key)) pendingProducts.set(key, (async () => {
      if (!ids.length) return []
      const batches: Promise<AiChatProduct[]>[] = []
      for (let offset = 0; offset < ids.length; offset += 100) {
        batches.push((async () => {
          const batch = ids.slice(offset, offset + 100)
          try {
            const { data: catalog } = await api.post<ProductsResponse>('/ai-chat/products', {
              product_ids: batch,
            }, { signal })
            const returned = new Set(catalog.products.map((product) => product.id))
            batch.forEach((id) => returned.has(id) ? unavailableProductIds.delete(id) : unavailableProductIds.add(id))
            return catalog.products
          } catch (error) {
            if (signal?.aborted) throw error
            batch.forEach((id) => unavailableProductIds.add(id))
            return []
          }
        })())
      }
      return (await Promise.all(batches)).flat()
    })())
    return pendingProducts.get(key)!.then((rows) => {
      const byId = new Map(rows.map((product) => [product.id, product]))
      return ids.flatMap((id) => { const product = byId.get(id); return product ? [product] : [] })
    })
  }

  const resultIds = (value: Pick<MessageResponse, 'product_ids' | 'groups'>) => [
    ...(value.product_ids ?? []), ...(value.groups ?? []).flatMap((group) => group.product_ids),
  ]
  const hydrateGroups = (groups: ProductResultGroup[] | undefined, rows: AiChatProduct[]): AiChatProductGroup[] => {
    const byId = new Map(rows.map((product) => [product.id, product]))
    return (groups ?? []).map((group) => ({
      id: group.id, query: group.query, status: group.status, message: group.message,
      hasMore: group.has_more === true,
      products: [...new Set(group.product_ids)].flatMap((id) => {
        const product = byId.get(id)
        return product ? [product] : []
      }),
    }))
  }

  try {
    await readAiChatEvents(stream, (event, value) => {
      if (event === 'error') throw new Error(value.error || 'AI chat stream failed')
      if (event === 'chunk') { text += value.content ?? ''; callbacks?.onText(text) }
      if (event === 'products') {
        // Fetch the platform cards concurrently with final answer generation.
        const revision = ++productsRevision
        void loadProducts(resultIds(value)).then((rows) => {
          if (!signal?.aborted && revision === productsRevision) {
            callbacks?.onProducts?.(rows, hydrateGroups(value.groups, rows))
          }
        }).catch(() => {})
      }
      if (event === 'done') {
        productsRevision += 1
        data = { ...value, response: value.full_response ?? text }
      }
    })
  } finally {
    productsRevision += 1
  }
  if (!data) throw new Error('Incomplete AI chat stream')
  const choiceIds = (data.clarification?.options ?? []).flatMap((option) =>
    Number.isSafeInteger(option.product_id) && option.product_id! > 0 ? [option.product_id!] : [])
  const rows = await loadProducts([...resultIds(data), ...choiceIds])
  const byId = new Map(rows.map((product) => [product.id, product]))
  const products = [...new Set(resultIds(data))].flatMap((id) => {
    const product = byId.get(id)
    return product ? [product] : []
  })
  const clarification = data.clarification ? {
    ...data.clarification,
    options: data.clarification.options.map((option) => ({
      id: option.id, label: option.label, product_id: option.product_id,
      quantity: Number.isSafeInteger(option.quantity) && option.quantity! > 0 ? option.quantity : null,
      availability_description: typeof option.availability_description === 'string' ? option.availability_description : null,
      read_availability: option.read_availability === true,
      product: option.product_id ? byId.get(option.product_id) ?? null : null,
    })),
  } : null
  callbacks?.onText(data.response)

  return {
    response: data.response,
    cartUpdated: data.cart_updated === true,
    cartActions: data.cart_actions ?? [],
    hasMore: data.has_more === true,
    products,
    groups: hydrateGroups(data.groups, products),
    productsUnavailable: [...resultIds(data), ...choiceIds].some((id) => unavailableProductIds.has(id)),
    orderIds: data.order_ids ?? [],
    clarification,
    taskPlan: data.task_plan ?? null,
  }
}

// Handles split UTF-8 characters, SSE frame boundaries and terminal failures.
export async function readAiChatEvents(
  stream: ReadableStream<Uint8Array>,
  receive: (event: string, value: any) => void,
) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let doneEvent = false
  try {
    while (true) {
      const { value, done } = await reader.read()
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
      // Normalize only complete CRLF pairs; a trailing CR may belong to the next chunk.
      buffer = buffer.replace(/\r\n/g, '\n')
      let end: number
      while ((end = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, end)
        buffer = buffer.slice(end + 2)
        const lines = frame.split('\n')
        const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim() || 'message'
        const body = lines.filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trimStart()).join('\n')
        if (!body) continue
        receive(event, JSON.parse(body))
        if (event === 'done') doneEvent = true
      }
      if (done) break
    }
    if (!doneEvent) throw new Error('Incomplete AI chat stream')
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
