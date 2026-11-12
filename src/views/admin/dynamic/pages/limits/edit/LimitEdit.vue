<template>
    <div class="limit-edit">
        <h1>{{ t("limits.edit") }}</h1>

        <div v-if="loaded" class="limit-edit-content">
            <LimitForm ref="formRef" :isEdit="true" @submit="handleSubmit" />

            <div class="section limit-edit-actions">
                <h3>{{ t("limits.assigned_units") }}</h3>

                <div class="limit-assignment-search">
                    <input
                        v-model="unitSearch"
                        class="form-control"
                        autocomplete="off"
                        :placeholder="t('limits.search_unit')"
                        @input="searchUnits"
                    />
                    <div v-if="unitSearchLoading" class="small text-muted mt-1">
                        {{ t("common.loading") }}
                    </div>
                    <div v-if="unitResults.length" class="limit-assignment-options">
                        <button
                            v-for="unit in unitResults"
                            :key="unit.id"
                            type="button"
                            class="limit-assignment-option"
                            @click="assignUnit(unit)"
                        >
                            <span>{{ unit.name }}</span>
                            <span v-if="unit.number" class="text-muted">{{ unit.number }}</span>
                        </button>
                    </div>
                    <div
                        v-if="unitSearch.trim().length >= 2 && !unitSearchLoading && !unitResults.length"
                        class="small text-muted mt-1"
                    >
                        {{ t("common.no_results") }}
                    </div>
                </div>

                <p v-if="!assignedUnits.length" class="small text-muted mt-3">
                    {{ t("limits.no_assigned_units") }}
                </p>
                <div v-else class="limit-unit-cards mt-3">
                    <article v-for="unit in assignedUnits" :key="unit.id" class="limit-unit-card">
                        <header class="limit-unit-card__header">
                            <h4 class="h6 mb-0">
                                {{ unit.unit?.name ?? unit.unit_id }}
                                <small v-if="unit.unit?.number" class="text-muted">{{ unit.unit.number }}</small>
                            </h4>
                            <button
                                type="button"
                                class="btn-close"
                                :aria-label="t('limits.remove')"
                                :disabled="removingUnitId === unit.id"
                                @click="removeUnit(unit)"
                            />
                        </header>

                        <section class="limit-people-panel mt-3">
                            <h5 class="h6">{{ t("limits.unit_users_and_acceptors") }}</h5>
                            <select
                                v-model="unit.selectedUserId"
                                class="form-select"
                                @change="addUnitUser(unit, unit.selectedUserId)"
                            >
                                <option value="">{{ t("limits.select_unit_user_or_acceptor") }}</option>
                                <option
                                    v-for="person in availableUnitUsers(unit)"
                                    :key="person.id"
                                    :value="person.id"
                                >
                                    {{ person.name }} — {{ person.email }}
                                    <template v-if="person.isAcceptor"> ({{ t("limits.unit_acceptor") }})</template>
                                </option>
                            </select>
                            <div v-if="unit.users.length" class="limit-assignment-tags mt-2">
                                <div v-for="person in unit.users" :key="person.user_id" class="limit-assignment-tag">
                                    <span>{{ person.name }} <small class="text-muted">{{ person.email }}</small></span>
                                    <button
                                        type="button"
                                        class="btn-close"
                                        :aria-label="t('limits.remove')"
                                        @click="removeUnitUser(unit, person.user_id)"
                                    />
                                </div>
                            </div>
                            <p v-else class="small text-muted mt-2">{{ t("limits.no_unit_users") }}</p>
                            <BaseButton
                                type="button"
                                class="mt-3"
                                :disabled="unit.savingUsers"
                                @click="saveUnitUsers(unit)"
                            >
                                {{ unit.savingUsers ? t("common.loading") : t("limits.save_unit_users") }}
                            </BaseButton>
                        </section>

                        <section class="limit-people-panel mt-3">
                            <header class="d-flex justify-content-between align-items-center gap-2">
                                <h5 class="h6 mb-0">{{ t("limits.approval_levels") }}</h5>
                                <BaseButton type="button" @click="addApprovalLevel(unit)">
                                    {{ t("limits.add_level") }}
                                </BaseButton>
                            </header>
                            <p v-if="!unit.levels.length" class="small text-muted mt-2">
                                {{ t("limits.no_approval_levels") }}
                            </p>
                            <article v-for="(level, index) in unit.levels" :key="level.key" class="limit-approval-level mt-3">
                                <header class="d-flex justify-content-between align-items-center gap-2">
                                    <strong>{{ t("limits.level_number", { number: index + 1 }) }}</strong>
                                    <button
                                        type="button"
                                        class="btn-close"
                                        :aria-label="t('limits.remove')"
                                        @click="removeApprovalLevel(unit, level.key)"
                                    />
                                </header>
                                <div class="mt-2">
                                    <label class="form-label">
                                        {{ t("limits.level_required_approvals") }}
                                    </label>
                                    <input
                                        v-model.number="level.required_approvals"
                                        class="form-control"
                                        :class="{ 'is-invalid': !isApprovalLevelValid(level) }"
                                        type="number"
                                        min="1"
                                        :max="level.users.length || 1"
                                        step="1"
                                        required
                                    />
                                    <div class="form-text">
                                        {{ t("limits.level_approval_count", {
                                            required: level.required_approvals,
                                            total: level.users.length
                                        }) }}
                                    </div>
                                    <div v-if="!isApprovalLevelValid(level)" class="invalid-feedback d-block">
                                        {{ t("limits.level_approval_count_invalid") }}
                                    </div>
                                </div>
                                <select
                                    v-model="level.selectedUserId"
                                    class="form-select"
                                    @change="addLevelApprover(unit, level, level.selectedUserId)"
                                >
                                    <option value="">{{ t("limits.select_unit_acceptor") }}</option>
                                    <option
                                        v-for="person in availableLevelApprovers(unit, level)"
                                        :key="person.id"
                                        :value="person.id"
                                    >
                                        {{ person.name }} — {{ person.email }}
                                    </option>
                                </select>
                                <div v-if="level.users.length" class="limit-assignment-tags mt-2">
                                    <div v-for="person in level.users" :key="person.user_id" class="limit-assignment-tag">
                                        <span>{{ person.name }} <small class="text-muted">{{ person.email }}</small></span>
                                        <button
                                            type="button"
                                            class="btn-close"
                                            :aria-label="t('limits.remove')"
                                            @click="removeLevelApprover(level, person.user_id)"
                                        />
                                    </div>
                                </div>
                            </article>
                            <BaseButton
                                type="button"
                                class="mt-3"
                                :disabled="unit.savingLevels || !unit.levels.every(isApprovalLevelValid)"
                                @click="saveApprovalLevels(unit)"
                            >
                                {{ unit.savingLevels ? t("common.loading") : t("limits.save_approval_levels") }}
                            </BaseButton>
                        </section>
                    </article>
                </div>
            </div>

            <div class="section limit-edit-actions">
                <h3>{{ t("limits.assigned_items") }}</h3>

                <div class="limit-items-search">
                    <select v-model.number="itemKind" class="form-select">
                        <option :value="1">{{ t("limits.product") }}</option>
                        <option :value="2">{{ t("limits.category") }}</option>
                    </select>
                    <div class="position-relative flex-grow-1">
                        <input
                            v-model="itemSearch"
                            class="form-control"
                            autocomplete="off"
                            :placeholder="itemKind === 1 ? t('limits.search_product') : t('limits.search_category')"
                            @input="searchItems"
                        />
                        <div v-if="itemSearchLoading" class="small text-muted mt-1">
                            {{ t("common.loading") }}
                        </div>
                        <div v-if="itemResults.length" class="limit-assignment-options">
                            <button
                                v-for="item in itemResults"
                                :key="item.id"
                                type="button"
                                class="limit-assignment-option"
                                @click="addItem(item)"
                            >
                                <span>{{ item.name }}</span>
                                <span v-if="item.sku" class="text-muted">{{ item.sku }}</span>
                            </button>
                        </div>
                        <div
                            v-if="itemSearch.trim().length >= 2 && !itemSearchLoading && !itemResults.length"
                            class="small text-muted mt-1"
                        >
                            {{ t("common.no_results") }}
                        </div>
                    </div>
                </div>

                <div class="limit-assigned-items-grid mt-3">
                    <section class="limit-assigned-items-panel">
                        <h4 class="h6">{{ t("limits.assigned_products") }}</h4>
                        <p v-if="!assignedProducts.length" class="small text-muted">
                            {{ t("limits.no_assigned_products") }}
                        </p>
                        <div v-else class="limit-assignment-tags">
                            <div v-for="item in assignedProducts" :key="`product-${item.product_id}`" class="limit-assignment-tag">
                                <span>
                                    {{ item.name }}
                                    <small v-if="item.sku" class="text-muted">[{{ item.sku }}]</small>
                                </span>
                                <button type="button" class="btn-close" :aria-label="t('limits.remove')" @click="removeItem(item)" />
                            </div>
                        </div>
                    </section>
                    <section class="limit-assigned-items-panel">
                        <h4 class="h6">{{ t("limits.assigned_categories") }}</h4>
                        <p v-if="!assignedCategories.length" class="small text-muted">
                            {{ t("limits.no_assigned_categories") }}
                        </p>
                        <div v-else class="limit-assignment-tags">
                    <div
                                v-for="item in assignedCategories"
                                :key="`category-${item.category_id}`"
                                class="limit-assignment-tag"
                    >
                        <span>
                            {{ item.name }}
                        </span>
                        <button
                            type="button"
                            class="btn-close"
                            :aria-label="t('limits.remove')"
                            @click="removeItem(item)"
                        />
                    </div>
                </div>
                    </section>
                </div>

                <div v-if="assignmentError" class="alert alert-danger mt-3">
                    {{ assignmentError }}
                </div>
                <div class="d-flex justify-content-end mt-3">
                    <BaseButton
                        type="button"
                        :disabled="savingItems"
                        @click="saveItems"
                    >
                        {{ savingItems ? t("common.loading") : t("limits.save_items") }}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";
