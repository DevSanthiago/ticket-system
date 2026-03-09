import {
    Badge, Flex, HStack, Icon, Text, Drawer, DrawerBody, DrawerHeader,
    DrawerOverlay, DrawerContent, DrawerCloseButton, Button, VStack,
    Box, Divider, useDisclosure, useBreakpointValue, Switch,
    Input, InputGroup, InputLeftElement
} from "@chakra-ui/react";
import type { TicketFiltersProps } from "../types";
import { FaFilter, FaTimes, FaCheck, FaSearch } from "react-icons/fa";
import { useColorModeValue } from "../hooks/useColorModeValue";

export const TicketFilters = ({
    filterMyTickets,
    setFilterMyTickets,
    filterTypes,
    setFilterTypes,
    filterStatus,
    setFilterStatus,
    typeOptions = [],
    statusOptions,
    myTicketsColor = "purple",
    filterSectors = [],
    setFilterSectors,
    sectorOptions = [],
    searchTerm = "",
    setSearchTerm,
}: TicketFiltersProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const drawerMargin = useBreakpointValue({ base: "60px", md: "64px", lg: "72px" });
    const drawerHeight = useBreakpointValue({
        base: "calc(100vh - 60px)",
        md: "calc(100vh - 64px)",
        lg: "calc(100vh - 72px)"
    });

    const isDark = useColorModeValue(false, true);

    const drawerBg = useColorModeValue("white", "black");
    const drawerBorderColor = useColorModeValue("gray.200", "gray.700");
    const headerBorderColor = useColorModeValue("gray.100", "gray.700");
    const scrollThumbColor = useColorModeValue("#cbd5e0", "gray.600");

    const titleColor = useColorModeValue("gray.700", "whiteAlpha.900");
    const subtitleColor = useColorModeValue("gray.500", "gray.400");

    const triggerColor = useColorModeValue("gray.500", "gray.400");
    const triggerBorder = useColorModeValue("gray.200", "gray.700");
    const triggerHoverColor = useColorModeValue("blue.500", "blue.300");
    const triggerHoverBorder = useColorModeValue("blue.300", "blue.500");

    const itemBorderDefault = useColorModeValue("gray.200", "gray.700");
    const itemBgDefault = useColorModeValue("transparent", "black");
    const itemTextDefault = useColorModeValue("gray.600", "gray.300");
    const itemIconDefault = useColorModeValue("gray.500", "gray.400");
    const itemBorderHover = useColorModeValue("gray.300", "gray.500");

    const btnOutlineColor = useColorModeValue("gray.500", "gray.300");
    const btnOutlineBorder = useColorModeValue("gray.200", "gray.600");
    const btnOutlineHoverBg = useColorModeValue("gray.50", "whiteAlpha.200");

    const toggleMyTickets = () => setFilterMyTickets(!filterMyTickets);

    const toggleType = (type: number) => {
        setFilterTypes((prev: number[]) =>
            prev.includes(type) ? prev.filter((t: number) => t !== type) : [...prev, type]
        );
    };

    const toggleStatus = (statusId: number) => {
        setFilterStatus((prev: number[]) =>
            prev.includes(statusId)
                ? prev.filter((s) => s !== statusId)
                : [...prev, statusId]
        );
    };

    const toggleSector = (sectorVal: string) => {
        if (!setFilterSectors) return;
        setFilterSectors((prev: string[]) =>
            prev.includes(sectorVal)
                ? prev.filter((s) => s !== sectorVal)
                : [...prev, sectorVal]
        );
    };

    const resetFilters = () => {
        setFilterMyTickets(false);
        setFilterTypes([]);
        setFilterStatus([]);
        if (setFilterSectors) setFilterSectors([]);
        if (setSearchTerm) setSearchTerm("");
    };

    const isGeneralFilterActive = !filterMyTickets && filterTypes.length === 0 && filterStatus.length === 0 && filterSectors.length === 0 && !searchTerm;

    const activeFiltersCount = [
        filterMyTickets,
        filterTypes.length > 0,
        filterStatus.length > 0,
        filterSectors.length > 0
    ].filter(Boolean).length;

    return (
        <>
            <Flex w="full" gap={3} align="center" justify="flex-end" wrap="wrap">
                {setSearchTerm && (
                    <InputGroup size="md" w={{ base: "full", md: "250px" }}>
                        <InputLeftElement pointerEvents="none">
                            <Icon as={FaSearch} color={triggerColor} fontSize="sm" />
                        </InputLeftElement>
                        <Input
                            placeholder="Buscar por ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            bg={drawerBg}
                            borderColor={triggerBorder}
                            color={titleColor}
                            borderRadius="md"
                            _focus={{ borderColor: triggerHoverBorder, boxShadow: "none" }}
                            type="number"
                        />
                    </InputGroup>
                )}

                <Flex
                    align="center"
                    gap={2}
                    color={triggerColor}
                    cursor="pointer"
                    onClick={onOpen}
                    transition="all 0.2s"
                    position="relative"
                    px={3}
                    py={2}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={triggerBorder}
                    _hover={{
                        color: triggerHoverColor,
                        transform: "translateY(-1px)",
                        borderColor: triggerHoverBorder,
                    }}
                >
                    <Icon as={FaFilter} fontSize="sm" />
                    <Text fontSize="sm" fontWeight="bold">FILTROS</Text>
                    {activeFiltersCount > 0 && (
                        <Badge
                            position="absolute"
                            top="-8px"
                            right="-8px"
                            colorScheme="blue"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="2xs"
                            minW="20px"
                            textAlign="center"
                        >
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Flex>
            </Flex>

            <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
                <DrawerOverlay />
                <DrawerContent
                    mt={drawerMargin}
                    height={drawerHeight}
                    borderTopLeftRadius="lg"
                    borderBottomLeftRadius="lg"
                    bg={drawerBg}
                    borderColor={drawerBorderColor}
                    borderWidth="1px"
                >
                    <DrawerCloseButton top="16px" right="16px" />

                    <DrawerHeader borderBottomWidth="1px" pt={6} borderColor={headerBorderColor}>
                        <Flex align="center" gap={2}>
                            <Icon as={FaFilter} />
                            <Text>Filtros de Tickets</Text>
                        </Flex>
                        <Text fontSize="sm" color={subtitleColor} mt={1} fontWeight="normal">
                            Ajuste os filtros abaixo para refinar sua visualização
                        </Text>
                    </DrawerHeader>

                    <DrawerBody
                        py={6}
                        overflowY="auto"
                        css={{
                            '&::-webkit-scrollbar': { width: '4px' },
                            '&::-webkit-scrollbar-track': { width: '6px' },
                            '&::-webkit-scrollbar-thumb': { background: scrollThumbColor, borderRadius: '24px' },
                        }}
                    >
                        <VStack spacing={6} align="stretch">

                            {typeOptions.length > 0 && (
                                <>
                                    <Box>
                                        <Text fontWeight="bold" mb={3} color={titleColor}>
                                            Tipo de Tickets
                                        </Text>
                                        <VStack spacing={3} align="stretch">
                                            {typeOptions.map((option) => {
                                                const isActive = filterTypes.includes(option.value);
                                                const IconComponent = option.icon;
                                                const activeBg = isDark ? `${option.color}.900` : `${option.color}.50`;
                                                const activeBorder = isDark ? `${option.color}.600` : `${option.color}.300`;
                                                const activeText = isDark ? `${option.color}.300` : `${option.color}.700`;
                                                const activeIcon = isDark ? `${option.color}.400` : `${option.color}.600`;
                                                const hoverBorder = isActive ? (isDark ? `${option.color}.500` : `${option.color}.400`) : itemBorderHover;

                                                return (
                                                    <Flex key={option.value} justify="space-between" align="center" p={3} borderRadius="md" borderWidth="1px" borderColor={isActive ? activeBorder : itemBorderDefault} bg={isActive ? activeBg : itemBgDefault} cursor="pointer" onClick={() => toggleType(option.value)} transition="all 0.2s" _hover={{ borderColor: hoverBorder }}>
                                                        <Flex align="center" gap={3}>
                                                            {IconComponent && <Icon as={IconComponent} color={isActive ? activeIcon : itemIconDefault} boxSize="20px" />}
                                                            <Text color={isActive ? activeText : itemTextDefault} fontWeight={isActive ? "semibold" : "normal"}>{option.label}</Text>
                                                        </Flex>
                                                        <Box onClick={(e) => e.stopPropagation()}>
                                                            <Switch isChecked={isActive} onChange={() => toggleType(option.value)} colorScheme={option.color} size="lg" />
                                                        </Box>
                                                    </Flex>
                                                );
                                            })}
                                        </VStack>
                                    </Box>
                                    <Divider borderColor={headerBorderColor} />
                                </>
                            )}

                            {sectorOptions.length > 0 && (
                                <>
                                    <Box>
                                        <Text fontWeight="bold" mb={3} color={titleColor}>
                                            Setor do Ticket
                                        </Text>
                                        <VStack spacing={3} align="stretch">
                                            {sectorOptions.map((option) => {
                                                const isActive = filterSectors.includes(option.value);
                                                const IconComponent = option.icon;
                                                const activeBg = isDark ? `${option.color}.900` : `${option.color}.50`;
                                                const activeBorder = isDark ? `${option.color}.600` : `${option.color}.300`;
                                                const activeText = isDark ? `${option.color}.300` : `${option.color}.700`;
                                                const activeIcon = isDark ? `${option.color}.400` : `${option.color}.600`;
                                                const hoverBorder = isActive ? (isDark ? `${option.color}.500` : `${option.color}.400`) : itemBorderHover;

                                                return (
                                                    <Flex key={option.value} justify="space-between" align="center" p={3} borderRadius="md" borderWidth="1px" borderColor={isActive ? activeBorder : itemBorderDefault} bg={isActive ? activeBg : itemBgDefault} cursor="pointer" onClick={() => toggleSector(option.value)} transition="all 0.2s" _hover={{ borderColor: hoverBorder }}>
                                                        <Flex align="center" gap={3}>
                                                            {IconComponent && <Icon as={IconComponent} color={isActive ? activeIcon : itemIconDefault} boxSize="20px" />}
                                                            <Text color={isActive ? activeText : itemTextDefault} fontWeight={isActive ? "semibold" : "normal"}>{option.label}</Text>
                                                        </Flex>
                                                        <Box onClick={(e) => e.stopPropagation()}>
                                                            <Switch isChecked={isActive} onChange={() => toggleSector(option.value)} colorScheme={option.color} size="lg" />
                                                        </Box>
                                                    </Flex>
                                                );
                                            })}
                                        </VStack>
                                    </Box>
                                    <Divider borderColor={headerBorderColor} />
                                </>
                            )}

                            <Box>
                                <Text fontWeight="bold" mb={3} color={titleColor}>
                                    Status do Ticket
                                </Text>
                                <VStack spacing={3} align="stretch">
                                    {statusOptions.map((option) => {
                                        const isActive = filterStatus.includes(option.value);
                                        const IconComponent = option.icon;
                                        const activeBg = isDark ? `${option.color}.900` : `${option.color}.50`;
                                        const activeBorder = isDark ? `${option.color}.600` : `${option.color}.300`;
                                        const activeText = isDark ? `${option.color}.300` : `${option.color}.700`;
                                        const activeIcon = isDark ? `${option.color}.400` : `${option.color}.600`;
                                        const hoverBorder = isActive ? (isDark ? `${option.color}.500` : `${option.color}.400`) : itemBorderHover;

                                        return (
                                            <Flex key={option.value} justify="space-between" align="center" p={3} borderRadius="md" borderWidth="1px" borderColor={isActive ? activeBorder : itemBorderDefault} bg={isActive ? activeBg : itemBgDefault} cursor="pointer" onClick={() => toggleStatus(option.value)} transition="all 0.2s" _hover={{ borderColor: hoverBorder }}>
                                                <Flex align="center" gap={3}>
                                                    {IconComponent && <Icon as={IconComponent} color={isActive ? activeIcon : itemIconDefault} boxSize="20px" />}
                                                    <Text color={isActive ? activeText : itemTextDefault} fontWeight={isActive ? "semibold" : "normal"}>{option.label}</Text>
                                                </Flex>
                                                <Box onClick={(e) => e.stopPropagation()}>
                                                    <Switch isChecked={isActive} onChange={() => toggleStatus(option.value)} colorScheme={option.color} size="lg" />
                                                </Box>
                                            </Flex>
                                        );
                                    })}
                                </VStack>
                            </Box>

                            <VStack spacing={3} mt={4} pb={4}>
                                <Button w="full" colorScheme="gray" variant="outline" onClick={resetFilters} leftIcon={<FaTimes />} isDisabled={isGeneralFilterActive} borderColor={btnOutlineBorder} color={btnOutlineColor} _hover={{ bg: btnOutlineHoverBg }}>
                                    Limpar Todos os Filtros
                                </Button>
                                <Button w="full" colorScheme="blue" onClick={onClose} leftIcon={<FaCheck />} boxShadow="md" _hover={{ boxShadow: "lg" }}>
                                    Aplicar Filtros
                                </Button>
                            </VStack>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {!isGeneralFilterActive && (
                <HStack gap={2} wrap="wrap" mt={2}>
                    {filterMyTickets && (
                        <Badge colorScheme={myTicketsColor} px={3} py={1} borderRadius="md" cursor="pointer" onClick={toggleMyTickets} _hover={{ opacity: 0.8 }}>
                            MEUS TICKETS
                        </Badge>
                    )}

                    {filterTypes.map(type => {
                        const option = typeOptions.find(opt => opt.value === type);
                        if (!option) return null;
                        return (
                            <Badge key={type} colorScheme={option.color} px={3} py={1} borderRadius="md" cursor="pointer" onClick={() => toggleType(type)} _hover={{ opacity: 0.8 }}>{option.label}</Badge>
                        );
                    })}

                    {filterSectors.map(sectorVal => {
                        const option = sectorOptions.find(opt => opt.value === sectorVal);
                        if (!option) return null;
                        return (
                            <Badge key={sectorVal} colorScheme={option.color} px={3} py={1} borderRadius="md" cursor="pointer" onClick={() => toggleSector(sectorVal)} _hover={{ opacity: 0.8 }}>{option.label}</Badge>
                        );
                    })}

                    {filterStatus.map(statusId => {
                        const option = statusOptions.find(opt => opt.value === statusId);
                        if (!option) return null;
                        return (
                            <Badge key={statusId} colorScheme={option.color} px={3} py={1} borderRadius="md" cursor="pointer" onClick={() => toggleStatus(statusId)} _hover={{ opacity: 0.8 }}>{option.label}</Badge>
                        );
                    })}
                </HStack>
            )}
        </>
    );
};