<template>
    <div class="favourites-panel">
        <div class="favourites-panel__header">
            <h1>{{ t('favourite.title') }}</h1>
            <BaseButton @click="showNewForm = true">
                <BaseIcon name="plus" />
                {{ t('favourite.new_list') }}
            </BaseButton>
        </div>

        <!-- Nowa lista -->
        <div v-if="showNewForm" class="favourites-panel__new-form">
            <BaseInput v-model="newListName" :placeholder="t('favourite.new_list_placeholder')"
                @keyup.enter="createList" @keyup.esc="showNewForm = false" />
            <BaseButton :loading="creating" @click="createList">{{ t('favourite.create_btn') }}</BaseButton>
            <BaseButton variant="secondary" @click="showNewForm = false">{{ t('favourite.cancel_btn') }}</BaseButton>
        </div>

        <!-- Ładowanie -->
        <div v-if="store.loading" class="favourites-panel__loading">
            <BaseIcon name="reset" />
        </div>

        <!-- Pusta lista -->
        <div v-else-if="!store.loading && store.lists.length === 0" class="favourites-panel__empty">
            {{ t('favourite.empty') }}
        </div>

        <!-- Karty list -->
        <div v-else class="favourites-panel__lists">
            <div v-for="list in store.lists" :key="list.id" class="favourite-list-card">
                <!-- Nagłówek listy -->
                <div class="favourite-list-card__header">
                    <template v-if="editingId === list.id">
                        <BaseInput v-model="editName" size="sm" @keyup.enter="saveRename(list.id)"
                            @keyup.esc="editingId = null" />
                        <BaseButton size="sm" @click="saveRename(list.id)">{{ t('favourite.save_btn') }}</BaseButton>
                        <BaseButton size="sm" variant="secondary" @click="editingId = null">{{ t('favourite.cancel_btn')
                            }}</BaseButton>
                    </template>
                    <template v-else>
                        <span class="favourite-list-card__name">{{ list.name }}</span>
                        <div class="d-flex gap-1">
                            <BaseButton size="sm" variant="secondary" @click="startRename(list)">
                                <BaseIcon name="edit" />
                            </BaseButton>
                            <BaseButton size="sm" variant="secondary" @click="deleteList(list.id)">
                                <BaseIcon name="trashCan" />
                            </BaseButton>
                        </div>
                    </template>
                </div>

                <!-- Produkty na liście -->
                <div v-if="list.products.length === 0" class="favourite-list-card__empty">
                    {{ t('favourite.empty_list') }}
                </div>
                <div v-else class="favourite-list-card__products">
                    <div v-for="product in list.products" :key="product.id" class="favourite-product-row">
                        <router-link :to="resolve(product.url)" class="favourite-product-row__image-link">
                            <img v-if="product.image" :src="product.image" :alt="product.name ?? ''"
                                class="favourite-product-row__image" />
                            <div v-else class="favourite-product-row__image-placeholder" />
                        </router-link>

                        <div class="favourite-product-row__info">
                            <router-link :to="resolve(product.url)" class="favourite-product-row__name">
                                {{ product.name }}
                            </router-link>
                            <div class="favourite-product-row__prices">
                                <span v-if="product.net_price">{{ product.net_price }} {{ t('products.details.net')
                                    }}</span>
                                <span v-if="product.gross_price" class="text-muted">{{ product.gross_price }} {{
                                    t('products.details.gross') }}</span>
                            </div>
                        </div>

                        <BaseButton size="sm" variant="secondary" @click="store.removeProduct(list.id, product.id)">
                            <BaseIcon name="remove" />
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFavouriteStore } from '@/core/stores/favouriteStore'
import type { FavouriteList } from '@/core/stores/favouriteStore'
import { useUrlResolver } from '@/composables/useUrlResolver'
import BaseButton from '@shared/ui/BaseButton.vue'
import BaseIcon from '@shared/ui/BaseIcon.vue'
import BaseInput from '@shared/ui/BaseInput.vue'

const { t } = useI18n()
const store = useFavouriteStore()
const { resolve } = useUrlResolver()

const showNewForm = ref(false)
const newListName = ref('')
const creating = ref(false)
const editingId = ref<number | null>(null)
const editName = ref('')

onMounted(() => store.fetchFavourites())

async function createList() {
    const name = newListName.value.trim()
    if (!name) return
    creating.value = true
    try {
        await store.createList(name)
        newListName.value = ''
        showNewForm.value = false
    } finally {
        creating.value = false
    }
}

function startRename(list: FavouriteList) {
    editingId.value = list.id
    editName.value = list.name
}

async function saveRename(listId: number) {
    const name = editName.value.trim()
    if (name) await store.renameList(listId, name)
    editingId.value = null
}

async function deleteList(listId: number) {
    await store.deleteList(listId)
}
</script>

<style scoped>
.favourites-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.favourites-panel__new-form {
    display: flex;
    gap: .5rem;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.favourites-panel__loading,
.favourites-panel__empty {
    padding: 1rem;
    color: #888;
}

.favourites-panel__lists {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.favourite-list-card {
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
}

.favourite-list-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .5rem;
    padding: .75rem 1rem;
    background: #f9f9f9;
    border-bottom: 1px solid #eee;
}

.favourite-list-card__name {
    font-weight: 600;
}

.favourite-list-card__empty {
    padding: .75rem 1rem;
    font-size: .85rem;
    color: #999;
}

.favourite-list-card__products {
    display: flex;
    flex-direction: column;
}

.favourite-product-row {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: .5rem 1rem;
    border-bottom: 1px solid #f0f0f0;
}

.favourite-product-row:last-child {
    border-bottom: none;
}

.favourite-product-row__image-link {
    flex-shrink: 0;
}

.favourite-product-row__image,
.favourite-product-row__image-placeholder {
    width: 56px;
    height: 56px;
    object-fit: contain;
    border-radius: 4px;
    background: #f5f5f5;
}

.favourite-product-row__info {
    flex: 1;
    min-width: 0;
}

.favourite-product-row__name {
    display: block;
    font-size: .9rem;
    font-weight: 500;
    color: inherit;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.favourite-product-row__name:hover {
    text-decoration: underline;
    color: var(--accent);
}

.favourite-product-row__prices {
    display: flex;
    gap: .5rem;
    font-size: .8rem;
    margin-top: 2px;
}

.text-muted {
    color: #999;
}
</style>