import { useModalStore } from "@/core/stores/modalStore";
import ConfirmDeleteModal from "@/views/modals/ConfirmDeleteModal.vue";

import BaseButton from "@shared/ui/BaseButton.vue";
import LimitForm from "../form/LimitForm.vue";
import type { LimitFormData } from "../form/LimitForm";

const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const modal = useModalStore();
const { t } = useI18n();

const limitId = Number(route.params.id);
const formRef = ref<InstanceType<typeof LimitForm> | null>(null);
const loaded = ref(false);
const unitSearch = ref("");
const unitResults = ref<UnitSearchResult[]>([]);
const assignedUnits = ref<AssignedUnit[]>([]);
const unitSearchLoading = ref(false);
const removingUnitId = ref<number | null>(null);
const itemKind = ref<1 | 2>(1);
const itemSearch = ref("");
const itemResults = ref<ItemSearchResult[]>([]);
const itemSearchLoading = ref(false);
const assignedItems = ref<AssignedItem[]>([]);
const savingItems = ref(false);
const assignmentError = ref("");
let unitSearchTimer: ReturnType<typeof setTimeout> | null = null;
let itemSearchTimer: ReturnType<typeof setTimeout> | null = null;

type UnitSearchResult = {
    id: number;
    name: string;
    number: string | null;
};

