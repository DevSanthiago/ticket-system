import {
    Box, Heading, Text, Button, Flex, Icon, Spinner, Badge,
    useDisclosure, useToast, VStack, StackDivider, Input, InputGroup, InputLeftElement, HStack, IconButton
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import {
    FaClipboardCheck, FaClock, FaSearch, FaEnvelope, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import {
    AnimatedCircleCheck, AnimatedFeather, AnimatedArrowBigUpDash, AnimatedFileCheck2, AnimatedEye
} from "../components/icons/NewAnimatedIcons";
import { ChecklistForm } from "../components/ChecklistForm";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { AxiosError } from "axios";
import type { SetupTicket, User, ApiErrorResponse, TicketActionButtonProps } from "../types";
import { ChecklistStatus } from "../types";

const TicketActionButton = ({
    userRole,
    onClick,
    isPending,
    actionButtonOrange,
    actionButtonBlue
}: TicketActionButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);

    let IconComponent;
    if (isPending) {
        IconComponent = userRole === 'Requester' ? AnimatedFeather : AnimatedArrowBigUpDash;
    } else {
        IconComponent = AnimatedEye;
    }

    return (
        <Button
            size="sm"
            {...(isPending ? actionButtonOrange : actionButtonBlue)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            leftIcon={<IconComponent size={18} isHovered={isHovered} />}
            onClick={onClick}
            minW={{ base: "full", md: "180px" }}
            transition="all 0.2s"
        >
            {isPending
                ? (userRole === 'Requester' ? "Preencher" : "Enviado")
                : "Visualizar"
            }
        </Button>
    );
};

export const ChecklistPage = () => {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [viewMode, setViewMode] = useState<'sent' | 'received'>('sent');
    const [searchTerm, setSearchTerm] = useState("");

    const [isSentHovered, setIsSentHovered] = useState(false);
    const [isReceivedHovered, setIsReceivedHovered] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    const {
        borderColor,
        hoverBg,
        hoverButtonTextColor,
        searchBg,
        textColor,
        actionButtonBlue,
        actionButtonOrange,
        emptyStateBg,
        emptyStateTitle,
        emptyStateText
    } = useDepartmentTheme("setup");

    const [tickets, setTickets] = useState<SetupTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<SetupTicket | null>(null);

    const isRequester = currentUser?.roles?.some(r => r.toLowerCase() === 'requester') ?? false;
    const userRoleString = isRequester ? 'Requester' : undefined;

    useEffect(() => {
        const userStr = localStorage.getItem("ticket_user") || localStorage.getItem("user");
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr) as User);
            } catch (e) {
                console.error("Erro ao ler usuário", e);
            }
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode, searchTerm]);

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get<SetupTicket[]>(API_ENDPOINTS.SETUP_TICKETS.GET_ALL);

            let filteredData = data;

            if (viewMode === 'sent') {
                filteredData = data.filter(t => t.checklistStatus === ChecklistStatus.Pending);
            } else {
                filteredData = data.filter(t => t.checklistStatus === ChecklistStatus.Completed && t.checklistContent);
            }

            if (searchTerm) {
                const lowerSearch = searchTerm.toLowerCase();
                filteredData = filteredData.filter(t =>
                    t.id.toString().includes(lowerSearch) ||
                    t.lineName.toLowerCase().includes(lowerSearch) ||
                    t.lineCategory.toString().toLowerCase().includes(lowerSearch) ||
                    (t.requesterName && t.requesterName.toLowerCase().includes(lowerSearch))
                );
            }

            setTickets(filteredData);

        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            const errorMessage = err.response?.data?.message || "Erro ao carregar tickets";
            toast({
                title: "Erro",
                description: errorMessage,
                status: "error",
                duration: 4000,
                isClosable: true
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [toast, viewMode, searchTerm]);

    useEffect(() => {
        if (currentUser) fetchTickets();
    }, [currentUser, fetchTickets]);

    const totalPages = Math.ceil(tickets.length / ITEMS_PER_PAGE);
    const paginatedTickets = tickets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleTicketClick = (ticket: SetupTicket) => {
        setSelectedTicket(ticket);
        onOpen();
    };

    const getHeaderTitle = () => {
        const count = tickets.length;

        if (viewMode === 'sent') {
            if (isRequester) {
                if (count > 0) return `Você possui ${count} checklists pendentes para preencher!`;
                return "Parabéns, você não possui pendências!";
            } else {
                if (count > 0) return `Você enviou ${count} checklists para preenchimento!`;
                return "Não há checklists pendentes aguardando monitores.";
            }
        } else {
            if (isRequester) {
                if (count > 0) return `Você já preencheu ${count} checklists!`;
                return "Nenhum histórico de preenchimento encontrado.";
            } else {
                if (count > 0) return `Você possui ${count} checklists preenchidos e finalizados!`;
                return "Nenhum checklist preenchido encontrado.";
            }
        }
    };

    if (isLoading) return <Flex justify="center" align="center" h="100vh"><Spinner size="xl" color="blue.500" /></Flex>;

    return (
        <Box p={{ base: 4, md: 8 }} w="100%">
            <Box pb={3}>
                <Flex
                    direction={{ base: "column", xl: "row" }}
                    align={{ base: "start", xl: "center" }}
                    justify="space-between"
                    gap={4}
                    mb={2}
                >
                    <Flex align="center" gap={3} wrap="wrap">
                        <Badge
                            variant="outline"
                            colorScheme={isRequester ? "orange" : "blue"}
                            p={2}
                            borderRadius="lg"
                            display="flex"
                            alignItems="center"
                            gap={2}
                            fontSize="md"
                            textTransform="none"
                        >
                            <Icon
                                as={viewMode === 'sent' && !isRequester ? FaEnvelope : FaClipboardCheck}
                            />
                            <Text as="span" fontWeight="bold">Caixa de entrada</Text>
                        </Badge>

                        <Heading size="md" fontWeight="medium" color={textColor}>
                            {getHeaderTitle()}
                        </Heading>
                    </Flex>

                    <HStack w={{ base: "full", xl: "auto" }} spacing={3}>
                        <InputGroup w={{ base: "full", md: "320px" }}>
                            <InputLeftElement pointerEvents="none">
                                <Icon as={FaSearch} color="gray.400" />
                            </InputLeftElement>
                            <Input
                                placeholder="Buscar por ID, Linha ou Requester..."
                                bg={searchBg}
                                borderColor={borderColor}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>

                        <HStack spacing={2}>
                            <Button
                                size="md"
                                onMouseEnter={() => setIsSentHovered(true)}
                                onMouseLeave={() => setIsSentHovered(false)}
                                leftIcon={
                                    isRequester
                                        ? <AnimatedFeather size={18} isHovered={isSentHovered} />
                                        : <AnimatedArrowBigUpDash size={18} isHovered={isSentHovered} />
                                }
                                onClick={() => setViewMode('sent')}
                                variant={viewMode === 'sent' ? "solid" : "outline"}
                                bg={viewMode === 'sent' ? "blue.500" : "transparent"}
                                borderColor={viewMode === 'sent' ? "blue.500" : borderColor}
                                borderWidth="1px"
                                color={viewMode === 'sent' ? "white" : "gray.500"}
                                _hover={{
                                    bg: viewMode === 'sent' ? "blue.600" : hoverBg,
                                    borderColor: viewMode === 'sent' ? "blue.600" : "gray.400",
                                    color: viewMode === 'sent' ? "white" : hoverButtonTextColor
                                }}
                                _active={{
                                    bg: "blue.700",
                                    color: "white",
                                    borderColor: "blue.700"
                                }}
                                minW="120px"
                            >
                                {isRequester ? "Preencher" : "Enviados"}
                            </Button>

                            <Button
                                size="md"
                                onMouseEnter={() => setIsReceivedHovered(true)}
                                onMouseLeave={() => setIsReceivedHovered(false)}
                                leftIcon={<AnimatedFileCheck2 size={18} isHovered={isReceivedHovered} />}
                                onClick={() => setViewMode('received')}
                                variant={viewMode === 'received' ? "solid" : "outline"}
                                bg={viewMode === 'received' ? "green.500" : "transparent"}
                                borderColor={viewMode === 'received' ? "green.500" : borderColor}
                                borderWidth="1px"
                                color={viewMode === 'received' ? "white" : "gray.500"}
                                _hover={{
                                    bg: viewMode === 'received' ? "green.600" : hoverBg,
                                    borderColor: viewMode === 'received' ? "green.600" : "gray.400",
                                    color: viewMode === 'received' ? "white" : hoverButtonTextColor
                                }}
                                _active={{
                                    bg: "green.700",
                                    color: "white",
                                    borderColor: "green.700"
                                }}
                            >
                                Preenchidos
                            </Button>
                        </HStack>
                    </HStack>
                </Flex>
            </Box>

            {tickets.length === 0 ? (
                <Box textAlign="center" py={10} bg={emptyStateBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                    <Box mb={4} display="flex" justifyContent="center">
                        <AnimatedCircleCheck size={70} color="#38A169" />
                    </Box>
                    <Heading size="md" mb={2} color={emptyStateTitle}>Nenhum item encontrado</Heading>
                    <Text color={emptyStateText}>
                        {isRequester
                            ? "Você não tem pendências de checklist."
                            : "Nenhum checklist finalizado para visualização."}
                    </Text>
                </Box>
            ) : (
                <VStack
                    spacing={0}
                    align="stretch"
                    bg={emptyStateBg}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    divider={<StackDivider borderColor={borderColor} />}
                    overflow="hidden"
                    mb={4}
                >
                    {paginatedTickets.map((ticket) => (
                        <Flex
                            key={ticket.id}
                            p={4}
                            align="center"
                            justify="space-between"
                            gap={4}
                            transition="all 0.2s"
                            _hover={{ bg: hoverBg }}
                            direction={{ base: "column", md: "row" }}
                        >
                            <Flex gap={4} align="center" flex={1}>
                                <Badge
                                    colorScheme={ticket.checklistStatus === ChecklistStatus.Pending ? "orange" : "green"}
                                    px={2} py={1} borderRadius="md"
                                    minW="80px" textAlign="center"
                                >
                                    ID: {ticket.id}
                                </Badge>

                                <Box>
                                    <Heading size="sm" mb={1} color={textColor}>
                                        {ticket.lineName}
                                    </Heading>
                                    <Text fontSize="xs" color={textColor} display="flex" alignItems="center" gap={1}>
                                        <Icon as={FaClock} />
                                        {ticket.checklistStatus === ChecklistStatus.Pending
                                            ? "Aguardando conferência"
                                            : `Checklist gerado em ${new Date(ticket.createdAt).toLocaleDateString()}`
                                        }
                                    </Text>
                                </Box>
                            </Flex>

                            <Box flex={1} display={{ base: "none", md: "block" }}>
                                <Text fontSize="sm" color={textColor}>
                                    {ticket.checklistStatus === ChecklistStatus.Pending ? (
                                        <>
                                            <Text as="span" fontWeight="bold">Responsável:</Text> {ticket.resolverName}
                                        </>
                                    ) : (
                                        <>
                                            <Text as="span" fontWeight="bold">Conferido por:</Text>{" "}
                                            {ticket.requesterName || `Requester #${ticket.requesterId}`}
                                        </>
                                    )}
                                </Text>

                                <Flex align="center" gap={2} mt={1} wrap="wrap">
                                    <Badge variant="outline" colorScheme="blue">
                                        {ticket.lineCategory}
                                    </Badge>

                                    <Badge
                                        variant="solid"
                                        colorScheme="gray"
                                        fontSize="0.65rem"
                                        bg="gray.500"
                                        color="white"
                                        _dark={{ bg: "gray.700" }}
                                        title="Engenheiro Responsável pelo Documento"
                                    >
                                        Checklist elaborado por Renato Miranda
                                    </Badge>
                                </Flex>
                            </Box>

                            <TicketActionButton
                                userRole={userRoleString}
                                onClick={() => handleTicketClick(ticket)}
                                isPending={ticket.checklistStatus === ChecklistStatus.Pending}
                                actionButtonOrange={actionButtonOrange}
                                actionButtonBlue={actionButtonBlue}
                                ticket={ticket}
                            />
                        </Flex>
                    ))}
                </VStack>
            )}

            {tickets.length > 0 && (
                <Flex justify="space-between" align="center" mb={3}>
                    <Text fontSize="sm" color="gray.500">
                        Mostrando {paginatedTickets.length} de {tickets.length} registros
                    </Text>
                    <HStack spacing={2}>
                        <IconButton
                            aria-label="Página anterior"
                            icon={<FaChevronLeft />}
                            size="sm"
                            isDisabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        />
                        <Text fontSize="sm" fontWeight="bold">
                            {currentPage} de {totalPages}
                        </Text>
                        <IconButton
                            aria-label="Próxima página"
                            icon={<FaChevronRight />}
                            size="sm"
                            isDisabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        />
                    </HStack>
                </Flex>
            )}

            <ChecklistForm
                isOpen={isOpen}
                onClose={onClose}
                ticket={selectedTicket}
                currentUser={currentUser}
                onSuccess={fetchTickets}
            />
        </Box>
    );
};