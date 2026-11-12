<template>
	<div class="price-type-switch d-flex align-items-center">
		<span v-if="isNet">
			{{ t('products.details.price_net') }}
		</span>
		<span v-if="isGross">
			{{ t('products.details.price_gross') }}
		</span>
		<button class="price-switch" type="button" role="switch" :aria-checked="isNet" @click="toggle"
			:class="{ net: isNet, gross: isGross }">
			<span class="switch-label" :class="{ active: isNet }"></span>
			<span class="switch-label" :class="{ active: isGross }"></span>
			<span class="switch-thumb" :class="{ 'is-net': isNet }" />
		</button>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { usePriceTypeSwitch } from './PriceTypeSwitch'

const { t } = useI18n()
const { isNet, isGross, select } = usePriceTypeSwitch()

const toggle = () => select(isNet.value ? 'gross' : 'net')
</script>

<style scoped>
.price-type-switch {
	font-size: var(--font-size-md-minus);
	gap: var(--gap-sm);
}

.price-switch {
	position: relative;
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: center;
	gap: 0;
	border: 1px solid var(--border-light);
	border-radius: 999px;
	background: #f5f6f8;
	cursor: pointer;
}

.price-switch.net {
	border-color: var(--accent);
	background: var(--accent);
}

.price-switch:focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 2px;
}

.switch-label {
	position: relative;
	z-index: 2;
	text-align: center;
	user-select: none;
	padding: 10px;
}

.switch-label.active {
	color: #fff;
}

.switch-thumb {
	position: absolute;
	top: 3px;
	left: 3px;
	height: calc(100% - 6px);
	width: calc(50% - 3px);
	border-radius: 999px;
	background: #fff;
	transition: transform .22s ease;
	will-change: transform;
}

.switch-thumb.is-net {
	transform: translateX(100%);
}
</style>
