import { useState } from "react";
import { Button, Icon, Spinner } from "@chakra-ui/react";
import { FaWhatsapp } from "react-icons/fa";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { AxiosError } from "axios";
import type { ApiErrorResponse, TicketResolverWhatsappTransportProps, TransportResponse } from "../types";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { Alert } from "../services/alertService";

export const TicketResolverWhatsappTransport = ({
    ticketId,
    department,
    actionType,
    buttonText
}: TicketResolverWhatsappTransportProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const isDarkMode = useColorModeValue(false, true);

    const getEndpoint = () => {
        const d = department.toLowerCase();
        if (d === "automation") {
            return actionType === "start"
                ? API_ENDPOINTS.TICKET_ACTIONS.AUTOMATION_START(ticketId)
                : API_ENDPOINTS.TICKET_ACTIONS.AUTOMATION_RESOLVE(ticketId);
        }
        if (d === "setup") {
            return actionType === "start"
                ? API_ENDPOINTS.TICKET_ACTIONS.SETUP_START(ticketId)
                : API_ENDPOINTS.TICKET_ACTIONS.SETUP_RESOLVE(ticketId);
        }
        if (d === "test") {
            return actionType === "start"
                ? API_ENDPOINTS.TICKET_ACTIONS.TEST_START(ticketId)
                : API_ENDPOINTS.TICKET_ACTIONS.TEST_RESOLVE(ticketId);
        }
        if (d === "software") {
            return actionType === "start"
                ? API_ENDPOINTS.TICKET_ACTIONS.SOFTWARE_START(ticketId)
                : API_ENDPOINTS.TICKET_ACTIONS.SOFTWARE_RESOLVE(ticketId);
        }
        return "";
    };

    const handleAction = async () => {
        setIsLoading(true);
        try {
            const endpoint = getEndpoint();
            const { data } = await api.get<TransportResponse>(endpoint);
            try {
                await navigator.clipboard.writeText(data.message);
                Alert.toast("Mensagem copiada! Cole no grupo do WhatsApp.", "success", isDarkMode);
            } catch (err) {
                console.error("Erro ao copiar", err);
            }
            setTimeout(() => {
                window.open(data.url, "_blank");
            }, 1000);
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            Alert.toast(err.response?.data?.message || "Erro ao processar ação.", "error", isDarkMode);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            leftIcon={isLoading ? <Spinner size="xs" /> : <Icon as={FaWhatsapp} />}
            bg="#25D366"
            color="white"
            _hover={{ bg: "#128C7E" }}
            w="full"
            size="md"
            onClick={handleAction}
            isLoading={isLoading}
            loadingText="Processando..."
        >
            {buttonText || (actionType === "start" ? "Avisar que Assumi" : "Avisar Finalização")}
        </Button>
    );
};