type AssignedUnit = {
    id: number;
    unit_id: number;
    unit: UnitSearchResult | null;
    availableUsers: PersonSearchResult[];
    availableAcceptors: PersonSearchResult[];
    users: AssignedPerson[];
    levels: ApprovalLevel[];
    selectedUserId: number | "";
    savingUsers: boolean;
    savingLevels: boolean;
};

type PersonSearchResult = {
    id: number;
    name: string;
    email: string;
    isAcceptor?: boolean;
};

type AssignedPerson = {
    id: number;
    user_id: number;
    name: string;
    email: string;
};

type ApprovalLevel = {
    id?: number;
    key: string;
    level_order: number;
    required_approvals: number;
    users: AssignedPerson[];
    selectedUserId: number | "";
};

const isApprovalLevelValid = (level: ApprovalLevel) =>
    Number.isInteger(Number(level.required_approvals))
    && Number(level.required_approvals) >= 1
    && Number(level.required_approvals) <= level.users.length;

type ItemSearchResult = {
    id: number;
    name: string;
    sku?: string | null;
};

type AssignedItem = {
    id: number;
    product_id: number | null;
    category_id: number | null;
    name: string;
    sku: string | null;
};

const assignedProducts = computed(() =>
    assignedItems.value.filter(item => item.product_id !== null)
);
const assignedCategories = computed(() =>
    assignedItems.value.filter(item => item.category_id !== null)
);
const loadLimit = async () => {
    ui.showLoader();

    try {
        const { data } = await api.get(`/limits/${limitId}`);

        loaded.value = true;
        await nextTick();
        formRef.value?.setFormData(data.data ?? data);
        await loadAssignments();
    } catch (error) {
        console.error(error);
        ui.showError(t("limits.load_error"));
        await router.push({ name: "admin.limits" });
    } finally {
        ui.hideLoader();
    }
};

