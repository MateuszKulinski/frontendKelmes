<template>
  <div v-if="loading" class="text-center py-5"><div class="spinner-border" /></div>
  <main v-else-if="claim" class="claim-case-edit">
    <button type="button" class="btn btn-link px-0 mb-3" @click="backToClaim">{{ t("claims.back_to_list") }}</button>
    <h2 class="h3 mb-3">{{ t("claims.edit_case") }} #{{ claim.id }}</h2>

    <section class="mb-4">
      <h3 class="h5">{{ t("claims.positions") }}</h3>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t("claims.product") }}</th>
              <th>{{ t("claims.quantity") }}</th>
              <th>{{ t("claims.notes") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.document_position?.product?.name || item.document_position?.name || `#${item.document_position_id}` }}</td>
              <td>
                <input v-model.number="item.quantity_returned" type="number" class="form-control" min="0.001"
                  :max="item.document_position?.quantity" step="any" required :disabled="!canEdit" />
              </td>
              <td><textarea v-model="item.notes" class="form-control" rows="2" :disabled="!canEdit" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <form v-if="canEdit" class="claim-case-edit__form" @submit.prevent="save">
      <label class="form-label" for="claim-description">{{ t("claims.description") }}</label>
      <textarea id="claim-description" v-model="description" class="form-control" rows="5"
        :placeholder="t('claims.description_placeholder')" />
      <div class="d-flex justify-content-end gap-2 mt-3">
        <button type="button" class="btn btn-outline-secondary" @click="backToClaim">{{ t("claims.no") }}</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" />
          {{ t("common.save") }}
        </button>
      </div>
    </form>
    <p v-else class="alert alert-secondary">{{ t("claims.case_closed") }}</p>
  </main>
  <div v-else class="alert alert-warning">{{ t("claims.case_not_found") }}</div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useClaimCaseEdit } from "./ClaimCaseEditView";

const { t } = useI18n();
const { claim, items, description, loading, saving, canEdit, backToClaim, save } = useClaimCaseEdit();
</script>

<style scoped>
.claim-case-edit__items {
  padding-left: 20px;
}

.claim-case-edit__form {
  max-width: 760px;
  border-top: 1px solid #d8e2de;
  padding-top: 20px;
}
</style>