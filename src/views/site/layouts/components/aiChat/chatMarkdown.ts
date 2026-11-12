// Render the small Markdown subset used in chat. Escape model text before adding tags.
const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character] ?? character)

function inline(value: string): string {
  return escapeHtml(value)
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
}

export function renderChatMarkdown(value: string): string {
  const lines = value.replace(/\r\n?/g, '\n').split('\n')
  const output: string[] = []
  let paragraph: string[] = []
  let list: 'ul' | 'ol' | null = null

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${paragraph.map(inline).join('<br>')}</p>`)
    paragraph = []
  }
  const closeList = () => {
    if (list) output.push(`</${list}>`)
    list = null
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      flushParagraph()
      closeList()
      continue
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed)
    if (heading) {
      flushParagraph()
      closeList()
      const level = Math.min(heading[1].length + 2, 5)
      output.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      continue
    }
    const bullet = /^[-*]\s+(.+)$/.exec(trimmed)
    const numbered = /^\d+[.)]\s+(.+)$/.exec(trimmed)
    if (bullet || numbered) {
      flushParagraph()
      const kind = bullet ? 'ul' : 'ol'
      if (list !== kind) {
        closeList()
        output.push(`<${kind}>`)
        list = kind
      }
      output.push(`<li>${inline((bullet || numbered)![1])}</li>`)
      continue
    }
    closeList()
    paragraph.push(trimmed)
  }
  flushParagraph()
  closeList()
  return output.join('')
}