const loadAssignments = async () => {
    assignmentError.value = "";

    try {
        const [unitsResponse, itemsResponse] = await Promise.all([
            api.get(`/limits/${limitId}/units`),
            api.get(`/limits/${limitId}/items`),
        ]);

        assignedUnits.value = await Promise.all(
            (unitsResponse.data as Array<Pick<AssignedUnit, "id" | "unit_id" | "unit">>)
                .map(async unit => {
                    const [
                        usersResponse,
                        availableUsersResponse,
                        availableAcceptorsResponse,
                        levelsResponse,
                    ] = await Promise.all([
                        api.get(`/limit-units/${unit.id}/users`),
                        api.get("/limits/users", {
                            params: { unit_id: unit.unit_id, type: "users" },
                        }),
                        api.get("/limits/users", {
                            params: { unit_id: unit.unit_id, type: "acceptors" },
                        }),
                        api.get(`/limit-units/${unit.id}/levels`),
                    ]);

                    return {
                        ...unit,
                        users: usersResponse.data,
                        availableUsers: [
                            ...(availableUsersResponse.data as PersonSearchResult[]),
                            ...(availableAcceptorsResponse.data as PersonSearchResult[])
                                .map(person => ({ ...person, isAcceptor: true })),
                        ],
                        availableAcceptors: availableAcceptorsResponse.data,
                        levels: (levelsResponse.data as Array<Omit<ApprovalLevel, "key" | "selectedUserId">>)
                            .map((level, index) => ({
                                ...level,
                                key: `saved-${level.id ?? index}`,
                                selectedUserId: "",
                            })),
                        selectedUserId: "",
                        savingUsers: false,
                        savingLevels: false,
                    };
                })
        );
        assignedItems.value = itemsResponse.data;
    } catch (error) {
        console.error("Load limit assignments failed", error);
        assignmentError.value = t("limits.assignment_load_error");
    }
};

const addApprovalLevel = (unit: AssignedUnit) => {
    unit.levels.push({
        key: `new-${Date.now()}-${unit.levels.length}`,
        level_order: unit.levels.length + 1,
        required_approvals: 1,
        users: [],
        selectedUserId: "",
    });
};

const removeApprovalLevel = (unit: AssignedUnit, key: string) => {
    unit.levels = unit.levels.filter(level => level.key !== key);
};

const availableLevelApprovers = (unit: AssignedUnit, level: ApprovalLevel) => {
    const assigned = new Set(level.users.map(person => person.user_id));
    return unit.availableAcceptors.filter(person => !assigned.has(Number(person.id)));
};

const addLevelApprover = (
    unit: AssignedUnit,
    level: ApprovalLevel,
    selectedId: number | ""
) => {
    if (selectedId === "") return;
    const person = unit.availableAcceptors.find(item => Number(item.id) === Number(selectedId));
    if (person && !level.users.some(item => item.user_id === Number(person.id))) {
        level.users.push({
            id: Number(person.id),
            user_id: Number(person.id),
            name: person.name,
            email: person.email,
        });
    }
    level.selectedUserId = "";
};

const removeLevelApprover = (level: ApprovalLevel, userId: number) => {
    level.users = level.users.filter(person => person.user_id !== userId);
};

const availableUnitUsers = (unit: AssignedUnit) => {
    const assigned = new Set(unit.users.map(person => person.user_id));
    return unit.availableUsers.filter(person => !assigned.has(Number(person.id)));
};

