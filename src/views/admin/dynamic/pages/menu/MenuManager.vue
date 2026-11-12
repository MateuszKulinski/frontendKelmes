<template>
  <div class="menu-manager">
    <header class="manager-header">
      <div>
        <h1>{{ t('menu.manage') }}</h1>
        <p>{{ t('menu.manageHint') }}</p>
      </div>
      <button class="manager-primary" type="button" @click="startCreate">{{ t('menu.addItem') }}</button>
    </header>

    <div class="manager-tabs" role="tablist" :aria-label="t('menu.manage')">
      <button v-for="tab in tabs" :key="tab.key" type="button" role="tab"
        :aria-selected="section === tab.key" :class="{ selected: section === tab.key }"
        @click="selectSection(tab.key)">{{ tab.label }}</button>
    </div>

    <p v-if="loading" class="manager-state">{{ t('common.loading') }}</p>
    <p v-else-if="loadError" class="manager-error" role="alert">{{ loadError }}</p>
    <div v-else class="manager-layout" :class="{ 'has-form': editing }">
      <section class="manager-card">
        <div class="card-heading">
          <h2>{{ currentSectionLabel }}</h2>
          <span>{{ sectionItems.length }} {{ t('menu.items') }}</span>
        </div>
        <p v-if="!sectionItems.length" class="manager-state">{{ t('menu.empty') }}</p>
        <ul v-else class="item-list">
          <li v-for="item in sectionItems" :key="item.id" class="item-row"
            :class="`depth-${Math.min(item.depth, 5)}`">
            <div class="item-info">
              <strong>{{ item.langs.find(lang => lang.lang_id === activeLangId)?.name || item.langs[0]?.name || '—' }}</strong>
              <span>{{ typeLabel(item.type) }} · #{{ item.id }} · {{ t('menu.position') }} {{ item.position }}</span>
            </div>
            <span class="item-status" :class="{ inactive: !item.is_active }">
              {{ item.is_active ? t('common.active') : t('common.inactive') }}
            </span>
            <div class="item-actions">
              <button type="button" @click="startEdit(item)">{{ t('common.edit') }}</button>
              <button type="button" class="danger" @click="remove(item)">{{ t('common.delete') }}</button>
            </div>
          </li>
        </ul>
      </section>

      <section v-if="editing" class="manager-card editor-card">
        <div class="card-heading">
          <h2>{{ editingId ? t('menu.editItem') : t('menu.addItem') }}</h2>
          <button class="close-editor" type="button" :aria-label="t('common.close')" @click="editing = false">×</button>
        </div>
        <form @submit.prevent="save">
          <label>{{ t('menu.location') }}
            <select v-model="form.location" required @change="form.parent_id = null">
              <option v-for="tab in tabs" :key="tab.key" :value="tab.key">{{ tab.label }}</option>
            </select>
          </label>
          <label>{{ t('menu.type') }}
            <select v-model="form.type" required>
              <option v-for="type in types" :key="type" :value="type">{{ typeLabel(type) }}</option>
            </select>
          </label>
          <label v-if="form.type === 'category'">{{ t('menu.category') }}
            <select v-model.number="form.category_id" required>
              <option :value="null">—</option>
              <option v-for="option in options.categories" :key="option.id" :value="option.id">{{ option.name }}</option>
            </select>
          </label>
          <label v-if="form.type === 'cms'">{{ t('menu.cms') }}
            <select v-model.number="form.cms_id" required>
              <option :value="null">—</option>
              <option v-for="option in options.cms" :key="option.id" :value="option.id">{{ option.name }}</option>
            </select>
          </label>
          <label v-if="form.type === 'news_category'">{{ t('menu.newsCategory') }}
            <select v-model.number="form.news_category_id" required>
              <option :value="null">—</option>
              <option v-for="option in options.news_categories" :key="option.id" :value="option.id">{{ option.name }}</option>
            </select>
          </label>
          <label v-if="form.type === 'external'">URL
            <input v-model.trim="form.url" type="text" required maxlength="2048" placeholder="https://... lub /sciezka" />
          </label>
          <label>{{ t('menu.parent') }}
            <select v-model.number="form.parent_id">
              <option :value="null">{{ t('menu.root') }}</option>
              <option v-for="item in parentOptions" :key="item.id" :value="item.id">
                {{ item.langs.find(lang => lang.lang_id === activeLangId)?.name || item.langs[0]?.name || `#${item.id}` }}
              </option>
            </select>
          </label>
          <label>{{ t('menu.position') }}
            <input v-model.number="form.position" type="number" min="0" required />
          </label>
          <div class="check-row">
            <label><input v-model="form.is_active" type="checkbox" /> {{ t('common.active') }}</label>
            <label><input v-model="form.target_blank" type="checkbox" /> {{ t('menu.newTab') }}</label>
          </div>
          <div class="language-fields">
            <TranslationFields :key="editingId ?? 'new'" :items="options.langs" language-id-key="id"
              :title="t('menu.names')" v-slot="{ item: lang }">
              <label>{{ t('common.name') }}
                <input v-model.trim="form.names[lang.id]" type="text" required maxlength="255" />
              </label>
            </TranslationFields>
          </div>
          <p v-if="saveError" class="manager-error" role="alert">{{ saveError }}</p>
          <div class="form-actions">
            <button class="manager-primary" type="submit" :disabled="saving">{{ saving ? t('common.loading') : t('common.save') }}</button>
            <button type="button" @click="editing = false">{{ t('common.cancel') }}</button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import TranslationFields from '@admin/components/TranslationFields.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/core/api/axios'
import { useUiStore } from '@/core/stores/uiStore'
import { useModalStore } from '@/core/stores/modalStore'
import ConfirmDeleteModal from '@/views/modals/ConfirmDeleteModal.vue'

