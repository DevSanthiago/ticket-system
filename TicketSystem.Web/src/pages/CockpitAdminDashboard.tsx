import React from "react";
import {
    Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
    VStack, Text, Button, HStack, Skeleton, SkeletonText, SkeletonCircle
} from "@chakra-ui/react";
import { Alert } from "../services/alertService";
import { useNavigate } from "react-router-dom";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import { useEffect, useState, useCallback } from "react";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { api } from "../services/api";
import type { ProductionLine, DashboardStats, StatCardProps, DashboardActionCardProps } from "../types";
import {
    AnimatedLayoutPanelTop, AnimatedRoute, AnimatedSlidersHorizontal,
    AnimatedSettings
} from "../components/icons/NewAnimatedIcons";

export const CockpitAdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalLines: 0,
        activeLines: 0,
        totalUsers: 0,
        totalPrefixes: 0
    });
    const [loading, setLoading] = useState(true);

    const theme = useDepartmentTheme("setup");
    const bgCard = theme.cardBg;
    const borderColor = theme.borderColor;
    const iconHeaderColor = useColorModeValue("black", "white");
    const isDarkMode = useColorModeValue(false, true);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);

            const delay = new Promise(resolve => setTimeout(resolve, 1800));

            const [linesResponse] = await Promise.all([
                api.get<ProductionLine[]>(`${API_ENDPOINTS.ADMIN_COCKPIT.GET_ALL_PRODUCTION_LINES}?includeInactive=true`),
                delay
            ]);

            const lines = linesResponse.data;
            const activeLinesCount = lines.filter(line => line.isActive).length;
            const uniquePrefixesCount = [...new Set(lines.map(line => line.prefix))].length;

            setStats({
                totalLines: lines.length,
                activeLines: activeLinesCount,
                totalUsers: 0,
                totalPrefixes: uniquePrefixesCount
            });
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
            Alert.error("Erro ao carregar dados", "Não foi possível atualizar as estatísticas do cockpit.", isDarkMode);
        } finally {
            setLoading(false);
        }
    }, [isDarkMode]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const StatCard = ({ label, value, helpText, animatedIcon, color }: StatCardProps) => {
        const [cardHovered, setCardHovered] = useState(false);

        return (
            <Box
                p={6}
                bg={bgCard}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                boxShadow={theme.cardShadow}
                display="flex"
                flexDirection="column"
                _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                transition="all 0.2s"
                onMouseEnter={() => setCardHovered(true)}
                onMouseLeave={() => setCardHovered(false)}
            >
                <Stat>
                    <HStack justify="space-between" mb={2}>
                        <StatLabel fontSize="sm" color="gray.500" fontWeight="medium">
                            {label}
                        </StatLabel>
                        <SkeletonCircle size="6" isLoaded={!loading}>
                            <Box color={color}>
                                {animatedIcon && React.cloneElement(animatedIcon, { isHovered: cardHovered })}
                            </Box>
                        </SkeletonCircle>
                    </HStack>

                    <Skeleton isLoaded={!loading} h="36px" my={1} borderRadius="md">
                        <StatNumber fontSize="3xl" fontWeight="bold" color={color}>
                            {value}
                        </StatNumber>
                    </Skeleton>

                    <SkeletonText isLoaded={!loading} noOfLines={1} skeletonHeight="2">
                        <StatHelpText fontSize="xs" color="gray.500" mb={0}>
                            {helpText}
                        </StatHelpText>
                    </SkeletonText>
                </Stat>
            </Box>
        );
    };

    const ActionCard = ({ title, description, animatedIcon, buttonText, buttonColor, onClick }: DashboardActionCardProps) => {
        const [isActionHovered, setIsActionHovered] = useState(false);
        const { iconColor, groupHoverIconColor, cockpitButtonBg, cockpitButtonHoverBg } = theme.getActionCardColors(buttonColor);

        return (
            <Box
                p={6}
                bg={bgCard}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                boxShadow="sm"
                display="flex"
                flexDirection="column"
                _hover={{
                    transform: "translateY(-4px)",
                    borderColor: iconColor,
                    boxShadow: "md"
                }}
                transition="all 0.3s ease"
                onMouseEnter={() => setIsActionHovered(true)}
                onMouseLeave={() => setIsActionHovered(false)}
            >
                <VStack align="start" spacing={4} flex={1}>
                    <HStack>
                        <SkeletonCircle size="6" isLoaded={!loading}>
                            <Box color={isActionHovered ? groupHoverIconColor : iconColor}>
                                {React.cloneElement(animatedIcon, { isHovered: isActionHovered })}
                            </Box>
                        </SkeletonCircle>
                        <Skeleton isLoaded={!loading} borderRadius="md">
                            <Heading size="md">{title}</Heading>
                        </Skeleton>
                    </HStack>

                    <SkeletonText isLoaded={!loading} noOfLines={2} spacing="2" w="100%">
                        <Text color={theme.textColor} fontSize="sm">
                            {description}
                        </Text>
                    </SkeletonText>

                    <Skeleton isLoaded={!loading} w="100%" mt="auto" borderRadius="md">
                        <Button
                            bg={cockpitButtonBg}
                            color="white"
                            size="sm"
                            onClick={onClick}
                            w="100%"
                            _hover={{ bg: cockpitButtonHoverBg }}
                        >
                            {buttonText}
                        </Button>
                    </Skeleton>
                </VStack>
            </Box>
        );
    };

    return (
        <Box h="100%" display="flex" flexDirection="column" bg={useColorModeValue("gray.50", "black")}>
            <VStack align="start" spacing={6} w="100%" h="100%" p={8} overflow="auto">
                <Box w="100%">
                    <HStack spacing={3} mb={2}>
                        <SkeletonCircle size="8" isLoaded={!loading}>
                            <AnimatedLayoutPanelTop size={32} color={iconHeaderColor} />
                        </SkeletonCircle>
                        <Skeleton isLoaded={!loading} borderRadius="md">
                            <Heading size="lg">Cockpit Administrativo</Heading>
                        </Skeleton>
                    </HStack>
                    <Skeleton isLoaded={!loading} w="300px" borderRadius="md">
                        <Text color="gray.500">Gerencie linhas de produção e usuários do sistema</Text>
                    </Skeleton>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="100%">
                    <StatCard
                        label="Total de Linhas"
                        value={stats.totalLines}
                        helpText="Todas as linhas cadastradas"
                        animatedIcon={<AnimatedRoute size={24} />}
                        color="blue.500"
                    />
                    <StatCard
                        label="Linhas Ativas"
                        value={stats.activeLines}
                        helpText="Linhas em operação"
                        animatedIcon={<AnimatedSlidersHorizontal size={24} />}
                        color="green.500"
                    />
                    <StatCard
                        label="Prefixos Cadastrados"
                        value={stats.totalPrefixes}
                        helpText="Categorias de linhas"
                        animatedIcon={<AnimatedSettings size={24} />}
                        color="purple.500"
                    />
                </SimpleGrid>

                <Box w="100%" mt={8}>
                    <Skeleton isLoaded={!loading} w="150px" mb={4} borderRadius="md">
                        <Heading size="md">Ações Rápidas</Heading>
                    </Skeleton>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <ActionCard
                            title="Linhas de Produção"
                            description="Gerencie todas as linhas de produção do sistema."
                            animatedIcon={<AnimatedRoute size={24} />}
                            buttonText="Gerenciar Linhas"
                            buttonColor="blue"
                            onClick={() => navigate("/cockpit-admin/production-lines")}
                        />
                        <ActionCard
                            title="Prefixos"
                            description="Gerencie os prefixos das linhas de produção. Adicione ou remova categorias do sistema."
                            animatedIcon={<AnimatedSettings size={24} />}
                            buttonText="Gerenciar Prefixos"
                            buttonColor="purple"
                            onClick={() => navigate("/cockpit-admin/prefixes")}
                        />
                    </SimpleGrid>
                </Box>
            </VStack>
        </Box>
    );
};