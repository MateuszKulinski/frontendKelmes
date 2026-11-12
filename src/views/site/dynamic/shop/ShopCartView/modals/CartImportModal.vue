<template>
    <div ref="dialog" class="cart-import-dialog" role="dialog" aria-modal="true" tabindex="-1"
        aria-labelledby="cart-import-title" aria-describedby="cart-import-description" :aria-busy="saving"
        @keydown.tab="keepFocus">
        <BaseIcon :name="!result ? 'info' : result.imported_count > 0 ? 'check' : 'warning'"
            class="cart-import-dialog__symbol" :class="{
            'cart-import-dialog__symbol--success': result && result.imported_count > 0,
            'cart-import-dialog__symbol--warning': result && result.imported_count === 0,
        }" aria-hidden="true" />

        <h2 id="cart-import-title" class="cart-import-dialog__title">
            {{ t(result ? 'cart.import_result_title' : 'cart.import_mode_title') }}
        </h2>

        <template v-if="!result">
            <p id="cart-import-description" class="cart-import-dialog__description">
                {{ t('cart.import_mode_description') }}
            </p>
            <p class="cart-import-dialog__muted text-break mb-0">{{ file.name }}</p>
            <p v-if="errorMessage" class="cart-import-dialog__error cart-import-dialog__notice" role="alert">{{ errorMessage }}</p>
            <p v-if="saving" class="cart-import-dialog__muted cart-import-dialog__notice" role="status">{{ t('cart.import_processing') }}</p>

            <div class="cart-import-dialog__actions">
                <BaseButton variant="secondary" size="sm" type="button"
                    :disabled="saving" @click="modal.closeModal()">
                    {{ t('cart.import_cancel') }}
                </BaseButton>
                <BaseButton variant="primary" size="sm" type="button" :disabled="saving || cartStore.loading"
                    @click="importProducts('append')">
                    {{ t('cart.import_append') }}
                </BaseButton>
                <BaseButton variant="primary" size="sm" type="button" :disabled="saving || cartStore.loading"
                    :title="t('cart.import_replace_hint')" @click="importProducts('replace')">
                    {{ t('cart.import_replace') }}
                </BaseButton>
            </div>
            <BaseButton class="cart-import-dialog__secondary-action" variant="secondary" size="sm" type="button" :disabled="saving || cartStore.loading"
                :title="t('cart.import_new_hint')" @click="importProducts('new')">
                {{ t('cart.import_new') }}
            </BaseButton>
        </template>

        <template v-else>
            <p id="cart-import-description" class="cart-import-dialog__description" role="status">
                {{ t('cart.import_result_count', { imported: result.imported_count, total: result.total_count }) }}
            </p>
            <p v-if="result.imported_count === 0" class="cart-import-dialog__muted">{{ t('cart.import_no_changes') }}</p>
            <template v-if="result.skipped_count > 0">
                <p class="cart-import-dialog__muted">{{ t('cart.import_skipped') }}</p>
                <ul class="cart-import-dialog__skipped list-unstyled mb-0">
                    <li v-for="item in result.skipped_items" :key="item.catalog_number" class="text-break">
                        <strong>{{ item.catalog_number }}</strong>
                        <span class="d-block cart-import-dialog__muted">{{ t(`cart.import_reasons.${item.reason}`) }}</span>
                    </li>
                </ul>
            </template>
            <p v-else class="cart-import-dialog__muted mb-0">{{ t('cart.import_all_success') }}</p>
            <BaseButton variant="primary" size="sm" type="button" class="cart-import-dialog__submit" @click="modal.closeModal()">
                {{ t('cart.import_ok') }}
            </BaseButton>
        </template>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { isAxiosError } from 'axios'
import { useI18n } from 'vue-i18n'
import { useCartStore, type CartImportMode, type CartImportResult } from '@/core/stores/cartStore'
import { useModalStore } from '@/core/stores/modalStore'
import BaseButton from '@/views/shared/ui/BaseButton.vue'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'

const props = defineProps<{ file: File }>()
const { t } = useI18n()
const cartStore = useCartStore()
const modal = useModalStore()
const saving = ref(false)
const result = ref<CartImportResult | null>(null)
const errorMessage = ref('')
const dialog = ref<HTMLElement | null>(null)

onMounted(() => dialog.value?.focus())

function keepFocus(event: KeyboardEvent) {
    const buttons = dialog.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
    if (!buttons?.length) {
        event.preventDefault()
        return
    }
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (document.activeElement === dialog.value || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault()
        const target = event.shiftKey ? last : first
        target?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
    }
}

async function importProducts(mode: CartImportMode) {
    if (saving.value || cartStore.loading || result.value) return
    saving.value = true
    errorMessage.value = ''
    modal.lock()
    try {
        result.value = await cartStore.importFile(props.file, mode)
        await nextTick()
        dialog.value?.focus()
    } catch (error) {
        const data = isAxiosError(error) ? error.response?.data : null
        errorMessage.value = t(data?.errors?.file?.[0] ?? data?.errors?.mode?.[0] ?? data?.message ?? 'cart.import_error')
    } finally {
        modal.unlock()
        saving.value = false
    }
}
</script>

<style scoped>
.cart-import-dialog {
    padding: var(--padding-xl);
    color: var(--text-primary);
    font-size: var(--font-size-sm-plus);
    text-align: center;
    outline: none;
}
.cart-import-dialog__symbol {
    margin-bottom: var(--margin-xl);
    color: var(--text-muted);
    font-size: calc(var(--font-size-extra-plus) * 2);
}
.cart-import-dialog__symbol--success { color: var(--success); }
.cart-import-dialog__symbol--warning { color: var(--warning); }
.cart-import-dialog__title { margin: 0; font-size: var(--font-size-lg-plus); font-weight: 500; }
.cart-import-dialog__description { margin: var(--margin-md) 0; color: var(--text-secondary); }
.cart-import-dialog__muted { margin-bottom: var(--margin-sm); color: var(--text-secondary); }
.cart-import-dialog__error { color: var(--error); }
.cart-import-dialog__notice { margin: var(--margin-lg) 0 0; }
.cart-import-dialog__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--gap-sm);
    margin-top: var(--margin-xl);
}
.cart-import-dialog__secondary-action { margin-top: var(--margin-lg); }
.cart-import-dialog__submit { margin-top: var(--margin-xl); }
.cart-import-dialog__skipped { max-height: 30vh; overflow-y: auto; font-size: var(--font-size-sm); }
.cart-import-dialog__skipped li { margin-bottom: var(--margin-sm); }
</style>
