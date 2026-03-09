export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/Auth/login'
    },
    SETUP_TICKETS: {
        BASE: '/setup-tickets',
        OPEN: '/setup-tickets/open',
        GET_ALL: '/setup-tickets',
        CHECK_PENDING: '/setup-tickets/check-pending-checklist',
        DOWNLOAD_PDF: (id: number) => `/setup-tickets/${id}/pdf`
    },
    AUTOMATION: {
        BASE: '/automation-tickets',
        OPEN: '/automation-tickets/open',
        GET_ALL: '/automation-tickets'
    },
    SOFTWARE: {
        BASE: '/software-tickets',
        OPEN: '/software-tickets/open',
        GET_ALL: '/software-tickets',
        START: (id: number) => `/software-tickets/${id}/start`,
        RESOLVE: (id: number) => `/software-tickets/${id}/resolve`
    },
    TEST: {
        BASE: '/test-tickets',
        OPEN: '/test-tickets/open',
        GET_ALL: '/test-tickets',
        START: (id: number) => `/test-tickets/${id}/start`,
        RESOLVE: (id: number) => `/test-tickets/${id}/resolve`
    },
    TICKET_TRANSPORT: {
        AUTOMATION: (id: number) => `/TicketTransport/automation/${id}`,
        SETUP: (id: number) => `/TicketTransport/setup/${id}`,
        TEST: (id: number) => `/TicketTransport/test/${id}`,
        SOFTWARE: (id: number) => `/TicketTransport/software/${id}`
    },
    TICKET_ACTIONS: {
        AUTOMATION_START: (id: number) => `/ticket-actions/automation/start/${id}`,
        AUTOMATION_RESOLVE: (id: number) => `/ticket-actions/automation/resolve/${id}`,

        SETUP_START: (id: number) => `/ticket-actions/setup/start/${id}`,
        SETUP_RESOLVE: (id: number) => `/ticket-actions/setup/resolve/${id}`,

        TEST_START: (id: number) => `/ticket-actions/test/start/${id}`,
        TEST_RESOLVE: (id: number) => `/ticket-actions/test/resolve/${id}`,

        SOFTWARE_START: (id: number) => `/ticket-actions/software/start/${id}`,
        SOFTWARE_RESOLVE: (id: number) => `/ticket-actions/software/resolve/${id}`
    },

    ADMIN_COCKPIT: {
        GET_ALL_PRODUCTION_LINES: '/admin-cockpit/production-lines',
        PRODUCTION_LINES_BY_PREFIX: '/admin-cockpit/production-lines/by-prefix',
        CREATE_PRODUCTION_LINE: '/admin-cockpit/production-lines',
        UPDATE_PRODUCTION_LINE: (id: number) => `/admin-cockpit/production-lines/${id}`,
        DELETE_PRODUCTION_LINE: (id: number) => `/admin-cockpit/production-lines/${id}`,
        DEACTIVATE_PRODUCTION_LINE: (id: number) => `/admin-cockpit/production-lines/${id}/deactivate`,
        ACTIVATE_PRODUCTION_LINE: (id: number) => `/admin-cockpit/production-lines/${id}/activate`,

        GET_PREFIXES: '/admin-cockpit/production-lines/prefixes',
        CREATE_PREFIX: '/admin-cockpit/production-lines/prefixes',
        DELETE_PREFIX: (id: number) => `/admin-cockpit/production-lines/prefixes/${id}`,
    },
    
    SUPPORT: {
        CONTACT_INFO: (type: string) => `/Support/contact-info?type=${type}`
    }
} as const;