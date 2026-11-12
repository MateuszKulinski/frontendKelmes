<template>
    <section class="cart-file-tools" :aria-label="t('cart.file_tools')">
        <div class="cart-file-tools__heading">
            <span class="cart-file-tools__icon" aria-hidden="true"><BaseIcon name="doc" /></span>
            <div>
                <h2>{{ t('cart.file_tools') }}</h2>
                <p>{{ t('cart.import_schema') }}</p>
            </div>
        </div>

        <div class="cart-file-tools__actions">
            <div class="cart-file-tools__group">
                <span class="cart-file-tools__group-label">{{ t('cart.import_group') }}</span>
                <BaseButton variant="secondary" size="lg" class="shop cart-file-tools__import-button"
                    type="button" :disabled="cartStore.loading" @click="openFilePicker">
                    <BaseIcon name="upload" />
                    <span>{{ t('cart.import_file') }}</span>
                </BaseButton>
                <input ref="fileInput" class="cart-file-tools__file-input" type="file"
                    accept=".csv,.xml,text/csv,application/xml,text/xml"
                    :disabled="cartStore.loading" @change="onImportFile" />
            </div>

            <div class="cart-file-tools__group">
                <span class="cart-file-tools__group-label">{{ t('cart.template_group') }}</span>
                <div class="cart-file-tools__button-row">
                    <BaseButton variant="secondary" size="sm" class="cart-file-tools__format-button"
                        type="button" :aria-label="t('cart.download_template')"
                        :disabled="cartStore.loading" @click="download('csv', true)">
                        <BaseIcon name="download" />
                        CSV
                    </BaseButton>
                    <BaseButton variant="secondary" size="sm" class="cart-file-tools__format-button"
                        type="button" :aria-label="t('cart.download_template_xml')"
                        :disabled="cartStore.loading" @click="download('xml', true)">
                        <BaseIcon name="download" />
                        XML
                    </BaseButton>
                </div>
            </div>

            <div class="cart-file-tools__group">
                <span class="cart-file-tools__group-label">{{ t('cart.export_group') }}</span>
                <div class="cart-file-tools__button-row">
                    <BaseButton variant="secondary" size="sm" class="cart-file-tools__format-button"
                        type="button" :aria-label="t('cart.export_csv')"
                        :disabled="cartStore.isEmpty || cartStore.loading" @click="download('csv')">
                        <BaseIcon name="download" />
                        CSV
                    </BaseButton>
                    <BaseButton variant="secondary" size="sm" class="cart-file-tools__format-button"
                        type="button" :aria-label="t('cart.export_xml')"
                        :disabled="cartStore.isEmpty || cartStore.loading" @click="download('xml')">
                        <BaseIcon name="download" />
                        XML
                    </BaseButton>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { markRaw, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/core/stores/cartStore'
import { useUiStore } from '@/core/stores/uiStore'
import { useModalStore } from '@/core/stores/modalStore'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import BaseButton from '@/views/shared/ui/BaseButton.vue'
import CartImportModal from './modals/CartImportModal.vue'

const { t } = useI18n()
const cartStore = useCartStore()
const ui = useUiStore()
const modal = useModalStore()
const fileInput = ref<HTMLInputElement | null>(null)

function openFilePicker() {
    fileInput.value?.click()
}

function onImportFile(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    modal.openModal(markRaw(CartImportModal), {
        file,
    })
    input.value = ''
}

async function download(format: 'csv' | 'xml', template = false) {
    try {
        await cartStore.downloadCartFile(format, template)
    } catch {
        ui.showError(t('cart.download_error'))
    }
}
</script>

<style scoped>
.cart-file-tools {
  display: grid;
  gap: var(--gap-lg);
  margin: var(--margin-xl) 0;
  padding: var(--padding-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  text-align: left;
}
.cart-file-tools__heading { display: flex; align-items: center; gap: var(--gap-md); }
.cart-file-tools__heading h2 { margin: 0 0 var(--margin-sm); font-size: var(--font-size-lg); font-weight: 700; }
.cart-file-tools__heading p { margin: 0; color: var(--text-secondary); font-size: var(--font-size-sm-plus); }
.cart-file-tools__icon {
  display: grid;
  flex: 0 0 calc(var(--padding-lg) * 2);
  place-items: center;
  height: calc(var(--padding-lg) * 2);
  border-radius: 50%;
  background: var(--accent-muted);
  color: var(--accent);
}
.cart-file-tools__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--gap-lg);
}
.cart-file-tools__group { display: grid; align-content: start; gap: var(--gap-sm); min-width: 0; }
.cart-file-tools__group-label { color: var(--text-secondary); font-size: var(--font-size-sm-plus); font-weight: 600; }
.cart-file-tools__button-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-sm);
}
.cart-file-tools__import-button {
  width: 100%;
}
.cart-file-tools__format-button {
  flex: 1 1 0;
}
.cart-file-tools__file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 820px) {
  .cart-file-tools__actions { grid-template-columns: 1fr; gap: var(--gap-md); }
  .cart-file-tools__button-row { max-width: 420px; }
}
@media (max-width: 480px) {
  .cart-file-tools { padding: var(--padding-md); }
  .cart-file-tools__button-row { max-width: none; }
}
</style>
