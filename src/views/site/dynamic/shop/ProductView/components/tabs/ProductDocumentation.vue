<template>
    <div class="documentation">
        <div class="tab-header d-flex justify-content-between align-items-center" :class="{ 'is-open': isOpen }"
            @click="toggleDocumentation">
            <div class="tab-title-container">
                <BaseIcon class="tab-icon" name="download" />
                <span class="tab-title">
                    {{ t('products.section.documentation') }}
                </span>
            </div>

            <BaseIcon :name="isOpen ? 'minus' : 'plus'" />
        </div>

        <div class="wrapper-content" :class="{ 'is-open': isOpen }">
            <div class="content-wrapper-inside">
                <div v-if="files?.length" class="documentation-list">
                    <a v-for="file in files" :key="file.file_id" :href="file.file" target="_blank"
                        rel="noopener noreferrer" class="documentation-item">
                        <BaseIcon name="fileDownload" />

                        <div class="documentation-content">
                            <div class="documentation-name">
                                {{ file.name }}
                            </div>

                            <div v-if="file.description" class="documentation-description">
                                {{ file.description }}
                            </div>
                        </div>
                    </a>
                </div>

                <div v-else class="documentation-empty">
                    {{ t('products.section.brak_dokumentacji') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'

defineProps<{
    files: any
}>()

const { t } = useI18n()

const isOpen = ref(false)

const toggleDocumentation = () => {
    isOpen.value = !isOpen.value
}
</script>

<style scoped>
@import './ProductTabs.css';
</style>