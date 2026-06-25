import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
Input, Textarea, VStack, FormErrorMessage, Switch, HStack, Text, Select } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import type { AxiosError } from "axios";
import type { ApiErrorResponse, ProductionLineModalProps, PrefixOption, CreateProductionLineDto } from "../../types";
import { api } from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { Alert } from "../../services/alertService";
import { useColorModeValue } from "../../hooks/useColorModeValue";

export const ProductionLineModal = ({
    isOpen,
    onClose,
    onSuccess,
    line,
}: ProductionLineModalProps) => {
    const isDarkMode = useColorModeValue(false, true);
    

    const modalBg = useColorModeValue("white", "black");
    const borderColor = useColorModeValue("gray.200", "gray.800");
    const textColor = useColorModeValue("gray.800", "white");
    const inputBg = useColorModeValue("gray.50", "gray.900");

    const [availablePrefixes, setAvailablePrefixes] = useState<PrefixOption[]>([]);
    const [formData, setFormData] = useState<CreateProductionLineDto>({
        lineName: "",
        prefix: "",
        description: "",
        isActive: true,
    });

    const [errors, setErrors] = useState({
        lineName: "",
        prefix: "",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPrefixes = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.ADMIN_COCKPIT.GET_PREFIXES);
                setAvailablePrefixes(response.data);
            } catch (error) {
                console.error("Erro ao carregar prefixos", error);
            }
        };

        if (isOpen) {
            fetchPrefixes();
            if (line) {
                setFormData({
                    lineName: line.lineName,
                    prefix: line.prefix,
                    description: line.description || "",
                    isActive: line.isActive,
                });
            } else {
                setFormData({
                    lineName: "",
                    prefix: "",
                    description: "",
                    isActive: true,
                });
            }
            setErrors({ lineName: "", prefix: "" });
        }
    }, [isOpen, line]);

    const handleLineNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setFormData((prev) => ({ ...prev, lineName: value }));
        if (!value.trim()) {
            setErrors((prev) => ({ ...prev, lineName: "Nome da linha é obrigatório" }));
        } else {
            setErrors((prev) => ({ ...prev, lineName: "" }));
        }
    };

    const handleSubmit = async () => {
        const newErrors = {
            lineName: !formData.lineName.trim() ? "Nome da linha é obrigatório" : "",
            prefix: !formData.prefix ? "Prefixo é obrigatório" : "",
        };

        setErrors(newErrors);

        if (newErrors.lineName || newErrors.prefix) {
            return;
        }

        try {
            setLoading(true);
            const payload: CreateProductionLineDto = {
                ...formData,
                lineName: formData.lineName.trim(),
                description: formData.description?.trim() || null,
            };

            if (line) {
                await api.put(API_ENDPOINTS.ADMIN_COCKPIT.UPDATE_PRODUCTION_LINE(line.id), payload);
                Alert.success("Sucesso", "Linha atualizada com sucesso!", isDarkMode);
            } else {
                await api.post(API_ENDPOINTS.ADMIN_COCKPIT.CREATE_PRODUCTION_LINE, payload);
                Alert.success("Sucesso", "Linha criada com sucesso!", isDarkMode);
            }
            onSuccess();
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            Alert.error(
                line ? "Erro ao atualizar" : "Erro ao criar",
                axiosError.response?.data?.message || "Erro de conexão com o servidor",
                isDarkMode
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent
                bg={modalBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
                boxShadow="2xl"
            >
                <ModalHeader color={textColor} borderBottomWidth="1px" borderColor={borderColor}>
                    {line ? "Editar Linha de Produção" : "Nova Linha de Produção"}
                </ModalHeader>
                <ModalCloseButton color={textColor} />

                <ModalBody py={6}>
                    <VStack spacing={5} align="stretch">
                        <FormControl isInvalid={!!errors.lineName} isRequired>
                            <FormLabel color={textColor} fontSize="sm" fontWeight="bold">Nome da Linha</FormLabel>
                            <Input
                                placeholder="Ex: MB01, ML01"
                                value={formData.lineName}
                                onChange={handleLineNameChange}
                                textTransform="uppercase"
                                maxLength={50}
                                bg={inputBg}
                                borderColor={borderColor}
                                color={textColor}
                                _hover={{ borderColor: "blue.500" }}
                                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                            />
                            <FormErrorMessage>{errors.lineName}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.prefix} isRequired>
                            <FormLabel color={textColor} fontSize="sm" fontWeight="bold">Prefixo</FormLabel>
                            <Select
                                placeholder="Selecione um prefixo"
                                value={formData.prefix}
                                bg={inputBg}
                                borderColor={borderColor}
                                color={textColor}
                                onChange={(e) => setFormData(prev => ({ ...prev, prefix: e.target.value }))}
                                _hover={{ borderColor: "blue.500" }}
                                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                            >
                                {availablePrefixes.map((p) => (
                                    <option key={p.value} value={p.value} style={{ background: modalBg }}>
                                        {p.label} ({p.value})
                                    </option>
                                ))}
                            </Select>
                            <FormErrorMessage>{errors.prefix}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                            <FormLabel color={textColor} fontSize="sm" fontWeight="bold">Descrição (Opcional)</FormLabel>
                            <Textarea
                                placeholder="Descrição da linha de produção..."
                                value={formData.description ?? ""}
                                bg={inputBg}
                                borderColor={borderColor}
                                color={textColor}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                maxLength={200}
                                rows={3}
                                _hover={{ borderColor: "blue.500" }}
                                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                            />
                        </FormControl>

                        {line && (
                            <FormControl pt={2}>
                                <HStack justify="space-between" p={3} borderRadius="md" bg={inputBg} border="1px solid" borderColor={borderColor}>
                                    <FormLabel mb={0} color={textColor} fontSize="sm">Status da Linha</FormLabel>
                                    <HStack>
                                        <Text
                                            fontSize="xs"
                                            color={formData.isActive ? "green.400" : "red.400"}
                                            fontWeight="bold"
                                            textTransform="uppercase"
                                        >
                                            {formData.isActive ? "Ativa" : "Inativa"}
                                        </Text>
                                        <Switch
                                            colorScheme="green"
                                            isChecked={formData.isActive}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                                        />
                                    </HStack>
                                </HStack>
                            </FormControl>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
                    <Button variant="ghost" mr={3} onClick={onClose} color={textColor} _hover={{ bg: inputBg }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="outline"
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isLoading={loading}
                        px={8}
                    >
                        {line ? "Atualizar" : "Criar Linha"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};