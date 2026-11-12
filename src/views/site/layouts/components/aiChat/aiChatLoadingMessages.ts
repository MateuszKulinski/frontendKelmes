import type { Locale } from '@/core/i18n/types'

const loadingMessages: Record<Locale, readonly [string, ...string[]]> = {
  pl: [
    'Analizowanie rozmowy...',
    'Przeszukiwanie katalogu...',
    'Dopasowywanie produktów...',
    'Formatowanie tekstu...',
    'Przygotowywanie odpowiedzi...',
  ],
  en: [
    'Analyzing the conversation...',
    'Searching the catalog...',
    'Matching products',
    'Formatting text...',
    'Preparing the response...',
  ],
  de: [
    'Gespräch analysieren...',
    'Katalog durchsuchen...',
    'Passende Produkte finden...',
    'Text formatieren...',
    'Antwort vorbereiten...',
  ],
}

export function getAiChatLoadingMessages(locale: string): readonly [string, ...string[]] {
  const language = locale.toLowerCase().split(/[-_]/)[0]
  return language === 'pl' || language === 'de' ? loadingMessages[language] : loadingMessages.en
}
