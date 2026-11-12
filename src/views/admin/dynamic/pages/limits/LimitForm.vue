<template>
    <main class="limit-form-page">
        <header class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <h1 class="h3 mb-0">{{ isEdit ? t("limits.edit") : t("limits.add") }}</h1>
            <button type="button" class="btn btn-outline-secondary" @click="goToList">{{ t("common.cancel") }}</button>
        </header>

        <form class="limit-form" @submit.prevent="save">
            <section class="limit-form__section">
                <div class="row g-3">
                    <div class="col-12 col-lg-6">
                        <label class="form-label" for="limit-name">{{ t("limits.name") }}</label>
                        <input id="limit-name" v-model.trim="form.name" class="form-control" required maxlength="255" />
                    </div>

                    <div class="col-12 col-lg-6">
                        <label class="form-label" for="limit-unit">{{ t("limits.unit") }}</label>
                        <input id="limit-unit" v-model="unitSearch" class="form-control" autocomplete="off"
                            :placeholder="t('limits.search_unit')" @input="searchUnits" />
                        <div v-if="unitOptions.length" class="limit-form__options">
                            <button v-for="unit in unitOptions" :key="unit.id" type="button" class="limit-form__option"
                                @click="selectUnit(unit)">{{ unit.name }} <span class="text-muted">{{ unit.number
                                }}</span></button>
                        </div>
                        <div v-if="form.unit_id" class="small text-success mt-1">{{ selectedUnitName }}</div>
                    </div>

                    <div class="col-12 col-lg-6">
                        <label class="form-label" for="limit-path">{{ t("limits.path") }}</label>
                        <select id="limit-path" v-model.number="form.path_id" class="form-select"
                            :disabled="!form.unit_id">
                            <option :value="null">{{ t("limits.none") }}</option>
                            <option v-for="path in paths" :key="path.id" :value="path.id">{{ path.name }}</option>
                        </select>
                    </div>

                    <div class="col-12 col-lg-6">
                        <label class="form-label" for="limit-type">{{ t("limits.limit_type") }}</label>
                        <select id="limit-type" v-model.number="form.limit_type" class="form-select">
                            <option :value="1">{{ t("limits.type_quantity") }}</option>
                            <option :value="2">{{ t("limits.type_financial") }}</option>
                            <option :value="3">{{ t("limits.type_both") }}</option>
                            <option :value="4">{{ t("limits.type_either") }}</option>
                        </select>
                    </div>

                    <div class="col-12 col-lg-6">
                        <label class="form-label" for="time-limit">{{ t("limits.time_limit") }}</label>
                        <select id="time-limit" v-model.number="form.time_limit" class="form-select">
                            <option :value="1">{{ t("limits.week") }}</option>
                            <option :value="2">{{ t("limits.month") }}</option>
                            <option :value="3">{{ t("limits.quarter") }}</option>
                            <option :value="4">{{ t("limits.year") }}</option>
                            <option :value="5">{{ t("limits.custom_period") }}</option>
                        </select>
                    </div>

                    <template v-if="form.time_limit === 5">
                        <div class="col-12 col-md-6">
                            <label class="form-label" for="date-start">{{ t("limits.date_start") }}</label>
                            <input id="date-start" v-model="form.date_start" type="date" class="form-control"
                                required />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label" for="date-end">{{ t("limits.date_end") }}</label>
                            <input id="date-end" v-model="form.date_end" type="date" class="form-control"
                                :min="form.date_start" required />
                        </div>
                    </template>

                    <div v-if="[1, 3, 4].includes(form.limit_type)" class="col-12 col-md-6">
                        <label class="form-label" for="limit-quantity">{{ t("limits.quantity") }}</label>
                        <input id="limit-quantity" v-model.number="form.quantity" type="number" min="0" step="1"
                            class="form-control" required />
                    </div>
                    <div v-if="[2, 3, 4].includes(form.limit_type)" class="col-12 col-md-6">
                        <label class="form-label" for="limit-price">{{ t("limits.price") }}</label>
                        <input id="limit-price" v-model.number="form.price" type="number" min="0" step="0.01"
                            class="form-control" required />
                    </div>
                </div>

                <div class="limit-form__toggles mt-3">
                    <label class="form-check"><input v-model="form.is_exceedable" class="form-check-input"
                            type="checkbox" />
                        <span class="form-check-label">{{ t("limits.is_exceedable") }}</span></label>
                    <label v-if="form.limit_type !== 1" class="form-check"><input v-model="form.is_tax"
                            class="form-check-input" type="checkbox" />
                        <span class="form-check-label">{{ t("limits.is_tax") }}</span></label>
                </div>
            </section>

            <section class="limit-form__section">
                <h2 class="h5">{{ t("limits.items") }}</h2>
                <div class="row g-2 align-items-end">
                    <div class="col-12 col-md-3">
                        <label class="form-label" for="item-kind">{{ t("limits.item_kind") }}</label>
                        <select id="item-kind" v-model.number="itemKind" class="form-select" @change="clearItemSearch">
                            <option :value="1">{{ t("limits.product") }}</option>
                            <option :value="2">{{ t("limits.category") }}</option>
                        </select>
                    </div>
                    <div class="col-12 col-md-9 position-relative">
                        <label class="form-label" for="item-search">{{ itemKind === 1 ? t("limits.product") :
                            t("limits.category")
                        }}</label>
                        <input id="item-search" v-model="itemSearch" class="form-control" autocomplete="off"
                            :placeholder="itemKind === 1 ? t('limits.search_product') : t('limits.search_category')"
                            @input="searchItems" />
                        <div v-if="itemLoading" class="small text-muted mt-1">{{ t("common.loading") }}</div>
                        <div v-if="itemOptions.length" class="limit-form__options">
                            <button v-for="item in itemOptions" :key="item.id" type="button" class="limit-form__option"
                                @click="addItem(item)">{{ item.name }} <span v-if="item.sku" class="text-muted">[{{
                                    item.sku
                                }}]</span></button>
                        </div>
                    </div>
                </div>
                <div v-if="form.limit_items.length" class="limit-form__tags mt-3">
                    <span v-for="item in form.limit_items" :key="`${item.limit_type}-${item.item_id}`"
                        class="limit-form__tag">
                        <span>{{ item.name }} <small class="text-muted">{{ item.limit_type === 1 ? t("limits.product") :
                            t("limits.category") }}</small></span>
                        <button type="button" class="btn-close" :aria-label="t('common.delete')"
                            @click="removeItem(item)" />
                    </span>
                </div>
                <p v-else class="small text-muted mt-2 mb-0">{{ t("limits.no_items") }}</p>
            </section>

            <section class="limit-form__section">
                <h2 class="h5">{{ t("limits.users") }}</h2>
                <p v-if="!form.unit_id" class="small text-muted">{{ t("limits.no_unit") }}</p>
                <template v-else>
                    <input v-model="userSearch" class="form-control" autocomplete="off"
                        :placeholder="t('limits.search_user')" @input="searchUsers" />
                    <div v-if="userLoading" class="small text-muted mt-1">{{ t("common.loading") }}</div>
                    <div v-if="userOptions.length" class="limit-form__options">
                        <button v-for="user in userOptions" :key="user.id" type="button" class="limit-form__option"
                            @click="addUser(user)">{{ user.name }} <span class="text-muted">{{ user.email
                            }}</span></button>
                    </div>
                    <div v-if="form.limit_users.length" class="limit-form__tags mt-3">
                        <span v-for="user in form.limit_users" :key="user.user_id" class="limit-form__tag">
                            <span>{{ user.name }} <small class="text-muted">{{ user.email }}</small></span>
                            <button type="button" class="btn-close" :aria-label="t('common.delete')"
                                @click="removeUser(user.user_id)" />
                        </span>
                    </div>
                    <p v-else class="small text-muted mt-2 mb-0">{{ t("limits.no_users") }}</p>
                </template>
            </section>

            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="goToList">{{ t("common.cancel")
                }}</button>
                <button type="submit" class="btn btn-primary" :disabled="saving || !form.unit_id || !form.name.trim()">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2" />{{ t("limits.save") }}
                </button>
            </div>
        </form>
    </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import axios from "axios";
