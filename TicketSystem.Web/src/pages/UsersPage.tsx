import {
    Box, Heading, Button, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, useDisclosure, Text, Spinner,
    Center, Input, InputGroup, InputLeftElement, Menu, MenuButton, MenuList, MenuItem,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { FaEdit, FaTrash, FaSearch, FaEllipsisV } from "react-icons/fa";
import { AnimatedUser, AnimatedPlus } from "../components/icons/NewAnimatedIcons";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import { useColorModeValue } from "../hooks/useColorModeValue";
import type { AxiosError } from "axios";
import { api } from "../services/api";
import type { ApiErrorResponse } from "../types/index";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { UserModal } from "../components/CockpitAdmin/UserModal";
import { Alert } from "../services/alertService";

interface User {
    id: number;
    username: string;
    fullName: string;
    email: string;
    registration: string;
    role: string;
    resolverDepartment?: string;
}

const ROLE_LABELS: Record<string, string> = {
    Requester: "Requester",
    SetupAgent: "Agente Setup",
    AutomationAgent: "Agente Automação",
    TestAgent: "Agente Teste",
    Admin: "Admin",
};

const ROLE_COLORS: Record<string, string> = {
    Requester: "blue",
    SetupAgent: "green",
    AutomationAgent: "purple",
    TestAgent: "orange",
    Admin: "red",
};

const DEPARTMENT_LABELS: Record<string, string> = {
    Automation: "Automação",
    Setup: "Setup",
    Test: "Teste",
    Engineering: "Engenharia",
    Production: "Produção",
};

export const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const theme = useDepartmentTheme();

    const isDarkMode = theme.modalBg === "black";
    const bgCard = theme.cardBg;
    const borderColor = theme.borderColor;
    const textColor = theme.textColor;
    const titleColor = theme.titleColor;

    const [isHeaderHovered, setIsHeaderHovered] = useState(true);
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    const btnBorderColor = useColorModeValue("blue.500", "blue.300");
    const btnTextColor = useColorModeValue("blue.600", "blue.200");
    const btnHoverBg = useColorModeValue("blue.50", "whiteAlpha.100");
    const btnHoverBorder = useColorModeValue("blue.600", "blue.200");

    const badgeTotalBorder = useColorModeValue("blue.500", "blue.300");
    const badgeTotalColor = useColorModeValue("blue.700", "blue.200");

    const badgeShowingBorder = useColorModeValue("purple.500", "purple.300");
    const badgeShowingColor = useColorModeValue("purple.700", "purple.200");

    useEffect(() => {
        const timer = setTimeout(() => setIsHeaderHovered(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(API_ENDPOINTS.ADMIN_COCKPIT.GET_ALL_USERS);
            setUsers(response.data);
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            Alert.error("Erro", err.response?.data?.message || "Erro ao carregar usuários", isDarkMode);
        } finally {
            setLoading(false);
        }
    }, [isDarkMode]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleCreateUser = () => {
        setSelectedUser(null);
        onOpen();
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        onOpen();
    };

    const handleDeleteUser = async (user: User) => {
        const result = await Alert.confirm(
            "Excluir Usuário",
            `Tem certeza que deseja excluir o usuário ${user.fullName}?\nEsta ação não pode ser desfeita.`,
            isDarkMode
        );

        if (result.isConfirmed) {
            try {
                await api.delete(API_ENDPOINTS.ADMIN_COCKPIT.DELETE_USER(user.id));
                Alert.success("Sucesso", "Usuário excluído com sucesso", isDarkMode);
                fetchUsers();
            } catch (error) {
                const err = error as AxiosError<ApiErrorResponse>;
                Alert.error("Erro ao excluir", err.response?.data?.message || "Ocorreu um erro", isDarkMode);
            }
        }
    };

    const handleModalSuccess = () => {
        onClose();
        fetchUsers();
    };

    const filteredUsers = users.filter(
        (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const UserRow = ({ user }: { user: User }) => (
        <Tr borderColor={borderColor}>
            <Td fontWeight="bold" color={titleColor} borderColor={borderColor}>{user.fullName}</Td>
            <Td borderColor={borderColor}>{user.username}</Td>
            <Td borderColor={borderColor}>{user.email}</Td>
            <Td borderColor={borderColor}>{user.registration}</Td>
            <Td borderColor={borderColor}>
                <Badge colorScheme={ROLE_COLORS[user.role] || "gray"} fontSize="xs">
                    {ROLE_LABELS[user.role] || user.role}
                </Badge>
            </Td>
            <Td fontSize="sm" borderColor={borderColor}>
                {user.resolverDepartment ? DEPARTMENT_LABELS[user.resolverDepartment] || user.resolverDepartment : "-"}
            </Td>
            <Td borderColor={borderColor}>
                <Menu>
                    <MenuButton as={IconButton} icon={<FaEllipsisV />} variant="ghost" size="sm" />
                    <MenuList bg={theme.modalBg} borderColor={borderColor}>
                        <MenuItem bg={theme.modalBg} icon={<FaEdit />} onClick={() => handleEditUser(user)}>
                            Editar
                        </MenuItem>
                        <MenuItem bg={theme.modalBg} icon={<FaTrash />} onClick={() => handleDeleteUser(user)} color="red.500">
                            Excluir
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Td>
        </Tr>
    );

    if (loading) {
        return (
            <Center h="400px">
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    return (
        <Box h="100%" display="flex" flexDirection="column">
            <VStack align="start" spacing={6} w="100%" h="100%" p={8}>
                <HStack justify="space-between" w="100%" flexShrink={0}>
                    <HStack spacing={4} align="flex-start">
                        <Box
                            onMouseEnter={() => setIsHeaderHovered(true)}
                            onMouseLeave={() => setIsHeaderHovered(false)}
                            color={titleColor}
                            pt={1}
                            cursor="default"
                        >
                            <AnimatedUser isHovered={isHeaderHovered} size={45} />
                        </Box>

                        <Box>
                            <Heading size="lg" mb={2} color={titleColor}>
                                Gerenciamento de Usuários
                            </Heading>
                            <Text color={textColor}>
                                Gerencie todos os usuários do sistema
                            </Text>
                        </Box>
                    </HStack>

                    <Button
                        colorScheme="blue"
                        variant="outline"
                        onClick={handleCreateUser}
                        onMouseEnter={() => setIsButtonHovered(true)}
                        onMouseLeave={() => setIsButtonHovered(false)}
                        display="flex"
                        alignItems="center"
                        gap={3}
                        pl={4}
                        pr={6}
                        borderColor={btnBorderColor}
                        color={btnTextColor}
                        _hover={{
                            bg: btnHoverBg,
                            borderColor: btnHoverBorder
                        }}
                    >
                        <AnimatedPlus isHovered={isButtonHovered} size={24} />
                        Novo Usuário
                    </Button>
                </HStack>

                <InputGroup maxW="400px" flexShrink={0}>
                    <InputLeftElement><FaSearch color="gray" /></InputLeftElement>
                    <Input
                        placeholder="Busque por matrícula, username ou nome com..."
                        value={searchTerm}
                        bg={theme.inputBg}
                        borderColor={borderColor}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                <Box w="100%" flex="1" bg={bgCard} borderRadius="xl" border="1px solid" borderColor={borderColor} boxShadow={theme.cardShadow} display="flex" flexDirection="column" minH="0" overflow="hidden">
                    {filteredUsers.length === 0 ? (
                        <Center py={10}>
                            <VStack spacing={3}>
                                <Text fontSize="lg" color={textColor}>
                                    {searchTerm ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
                                </Text>
                            </VStack>
                        </Center>
                    ) : (
                        <Box flex="1" overflow="auto">
                            <Table variant="simple">
                                <Thead>
                                    <Tr borderColor={borderColor}>
                                        <Th color={textColor} borderColor={borderColor}>Nome Completo</Th>
                                        <Th color={textColor} borderColor={borderColor}>Username</Th>
                                        <Th color={textColor} borderColor={borderColor}>Email</Th>
                                        <Th color={textColor} borderColor={borderColor}>Matrícula</Th>
                                        <Th color={textColor} borderColor={borderColor}>Role</Th>
                                        <Th color={textColor} borderColor={borderColor}>Departamento</Th>
                                        <Th color={textColor} borderColor={borderColor}>Ações</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredUsers.map((user) => (
                                        <UserRow key={user.id} user={user} />
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    )}
                </Box>

                <HStack spacing={4} flexShrink={0}>
                    <Badge
                        variant="outline"
                        fontSize="sm"
                        p={2}
                        borderRadius="md"
                        borderColor={badgeTotalBorder}
                        color={badgeTotalColor}
                    >
                        Total: {users.length}
                    </Badge>

                    <Badge
                        variant="outline"
                        fontSize="sm"
                        p={2}
                        borderRadius="md"
                        borderColor={badgeShowingBorder}
                        color={badgeShowingColor}
                    >
                        Mostrando: {filteredUsers.length}
                    </Badge>
                </HStack>
            </VStack>

            <UserModal isOpen={isOpen} onClose={onClose} onSuccess={handleModalSuccess} user={selectedUser} />
        </Box>
    );
};