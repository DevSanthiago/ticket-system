export const formatDateTime = (
    value?: string | Date | null
): string => {
    if (!value) return "—";

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
};

export const formatDate = (
    value?: string | Date | null
): string => {
    if (!value) return "—";

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
    }).format(date);
};

export const formatTime = (
    value?: string | Date | null
): string => {
    if (!value) return "—";

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-BR", {
        timeStyle: "short",
    }).format(date);
};
