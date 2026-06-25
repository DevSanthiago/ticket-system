import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input,
    VStack, FormErrorMessage, Select, InputGroup, InputRightElement, IconButton, HStack, Box
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaTrash } from "react-icons/fa";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../types";
import { api } from "../../services/api";
import { Alert } from "../../services/alertService";
import { useColorModeValue } from "../../hooks/useColorModeValue";

interface User {
    id: number;
    username: string;
    fullName: string;
    email: string;
    registration: string;
    role: string;
    resolverDepartment?: string;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user?: User | null;
}

const ROLES = [
    { value: "Requester", label: "Requester" },
    { value: "SetupAgent", label: "Agente Setup" },
    { value: "AutomationAgent", label: "Agente Automação" },
    { value: "TestAgent", label: "Agente Teste" },
    { value: "Admin", label: "Admin" },
];

const DEPARTMENTS = [
    { value: "0", label: "Automação" },
    { value: "1", label: "Setup" },
    { value: "2", label: "Teste" },
    { value: "3", label: "Engenharia" },
    { value: "4", label: "Produção" },
];

export const UserModal = ({ isOpen, onClose, onSuccess, user }: UserModalProps) => {
    const isDarkMode = useColorModeValue(false, true);
    const modalBg = useColorModeValue("white", "black");
    const borderColor = useColorModeValue("gray.200", "gray.800");
    const textColor = useColorModeValue("gray.800", "white");
    const inputBg = useColorModeValue("gray.50", "gray.900");

    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        registration: "",
        password: "",
        role: "Requester",
        resolverDepartment: "",
    });

    const [errors, setErrors] = useState({
        username: "",
        fullName: "",
        email: "",
        registration: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData({
                    username: user.username,
                    fullName: user.fullName,
                    email: user.email,
                    registration: user.registration,
                    password: "",
                    role: user.role,
                    resolverDepartment: user.resolverDepartment?.toString() || "",
                });
            } else {
                setFormData({
                    username: "",
                    fullName: "",
                    email: "",
                    registration: "",
                    password: "",
                    role: "Requester",
                    resolverDepartment: "",
                });
            }
            setErrors({
                username: "",
                fullName: "",
                email: "",
                registration: "",
                password: "",
            });
        }
    }, [isOpen, user]);

    const validateEmail = (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleDelete = async () => {
        if (!user) return;

        const confirmed = await Alert.confirm(
            "Excluir Usuário",
            `Deseja realmente excluir o usuário ${user.fullName}?`,
            isDarkMode
        );

        if (confirmed) {
            try {
                setLoading(true);
                await api.delete(API_ENDPOINTS.ADMIN_COCKPIT.DELETE_USER(user.id));
                Alert.success("Sucesso", "Usuário removido com sucesso", isDarkMode);
                onSuccess();
                onClose();
            } catch (error) {
                const err = error as AxiosError<ApiErrorResponse>;
                Alert.error("Erro", err.response?.data?.message || "Erro ao excluir usuário", isDarkMode);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async () => {
        const newErrors = {
            username: !formData.username.trim() ? "Username é obrigatório" : "",
            fullName: !formData.fullName.trim() ? "Nome completo é obrigatório" : "",
            email: !formData.email.trim()
                ? "Email é obrigatório"
                : !validateEmail(formData.email)
                    ? "Email inválido"
                    : "",
            registration: !formData.registration.trim()
                ? "Matrícula é obrigatória"
                : "",
            password:
                !user && !formData.password.trim()
                    ? "Senha é obrigatória"
                    : formData.password && formData.password.length < 6
                        ? "Senha deve ter no mínimo 6 caracteres"
                        : "",
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some(error => error !== "")) return;

        try {
            setLoading(true);

            const payload: Record<string, unknown> = {
                username: formData.username.trim(),
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                registration: formData.registration.trim(),
                role: formData.role,
                resolverDepartment: formData.resolverDepartment !== ""
                    ? parseInt(formData.resolverDepartment)
                    : null,
            };

            if (user) {
                if (formData.password.trim()) {
                    payload.password = formData.password.trim();
                }
                await api.put(API_ENDPOINTS.ADMIN_COCKPIT.UPDATE_USER(user.id), payload);
                Alert.success("Sucesso", "Usuário atualizado com sucesso!", isDarkMode);
            } else {
                payload.password = formData.password.trim();
                await api.post(API_ENDPOINTS.ADMIN_COCKPIT.CREATE_USER, payload);
                Alert.success("Sucesso", "Usuário criado com sucesso!", isDarkMode);
            }

            onSuccess();
            onClose();
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            Alert.error(
                user ? "Erro ao atualizar" : "Erro ao criar",
                err.response?.data?.message || "Ocorreu um erro inesperado",
                isDarkMode
            );
        } finally {
            setLoading(false);
        }
    };

    const needsDepartment = ["Requester", "SetupAgent", "AutomationAgent", "TestAgent", "Admin"].includes(formData.role);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent
                bg={modalBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
            >
                <ModalHeader color={textColor} borderBottomWidth="1px" borderColor={borderColor}>
                    {user ? "Editar Usuário" : "Novo Usuário"}
                </ModalHeader>
                <ModalCloseButton color={textColor} />

                <ModalBody py={6}>
                    <VStack spacing={4} align="stretch">
                        <FormControl isInvalid={!!errors.fullName} isRequired>
                            <FormLabel color={textColor} fontSize="sm" fontWeight="bold">Nome Completo</FormLabel>
                            <Input
                                bg={inputBg}
                                borderColor={borderColor}
                                color={textColor}
                                placeholder="Ex: Gabriele Silva"
                                value={formData.fullName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                            />
                            <FormErrorMessage>{errors.fullName}</FormErrorMessage>
                        </FormControl>

                        <HStack spacing={4}>
                            <FormControl isInvalid={!!errors.username} isRequired>
                                <FormLabel color={textColor} fontSize="sm" fontWeight="bold">Username</FormLabel>
                                <Input
                                    bg={inputBg}
                                    borderColor={borderColor}
                                    color={textColor}
                                    placeholder="gabriele.silva"
                                    value={formData.username}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                                    _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                                />
                                <FormErrorMessage>{errors.username}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={!!errors.registration} isRequired>
                                <FormLabel color={textColor} fontSize="sm" fontWeight="bold">Matrícula</FormLabel>
                                <Input
                                    bg={inputBg}
                                    borderColor={borderColor}
                                    color={textColor}
                                    placeholder="12345"
                                    value={formData.registration}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, registration: e.target.value }))}
                                    _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                                />
                                <FormErrorMessage>{errors.registration}</FormErrorMessage>
                            </FormControl>
                        </HStack>

                        <FormControl isInvalid={!!errors.email} isRequired>
                            <FormLabel color={textColor} fontSize="sm" fontWeight="bold">Email</FormLabel>
                            <Input
                                bg={inputBg}
                                borderColor={borderColor}
                                color={textColor}
                                type="email"
                                placeholder="joao.silva@empresa.com.br"
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                            />
                            <FormErrorMessage>{errors.email}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.password} isRequired={!user}>
                            <FormLabel color={textColor} fontSize="sm" fontWeight="bold">
                                Senha {user && "(opcional)"}
                            </FormLabel>
                            <InputGroup>
                                <Input
                                    bg={inputBg}
                                    borderColor={borderColor}
                                    color={textColor}
                                    type={showPassword ? "text" : "password"}
                                    placeholder={user ? "Em branco para manter" : "Mínimo 6 caracteres"}
                                    value={formData.password}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                    _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label="Toggle password"
                                        icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                                        onClick={() => setShowPassword(!showPassword)}
                                        variant="ghost"
                                        size="sm"
                                        color={textColor}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{errors.password}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel color={textColor} fontSize="sm" fontWeight="bold">Papel/Função</FormLabel>
                            <Select
                                bg={inputBg}
                                borderColor={borderColor}
                                color={textColor}
                                value={formData.role}
                                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                            >
                                {ROLES.map((role) => (
                                    <option key={role.value} value={role.value} style={{ background: modalBg }}>
                                        {role.label}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        {needsDepartment && (
                            <FormControl isRequired>
                                <FormLabel color={textColor} fontSize="sm" fontWeight="bold">Departamento</FormLabel>
                                <Select
                                    bg={inputBg}
                                    borderColor={borderColor}
                                    color={textColor}
                                    value={formData.resolverDepartment}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, resolverDepartment: e.target.value }))}
                                    placeholder="Selecione um departamento"
                                    _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                                >
                                    {DEPARTMENTS.map((dept) => (
                                        <option key={dept.value} value={dept.value} style={{ background: modalBg }}>
                                            {dept.label}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter borderTopWidth="1px" borderColor={borderColor} justifyContent="space-between">
                    <Box>
                        {user && (
                            <Button
                                leftIcon={<FaTrash />}
                                colorScheme="red"
                                variant="ghost"
                                onClick={handleDelete}
                                isLoading={loading}
                            >
                                Excluir
                            </Button>
                        )}
                    </Box>
                    <HStack spacing={3}>
                        <Button variant="ghost" onClick={onClose} color={textColor}>
                            Cancelar
                        </Button>
                        <Button
                            variant="outline"
                            colorScheme="blue"
                            onClick={handleSubmit}
                            isLoading={loading}
                            px={8}
                        >
                            {user ? "Atualizar" : "Criar Usuário"}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};