import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";

interface SearchOption { id: number; name: string; sku?: string | null; email?: string | null }
interface LimitItemForm extends SearchOption { item_id: number; limit_type: 1 | 2 }
interface LimitUserForm extends SearchOption { user_id: number }

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const limitId = Number(route.params.id) || null;
const isEdit = computed(() => limitId !== null);
const saving = ref(false);
const errorMessage = ref("");
const paths = ref<Array<{ id: number; name: string }>>([]);
const unitOptions = ref<Array<{ id: number; name: string; number?: string }>>([]);
const selectedUnitName = ref("");
const unitSearch = ref("");
const itemKind = ref<1 | 2>(1);
const itemSearch = ref("");
const itemOptions = ref<SearchOption[]>([]);
const itemLoading = ref(false);
const userSearch = ref("");
const userOptions = ref<SearchOption[]>([]);
const userLoading = ref(false);
const timers: ReturnType<typeof setTimeout>[] = [];

const form = reactive({
    name: "",
    unit_id: null as number | null,
    path_id: null as number | null,
    limit_type: 1 as 1 | 2 | 3 | 4,
    time_limit: 1 as 1 | 2 | 3 | 4 | 5,
    quantity: null as number | null,
    price: null as number | null,
    is_exceedable: false,
    is_tax: false,
    date_start: "",
    date_end: "",
    limit_items: [] as LimitItemForm[],
    limit_users: [] as LimitUserForm[],
});

