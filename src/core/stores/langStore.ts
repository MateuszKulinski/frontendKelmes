import { defineStore } from 'pinia'
import api from '@/core/api/axios'
import type { Locale } from '@/core/i18n/types'
import { i18n } from '@/core/i18n'

interface Lang {
  id: number
  code: Locale
  name: string
  locale: string
  is_default: boolean
}

const savedLang = localStorage.getItem('lang')
const hasUserSelectedLang = localStorage.getItem('lang_selected') === 'true'

export const useLangStore = defineStore('lang', {
  state: () => ({
    langs: [] as Lang[],
    current: ((hasUserSelectedLang ? savedLang : null) as Locale | null) ?? 'pl',
  }),

  getters: {
    currentLang(state) {
      return state.langs.find(l => l.code === state.current)
    }
  },

  actions: {
    async fetchLangs() {
      try {
        const res = await api.get('/langs')
        this.langs = res.data
      } catch (e) {
        console.warn('Langs API failed')

        // fallback na current
        i18n.global.locale.value = this.current
        return
      }

      if (hasUserSelectedLang && savedLang) {
        const lang = this.langs.find(l => l.code === savedLang)
        if (lang) {
          this.current = lang.code

          // 🔥 sync i18n
          i18n.global.locale.value = lang.code
          document.documentElement.lang = lang.code

          localStorage.setItem('lang_id', String(lang.id))
          return
        }
      }

      const def = this.langs.find(l => l.is_default)
        ?? this.langs.find(l => l.code === 'pl')
      if (def) {
        this.setLang(def.code, false)
      }
    },

    setLang(code: Locale, userSelected = true) {
      const lang = this.langs.find(l => l.code === code)
      if (!lang) return

      this.current = code

      i18n.global.locale.value = code
      document.documentElement.lang = code

      localStorage.setItem('lang', code)
      localStorage.setItem('lang_id', String(lang.id))

      if (userSelected) {
        localStorage.setItem('lang_selected', 'true')
      }
    }
  }
})