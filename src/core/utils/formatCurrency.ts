export const formatCurrency = (
    value: number,
    currency = "PLN",
    locale = "pl-PL"
): string => {

    return new Intl.NumberFormat(locale, {

        style: "currency",

        currency,

        minimumFractionDigits: 2,

        maximumFractionDigits: 2,

    }).format(value);
};