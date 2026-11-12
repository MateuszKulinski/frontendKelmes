<template>
  <div class="col-12 col-md mb-3">
    <div class="footer-col small footer-company">
      <!-- LOGO -->
      <div class="mb-3">
        <img src="/img/logo.png" alt="Logo" class="footer-logo" />
      </div>

      <!-- ADRES -->
      <div v-if="company" class="mb-2 d-flex align-center">
        <span class="footer-icon">
          <BaseIcon name="location" />
        </span>
        <div>
          <b>{{ company?.name }}</b>, {{ fullAddress }}
        </div>
      </div>

      <!-- TELEFONY -->
      <div v-if="company?.phones?.length" class="mb-2 d-flex align-center">
        <span class="footer-icon">
          <BaseIcon name="phone" />
        </span>

        <div>
          <div v-for="(phone, i) in company.phones" :key="i">
            Tel:
            <a :href="`tel:${phone}`" class="text-decoration-none text-dark">
              {{ phone }}
            </a>
          </div>
        </div>
      </div>

      <!-- MAILE -->
      <div v-if="company?.emails?.length" class="mb-2 d-flex align-center">
        <span class="footer-icon">
          <BaseIcon name="email" />
        </span>

        <div>
          <div v-for="(email, i) in company.emails" :key="i">
            E-mail:
            <a :href="`mailto:${email}`" class="text-decoration-none text-dark">
              {{ email }}
            </a>
          </div>
        </div>
      </div>

      <!-- <div class="mb-2 d-flex align-items-center">
        <span class="footer-icon">
          <BaseIcon name="test" />
        </span>
        <span>{{ t("common.contact_form") }}</span>
      </div> -->
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed } from "vue";
import type { Company } from "@/core/stores/contentStore";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

const props = defineProps<{
  logoDark: string | null;
  company: Company | null;
}>();

const fullAddress = computed(() => {
  if (!props.company) return "";

  const a = props.company.address;
  return `${a.street} ${a.building_number}${a.local_number ? "/" + a.local_number : ""
    }, ${a.zip_code} ${a.city}`;
});
</script>


<style scoped>
.footer-logo {
  max-width: 9.375rem;
}

.footer-icon {
  width: var(--padding-lg);
  min-width: var(--padding-lg);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-right: var(--margin-md);
  color: #4F78BE;
}

.footer-company {
  font-size: var(--font-size-md-minus);
  margin-top: calc(0rem - var(--margin-xl));
}
</style>
