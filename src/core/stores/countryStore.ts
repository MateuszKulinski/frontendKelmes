import { defineStore } from "pinia";
import api from "../api/axios";

type Country = {
    id: number;
    code: string;
    name: string;
};

export const useCountryStore = defineStore("country", {
    state: () => ({
        countries: [] as Country[],
    }),

    actions: {
        async fetchCountries() {
            const { data } = await api.get("/countries");

            this.countries = Array.isArray(data) ? data : data.data;
        },
    },
});

