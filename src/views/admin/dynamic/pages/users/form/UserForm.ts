import { reactive, ref, onMounted } from "vue";
import { useUnitSearch } from "@/composables/useUnitSearch";
import { useLangStore } from "@/core/stores/langStore";
import api from "@/core/api/axios";
import { useI18n } from "vue-i18n";


type Unit = {
    id: number;
    name: string;
};

type Permission = {
    id: number;
    permission_name: string;
    display_name: string;
};

type Agent = {
    id: number;
    firstname: string;
    lastname: string;
};

type Module = {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_superadmin: boolean;
    checked: boolean;
    disabled: boolean;
};

type Address = {
    id: number;
    unit_id: number;
    alias: string | null;
    company: string | null;
    firstname: string | null;
    lastname: string | null;
    postcode: string | null;
    city: string | null;
    street: string | null;
    house_number: string | null;
    apartment: string | null;
    is_main: boolean | null;
};

export function useUserForm(
    emit: (e: "submit", form: any) => void,
    options?: { isEdit?: boolean }
) {
    const langStore = useLangStore();
    const isEdit = options?.isEdit ?? false;

    const permissions = ref<Permission[]>([]);
    const agents = ref<Agent[]>([]);
    const modules = ref<Module[]>([]);
    const { t } = useI18n();

    const form = reactive({
        name: "",
        email: "",
        password: "",
        firstname: "",
        lastname: "",
        phone: "",

        unit_id: null as number | null,
        units: [] as number[],

        lang_id: null as number | null,

        show_net_price: true,
        show_gross_price: true,
        is_active: true,

        permission_id: null as number | null,
        agent_id: null as number | null,

        modules: [] as number[],
        send_email: false,
        addresses: [] as number[],
    });

    const setBackendErrors = (backendErrors: Record<string, string[]>) => {
        Object.keys(errors).forEach(k => (errors[k] = ""));
        for (const key in backendErrors) {
            errors[key] = backendErrors[key][0];
        }
    };

    const errors = reactive<Record<string, string>>({});

    const validate = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        errors.name = form.name ? "" : t("user.login_required");

        errors.email = !form.email
            ? t("user.email_required")
            : !emailRegex.test(form.email)
                ? t("user.email_invalid")
                : "";

        errors.password = isEdit
            ? ""
            : form.password
                ? ""
                : t("user.password_required");

        errors.firstname = form.firstname ? "" : t("user.firstname_required");
        errors.lastname = form.lastname ? "" : t("user.lastname_required");
        errors.unit_id = form.unit_id ? "" : t("user.unit_required");
        errors.permission_id = form.permission_id ? "" : t("user.permission_required");
        errors.lang_id = form.lang_id ? "" : t("user.language_required");

        return !Object.values(errors).some(e => e);
    };

    const fetchFormData = async () => {
        try {
            const { data } = await api.get("/users/formData");

            permissions.value = data.permissions;
            agents.value = data.agents;
            modules.value = data.modules;

            // 🎯 domyślnie zaznaczone moduły
            form.modules = modules.value
                .filter(m => m.checked)
                .map(m => m.id);

            // 🎯 domyślna rola "user" tylko przy tworzeniu
            if (!isEdit && !form.permission_id) {
                const userRole = permissions.value.find(
                    p => p.permission_name === "user"
                );

                if (userRole) {
                    form.permission_id = userRole.id;
                }
            }

        } catch (e) {
            console.error("Form data fetch failed", e);
        }
    };

    const toggleModule = (id: number) => {
        const module = modules.value.find(m => m.id === id);

        if (!module || module.disabled) return;

        if (form.modules.includes(id)) {
            form.modules = form.modules.filter(m => m !== id);
        } else {
            form.modules.push(id);
        }
    };

    const { query, units, search } = useUnitSearch();

    const selectedMainUnit = ref<Unit | null>(null);
    const selectedUnits = ref<Unit[]>([]);
    const addresses = ref<Address[]>([]);

    const langs = langStore.langs;

    const onSearch = (q: string) => {
        query.value = q;
        search();
    };

    const onSelectMainUnit = async (unit: Unit) => {
        form.unit_id = unit.id;
        selectedMainUnit.value = unit;

        await fetchAddresses(unit.id);
        syncAddresses();
    };

    const onSelectUnit = async (unit: Unit) => {
        if (form.units.includes(unit.id)) return;

        form.units.push(unit.id);
        selectedUnits.value.push(unit);

        await fetchAddresses(unit.id);
        syncAddresses();
    };

    const removeUnit = (id: number) => {
        form.units = form.units.filter(unitId => unitId !== id);

        selectedUnits.value = selectedUnits.value.filter(
            unit => unit.id !== id
        );

        syncAddresses();
    };

    const submit = () => {
        if (!validate()) return;

        let payload;

        if (isEdit && !form.password) {
            const { password, ...rest } = form;
            payload = rest;
        } else {
            payload = { ...form };
        }

        emit("submit", payload);
    };

    // 🌍 default lang
    if (langs.length && !form.lang_id) {
        const pl =
            langs.find(l => l.code === "pl") ||
            langs.find(l => l.is_default);

        if (pl) {
            form.lang_id = pl.id;
        }
    }

    onMounted(async () => {
        await fetchFormData();
    });

    const setFormData = async (data: any) => {
        form.name = data.name ?? "";
        form.email = data.email ?? "";
        form.firstname = data.firstname ?? "";
        form.lastname = data.lastname ?? "";
        form.phone = data.phone ?? "";

        const mainUnitId = data.unit_id ?? data.unit?.id;
        form.unit_id = mainUnitId != null
            ? Number(mainUnitId)
            : null;

        selectedMainUnit.value = data.unit ?? null;

        form.units = (data.units ?? []).map(
            (u: any) => Number(u.id)
        );

        selectedUnits.value = data.units ?? [];

        const permissionId =
            data.permission_id ??
            data.permission?.id ??
            data.collection?.id;
        form.permission_id = permissionId != null
            ? Number(permissionId)
            : null;
        form.agent_id = data.agent_id;
        form.lang_id = data.lang_id;

        form.show_net_price = data.show_net_price;
        form.show_gross_price = data.show_gross_price;
        form.is_active = data.is_active;

        form.modules = (data.modules ?? []).map(
            (m: any) => Number(m.id)
        );

        form.password = "";

        const assignedAddresses: Address[] = (data.addresses ?? []).map(
            (address: Address) => ({
                ...address,
                id: Number(address.id),
                unit_id: Number(address.unit_id),
            })
        );

        form.addresses = assignedAddresses.map(address => address.id);
        addresses.value = assignedAddresses;

        const unitIds = [
            ...new Set([
                ...(form.unit_id !== null ? [form.unit_id] : []),
                ...form.units,
            ]),
        ];

        await Promise.all(
            unitIds.map(unitId => fetchAddresses(unitId))
        );

        syncAddresses();
    };

    const fetchAddresses = async (unitId: number) => {
        try {
            const { data } = await api.get(
                `/units/${unitId}/addresses`
            );

            const fetchedAddresses: Address[] = (
                data.addresses ?? []
            ).map((address: Address) => ({
                ...address,
                id: Number(address.id),
                unit_id: Number(address.unit_id),
            }));

            const current = new Map(
                addresses.value.map(address => [
                    Number(address.id),
                    address,
                ])
            );

            fetchedAddresses.forEach(address => {
                current.set(address.id, address);
            });

            addresses.value = Array.from(current.values());
        } catch (e) {
            console.error(
                `Failed to fetch addresses for unit ${unitId}`,
                e
            );
        }
    };

    const syncAddresses = () => {
        const unitIds = new Set<number>([
            ...(form.unit_id !== null ? [Number(form.unit_id)] : []),
            ...form.units.map(Number),
        ]);

        addresses.value = addresses.value.filter(
            address => unitIds.has(Number(address.unit_id))
        );

        const addressUnitIds = new Map(
            addresses.value.map(address => [
                Number(address.id),
                Number(address.unit_id),
            ])
        );

        form.addresses = [...new Set(form.addresses.map(Number))]
            .filter(addressId => {
                const unitId = addressUnitIds.get(addressId);
                return unitId !== undefined && unitIds.has(unitId);
            });
    };

    const toggleAddress = (id: number) => {
        if (form.addresses.includes(id)) {
            form.addresses = form.addresses.filter(
                addressId => addressId !== id
            );
        } else {
            form.addresses.push(id);
        }
    };

    return {
        form,
        errors,

        units,
        selectedUnits,
        selectedMainUnit,

        langs,
        permissions,
        agents,
        modules,

        onSearch,
        onSelectUnit,
        onSelectMainUnit,
        removeUnit,

        toggleModule,
        submit,

        setBackendErrors,
        setFormData,

        addresses,
        toggleAddress
    };
}