<template>
  <div class="ai-chat-task-question">
    <AiChatProductCarousel v-if="productOptions.length" :item-count="productOptions.length" :label="question.prompt">
      <template #slides>
      <div v-for="option in productOptions" :key="option.id" class="swiper-slide" :data-option-id="option.id"
        :data-product-id="option.product_id">
      <button type="button" class="ai-chat-product-choice"
        :class="{ selected: selectedOptionId === option.id }" :disabled="disabled"
        :aria-pressed="selectedOptionId === option.id" :aria-label="`${choiceLabel(option)}: ${choiceName(option)}`"
        @click="select(option)">
        <span class="ai-chat-choice-image">
          <ProductImage :src="option.product?.image" :alt="choiceName(option)" type="small" />
        </span>
        <strong>{{ choiceName(option) }}</strong>
        <small v-if="option.product?.catalog_number">{{ labels.catalog }}: {{ option.product.catalog_number }}</small>
        <small v-else-if="option.product?.indeks">{{ labels.index }}: {{ option.product.indeks }}</small>
        <small v-else>{{ labels.productId }}: {{ option.product_id }}</small>
        <span v-if="priceBasis === 'gross' && option.product?.gross_price" class="ai-chat-choice-price">
          {{ option.product.gross_price }} <small>{{ labels.gross }}</small>
        </span>
        <span v-else-if="priceBasis === 'net' && option.product?.net_price" class="ai-chat-choice-price">
          {{ option.product.net_price }} <small>{{ labels.net }}</small>
        </span>
        <small v-if="option.availability_description">{{ option.availability_description }}</small>
        <span class="ai-chat-choice-confirm">{{ selectedOptionId === option.id ? labels.selected : choiceLabel(option) }}</span>
      </button>
      </div>
      </template>
    </AiChatProductCarousel>
    <div v-if="textOptions.length" class="ai-chat-choices" role="group" :aria-label="question.prompt">
      <button v-for="option in textOptions" :key="option.id" type="button" class="ai-chat-choice"
        :disabled="disabled" @click="select(option)">{{ option.label }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProductImage from '@/views/site/components/products/ProductImage.vue'
import AiChatProductCarousel from './AiChatProductCarousel.vue'
import type { AiChatClarification, AiChatClarificationOption } from './aiChatApi'

const props = withDefaults(defineProps<{ question: AiChatClarification; disabled: boolean;
  selectedOptionId?: string; priceBasis?: 'net' | 'gross' }>(), { priceBasis: 'net' })
const emit = defineEmits<{ select: [option: { id: string; label: string }] }>()
const { locale } = useI18n()
const productOptions = computed(() => props.question.options.filter((option) =>
  Number.isSafeInteger(option.product_id) && option.product_id! > 0))
const textOptions = computed(() => props.question.options.filter((option) => !productOptions.value.includes(option)))
const labels = computed(() => locale.value.toLowerCase().startsWith('pl') ? {
  choose: 'Chodzi mi o ten produkt', selected: 'Wybrano ten produkt', catalog: 'Nr katalogowy',
  index: 'Indeks', productId: 'ID produktu', net: 'netto', gross: 'brutto',
  fallbackProduct: 'Produkt', chooseQuantity: 'Wybierz ilość', units: 'szt.', availability: 'Sprawdź dostępność',
} : locale.value.toLowerCase().startsWith('de') ? {
  choose: 'Produkt auswählen', selected: 'Produkt ausgewählt', catalog: 'Katalognummer',
  index: 'Artikelindex', productId: 'Produkt-ID', net: 'netto', gross: 'brutto',
  fallbackProduct: 'Produkt', chooseQuantity: 'Menge wählen', units: 'Stk.', availability: 'Verfügbarkeit prüfen',
} : {
  choose: 'Choose this product', selected: 'Selected product', catalog: 'Catalog no.',
  index: 'Index', productId: 'Product ID', net: 'net', gross: 'gross',
  fallbackProduct: 'Product', chooseQuantity: 'Choose quantity', units: 'pcs.', availability: 'Check availability',
})

function choiceName(option: AiChatClarificationOption) {
  return option.product?.name || `${labels.value.fallbackProduct} ${option.product_id}`
}
function choiceLabel(option: AiChatClarificationOption) {
  if (option.read_availability) return labels.value.availability
  return option.quantity ? `${labels.value.chooseQuantity}: ${option.quantity} ${labels.value.units}` : labels.value.choose
}
function select(option: AiChatClarificationOption) {
  if (!props.disabled) emit('select', option.product_id ? {
    id: option.id, label: `${choiceName(option)}${option.quantity ? ` — ${option.quantity} ${labels.value.units}` : ''}`,
  } : option)
}
</script>

<style scoped>
.ai-chat-task-question {
  width: 100%;
  min-width: 0;
}

.ai-chat-task-question > .ai-chat-choices {
  margin-top: 10px;
}

.ai-chat-product-choice {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  height: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 12px;
  text-align: left;
  color: var(--text-primary);
  font: inherit;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  background: var(--bg-surface);
  cursor: pointer;
  overflow-wrap: anywhere;
  transition: border-color .18s ease, box-shadow .18s ease;
}

.ai-chat-product-choice:hover:not(:disabled) {
  border-color: var(--accent);
  box-shadow: 0 3px 10px var(--accent-muted);
}

.ai-chat-product-choice:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -3px;
}

.ai-chat-product-choice:disabled {
  cursor: default;
  opacity: .65;
}

.ai-chat-product-choice.selected {
  border-color: var(--success);
  opacity: 1;
}

.ai-chat-choice-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 100%;
  padding: 6px;
  background: #fff;
  border-radius: 8px;
}

.ai-chat-choice-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ai-chat-product-choice strong {
  margin: 2px 0 0;
  font-size: 13px;
  line-height: 1.45;
}

.ai-chat-product-choice small {
  font-size: 11px;
  color: var(--text-secondary);
}

.ai-chat-choice-price {
  font-weight: 700;
  font-size: 14px;
}

.ai-chat-choice-price small {
  font-weight: 400;
}

.ai-chat-choice-confirm {
  margin-top: auto;
  padding-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}

.selected .ai-chat-choice-confirm {
  color: var(--success);
}

@media (prefers-reduced-motion: reduce) {
  .ai-chat-product-choice {
    transition: none;
  }
}
</style>
