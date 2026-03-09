import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, FormControl, FormLabel, Input, VStack, FormErrorMessage, useToast
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { AxiosError } from "axios";
import type { ApiErrorResponse, PrefixModalProps, CreateLinePrefixDto } from "../../types/index";

export const PrefixModal = ({ isOpen, onClose, onSuccess }: PrefixModalProps) => {
    const [formData, setFormData] = useState<CreateLinePrefixDto>({ value: "", label: "" });
    const [errors, setErrors] = useState({ value: "", label: "" });
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const borderColor = "gray.800";
    const inputBg = "gray.900";

    useEffect(() => {
        if (isOpen) {
            setFormData({ value: "", label: "" });
            setErrors({ value: "", label: "" });
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        const newErrors = {
            value: !formData.value.trim() ? "O valor do prefixo é obrigatório" : "",
            label: !formData.label.trim() ? "O rótulo é obrigatório" : ""
        };

        setErrors(newErrors);

        if (newErrors.value || newErrors.label) return;

        try {
            setLoading(true);
            await api.post(API_ENDPOINTS.ADMIN_COCKPIT.CREATE_PREFIX, {
                value: formData.value.toUpperCase().trim(),
                label: formData.label.trim()
            });

            toast({ title: "Prefixo criado com sucesso!", status: "success", duration: 3000 });
            onSuccess();
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            toast({
                title: "Erro ao criar prefixo",
                description: err.response?.data?.message || "Erro inesperado",
                status: "error",
                duration: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent
                bg="black"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
                color="white"
            >
                <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
                    Novo Prefixo de Linha
                </ModalHeader>
                <ModalCloseButton color="white" />

                <ModalBody py={6}>
                    <VStack spacing={4}>
                        <FormControl isInvalid={!!errors.value} isRequired>
                            <FormLabel fontSize="sm" fontWeight="bold">Valor (Sigla)</FormLabel>
                            <Input
                                placeholder="Ex: MB, ML"
                                value={formData.value}
                                bg={inputBg}
                                borderColor={borderColor}
                                color="white"
                                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                                _placeholder={{ color: "gray.600" }}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value.toUpperCase() })}
                            />
                            <FormErrorMessage>{errors.value}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.label} isRequired>
                            <FormLabel fontSize="sm" fontWeight="bold">Rótulo (Exibição)</FormLabel>
                            <Input
                                placeholder="Ex: Linhas MB, Laboratório"
                                value={formData.label}
                                bg={inputBg}
                                borderColor={borderColor}
                                color="white"
                                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                                _placeholder={{ color: "gray.600" }}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            />
                            <FormErrorMessage>{errors.label}</FormErrorMessage>
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
                    <Button
                        variant="ghost"
                        mr={3}
                        onClick={onClose}
                        color="white"
                        _hover={{ bg: "gray.900" }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        colorScheme="blue"
                        variant="outline"
                        onClick={handleSubmit}
                        isLoading={loading}
                        px={8}
                    >
                        Criar Prefixo
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};