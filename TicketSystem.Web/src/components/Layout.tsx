import {
    Box, Flex, HStack, IconButton, Spacer, Text, Image, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Badge, VStack,
    useColorMode } from "@chakra-ui/react";
import { Outlet, useNavigate } from "react-router-dom";
import { AnimatedUser, AnimatedSun, AnimatedSunMoon, AnimatedArrowBigLeftDash } from "../components/icons/NewAnimatedIcons";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { useState } from "react";
import logoImg from "../assets/img/new-logo-transparent-branding.svg";
import type { User } from "../types";

export const Layout = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const navigate = useNavigate();
    const isDark = colorMode === "dark";
    const [isThemeHovered, setIsThemeHovered] = useState(false);
    const [isProfileHovered, setIsProfileHovered] = useState(false);
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);

    const roleLabels: Record<string, string> = {
        "admin": "Admin",
        "operator": "Operador de Produção",
        "requester": "Requester de Produção",
        "inventory-clerk": "Inventário de Produção",
        "team-lead": "Líder de Produção",
        "quality-checker": "Operador da Qualidade",
        "back-office-clerk": "Assistente Administrativo de Produção",
        "specialist": "Engenheiro",
        "test-specialist": "Engenheiro de Teste",
        "product-specialist": "Engenheiro de Produto",
        "process-specialist": "Engenheiro de Processo",
        "setup-agent": "Assistente de Engenharia de Setup",
        "test-agent": "Assistente de Engenharia de Teste",
        "automation-agent": "Assistente de Engenharia de Automação",
        "software-agent": "Assistente de Engenharia de Software",
        "software-specialist": "Engenheiro de Software"
    };

    const [greeting] = useState(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Bom dia";
        if (hour >= 12 && hour < 18) return "Boa tarde";
        return "Boa noite";
    });

    const [fullUser] = useState<User | null>(() => {
        const stored = localStorage.getItem("ticket_user");
        return stored ? JSON.parse(stored) : null;
    });

    const userName = fullUser?.name?.split(" ")[0] || "Colaborador";

    const getRoleBadge = (roles: string[] | undefined) => {
        const firstRole = roles?.[0]?.toLowerCase();
        if (!firstRole) return <Badge colorScheme="gray">---</Badge>;

        const label = roleLabels[firstRole] || firstRole.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        let colorScheme = "gray";
        if (firstRole.includes("admin")) colorScheme = "purple";
        else if (firstRole.includes("requester")) colorScheme = "blue";
        else if (firstRole.includes("tecnico") || firstRole.includes("responsável")) colorScheme = "orange";

        return <Badge colorScheme={colorScheme} variant="outline">{label}</Badge>;
    };

    const handleLogout = () => {
        localStorage.removeItem("ticket_token");
        localStorage.removeItem("ticket_user");
        navigate("/login");
    };

    return (
        <Box h="100vh" bg={isDark ? "black" : "gray.50"} transition="background 0.2s" overflow="hidden">
            <Flex
                as="header"
                h="70px"
                bg={isDark ? "black" : "white"}
                align="center"
                px={6}
                color={isDark ? "white" : "gray.800"}
                position="sticky"
                top={0}
                zIndex={20}
                shadow="sm"
                transition="background 0.2s"
                borderBottom="1px solid"
                borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
                flexShrink={0}
            >
                <HStack gap={4}>
                    <Image
                        src={logoImg}
                        alt="Logo Ticket System"
                        h="45px"
                        objectFit="contain"
                        filter={isDark ? "none" : "invert(1)"}
                    />

                    <Box h="30px" w="1px" bg={isDark ? "whiteAlpha.400" : "gray.300"} />

                    <Text fontSize="md" color={isDark ? "whiteAlpha.900" : "gray.600"}>
                        {greeting}, <Text as="span" fontWeight="bold" color={isDark ? "white" : "black"}>{userName}</Text>
                    </Text>
                </HStack>

                <Spacer />

                <HStack gap={4}>
                    <IconButton
                        aria-label="Toggle theme"
                        variant="ghost"
                        color={isDark ? "white" : "gray.600"}
                        _hover={{ bg: isDark ? "whiteAlpha.200" : "gray.100" }}
                        onClick={toggleColorMode}
                        onMouseEnter={() => setIsThemeHovered(true)}
                        onMouseLeave={() => setIsThemeHovered(false)}
                        icon={
                            isDark
                                ? <AnimatedSun isHovered={isThemeHovered} />
                                : <AnimatedSunMoon isHovered={isThemeHovered} />
                        }
                    />

                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label="Profile"
                            variant="ghost"
                            color={isDark ? "white" : "gray.600"}
                            _hover={{ bg: isDark ? "whiteAlpha.200" : "gray.100" }}
                            _active={{ bg: isDark ? "whiteAlpha.300" : "gray.200" }}
                            onMouseEnter={() => setIsProfileHovered(true)}
                            onMouseLeave={() => setIsProfileHovered(false)}
                            icon={<AnimatedUser size={24} isHovered={isProfileHovered} />}
                        />

                        <MenuList
                            minW="260px"
                            p={0}
                            overflow="hidden"
                            color={isDark ? "gray.100" : "gray.800"}
                            bg={isDark ? "black" : "white"}
                            borderColor={isDark ? "gray.700" : "gray.200"}
                            boxShadow="lg"
                        >
                            <Box px={4} py={3}>
                                <VStack align="start" gap={1}>
                                    <Text fontWeight="bold" fontSize="md" color={isDark ? "white" : "gray.900"}>
                                        {fullUser?.name || "Usuário"}
                                    </Text>

                                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} title={fullUser?.email}>
                                        {fullUser?.email || "Email não disponível"}
                                    </Text>

                                    <HStack mt={2} justify="space-between" w="full" gap={4}>
                                        <Text fontSize="xs" fontWeight="bold" color={isDark ? "gray.400" : "gray.600"}>
                                            MAT: {fullUser?.registration || "---"}
                                        </Text>
                                        {getRoleBadge(fullUser?.roles)}
                                    </HStack>
                                </VStack>
                            </Box>

                            <MenuDivider m={0} borderColor={isDark ? "gray.600" : "gray.200"} />

                            <MenuItem
                                onClick={handleLogout}
                                px={4}
                                py={3}
                                fontSize="sm"
                                fontWeight="medium"
                                bg="transparent"
                                color={isDark ? "gray.400" : "gray.500"}
                                _hover={{
                                    bg: isDark ? "whiteAlpha.200" : "gray.100",
                                    color: "red.500"
                                }}
                                onMouseEnter={() => setIsLogoutHovered(true)}
                                onMouseLeave={() => setIsLogoutHovered(false)}
                            >
                                <Box as="span" mr="8px" display="inline-flex" alignItems="center">
                                    <AnimatedArrowBigLeftDash size={20} isHovered={isLogoutHovered} />
                                </Box>
                                Sair do Sistema
                            </MenuItem>
                        </MenuList>
                    </Menu>

                </HStack>
            </Flex>

            <Flex h="calc(100vh - 70px)" overflow="hidden">
                <Sidebar />

                <Flex
                    direction="column"
                    flex="1"
                    ml="60px"
                    bg={isDark ? "black" : "gray.50"}
                    transition="background 0.2s"
                    overflow="hidden"
                >
                    <Box flex="1" overflowY="auto">
                        <Outlet />
                    </Box>
                    <Footer />
                </Flex>
            </Flex>
        </Box>
    );
};