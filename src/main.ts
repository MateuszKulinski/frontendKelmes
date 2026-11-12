import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { i18n } from '@/core/i18n'
import { useLangStore } from '@/core/stores/langStore'
import { useCurrencyStore } from './core/stores/currencyStore'
import { useAuthStore } from '@/core/stores/authStore'
import api from '@/core/api/axios'

import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'flag-icons/css/flag-icons.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@/assets/fonts/Fonts.css'

async function bootstrap() {
    const app = createApp(App)
    const pinia = createPinia()

    app.use(pinia)
    app.use(router)
    app.use(i18n)

    // LANG INIT
    const langStore = useLangStore()

    try {
        await langStore.fetchLangs()
    } catch (e) {
        console.warn('Lang init failed')
    }

    const currencyStore = useCurrencyStore();
    try {
        await currencyStore.fetchCurrencies();
    } catch (e) {
        console.warn("Currency init failed");
    }

    i18n.global.locale.value = langStore.current
    document.documentElement.lang = langStore.current

    // AUTH INIT
    const auth = useAuthStore()
    const token = localStorage.getItem('token')

    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        try {
            await auth.fetchMe()
        } catch (e) {
            console.warn('Auth failed, removing token')
            localStorage.removeItem('token')
        }
    }

    app.mount('#app')

    // HEARTBEAT
    setInterval(() => {
        const token = localStorage.getItem('token')
        if (token) {
            api.post('/heartbeat').catch(() => { })
        }
    }, 60000)
}

bootstrap()