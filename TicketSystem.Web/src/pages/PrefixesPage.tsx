import {
    Box, Heading, Button, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, useDisclosure, Text, Center,
    Skeleton, SkeletonCircle
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { FaTrash } from "react-icons/fa";
import { AnimatedSettings, AnimatedPlus } from "../components/icons/NewAnimatedIcons";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { api } from "../services/api";
import { AxiosError } from "axios";
import type { ApiErrorResponse, LinePrefix } from "../types";
import { PrefixModal } from "../components/CockpitAdmin/PrefixModal";
import { Alert } from "../services/alertService";

export const PrefixesPage = () => {
    const [prefixes, setPrefixes] = useState<LinePrefix[]>([]);
    const [loading, setLoading] = useState(true);
    const [isHeaderHovered, setIsHeaderHovered] = useState(true);
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const theme = useDepartmentTheme();

    const isDarkMode = theme.modalBg === "black" || theme.modalBg === "#000000";
    const bgCard = theme.cardBg;
    const borderColor = theme.borderColor;
    const textColor = theme.textColor;
    const titleColor = theme.titleColor;

    useEffect(() => {
        const timer = setTimeout(() => setIsHeaderHovered(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const fetchPrefixes = useCallback(async () => {
        try {
            setLoading(true);

            const delay = new Promise(resolve => setTimeout(resolve, 1800));

            const [response] = await Promise.all([
                api.get(API_ENDPOINTS.ADMIN_COCKPIT.GET_PREFIXES),
                delay
            ]);

            setPrefixes(response.data);
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            Alert.error("Erro", err.response?.data?.message || "Erro ao carregar prefixos", isDarkMode);
        } finally {
            setLoading(false);
        }
    }, [isDarkMode]);

    useEffect(() => { fetchPrefixes(); }, [fetchPrefixes]);

    const handleDeleteClick = async (prefix: LinePrefix) => {
        const result = await Alert.confirm(
            "Excluir Prefixo",
            `Tem certeza que deseja excluir o prefixo ${prefix.value}? Esta ação só é permitida se não houver linhas vinculadas.`,
            isDarkMode
        );

        if (result.isConfirmed) {
            try {
                await api.delete(API_ENDPOINTS.ADMIN_COCKPIT.DELETE_PREFIX(prefix.id));
                Alert.success("Sucesso", "Prefixo removido com sucesso!", isDarkMode);
                fetchPrefixes();
            } catch (error) {
                const err = error as AxiosError<ApiErrorResponse>;
                Alert.error(
                    "Erro ao excluir",
                    err.response?.data?.message || "O prefixo pode estar em uso ou ocorreu um erro na API.",
                    isDarkMode
                );
            }
        }
    };

    const TableSkeleton = () => (
        <Table variant="simple">
            <Thead>
                <Tr borderColor={borderColor}>
                    <Th borderColor={borderColor}><Skeleton h="15px" w="70%" /></Th>
                    <Th borderColor={borderColor}><Skeleton h="15px" w="80%" /></Th>
                    <Th borderColor={borderColor}><Skeleton h="15px" w="60%" /></Th>
                    <Th borderColor={borderColor}><Skeleton h="15px" w="40%" /></Th>
                </Tr>
            </Thead>
            <Tbody>
                {[...Array(5)].map((_, i) => (
                    <Tr key={i} borderColor={borderColor}>
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
                            <SkeletonCircle size="45px" isLoaded={!loading}>
                                <AnimatedSettings isHovered={isHeaderHovered} size={45} />
                            </SkeletonCircle>
                        </Box>
                        <Box>
                            <Skeleton isLoaded={!loading} mb={2} borderRadius="md">
                                <Heading size="lg" color={titleColor}>Gerenciamento de Prefixos</Heading>
                            </Skeleton>
                            <Skeleton isLoaded={!loading} borderRadius="md">
                                <Text color={textColor}>Configure as categorias das linhas de produção</Text>
                            </Skeleton>
                        </Box>
                    </HStack>

                    <Skeleton isLoaded={!loading} borderRadius="md">
                        <Button
                            leftIcon={<AnimatedPlus isHovered={isButtonHovered} size={24} />}
                            colorScheme="blue"
                            variant="outline"
                            onClick={onOpen}
                            onMouseEnter={() => setIsButtonHovered(true)}
                            onMouseLeave={() => setIsButtonHovered(false)}
                            display="flex"
                            alignItems="center"
                            gap={3}
                            pl={4}
                            pr={6}
                        >
                            Novo Prefixo
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
                    display="flex"
                    flexDirection="column"
                    minH="0"
                    overflow="hidden"
                >
                    <Box flex="1" overflow="auto">
                        {loading ? (
                            <TableSkeleton />
                        ) : prefixes.length === 0 ? (
                            <Center py={10}>
                                <VStack spacing={3}>
                                    <Text fontSize="lg" color={textColor}>
                                        Nenhum prefixo cadastrado
                                    </Text>
                                </VStack>
                            </Center>
                        ) : (
                            <Table variant="simple">
                                <Thead>
                                    <Tr borderColor={borderColor}>
                                        <Th color={textColor} borderColor={borderColor}>Sigla (Value)</Th>
                                        <Th color={textColor} borderColor={borderColor}>Rótulo (Label)</Th>
                                        <Th color={textColor} borderColor={borderColor}>Status</Th>
                                        <Th color={textColor} borderColor={borderColor}>Ações</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {prefixes.map((p) => (
                                        <Tr key={p.id} _hover={{ bg: theme.hoverBg }} borderColor={borderColor}>
                                            <Td borderColor={borderColor}><Badge colorScheme="blue">{p.value}</Badge></Td>
                                            <Td borderColor={borderColor} fontWeight="bold" color={titleColor}>{p.label}</Td>
                                            <Td borderColor={borderColor}><Badge colorScheme={p.isActive ? "green" : "red"}>{p.isActive ? "Ativo" : "Inativa"}</Badge></Td>
                                            <Td borderColor={borderColor}>
                                                <IconButton
                                                    aria-label="Excluir"
                                                    icon={<FaTrash />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteClick(p)}
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        )}
                    </Box>
                </Box>
            </VStack>

            <PrefixModal isOpen={isOpen} onClose={onClose} onSuccess={() => { onClose(); fetchPrefixes(); }} />
        </Box>
    );
};