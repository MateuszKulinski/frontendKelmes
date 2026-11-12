<template>
    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border" />
    </div>

    <main v-else-if="claim" class="claim-case">
        <button type="button" class="btn btn-link px-0 mb-3" @click="backToList">
            {{ t("claims.back_to_list") }}
        </button>

        <header class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
                <h2 class="mb-1">{{ claim.claim_type === 2 ? t("claims.return_case") : t("claims.claim_case") }} #{{ claim.id }}</h2>
                <div class="text-muted">{{ t("claims.document") }}: {{ claim.document?.number ?? "" }}</div>
            </div>
            <div class="claim-case__status" :class="{ 'claim-case__status--closed': isFinal }">
                {{ currentStatusName }}
            </div>
            <button v-if="canEdit" type="button" class="btn btn-outline-primary" @click="editCase">
                {{ t("claims.edit_case") }}
            </button>
        </header>

        <section v-if="claim.claim_items?.length" class="mb-4">
            <h3 class="h5">{{ t("claims.positions") }}</h3>
            <ul class="claim-case__items">
                <li v-for="item in claim.claim_items" :key="item.id">
                    <strong>{{ item.document_position?.product?.name || item.document_position?.name || `#${item.document_position_id}` }}</strong>
                    <span class="ms-2">{{ item.quantity_returned }} {{ t("claims.quantity") }}</span>
                    <p v-if="item.notes" class="text-muted mb-0">{{ item.notes }}</p>
                </li>
            </ul>
        </section>

        <section v-if="claim.description" class="mb-4">
            <h3 class="h5">{{ t("claims.description") }}</h3>
            <p class="mb-0">{{ claim.description }}</p>
        </section>

        <section v-if="claim.claim_files?.length" class="mb-4">
            <h3 class="h5">{{ t("claims.attachments") }}</h3>
            <ul class="claim-case__files">
                <li v-for="file in claim.claim_files" :key="file.id">
                    <a :href="fileUrl(file.file_path)" target="_blank" rel="noopener noreferrer">{{ file.file_path.split("/").pop() }}</a>
                </li>
            </ul>
        </section>

        <section class="claim-case__history mb-4">
            <h3 class="h5 mb-3">{{ t("claims.history") }}</h3>
            <ol v-if="claim.claim_status_histories?.length" class="claim-case__timeline">
                <li v-for="entry in claim.claim_status_histories" :key="entry.id" class="claim-case__entry">
                    <div class="d-flex flex-wrap justify-content-between gap-2">
                        <strong>{{ entry.claim_status ? statusName(entry.claim_status) : t("claims.message") }}</strong>
                        <time class="text-muted">{{ entry.created_at }}</time>
                    </div>
                    <div class="small text-muted">{{ entry.user?.fullname || entry.user?.name || "" }}</div>
                    <p v-if="entry.message" class="mb-0 mt-2">{{ entry.message }}</p>
                </li>
            </ol>
            <p v-else class="text-muted">{{ t("claims.no_history") }}</p>
        </section>

        <section v-if="!isFinal" class="claim-case__reply">
            <h3 class="h5 mb-3">{{ t("claims.add_message") }}</h3>
            <label v-if="canAdmin" class="form-label" for="claim-status">{{ t("claims.status") }}</label>
            <select v-if="canAdmin" id="claim-status" v-model="selectedStatusId" class="form-select mb-3">
                <option :value="null">{{ t("claims.message_only") }}</option>
                <option v-for="status in statuses" :key="status.id" :value="status.id">{{ statusName(status) }}</option>
            </select>
            <textarea v-model="message" class="form-control" rows="4" :placeholder="t('claims.message_placeholder')" />
            <div class="d-flex flex-wrap justify-content-end gap-2 mt-3">
                <button v-if="!canAdmin" type="button" class="btn btn-outline-danger" :disabled="sending || !message.trim()"
                    @click="cancelCase">{{ t("claims.cancel_case") }}</button>
                <button type="button" class="btn btn-primary" :disabled="sending || !message.trim()"
                    @click="submitEntry">
                    <span v-if="sending" class="spinner-border spinner-border-sm me-2" />
                    {{ t("claims.send_message") }}
                </button>
            </div>
        </section>
        <p v-else class="alert alert-secondary mb-0">{{ t("claims.case_closed") }}</p>
    </main>

    <div v-else class="alert alert-warning">{{ t("claims.case_not_found") }}</div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { API_BASE_URL } from "@/core/config/client";
import type { ClaimStatus } from "@/composables/types/claims";
import { useClaimCase } from "./ClaimCaseView";

const { t } = useI18n();
const {
    claim,
    statuses,
    message,
    selectedStatusId,
    loading,
    sending,
    canAdmin,
    isFinal,
    currentStatusName,
    canEdit,
    submitEntry,
    cancelCase,
    backToList,
    editCase,
} = useClaimCase();

const statusName = (status: ClaimStatus) => status.langs?.[0]?.pivot?.name ?? status.code;
const fileUrl = (path: string) => `${API_BASE_URL.replace(/\/api\/?$/, "")}/storage/${path}`;
</script>

<style scoped>
.claim-case__status {
    border-left: 4px solid #167d6a;
    padding: 8px 12px;
    font-weight: 600;
    background: #edf7f4;
}

.claim-case__status--closed {
    border-color: #7a5260;
    background: #f7eff2;
}

.claim-case__timeline {
    list-style: none;
    padding: 0;
    margin: 0;
    border-left: 2px solid #d8e2de;
}

.claim-case__entry {
    position: relative;
    padding: 0 0 24px 20px;
}

.claim-case__entry::before {
    content: "";
    position: absolute;
    left: -6px;
    top: 5px;
    width: 10px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #167d6a;
}

.claim-case__reply {
    max-width: 760px;
    border-top: 1px solid #d8e2de;
    padding-top: 20px;
}

.claim-case__files {
    padding-left: 20px;
}

.claim-case__items {
    padding-left: 20px;
}
</style>