const addUnitUser = (unit: AssignedUnit, selectedId: number | "") => {
    if (selectedId === "") return;
    const person = unit.availableUsers.find(item => Number(item.id) === Number(selectedId));
    if (person && !unit.users.some(item => item.user_id === Number(person.id))) {
        unit.users.push({
            id: Number(person.id),
            user_id: Number(person.id),
            name: person.name,
            email: person.email,
        });
    }
    unit.selectedUserId = "";
};

const removeUnitUser = (unit: AssignedUnit, userId: number) => {
    unit.users = unit.users.filter(person => person.user_id !== userId);
};

const saveUnitUsers = async (unit: AssignedUnit) => {
    unit.savingUsers = true;
    try {
        const { data } = await api.put(`/limit-units/${unit.id}/users`, {
            user_ids: unit.users.map(person => person.user_id),
        });
        unit.users = data;
        ui.showSuccess(t("limits.people_saved"));
    } catch (error) {
        console.error("Save limit unit users failed", error);
        assignmentError.value = t("limits.assignment_save_error");
    } finally {
        unit.savingUsers = false;
    }
};

const saveApprovalLevels = async (unit: AssignedUnit) => {
    unit.savingLevels = true;
    try {
        const { data } = await api.put(`/limit-units/${unit.id}/levels`, {
            levels: unit.levels.map((level, index) => ({
                level_order: index + 1,
                required_approvals: Number(level.required_approvals),
                user_ids: level.users.map(person => person.user_id),
            })),
        });
        unit.levels = (data as Array<Omit<ApprovalLevel, "key" | "selectedUserId">>)
            .map((level, index) => ({
                ...level,
                key: `saved-${level.id ?? index}`,
                selectedUserId: "",
            }));
        ui.showSuccess(t("limits.approval_levels_saved"));
    } catch (error) {
        console.error("Save limit approval levels failed", error);
        assignmentError.value = t("limits.assignment_save_error");
    } finally {
        unit.savingLevels = false;
    }
};

const searchUnits = () => {
    if (unitSearchTimer) clearTimeout(unitSearchTimer);
    const search = unitSearch.value.trim();

    if (search.length < 2) {
        unitResults.value = [];
        return;
    }

    unitSearchTimer = setTimeout(async () => {
        unitSearchLoading.value = true;
        try {
            const { data } = await api.get("/limits/search-data/units", {
                params: { search },
            });
            const assignedIds = new Set(assignedUnits.value.map(unit => unit.unit_id));
            unitResults.value = (data as UnitSearchResult[])
                .filter(unit => !assignedIds.has(Number(unit.id)));
        } catch (error) {
            console.error("Search limit units failed", error);
            assignmentError.value = t("limits.assignment_load_error");
        } finally {
            unitSearchLoading.value = false;
        }
    }, 250);
};

const assignUnit = async (unit: UnitSearchResult) => {
    assignmentError.value = "";
    try {
        await api.post(`/limits/${limitId}/units`, { unit_id: unit.id });
        unitSearch.value = "";
        unitResults.value = [];
        await loadAssignments();
        ui.showSuccess(t("limits.unit_assigned"));
    } catch (error) {
        console.error("Assign limit unit failed", error);
        assignmentError.value = t("limits.assignment_save_error");
    }
};

const removeUnit = (unit: AssignedUnit) => {
    modal.openModal(ConfirmDeleteModal, {
        title: t("limits.remove"),
        message: t("common.confirm_delete"),
        itemName: unit.unit?.name ?? String(unit.unit_id),
        confirmText: t("limits.remove"),
        cancelText: t("common.cancel"),
        loadingText: t("common.loading"),
        onConfirm: async () => {
            assignmentError.value = "";
            removingUnitId.value = unit.id;
            try {
                await api.delete(`/limits/${limitId}/units/${unit.id}`);
                assignedUnits.value = assignedUnits.value.filter(item => item.id !== unit.id);
                ui.showSuccess(t("limits.unit_removed"));
            } finally {
                removingUnitId.value = null;
            }
        },
        onError: (error: unknown) => {
            console.error("Remove limit unit failed", error);
            assignmentError.value = t("limits.assignment_save_error");
            ui.showError(t("limits.assignment_save_error"));
        },
    });
};

