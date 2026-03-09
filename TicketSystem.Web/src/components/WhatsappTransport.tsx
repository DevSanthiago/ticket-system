import { Button, HStack } from "@chakra-ui/react";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import { AxiosError } from "axios";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type {
    ApiErrorResponse, TicketTransportResponse, SupportWhatsappTransportProps,
    TicketWhatsappTransportProps
} from "../types";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { Alert } from "../services/alertService";

export const SupportWhatsappTransport = ({
    type,
    isFullWidth = false
}: SupportWhatsappTransportProps) => {
    const isDarkMode = useColorModeValue(false, true);
    const [isLoading, setIsLoading] = useState(false);

    const handleRedirect = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get<TicketTransportResponse>(
                API_ENDPOINTS.SUPPORT.CONTACT_INFO(type)
            );

            try {
                await navigator.clipboard.writeText(data.message);
                Alert.toast("Mensagem copiada! Cole no grupo do WhatsApp.", "success", isDarkMode);
            } catch (err) {
                console.error("Erro ao copiar", err);
            }

            setTimeout(() => {
                window.open(data.url, "_blank");
            }, 1500);

        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            console.error(err);

            const errorMessage = err.response?.data?.message
                || "Não foi possível conectar ao suporte.";

            Alert.toast(errorMessage, "error", isDarkMode);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            leftIcon={<FaWhatsapp />}
            bg="#25D366"
            color="white"
            _hover={{ bg: "#128C7E" }}
            w={isFullWidth ? "full" : "auto"}
            onClick={handleRedirect}
            isLoading={isLoading}
            loadingText="Abrindo..."
        >
            Suporte
        </Button>
    );
};

export const TicketWhatsappTransport = ({
    ticketId,
    department,
    onSuccess
}: TicketWhatsappTransportProps) => {
    const isDarkMode = useColorModeValue(false, true);
    const [isLoading, setIsLoading] = useState(false);

    const handleTransport = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get<TicketTransportResponse>(
                API_ENDPOINTS.TICKET_TRANSPORT[department.toUpperCase() as keyof typeof API_ENDPOINTS.TICKET_TRANSPORT](ticketId)
            );

            try {
                await navigator.clipboard.writeText(data.message);
                Alert.toast("Mensagem copiada! Cole no grupo do WhatsApp.", "success", isDarkMode);
            } catch (err) {
                console.error("Erro ao copiar", err);
            }

            setTimeout(() => {
                window.open(data.url, "_blank");
            }, 1500);

            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            console.error(err);

            const errorMessage = err.response?.data?.message
                || "Não foi possível carregar as informações do ticket.";

            Alert.toast(errorMessage, "error", isDarkMode);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <HStack gap={3} w="full">
            <Button
                flex={1}
                leftIcon={<FaWhatsapp />}
                bg="#25D366"
                color="white"
                _hover={{ bg: "#128C7E" }}
                onClick={handleTransport}
                isLoading={isLoading}
                loadingText="Processando..."
            >
                Enviar para WhatsApp
            </Button>
        </HStack>
    );
};