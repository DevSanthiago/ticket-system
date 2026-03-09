import Swal, { type SweetAlertOptions } from "sweetalert2";

const THEME_COLORS = {
    blue: "#2563eb",
    red: "#d33",
    success: "#10b981",
    darkBg: "#000000",
    lightBg: "#ffffff",
};

export const showCustomAlert = (options: SweetAlertOptions, isDark: boolean) => {
    return Swal.fire({
        background: isDark ? THEME_COLORS.darkBg : THEME_COLORS.lightBg,
        color: isDark ? "#f1f5f9" : "#1e293b",
        confirmButtonColor: options.icon === 'error' ? THEME_COLORS.red : THEME_COLORS.blue,
        heightAuto: false,
        target: 'body',

        customClass: {
            container: 'swal-top-layer',
            popup: 'swal2-popup-custom',
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel'
        },

        didOpen: (modal: HTMLElement) => {
            const container = Swal.getContainer();
            if (container) {
                container.style.zIndex = '99999';
            }

            modal.style.zIndex = '100000';

            if (isDark) {
                modal.style.border = '1px solid #4a5568';
            } else {
                modal.style.border = '1px solid #e2e8f0';
            }
        },

        ...options,
    });
};

export const Alert = {
    success: (title: string, text?: string, isDark = false) =>
        showCustomAlert({ icon: 'success', title, text, timer: 2000, showConfirmButton: false }, isDark),

    error: (title: string, text?: string, isDark = false) =>
        showCustomAlert({ icon: 'error', title, text }, isDark),

    confirm: (title: string, text: string, isDark = false) =>
        showCustomAlert({
            icon: 'warning',
            title,
            text,
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar',
        }, isDark),
    toast: (title: string, icon: "success" | "error" | "warning" | "info" = "success", isDark = false) =>
        Swal.fire({
            toast: true,
            position: "top-end",
            icon,
            title,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: isDark ? THEME_COLORS.darkBg : THEME_COLORS.lightBg,
            color: isDark ? "#f1f5f9" : "#1e293b",
            didOpen: (toast) => {
                toast.addEventListener("mouseenter", Swal.stopTimer);
                toast.addEventListener("mouseleave", Swal.resumeTimer);
                const container = Swal.getContainer();
                if (container) {
                    container.style.zIndex = '999999';
                }
                toast.style.zIndex = '999999';
            },
            customClass: {
                popup: "swal2-toast-custom",
                container: "swal-toast-container"
            }
        }),
};