const goToList = () => router.push({ name: "admin.limits" });

const loadPaths = async () => {
    paths.value = [];
    form.path_id = null;
    if (!form.unit_id) return;
    const { data } = await api.get(`/limits/paths`, { params: { unit_id: form.unit_id } });
    paths.value = data;
};

const searchUnits = () => {
    const search = unitSearch.value.trim();
    const timer = setTimeout(async () => {
        if (search.length < 2) {
            unitOptions.value = [];
            return;
        }
        try {
            const { data } = await api.get("/units/search", { params: { q: search } });
            unitOptions.value = data.data ?? [];
        } catch {
            unitOptions.value = [];
        }
    }, 250);
    timers.push(timer);
};

const selectUnit = (unit: { id: number; name: string }) => {
    form.unit_id = unit.id;
    selectedUnitName.value = unit.name;
    unitSearch.value = unit.name;
    unitOptions.value = [];
    form.limit_users = [];
    void loadPaths();
};

const searchItems = () => {
    const search = itemSearch.value.trim();
    const timer = setTimeout(async () => {
        if (search.length < 2) {
            itemOptions.value = [];
            return;
        }
        itemLoading.value = true;
        try {
            const type = itemKind.value === 1 ? "products" : "categories";
            const { data } = await api.get(`/limits/items/${type}`, { params: { search } });
            itemOptions.value = data ?? [];
        } catch {
            itemOptions.value = [];
        } finally {
            itemLoading.value = false;
        }
    }, 250);
    timers.push(timer);
};

const clearItemSearch = () => {
    itemSearch.value = "";
    itemOptions.value = [];
};

const addItem = (item: SearchOption) => {
    const limitType = itemKind.value;
    if (!form.limit_items.some((existing) => existing.item_id === item.id && existing.limit_type === limitType)) {
        form.limit_items.push({ ...item, item_id: item.id, limit_type: limitType });
    }
    clearItemSearch();
};

const removeItem = (item: LimitItemForm) => {
    form.limit_items = form.limit_items.filter((existing) => !(existing.item_id === item.item_id && existing.limit_type === item.limit_type));
};

const searchUsers = () => {
    const search = userSearch.value.trim();
    const unitId = form.unit_id;
    const timer = setTimeout(async () => {
        if (!unitId || search.length < 2) {
            userOptions.value = [];
            return;
        }
        userLoading.value = true;
        try {
            const { data } = await api.get("/limits/users", { params: { unit_id: unitId, search } });
            userOptions.value = data ?? [];
        } catch {
            userOptions.value = [];
        } finally {
            userLoading.value = false;
        }
    }, 250);
    timers.push(timer);
};

