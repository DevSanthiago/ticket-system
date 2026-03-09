import {
    Box, Heading, Button, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, useDisclosure, Text, Tabs, TabList,
    TabPanels, Tab, TabPanel, Center, Input, InputGroup, InputLeftElement, Menu, MenuButton, MenuList, MenuItem,
    Skeleton, SkeletonCircle
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { FaEdit, FaCheck, FaTimes, FaSearch, FaEllipsisV, FaTrash } from "react-icons/fa";
import { AnimatedRoute, AnimatedPlus } from "../components/icons/NewAnimatedIcons";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { Alert } from "../services/alertService";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { ProductionLineModal } from "../components/CockpitAdmin/ProductionLineModal";
import type { AxiosError } from "axios";
import { api } from "../services/api";
import type { ApiErrorResponse, ProductionLine, ProductionLinesByPrefix } from "../types";

export const ProductionLinesPage = () => {
    const [linesByPrefix, setLinesByPrefix] = useState<ProductionLinesByPrefix[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null);
    const [includeInactive, setIncludeInactive] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const theme = useDepartmentTheme();
    const isDarkMode = useColorModeValue(false, true);

    const bgCard = theme.cardBg;
    const borderColor = theme.borderColor;
    const textColor = theme.textColor;
    const titleColor = theme.titleColor;

    const [isHeaderHovered, setIsHeaderHovered] = useState(true);
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    const btnBorderColor = useColorModeValue("blue.500", "blue.300");
    const btnTextColor = useColorModeValue("blue.600", "blue.200");
    const btnHoverBg = useColorModeValue("blue.50", "whiteAlpha.100");
    const btnHoverBorderColor = useColorModeValue("blue.600", "blue.200");

    useEffect(() => {
        const timer = setTimeout(() => setIsHeaderHovered(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const fetchLines = useCallback(async () => {
        try {
            setLoading(true);

            const delay = new Promise(resolve => setTimeout(resolve, 1800));

            const [response] = await Promise.all([
                api.get<ProductionLinesByPrefix[]>(
                    `${API_ENDPOINTS.ADMIN_COCKPIT.PRODUCTION_LINES_BY_PREFIX}?includeInactive=${includeInactive}`
                ),
                delay
            ]);

            setLinesByPrefix(response.data);
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            Alert.error("Erro ao carregar linhas", err.response?.data?.message || "Ocorreu um erro inesperado", isDarkMode);
        } finally {
            setLoading(false);
        }
    }, [includeInactive, isDarkMode]);

    useEffect(() => {
        fetchLines();
    }, [fetchLines]);

    const handleCreateLine = () => {
        setSelectedLine(null);
        onOpen();
    };

    const handleEditLine = (line: ProductionLine) => {
        setSelectedLine(line);
        onOpen();
    };

    const handleActionLine = async (line: ProductionLine, action: 'deactivate' | 'delete') => {
        const isDeactivate = action === 'deactivate';
        const title = isDeactivate ? 'Desativar Linha' : 'Excluir Linha';
        const message = isDeactivate
            ? `Tem certeza que deseja desativar a linha ${line.lineName}?`
            : `Esta ação é irreversível. Deseja excluir permanentemente a linha ${line.lineName}?`;

        const result = await Alert.confirm(title, message, isDarkMode);

        if (result.isConfirmed) {
            try {
                if (isDeactivate) {
                    await api.post(API_ENDPOINTS.ADMIN_COCKPIT.DEACTIVATE_PRODUCTION_LINE(line.id));
                    Alert.success("Sucesso", "Linha desativada com sucesso", isDarkMode);
                } else {
                    await api.delete(API_ENDPOINTS.ADMIN_COCKPIT.DELETE_PRODUCTION_LINE(line.id));
                    Alert.success("Sucesso", "Linha excluída com sucesso", isDarkMode);
                }
                fetchLines();
            } catch (error) {
                const err = error as AxiosError<ApiErrorResponse>;
                Alert.error("Erro", err.response?.data?.message || "Ocorreu um erro", isDarkMode);
            }
        }
    };

    const handleActivateLine = async (line: ProductionLine) => {
        try {
            await api.post(API_ENDPOINTS.ADMIN_COCKPIT.ACTIVATE_PRODUCTION_LINE(line.id));
            Alert.success("Sucesso", "Linha ativada com sucesso", isDarkMode);
            fetchLines();
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            Alert.error("Erro ao ativar", err.response?.data?.message || "Ocorreu um erro", isDarkMode);
        }
    };

    const handleModalSuccess = () => {
        onClose();
        fetchLines();
    };

    const filteredLinesByPrefix = linesByPrefix
        .map(group => ({
            ...group,
            lines: group.lines.filter(line =>
                line.lineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                line.prefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
                line.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }))
        .filter(group => group.lines.length > 0);

    const LineRow = ({ line }: { line: ProductionLine }) => (
        <Tr borderColor={borderColor}>
            <Td fontWeight="bold" color={titleColor} borderColor={borderColor}>{line.lineName}</Td>
            <Td borderColor={borderColor}>
                <Badge colorScheme="blue" fontSize="xs">
                    {line.prefix}
                </Badge>
            </Td>
            <Td maxW="300px" isTruncated borderColor={borderColor} color={textColor}>
                {line.description || "-"}
            </Td>
            <Td borderColor={borderColor}>
                <Badge colorScheme={line.isActive ? "green" : "red"}>
                    {line.isActive ? "Ativa" : "Inativa"}
                </Badge>
            </Td>
            <Td fontSize="sm" color={textColor} borderColor={borderColor}>
                {new Date(line.createdAt).toLocaleDateString("pt-BR")}
            </Td>
            <Td borderColor={borderColor}>
                <Menu>
                    <MenuButton
                        as={IconButton}
                        icon={<FaEllipsisV />}
                        variant="ghost"
                        size="sm"
                    />
                    <MenuList bg={theme.modalBg} borderColor={borderColor}>
                        <MenuItem bg={theme.modalBg} icon={<FaEdit />} onClick={() => handleEditLine(line)}>
                            Editar
                        </MenuItem>
                        {line.isActive ? (
                            <>
                                <MenuItem
                                    bg={theme.modalBg}
                                    icon={<FaTimes />}
                                    onClick={() => handleActionLine(line, 'deactivate')}
                                    color="orange.500"
                                >
                                    Desativar
                                </MenuItem>
                                <MenuItem
                                    bg={theme.modalBg}
                                    icon={<FaTrash />}
                                    onClick={() => handleActionLine(line, 'delete')}
                                    color="red.500"
                                >
                                    Excluir Permanentemente
                                </MenuItem>
                            </>
                        ) : (
                            <>
                                <MenuItem
                                    bg={theme.modalBg}
                                    icon={<FaCheck />}
                                    onClick={() => handleActivateLine(line)}
                                    color="green.500"
                                >
                                    Ativar
                                </MenuItem>
                                <MenuItem
                                    bg={theme.modalBg}
                                    icon={<FaTrash />}
                                    onClick={() => handleActionLine(line, 'delete')}
                                    color="red.500"
                                >
                                    Excluir Permanentemente
                                </MenuItem>
                            </>
                        )}
                    </MenuList>
                </Menu>
            </Td>
        </Tr>
    );

    const SkeletonLoader = () => (
        <Table variant="simple">
            <Thead>
                <Tr borderColor={borderColor}>
                    <Th borderColor={borderColor}><Skeleton h="20px" w="100px" /></Th>
                    <Th borderColor={borderColor}><Skeleton h="20px" w="60px" /></Th>
                    <Th borderColor={borderColor}><Skeleton h="20px" w="150px" /></Th>
                    <Th borderColor={borderColor}><Skeleton h="20px" w="80px" /></Th>
                    <Th borderColor={borderColor}><Skeleton h="20px" w="100px" /></Th>
                    <Th borderColor={borderColor}><Skeleton h="20px" w="50px" /></Th>
                </Tr>
            </Thead>
            <Tbody>
                {[...Array(5)].map((_, i) => (
                    <Tr key={i} borderColor={borderColor}>
                        <Td borderColor={borderColor}><Skeleton h="20px" /></Td>
                        <Td borderColor={borderColor}><Skeleton h="20px" /></Td>
                        <Td borderColor={borderColor}><Skeleton h="20px" /></Td>
                        <Td borderColor={borderColor}><Skeleton h="20px" /></Td>
                        <Td borderColor={borderColor}><Skeleton h="20px" /></Td>
                        <Td borderColor={borderColor}><Skeleton h="20px" /></Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>
    );

    return (
        <Box h="100%" display="flex" flexDirection="column" overflow="hidden">
            <VStack align="start" spacing={6} w="100%" h="100%" overflow="hidden" p={8}>
                <HStack justify="space-between" w="100%" flexShrink={0}>
                    <HStack align="flex-start" spacing={3}>
                        <Box
                            mt={1}
                            color={titleColor}
                            onMouseEnter={() => setIsHeaderHovered(true)}
                            onMouseLeave={() => setIsHeaderHovered(false)}
                            cursor="default"
                        >
                            <SkeletonCircle size="45px" isLoaded={!loading}>
                                <AnimatedRoute isHovered={isHeaderHovered} size={45} />
                            </SkeletonCircle>
                        </Box>
                        <Box>
                            <Skeleton isLoaded={!loading} mb={2} borderRadius="md">
                                <Heading
                                    size="lg"
                                    color={titleColor}
                                    onMouseEnter={() => setIsHeaderHovered(true)}
                                    onMouseLeave={() => setIsHeaderHovered(false)}
                                >
                                    Linhas de Produção
                                </Heading>
                            </Skeleton>
                            <Skeleton isLoaded={!loading} borderRadius="md">
                                <Text color={textColor}>
                                    Gerencie todas as linhas de produção do sistema
                                </Text>
                            </Skeleton>
                        </Box>
                    </HStack>
                    <Skeleton isLoaded={!loading} borderRadius="md">
                        <Button
                            colorScheme="blue"
                            variant="outline"
                            onClick={handleCreateLine}
                            onMouseEnter={() => setIsButtonHovered(true)}
                            onMouseLeave={() => setIsButtonHovered(false)}
                            display="flex"
                            alignItems="center"
                            gap={2}
                            pl={3}
                            pr={5}
                            borderColor={btnBorderColor}
                            color={btnTextColor}
                            _hover={{
                                bg: btnHoverBg,
                                borderColor: btnHoverBorderColor,
                            }}
                        >
                            <AnimatedPlus isHovered={isButtonHovered} size={24} />
                            <Text as="span">Nova Linha</Text>
                        </Button>
                    </Skeleton>
                </HStack>

                <HStack w="100%" spacing={4} flexShrink={0}>
                    <Skeleton isLoaded={!loading} w="400px" borderRadius="md">
                        <InputGroup maxW="400px">
                            <InputLeftElement>
                                <FaSearch color="gray" />
                            </InputLeftElement>
                            <Input
                                placeholder="Buscar por nome, prefixo ou descrição..."
                                value={searchTerm}
                                bg={theme.inputBg}
                                borderColor={borderColor}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Skeleton>
                    <Skeleton isLoaded={!loading} borderRadius="md">
                        <Button
                            variant={includeInactive ? "solid" : "outline"}
                            colorScheme="gray"
                            onClick={() => setIncludeInactive(!includeInactive)}
                            size="md"
                        >
                            {includeInactive ? "Mostrar apenas ativas" : "Mostrar todas"}
                        </Button>
                    </Skeleton>
                </HStack>

                <Box
                    w="100%"
                    flex="1"
                    bg={bgCard}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={borderColor}
                    p={6}
                    boxShadow={theme.cardShadow}
                    overflow="hidden"
                    display="flex"
                    flexDirection="column"
                >
                    {loading ? (
                        <SkeletonLoader />
                    ) : filteredLinesByPrefix.length === 0 ? (
                        <Center py={10}>
                            <VStack spacing={3}>
                                <Text fontSize="lg" color={textColor}>
                                    {searchTerm
                                        ? "Nenhuma linha encontrada com esse termo de busca"
                                        : "Nenhuma linha cadastrada"}
                                </Text>
                            </VStack>
                        </Center>
                    ) : (
                        <Tabs variant="enclosed" colorScheme="blue" display="flex" flexDirection="column" h="100%" overflow="hidden">
                            <TabList borderColor={borderColor} overflowX="auto" flexShrink={0} css={{
                                '&::-webkit-scrollbar': { display: 'none' },
                                'scrollbarWidth': 'none'
                            }}>
                                {filteredLinesByPrefix.map((group) => (
                                    <Tab key={group.prefix} _selected={{ color: "blue.400", borderColor: borderColor, borderBottomColor: bgCard }}>
                                        {group.prefixLabel} ({group.lines.length})
                                    </Tab>
                                ))}
                            </TabList>

                            <TabPanels flex="1" overflow="hidden">
                                {filteredLinesByPrefix.map((group) => (
                                    <TabPanel key={group.prefix} px={0} h="100%" overflow="auto">
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr borderColor={borderColor}>
                                                    <Th color={textColor} borderColor={borderColor}>Nome</Th>
                                                    <Th color={textColor} borderColor={borderColor}>Prefixo</Th>
                                                    <Th color={textColor} borderColor={borderColor}>Descrição</Th>
                                                    <Th color={textColor} borderColor={borderColor}>Status</Th>
                                                    <Th color={textColor} borderColor={borderColor}>Criada em</Th>
                                                    <Th color={textColor} borderColor={borderColor}>Ações</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {group.lines.map((line) => (
                                                    <LineRow key={line.id} line={line} />
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </TabPanel>
                                ))}
                            </TabPanels>
                        </Tabs>
                    )}
                </Box>
            </VStack>

            <ProductionLineModal
                isOpen={isOpen}
                onClose={onClose}
                onSuccess={handleModalSuccess}
                line={selectedLine}
            />
        </Box>
    );
};