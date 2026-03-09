import { Box, VStack, Icon, Text, HStack, Flex } from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa";
import { useState, useEffect, } from "react";
import type { SidebarItemProps, SubItemProps } from "../types";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatedLayoutPanelTop, AnimatedGalleryHorizontalEnd, AnimatedGalleryVerticalEnd, AnimatedBotMessageSquare, AnimatedWrench,
AnimatedFolderCog, AnimatedAirplay } from "./icons/NewAnimatedIcons";

const SidebarItem = ({ icon: IconComponent, label, isActive, children, isSidebarExpanded, onClick }: SidebarItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const hasChildren = !!children;

    const activeBg = useColorModeValue("blue.600", "blue.500");
    const hoverBg = useColorModeValue("blue.500", "blue.900");
    const activeColor = "white";
    const inactiveColor = useColorModeValue("gray.600", "gray.400");

    useEffect(() => {
        if (!isSidebarExpanded && isOpen) {
            const timer = setTimeout(() => {
                setIsOpen(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isSidebarExpanded, isOpen]);

    const handleClick = () => {
        if (onClick) {
            onClick();
        }

        if (hasChildren && isSidebarExpanded) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <Box w="100%">
            <HStack
                w="calc(100% - 16px)"
                mx="auto"
                justifyContent={isSidebarExpanded ? "flex-start" : "center"}
                pl={isSidebarExpanded ? 4 : 0}
                pr={isSidebarExpanded ? 4 : 0}
                my={1}
                h="48px"
                cursor="pointer"
                bg={isActive ? activeBg : "transparent"}
                color={isActive ? activeColor : inactiveColor}
                _hover={{ bg: hoverBg, color: "white" }}
                borderRadius="xl"
                transition="all 0.2s"
                overflow="hidden"
                whiteSpace="nowrap"
                alignItems="center"
                position="relative"
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Box w="24px" display="flex" justifyContent="center" flexShrink={0}>
                    <IconComponent size={24} isHovered={isHovered} />
                </Box>

                <Flex
                    display={isSidebarExpanded ? "flex" : "none"}
                    align="center"
                    justify="space-between"
                    flex={1}
                    overflow="hidden"
                    opacity={isSidebarExpanded ? 1 : 0}
                    transition="opacity 0.2s"
                >
                    <Text
                        ml={4}
                        fontWeight="medium"
                        pr={3}
                        flex={1}
                    >
                        {label}
                    </Text>

                    {hasChildren && (
                        <Icon
                            as={FaChevronDown}
                            fontSize="xs"
                            transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                            transition="transform 0.3s"
                        />
                    )}
                </Flex>
            </HStack>

            <Box
                overflow="hidden"
                transition="all 0.3s ease-in-out"
                maxH={isOpen && isSidebarExpanded ? "500px" : "0px"}
                opacity={isOpen && isSidebarExpanded ? 1 : 0}
            >
                <VStack align="start" pl={12} mt={1} gap={2}>
                    {children}
                </VStack>
            </Box>
        </Box>
    );
};

const SubItem = ({ label, icon: IconComponent, onClick }: SubItemProps) => {
    const textColor = useColorModeValue("gray.600", "gray.400");
    const hoverColor = useColorModeValue("black", "white");
    const [isHovered, setIsHovered] = useState(false);

    return (
        <HStack
            as="button"
            onClick={onClick}
            cursor="pointer"
            color={textColor}
            _hover={{ color: hoverColor }}
            w="100%"
            py={1}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {IconComponent && (
                <Box mr={2} display="flex" alignItems="center">
                    <IconComponent size={16} isHovered={isHovered} />
                </Box>
            )}
            <Text fontSize="sm">{label}</Text>
        </HStack>
    );
};

export const Sidebar = () => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();

    const sidebarBg = useColorModeValue("white", "black");
    const borderRight = useColorModeValue("1px solid", "1px solid rgba(255,255,255,0.1)");

    const [isMaster] = useState(() => {
        try {
            const storedUser = localStorage.getItem("ticket_user");
            if (storedUser) {
                const user = JSON.parse(storedUser);
                return user?.roles?.some((r: string) => r.toLowerCase() === "admin") ?? false;
            }
            return false;
        } catch {
            return false;
        }
    });

    return (
        <Box
            h="calc(100vh - 60px)"
            bg={sidebarBg}
            borderRight={borderRight}
            borderColor={useColorModeValue("gray.200", "gray.700")}
            color={useColorModeValue("gray.800", "white")}
            w={isExpanded ? "280px" : "60px"}
            transition="width 0.3s cubic-bezier(0.2, 0, 0, 1)"
            position="fixed"
            left={0}
            zIndex={10}
            boxShadow="xl"
            overflowX="hidden"
            overflowY="auto"
            css={{
                '&::-webkit-scrollbar': { display: 'none' },
                'scrollbarWidth': 'none'
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <VStack gap={2} p={0} py={4} align="start" w="100%">

                {isMaster && (
                    <SidebarItem
                        icon={AnimatedLayoutPanelTop}
                        label="Cockpit ADM"
                        isActive={location.pathname.startsWith("/cockpit-admin")}
                        isSidebarExpanded={isExpanded}
                        onClick={() => navigate("/cockpit-admin")}
                    />
                )}

                <SidebarItem
                    icon={AnimatedGalleryHorizontalEnd}
                    label="Painel de Ações"
                    isActive={location.pathname === "/"}
                    isSidebarExpanded={isExpanded}
                    onClick={() => navigate("/")}
                />

                <SidebarItem
                    icon={AnimatedGalleryVerticalEnd}
                    label="Tickets em aberto"
                    isActive={location.pathname.startsWith("/tickets")}
                    isSidebarExpanded={isExpanded}
                >
                    <SubItem icon={AnimatedBotMessageSquare} label="Tickets Automação" onClick={() => navigate("/tickets/automation-list")} />
                    <SubItem icon={AnimatedWrench} label="Tickets Setup" onClick={() => navigate("/tickets/setup-list")} />
                    <SubItem icon={AnimatedFolderCog} label="Tickets Teste" onClick={() => navigate("/tickets/test-list")} />
                    <SubItem icon={AnimatedAirplay} label="Tickets Software" onClick={() => navigate("/tickets/software-list")} />
                </SidebarItem>

            </VStack>
        </Box>
    );
};