const addUser = (user: SearchOption) => {
    if (!form.limit_users.some((existing) => existing.user_id === user.id)) {
        form.limit_users.push({ ...user, user_id: user.id });
    }
    userSearch.value = "";
    userOptions.value = [];
};

const removeUser = (userId: number) => {
    form.limit_users = form.limit_users.filter((user) => user.user_id !== userId);
};

const dateInput = (value?: string | null) => value ? value.slice(0, 10) : "";

const loadLimit = async () => {
    if (!limitId) return;
    ui.showLoader();
    try {
        const { data } = await api.get(`/limits/${limitId}`);
        form.name = data.name ?? "";
        form.unit_id = data.unit_id;
        selectedUnitName.value = data.unit?.name ?? "";
        unitSearch.value = selectedUnitName.value;
        form.path_id = data.path_id;
        form.limit_type = data.limit_type;
        form.time_limit = data.time_limit;
        form.quantity = data.quantity;
        form.price = data.price;
        form.is_exceedable = data.is_exceedable ?? false;
        form.is_tax = data.is_tax ?? false;
        form.date_start = dateInput(data.date_start);
        form.date_end = dateInput(data.date_end);
        form.limit_items = (data.limit_items ?? []).map((item: any) => ({
            id: item.item_id,
            item_id: item.item_id,
            limit_type: item.limit_type,
            name: item.name,
            sku: item.sku,
        }));
        form.limit_users = (data.limit_users ?? []).map((user: any) => ({
            id: user.user_id,
            user_id: user.user_id,
            name: user.name,
            email: user.email,
        }));
        const { data: pathOptions } = await api.get("/limits/paths", { params: { unit_id: form.unit_id } });
        paths.value = pathOptions;
    } catch (error) {
        console.error("Load limit failed", error);
        errorMessage.value = t("limits.save_error");
    } finally {
        ui.hideLoader();
    }
};

const save = async () => {
    errorMessage.value = "";
    if (!form.unit_id || !form.name.trim()) {
        errorMessage.value = t("limits.invalid_form");
        return;
    }
    saving.value = true;
    const payload = {
        ...form,
        quantity: [2].includes(form.limit_type) ? null : form.quantity,
        price: [1].includes(form.limit_type) ? null : form.price,
        is_tax: form.limit_type !== 1 && form.is_tax,
        date_start: form.time_limit === 5 ? form.date_start : null,
        date_end: form.time_limit === 5 ? form.date_end : null,
        limit_items: form.limit_items.map(({ item_id, limit_type }) => ({ item_id, limit_type })),
        limit_users: form.limit_users.map(({ user_id }) => ({ user_id })),
    };
    try {
        if (limitId) {
            await api.put(`/limits/${limitId}`, payload);
            ui.showSuccess(t("limits.updated"));
        } else {
            await api.post("/limits", payload);
            ui.showSuccess(t("limits.created"));
        }
        await goToList();
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 422) {
            errorMessage.value = Object.values(error.response.data.errors ?? {}).flat().join(" ") || t("limits.invalid_form");
        } else {
            console.error("Save limit failed", error);
            errorMessage.value = t("limits.save_error");
        }
    } finally {
        saving.value = false;
    }
};

onMounted(loadLimit);
onUnmounted(() => timers.forEach(clearTimeout));
</script>

<style scoped>
.limit-form {
    display: grid;
    gap: 20px;
}

.limit-form__section {
    border-top: 1px solid #d9e0e5;
    padding-top: 18px;
}

.limit-form__toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 24px;
}

.limit-form__options {
    position: absolute;
    z-index: 5;
    top: 100%;
    right: 0;
    left: 0;
    max-height: 240px;
    overflow-y: auto;
    background: white;
    border: 1px solid #cbd3d9;
    box-shadow: 0 4px 12px #1525361a;
}

.limit-form__option {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 8px 12px;
    border: 0;
    background: white;
    text-align: left;
}

.limit-form__option:hover {
    background: #f1f5f4;
}

.limit-form__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.limit-form__tag {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 6px 9px;
    border: 1px solid #d4dcdf;
    border-radius: 4px;
    background: #f8faf9;
}
</style>