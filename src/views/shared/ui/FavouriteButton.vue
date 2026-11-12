<template>
    <div class="favourite-btn-wrapper" ref="wrapperRef">
        <button
            class="favourite-btn"
            :class="{ 'favourite-btn--active': isFav }"
            :title="t('favourite.add_to_list')"
            @click.prevent.stop="toggle"
        >
            <BaseIcon :name="isFav ? 'heart' : 'heartOutline'" />
            <span v-if="label">{{ label }}</span>
        </button>

        <div v-if="open" class="favourite-dropdown">
            <p class="favourite-dropdown__title">{{ t('favourite.add_to_list') }}</p>

            <div
                v-for="list in store.lists"
                :key="list.id"
                class="favourite-dropdown__item"
                :class="{ 'favourite-dropdown__item--checked': list.product_ids.includes(productId) }"
                @click="toggleProduct(list)"
            >
                <BaseIcon :name="list.product_ids.includes(productId) ? 'heart' : 'heartOutline'" />
                {{ list.name }}
            </div>

            <div v-if="store.lists.length === 0" class="favourite-dropdown__empty">
                {{ t('favourite.empty') }}
            </div>

            <hr class="favourite-dropdown__divider" />

            <div v-if="!showNewForm" class="favourite-dropdown__new" @click="showNewForm = true">
                <BaseIcon name="plus" />
                {{ t('favourite.new_list') }}
            </div>

            <div v-else class="favourite-dropdown__create">
                <BaseInput
                    v-model="newListName"
                    :placeholder="t('favourite.new_list_placeholder')"
                    size="sm"
                    @keyup.enter="createList"
                    @keyup.esc="showNewForm = false"
                />
                <div class="d-flex gap-1 mt-1">
                    <BaseButton size="sm" @click="createList" :loading="creating">
                        {{ t('favourite.create_btn') }}
                    </BaseButton>
                    <BaseButton size="sm" variant="secondary" @click="showNewForm = false">
                        {{ t('favourite.cancel_btn') }}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFavouriteStore } from '@/core/stores/favouriteStore'
import { useAuthStore } from '@/core/stores/authStore'
import BaseIcon from '@shared/ui/BaseIcon.vue'
import BaseButton from '@shared/ui/BaseButton.vue'
import BaseInput from '@shared/ui/BaseInput.vue'
import type { FavouriteList } from '@/core/stores/favouriteStore'

const props = defineProps<{ productId: number; label?: string }>()

const { t } = useI18n()
const store = useFavouriteStore()
const auth = useAuthStore()

const open = ref(false)
const showNewForm = ref(false)
const newListName = ref('')
const creating = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const isFav = computed(() => store.isProductFavourite(props.productId))

async function toggle() {
    if (!auth.isLogged) return

    if (!store.initialized) {
        await store.fetchFavourites()
    }
    open.value = !open.value
    if (!open.value) showNewForm.value = false
}

async function toggleProduct(list: FavouriteList) {
    if (list.product_ids.includes(props.productId)) {
        await store.removeProduct(list.id, props.productId)
    } else {
        await store.addProduct(list.id, props.productId)
    }
}

async function createList() {
    const name = newListName.value.trim()
    if (!name) return
    creating.value = true
    try {
        const list = await store.createList(name)
        await store.addProduct(list.id, props.productId)
        newListName.value = ''
        showNewForm.value = false
    } finally {
        creating.value = false
    }
}

function onClickOutside(e: MouseEvent) {
    const target = e.target as Node
    // Jeśli kliknięty element został już usunięty z DOM (np. przez v-if), ignorujemy
    if (!document.contains(target)) return
    if (wrapperRef.value && !wrapperRef.value.contains(target)) {
        open.value = false
        showNewForm.value = false
    }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.favourite-btn-wrapper {
    position: relative;
    display: inline-block;
}

.favourite-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted, #aaa);
    font-size: 23px;
    transition: color 0.15s;
}

.favourite-btn:hover,
.favourite-btn--active {
    color: var(--accent, #e63946);
}

.favourite-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    z-index: 200;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    min-width: 200px;
    padding: 8px 0;
    box-shadow: 0 4px 12px rgba(0,0,0,.12);
}

.favourite-dropdown__title {
    font-size: .75rem;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    padding: 0 12px 4px;
    margin: 0;
}

.favourite-dropdown__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: .9rem;
    transition: background .1s;
}

.favourite-dropdown__item:hover {
    background: #f5f5f5;
}

.favourite-dropdown__item--checked {
    color: var(--accent, #e63946);
}

.favourite-dropdown__empty {
    padding: 6px 12px;
    font-size: .85rem;
    color: #999;
}

.favourite-dropdown__divider {
    margin: 6px 0;
    border-color: #eee;
}

.favourite-dropdown__new {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: .9rem;
    color: var(--accent, #e63946);
}

.favourite-dropdown__new:hover {
    background: #f5f5f5;
}

.favourite-dropdown__create {
    padding: 4px 12px 6px;
}
</style>
