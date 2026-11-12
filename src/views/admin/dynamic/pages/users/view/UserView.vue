<template>

    <!-- ⏳ LOADING -->
    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border"></div>
    </div>

    <!-- 📄 DATA -->
    <template v-else-if="user">

        <!-- 👤 USER -->
        <BigCard :title="user.name">

            <template #actions>
                <span class="badge bg-primary">
                    {{ user.permission?.display_name }}
                </span>
            </template>

            <div class="row g-3">

                <Info :label="t('user.login')" :value="user.name" />
                <Info :label="t('user.email')" :value="user.email" />

                <Info :label="t('user.firstname')" :value="user.firstname" />
                <Info :label="t('user.lastname')" :value="user.lastname" />

                <Info :label="t('user.phone')" :value="user.phone" />

                <Info :label="t('user.main_unit')" :value="user.unit?.name" />

                <Info :label="t('user.role')" :value="user.permission?.display_name" />

                <Info :label="t('user.language')" :value="user.lang?.name" />

                <Info :label="t('user.assign_agent')"
                    :value="user.agent ? user.agent.firstname + ' ' + user.agent.lastname : '-'" />

                <Info :label="t('user.status')" :value="user.is_active ? t('common.active') : t('common.inactive')" />

            </div>

        </BigCard>

        <BigCard v-if="user.units?.length" :title="t('user.additional_access')" class="mt-3">
            <ul class="list-group">
                <li v-for="u in user.units" :key="u.id" class="list-group-item">
                    {{ u.name }}
                </li>
            </ul>
        </BigCard>

        <BigCard v-if="user.modules?.length" :title="t('user.modules')" class="mt-3">
            <ul class="list-group">
                <li v-for="m in user.modules" :key="m.id" class="list-group-item">
                    {{ m.name }}
                </li>
            </ul>
        </BigCard>

    </template>

    <!-- ❌ BRAK -->
    <div v-else class="alert alert-warning">
        {{ t('user.not_found') }}
    </div>

</template>

<script setup lang="ts">
import { useUser } from "./UserView";
import Info from "@shared/ui/Info.vue";
import BigCard from "@shared/components/BigCard.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { user, loading } = useUser();
</script>