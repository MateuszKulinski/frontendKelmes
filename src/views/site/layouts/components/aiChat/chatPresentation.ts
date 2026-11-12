import type { AiChatClarification, AiChatProduct, AiChatProductGroup } from './aiChatApi'

const normalize = (text: string) => text.replace(/[*_`#]/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase()

// Keep the original reply in state. Only remove content already represented by
// the active question and its controls, never unrelated facts or confirmations.
export function assistantMessage(text: string, question?: AiChatClarification | null): string {
  const prompt = normalize(question?.prompt ?? '')
  const promptSuffix = question?.prompt.trim()
    ? new RegExp(`\\s*${question.prompt.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'u') : null
  const options = new Set((question?.options ?? []).map(option => normalize(option.label)))
  let previous = ''
  return text.replace(/\r\n?/g, '\n').split('\n').map(line => {
    // The model may append the same question to an otherwise useful sentence.
    return promptSuffix ? line.replace(promptSuffix, '') : line
  }).filter(line => {
    const value = normalize(line)
    if (!value) return true
    if (prompt && value === prompt) return false
    const option = /^\s*(?:[-*]|\d+[.)])\s+(.+)$/.exec(line)
    if (option && options.has(normalize(option[1]))) return false
    if (value === previous) return false
    previous = value
    return true
  }).join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export function messagePreview(text: string): string {
  if (text.length <= 420) return text
  const paragraph = text.indexOf('\n\n')
  if (paragraph > 0 && paragraph <= 360) return text.slice(0, paragraph)
  const sentence = [...text.slice(0, 360).matchAll(/[.!?](?=\s|$)/g)].at(-1)
  if (sentence?.index !== undefined && sentence.index > 80) return text.slice(0, sentence.index + 1)
  const boundary = text.lastIndexOf(' ', 320)
  return `${text.slice(0, boundary > 0 ? boundary : 320).trimEnd()}…`
}

export function productGroups(
  products: AiChatProduct[] = [], groups: AiChatProductGroup[] = [],
  fallbackLabel: string, excludedIds: Set<number> = new Set(), hasMore = false,
): AiChatProductGroup[] {
  const unique = (rows: AiChatProduct[]) => [...new Map(rows
    .filter(product => !excludedIds.has(product.id)).map(product => [product.id, product])).values()]
  const result = groups.flatMap(group => {
    const rows = unique(group.products)
    return rows.length || !group.products.length ? [{ ...group, products: rows }] : []
  })
  const groupedIds = new Set(groups.flatMap(group => group.products.map(product => product.id)))
  const remaining = unique(products).filter(product => !groupedIds.has(product.id))
  if (remaining.length) result.push({ id: '__other_products', query: fallbackLabel,
    products: remaining, status: 'ok', hasMore: groups.length ? false : hasMore })
  return result
}
