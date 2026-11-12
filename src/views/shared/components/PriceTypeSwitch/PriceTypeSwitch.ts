import { computed } from 'vue'
import { usePriceTypeStore, type PriceType } from '@/core/stores/priceTypeStore'

export function usePriceTypeSwitch() {
	const priceTypeStore = usePriceTypeStore()

	const current = computed(() => priceTypeStore.current)
	const isNet = computed(() => priceTypeStore.isNet)
	const isGross = computed(() => priceTypeStore.isGross)

	const select = (type: PriceType) => {
		priceTypeStore.setPriceType(type)
	}

	return {
		current,
		isNet,
		isGross,
		select,
	}
}
