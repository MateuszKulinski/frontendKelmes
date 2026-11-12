import { computed, onMounted, ref } from "vue";

import { useRoute, useRouter } from "vue-router";

import api from "@/core/api/axios";

import type {
  ClaimType,
  ClaimableDocument,
  ClaimDocumentPosition,
} from "@/composables/types/claims.ts";

import { useModalStore } from "@/core/stores/modalStore.ts";

import ClaimConfirmModal from "./ClaimConfirmModal.vue";

export function useClaimDocument() {
  const route = useRoute();
  const router = useRouter();

  const modalStore = useModalStore();

  const doc = ref<ClaimableDocument | null>(null);

  const loading = ref(false);
  const submitting = ref(false);
  const description = ref("");

  const documentFiles = ref<File[]>([]);

  const claimType = computed<ClaimType>(() =>
    Number(route.query.type) === 2 ? 2 : 1,
  );

  const isReturn = computed(() => claimType.value === 2);

  const actionKey = computed(() =>
    isReturn.value ? "claims.return" : "claims.claim",
  );

  const positions = computed(() => {
    return doc.value?.positions ?? [];
  });

  const hasItems = computed(() => {
    return positions.value.some(
      (position) => Number(position.form_quantity ?? 0) > 0,
    );
  });

  const fetchDocument = async () => {
    loading.value = true;

    try {
      const { data } = await api.get<ClaimableDocument>(
        `/claims/document/${route.params.id}/claimable`,
        {
          params: {
            claim_type: claimType.value,
          },
        },
      );

      doc.value = data;

      doc.value.positions.forEach((position) => {
        position.form_quantity = 0;
        position.form_notes = "";
        position.files = [];
      });
    } finally {
      loading.value = false;
    }
  };

  const onDocumentFiles = (event: Event) => {
    const input = event.target as HTMLInputElement;

    documentFiles.value = Array.from(input.files ?? []);
  };

  const onPositionFiles = (position: ClaimDocumentPosition, event: Event) => {
    const input = event.target as HTMLInputElement;

    position.files = Array.from(input.files ?? []);
  };

  const confirmSubmit = () => {
    modalStore.openModal(ClaimConfirmModal, {
      claimType: claimType.value,
      onConfirm: submit,
    });
  };

  const submit = async () => {
    if (!doc.value) {
      return;
    }

    submitting.value = true;

    try {
      const formData = new FormData();

      formData.append("claim_type", String(claimType.value));

      formData.append("document_id", String(doc.value.id));
      if (description.value.trim())
        formData.append("description", description.value.trim());

      const selectedPositions = positions.value.filter(
        (position) => Number(position.form_quantity ?? 0) > 0,
      );

      selectedPositions.forEach((position, index) => {
        formData.append(
          `items[${index}][document_position_id]`,
          String(position.id),
        );

        formData.append(
          `items[${index}][quantity_returned]`,
          String(position.form_quantity),
        );

        if (position.form_notes) {
          formData.append(`items[${index}][notes]`, position.form_notes);
        }

        position.files?.forEach((file) => {
          formData.append(`items[${index}][files][]`, file);
        });
      });

      documentFiles.value.forEach((file) => {
        formData.append("files[]", file);
      });

      const { data: createdClaim } = await api.post<{ id: number }>(
        "/claims",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      router.push({
        name: "panel.claims.detail",
        params: { id: createdClaim.id },
      });
    } finally {
      submitting.value = false;
    }
  };

  onMounted(fetchDocument);

  return {
    doc,
    positions,
    loading,
    submitting,
    description,
    claimType,
    isReturn,
    actionKey,
    hasItems,
    fetchDocument,
    onDocumentFiles,
    onPositionFiles,
    confirmSubmit,
  };
}