type Location = 'menu' | 'footer_1' | 'footer_2' | 'footer_3'
type ItemType = 'category' | 'cms' | 'news_category' | 'external' | 'title' | 'special_category'
interface MenuRecord {
  id: number
  parent_id: number | null
  location: Location
  type: ItemType
  category_id: number | null
  cms_id: number | null
  news_category_id: number | null
  url: string | null
  position: number
  is_active: boolean
  target_blank: boolean
  langs: { lang_id: number; name: string }[]
}
interface Option { id: number; name: string }
interface LangOption extends Option { code: string }
interface Options { langs: LangOption[]; categories: Option[]; cms: Option[]; news_categories: Option[] }
interface FormData {
  location: Location; type: ItemType; parent_id: number | null; category_id: number | null
  cms_id: number | null; news_category_id: number | null; url: string
  position: number; is_active: boolean; target_blank: boolean; names: Record<number, string>
}

const { t } = useI18n()
const ui = useUiStore()
const modal = useModalStore()
const tabs = computed<{ key: Location; label: string }[]>(() => [
  { key: 'menu', label: t('menu.header') },
  { key: 'footer_1', label: `${t('menu.footer')} 1` },
  { key: 'footer_2', label: `${t('menu.footer')} 2` },
  { key: 'footer_3', label: `${t('menu.footer')} 3` },
])
const types: ItemType[] = ['category', 'cms', 'news_category', 'external', 'title', 'special_category']
const typeLabel = (type: ItemType) => t(`menu.types.${type}`)
const section = ref<Location>('menu')
const items = ref<MenuRecord[]>([])
const options = ref<Options>({ langs: [], categories: [], cms: [], news_categories: [] })
const activeLangId = computed(() => Number(localStorage.getItem('lang_id')) || options.value.langs[0]?.id)
const loading = ref(true)
const loadError = ref('')
const saveError = ref('')
const saving = ref(false)
const editing = ref(false)
const editingId = ref<number | null>(null)
const form = reactive<FormData>(emptyForm())

function emptyForm(): FormData {
  return { location: section.value, type: 'title', parent_id: null, category_id: null, cms_id: null,
    news_category_id: null, url: '', position: 0, is_active: true, target_blank: false, names: {} }
}

const currentSectionLabel = computed(() => tabs.value.find(tab => tab.key === section.value)?.label)
const sectionItems = computed(() => {
  const selected = items.value.filter(item => item.location === section.value)
  const rows: (MenuRecord & { depth: number })[] = []
  const visit = (parentId: number | null, depth: number) => {
    selected.filter(item => item.parent_id === parentId)
      .sort((a, b) => a.position - b.position || a.id - b.id)
      .forEach(item => { rows.push({ ...item, depth }); visit(item.id, depth + 1) })
  }
  visit(null, 0)
  return rows
})
const parentOptions = computed(() => items.value.filter(item => item.location === form.location && item.type !== 'category' && item.id !== editingId.value))

function selectSection(value: Location) {
  section.value = value
  editing.value = false
}
function startCreate() {
  Object.assign(form, emptyForm())
  for (const lang of options.value.langs) form.names[lang.id] = ''
  editingId.value = null
  saveError.value = ''
  editing.value = true
}
function startEdit(item: MenuRecord) {
  Object.assign(form, { location: item.location, type: item.type, parent_id: item.parent_id,
    category_id: item.category_id, cms_id: item.cms_id, news_category_id: item.news_category_id,
    url: item.url || '', position: item.position, is_active: Boolean(item.is_active),
    target_blank: Boolean(item.target_blank), names: {} })
  for (const lang of options.value.langs) form.names[lang.id] = item.langs.find(entry => entry.lang_id === lang.id)?.name || ''
  editingId.value = item.id
  saveError.value = ''
  editing.value = true
}
async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await api.get<{ data: MenuRecord[]; options: Options }>('/settings/menu-items')
    items.value = data.data
    options.value = data.options
  } catch {
    loadError.value = t('menu.loadError')
  } finally {
    loading.value = false
  }
}
async function save() {
  saving.value = true
  saveError.value = ''
  const payload = { ...form, parent_id: form.parent_id || null,
    category_id: form.type === 'category' ? form.category_id : null,
    cms_id: form.type === 'cms' ? form.cms_id : null,
    news_category_id: form.type === 'news_category' ? form.news_category_id : null,
    url: form.type === 'external' ? form.url : null,
    langs: options.value.langs.map(lang => ({ lang_id: lang.id, name: form.names[lang.id] || '' })) }
  try {
    if (editingId.value) await api.put(`/settings/menu-items/${editingId.value}`, payload)
    else await api.post('/settings/menu-items', payload)
    section.value = form.location
    editing.value = false
    await load()
  } catch (error: any) {
    saveError.value = Object.values(error.response?.data?.errors || {}).flat().join(' ') || t('menu.saveError')
  } finally {
    saving.value = false
  }
}
async function remove(item: MenuRecord) {
  const itemName = item.langs.find(lang => lang.lang_id === activeLangId.value)?.name || item.langs[0]?.name
  modal.openModal(ConfirmDeleteModal, {
    title: t('common.delete'),
    message: t('menu.confirmDelete'),
    itemName,
    confirmText: t('common.delete'),
    cancelText: t('common.cancel'),
    loadingText: t('common.loading'),
    onConfirm: async () => {
      await api.delete(`/settings/menu-items/${item.id}`)
      if (editingId.value === item.id) editing.value = false
      await load()
    },
    onError: (error: unknown) => {
      console.error('Delete menu item failed', error)
      ui.showError(t('menu.saveError'))
    },
  })
}
onMounted(load)
</script>

<style scoped src="./MenuManager.css"></style>