const searchItems = () => {
    if (itemSearchTimer) clearTimeout(itemSearchTimer);
    const search = itemSearch.value.trim();

    if (search.length < 2) {
        itemResults.value = [];
        return;
    }

    itemSearchTimer = setTimeout(async () => {
        itemSearchLoading.value = true;
        try {
            const type = itemKind.value === 1 ? "products" : "categories";
            const { data } = await api.get(`/limits/search-data/${type}`, {
                params: { search },
            });
            itemResults.value = data;
        } catch (error) {
            console.error("Search limit items failed", error);
            assignmentError.value = t("limits.assignment_load_error");
        } finally {
            itemSearchLoading.value = false;
        }
    }, 250);
};

const addItem = (item: ItemSearchResult) => {
    const isProduct = itemKind.value === 1;
    const duplicate = assignedItems.value.some(existing =>
        isProduct
            ? existing.product_id === item.id
            : existing.category_id === item.id
    );

    if (!duplicate) {
        assignedItems.value.push({
            id: item.id,
            product_id: isProduct ? item.id : null,
            category_id: isProduct ? null : item.id,
            name: item.name,
            sku: item.sku ?? null,
        });
    }

    itemSearch.value = "";
    itemResults.value = [];
};

const removeItem = (item: AssignedItem) => {
    assignedItems.value = assignedItems.value.filter(existing =>
        item.product_id !== null
            ? existing.product_id !== item.product_id
            : existing.category_id !== item.category_id
    );
};

const saveItems = async () => {
    assignmentError.value = "";
    savingItems.value = true;

    try {
        const items = assignedItems.value.map(item => item.product_id !== null
            ? { product_id: item.product_id }
            : { category_id: item.category_id });
        const { data } = await api.put(`/limits/${limitId}/items`, { items });
        assignedItems.value = data;
        ui.showSuccess(t("limits.items_saved"));
    } catch (error) {
        console.error("Save limit items failed", error);
        assignmentError.value = t("limits.assignment_save_error");
    } finally {
        savingItems.value = false;
    }
};

const handleSubmit = async (form: LimitFormData) => {
    ui.showLoader();

    try {
        await api.put(`/limits/${limitId}`, form);

        ui.showSuccess(t("limits.saved_success"));
    } catch (error: any) {
        if (error.response?.status === 422) {
            formRef.value?.handleValidationError(
                error.response.data.errors
            );

            ui.showError(t("common.fix_form"));
        } else {
            console.error(error);
            ui.showError(t("common.error_occurred"));
        }
    } finally {
        ui.hideLoader();
    }
};

onMounted(loadLimit);
onBeforeUnmount(() => {
    if (unitSearchTimer) clearTimeout(unitSearchTimer);
    if (itemSearchTimer) clearTimeout(itemSearchTimer);
});
</script>

<style scoped>
.limit-assignment-search {
    position: relative;
    max-width: 640px;
}

.limit-items-search {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    max-width: 800px;
}

.limit-items-search > select {
    max-width: 200px;
}

.limit-unit-cards,
.limit-assigned-items-grid {
    display: grid;
    gap: 1rem;
}

.limit-unit-card,
.limit-assigned-items-panel,
.limit-people-panel {
    min-width: 0;
    padding: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    background: #fff;
}

.limit-unit-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.limit-people-grid,
.limit-assigned-items-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.limit-assignment-options {
    position: absolute;
    z-index: 10;
    top: 100%;
    right: 0;
    left: 0;
    max-height: 260px;
    overflow-y: auto;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    background: #fff;
    box-shadow: 0 0.5rem 1rem rgb(0 0 0 / 15%);
}

.limit-assignment-option {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 0;
    background: #fff;
    text-align: left;
}

.limit-assignment-option:hover {
    background: #f8f9fa;
}

.limit-assignment-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.limit-assignment-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    background: #f8f9fa;
}

@media (max-width: 640px) {
    .limit-items-search {
        flex-direction: column;
    }

    .limit-items-search > select {
        max-width: none;
        width: 100%;
    }

    .limit-people-grid,
    .limit-assigned-items-grid {
        grid-template-columns: 1fr;
    }
}
</style>
