import {
    Box, Heading, Text, VStack, SimpleGrid, Badge, Flex, Icon,
    HStack, Button, Skeleton, Stepper, Step, StepIndicator, StepStatus, StepIcon, StepNumber, StepSeparator,
    Alert as ChakraAlert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    PinInput, PinInputField, useDisclosure
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUserCog, FaCheckDouble, FaClock, FaArrowLeft, FaKey, FaRegCircle, FaCheck, FaPlay, FaBox, FaRobot, FaWrench, FaExclamationTriangle
} from "react-icons/fa";
import { AnimatedCircleCheck, AnimatedBadgeAlert } from "../components/icons/NewAnimatedIcons";
import { StaticCctv, StaticBot } from "../components/icons/StaticIcons"
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import { TicketFilters } from "../components/TicketFilters";
import { TicketResolverWhatsappTransport } from "../components/TicketResolverWhatsappTransport";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { AxiosError } from "axios";
import type { ApiErrorResponse, AutomationTicket, User } from "../types";
import { formatDateTime } from "../helpers/date";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { Alert } from "../services/alertService";

export const AutomationTicketsList = () => {
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        isOpen: isSuccessStartOpen,
        onOpen: onSuccessStartOpen,
        onClose: onSuccessStartClose
    } = useDisclosure();

    const {
        isOpen: isSuccessResolveOpen,
        onOpen: onSuccessResolveOpen,
        onClose: onSuccessResolveClose
    } = useDisclosure();

    const {
        cardBg,
        borderColor,
        labelColor,
        titleColor,
        blueBadge,
        textColor,
        hoverBg,
        inputBg,
        modalBg,
        cardShadow,
        department,
        actionButtonBlue,
        actionButtonOrange,
        successBox,
        signatureBox,
        errorBg,
        errorColor,
        lineStopped,
        emptyState,
    } = useDepartmentTheme("automation");

    const [tickets, setTickets] = useState<AutomationTicket[]>([]);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [filterMyTickets, setFilterMyTickets] = useState(false);
    const [filterTypes, setFilterTypes] = useState<number[]>([]);
    const [filterStatus, setFilterStatus] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const isDarkMode = useColorModeValue(false, true);

    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [tokenInput, setTokenInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [successTicketId, setSuccessTicketId] = useState<number | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const ticketsPerPage = 6;

    useEffect(() => {
        const userStr = localStorage.getItem("ticket_user") || localStorage.getItem("user");
        if (userStr) {
            try {
                const user: User = JSON.parse(userStr);
                setCurrentUser(user);
            } catch (error) {
                console.error("Erro ao parsear usuário:", error);
            }
        }
    }, []);

    const fetchTickets = useCallback(async () => {
        try {
            if (isFirstLoad) await new Promise(resolve => setTimeout(resolve, 300));
            const { data } = await api.get<AutomationTicket[]>(API_ENDPOINTS.AUTOMATION.BASE);
            setTickets(data);
        } catch (error) {
            console.error("Erro no polling:", error);
        } finally {
            setIsFirstLoad(false);
        }
    }, [isFirstLoad]);

    useEffect(() => {
        fetchTickets();
        const intervalId = setInterval(fetchTickets, 3000);
        return () => clearInterval(intervalId);
    }, [fetchTickets]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterMyTickets, filterTypes, filterStatus, searchTerm]);

    const handleOpenStartModal = (ticketId: number) => {
        setSelectedTicketId(ticketId);
        setTokenInput("");
        onOpen();
    };

    const handleConfirmStart = async () => {
        if (!selectedTicketId || !currentUser || tokenInput.length !== 4) {
            Alert.error("Token Inválido", "Digite o código de 4 dígitos informado pelo solicitante.", isDarkMode);
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post(`${API_ENDPOINTS.AUTOMATION.BASE}/${selectedTicketId}/start`, {
                resolverId: currentUser.id,
                resolverName: currentUser.name,
                token: tokenInput
            });

            onClose();

            setSuccessTicketId(selectedTicketId);
            onSuccessStartOpen();

            fetchTickets();
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            let msg = "Token inválido ou erro no servidor.";

            if (err.response?.data?.message) {
                msg = err.response.data.message;
            }

            Alert.error("Erro ao assumir", msg, isDarkMode);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolveTicket = async (ticketId: number) => {
        if (!currentUser) return;

        Alert.confirm("Finalizar Atendimento?", "Deseja marcar este ticket como resolvido?", isDarkMode)
            .then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await api.post(`${API_ENDPOINTS.AUTOMATION.BASE}/${ticketId}/resolve`, {
                            resolverId: currentUser.id,
                            resolverName: currentUser.name,
                            token: ""
                        });

                        setSuccessTicketId(ticketId);
                        onSuccessResolveOpen();

                        fetchTickets();
                    } catch (error) {
                        const err = error as AxiosError<ApiErrorResponse>;
                        Alert.error("Erro", err.response?.data?.message || "Não foi possível finalizar.", isDarkMode);
                    }
                }
            });
    };

    const filteredTickets = tickets.filter(ticket => {
        if (searchTerm.trim() !== "") {
            if (!ticket.id.toString().includes(searchTerm.trim())) return false;
        }
        if (filterStatus.length === 0) {
            if (ticket.status === 3) return false;
        }
        if (filterMyTickets && currentUser && ticket.requesterId !== currentUser.id) return false;
        if (filterTypes.length > 0 && !filterTypes.includes(ticket.ticketType)) return false;
        if (filterStatus.length > 0 && !filterStatus.includes(ticket.status)) return false;
        return true;
    });

    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
    const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

    const getStatusColor = (status: number) => {
        switch (status) {
            case 1: return "orange";
            case 2: return "blue";
            case 3: return "green";
            default: return "gray";
        }
    };

    const getStatusBadge = (status: number) => {
        let bg = "gray.100";
        let color = "gray.600";
        let borderColor = "transparent";
        let label = "DESCONHECIDO";

        switch (status) {
            case 1:
                label = "ABERTO";
                bg = department.badge;
                color = department.badgeText;
                break;
            case 2:
                label = "EM ANDAMENTO";
                bg = blueBadge.bg;
                color = blueBadge.textColor;
                borderColor = "transparent";
                break;
            case 3:
                label = "RESOLVIDO";
                bg = successBox.bg;
                color = successBox.textColor;
                borderColor = "transparent";
                break;
        }

        return (
            <Badge
                bg={bg}
                color={color}
                variant="subtle"
                px={2} py={0.5} borderRadius="md"
                fontSize="0.75rem"
                borderWidth="1px"
                borderColor={borderColor}
            >
                {label}
            </Badge>
        );
    };

    const getTypeBadge = (type: number) => {
        const badgeProps = {
            variant: "outline",
            fontSize: "0.9rem",
            px: 3, py: 1, borderRadius: "md",
            display: "flex", alignItems: "center",
            borderWidth: "1px", boxShadow: "none",
            bg: "transparent"
        } as const;

        if (type === 1) return (
            <Badge
                {...badgeProps}
                color={department.tools?.text}
                borderColor={department.tools?.iconColor}
            >
                <StaticCctv size={20} style={{ marginRight: '8px' }} /> POSTOS DA LINHA
            </Badge>
        );

        return (
            <Badge
                {...badgeProps}
                color={department.systems?.text}
                borderColor={department.systems?.iconColor}
            >
                <StaticBot size={20} style={{ marginRight: '8px' }} /> SISTEMAS
            </Badge>
        );
    };

    const typeOptions = [
        { value: 0, label: "SISTEMAS", color: "purple", icon: FaRobot },
        { value: 1, label: "POSTOS DA LINHA", color: "cyan", icon: FaWrench }
    ];

    const statusOptions = [
        { value: 1, label: "Em Aberto", color: "orange", icon: FaRegCircle },
        { value: 2, label: "Em Andamento", color: "blue", icon: FaClock },
        { value: 3, label: "Resolvido", color: "green", icon: FaCheck }
    ];

    const getLabelValidationTypeName = (type?: string): string => {
        const names: Record<string, string> = { "CameraAiming": "Configurar Câmera do Apontamento", "CameraDoubleCheck": "Configurar Câmera do Double Check", "TotalConfiguration": "Configuração Total" };
        return type && names[type] ? names[type] : type || "N/A";
    };
    const getSystemSupportTypeName = (type?: string): string => {
        const names: Record<string, string> = { "ProductRegistration": "Cadastro de Produto", "ScaleWeightIssue": "Peso não sobe na Balança", "SoftwareInstallation": "Instalação de Software" };
        return type && names[type] ? names[type] : type || "N/A";
    };
    const getToolTypeName = (type?: string): string => {
        const names: Record<string, string> = { "LabelValidation": "Label Validation", "ProductTesting": "Ensaio de Produto" };
        return type && names[type] ? names[type] : type || "N/A";
    };
    const getLineSystemName = (system?: string): string => {
        const names: Record<string, string> = { "Monitoring": "Monitoring", "ModularSystem": "Modular System", "IndustrialSystem": "Industrial System" };
        return system && names[system] ? names[system] : system || "N/A";
    };

    const handleClearFilters = () => {
        setFilterMyTickets(false);
        setFilterTypes([]);
        setFilterStatus([]);
        setSearchTerm("");
    };

    const getCanStartTicket = () => {
        if (!currentUser) return false;

        const roles = currentUser.roles?.map(r => r.toLowerCase()) ?? [];

        if (roles.includes('admin')) return true;

        if (roles.includes('automation-agent')) return true;

        return false;
    };

    const canStartTicket = getCanStartTicket();

    const infoBoxStyle = {
        p: 2, flex: 1, borderRadius: "md",
        bg: department.main.bg,
        borderWidth: "1px",
        borderColor: department.main.border
    };
    const infoBoxTextStyle = {
        fontSize: "xs", color: department.main.text
    };

    return (
        <Box p={{ base: 4, md: 8 }} minH="100vh" display="flex" flexDirection="column">
            <Flex align="flex-start" justify="space-between" mb={8} direction={{ base: "column", md: "row" }} gap={4}>
                <HStack align="center" h="40px">
                    <Button variant="ghost" onClick={() => navigate("/")} mr={2} color={labelColor} _hover={{ bg: hoverBg }}>
                        <Icon as={FaArrowLeft} mr={2} /> Voltar
                    </Button>
                    <Heading size="lg" color={titleColor}>Tickets Automação: Visão Geral</Heading>
                </HStack>

                <Flex direction="column" align="flex-end" w={{ base: "full", md: "auto" }}>
                    <TicketFilters
                        filterMyTickets={filterMyTickets} setFilterMyTickets={setFilterMyTickets}
                        filterTypes={filterTypes} setFilterTypes={setFilterTypes}
                        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                        typeOptions={typeOptions} statusOptions={statusOptions} myTicketsColor="purple"
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    />
                </Flex>
            </Flex>

            <Box flex="1">
                {isFirstLoad ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Box key={i} bg={cardBg} p={3} borderRadius="xl" borderWidth="1px" borderColor={borderColor} display="flex" flexDirection="column">
                                <VStack gap={2} align="stretch" flex={1}>
                                    <Flex justify="space-between" align="start" mb={2}>
                                        <Skeleton height="24px" width="60%" borderRadius="md" />
                                        <HStack gap={2}>
                                            <Skeleton height="24px" width="80px" borderRadius="md" />
                                            <Skeleton height="24px" width="120px" borderRadius="md" />
                                        </HStack>
                                    </Flex>
                                    <HStack gap={2} w="full">
                                        <Skeleton height="40px" width="100%" borderRadius="md" />
                                        <Skeleton height="40px" width="100%" borderRadius="md" />
                                    </HStack>
                                    <HStack gap={2} w="full">
                                        <Skeleton height="40px" width="100%" borderRadius="md" />
                                        <Skeleton height="40px" width="100%" borderRadius="md" />
                                    </HStack>
                                    <Skeleton height="24px" width="100%" borderRadius="md" />
                                    <Skeleton height="50px" width="100%" borderRadius="md" />
                                    <Skeleton height="60px" width="100%" borderRadius="md" />
                                    <Box flex={1} />
                                    <VStack gap={2} w="full">
                                        <Skeleton height="24px" width="100%" borderRadius="md" />
                                        <Skeleton height="20px" width="100%" borderRadius="md" />
                                        <Skeleton height="16px" width="100%" borderRadius="md" />
                                    </VStack>
                                </VStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                ) : filteredTickets.length === 0 ? (
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        flex={1}
                        minH="60vh"
                        textAlign="center"
                        color={textColor}
                    >
                        <Box
                            mb={8}
                            color={emptyState.color}
                        >
                            <AnimatedBadgeAlert size={120} loop={true} strokeWidth={1.5} />
                        </Box>

                        <Heading size="md" mb={2} color={emptyState.color}>
                            Nenhum ticket encontrado
                        </Heading>

                        <Text mb={6} color={textColor} maxW="400px">
                            Não há tickets pendentes com os filtros atuais. A lista será atualizada automaticamente.
                        </Text>

                        <Button
                            variant="outline"
                            color={emptyState.color}
                            borderColor={emptyState.borderColor}
                            _hover={{ bg: hoverBg }}
                            onClick={handleClearFilters}
                            size="sm"
                        >
                            Limpar Filtros
                        </Button>
                    </Flex>
                ) : (
                    <>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                            {currentTickets.map((ticket) => {
                                const displayToken = ticket.confirmationToken || ticket.ConfirmationToken;

                                return (
                                    <Box
                                        key={ticket.id}
                                        bg={cardBg}
                                        p={3} borderRadius="xl"
                                        borderWidth={department.main.border ? "1px" : "0px"}
                                        borderColor={borderColor}
                                        boxShadow={cardShadow}
                                        transition="all 0.2s"
                                        _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                                        position="relative"
                                    >
                                        {ticket.checklistStatus === 1 && ticket.status === 3 && (
                                            <ChakraAlert status="warning" variant="solid" bg={errorBg} borderRadius="md" mb={3} py={2} borderWidth="1px" borderColor={errorColor}>
                                                <AlertIcon boxSize="12px" color={errorColor} />
                                                <Text fontSize="xs" fontWeight="bold" color={errorColor}>Checklist Pendente!</Text>
                                                <Button
                                                    size="xs" ml="auto" variant="outline" bg={cardBg}
                                                    color={errorColor} borderColor={errorColor}
                                                    onClick={() => navigate(`/checklists?ticket=${ticket.id}`)}
                                                >
                                                    Preencher
                                                </Button>
                                            </ChakraAlert>
                                        )}

                                        <Flex justify="space-between" align="start" mb={2}>
                                            <Text fontWeight="bold" fontSize="lg" mt={1} color={titleColor}>
                                                ID: {ticket.id} - {ticket.lineName}
                                            </Text>
                                            <HStack gap={2}>
                                                {displayToken && (
                                                    <Badge
                                                        variant="outline" fontSize="0.9rem" px={3} py={1} borderRadius="md"
                                                        borderWidth="1px" display="flex" alignItems="center"
                                                        title="Seu Token de Confirmação" boxShadow="none" bg="transparent"
                                                        color={department.primary} borderColor={department.primary}
                                                    >
                                                        <Icon as={FaKey} mr={2} boxSize="16px" /> {displayToken}
                                                    </Badge>
                                                )}
                                                {getTypeBadge(ticket.ticketType)}
                                            </HStack>
                                        </Flex>

                                        <VStack align="start" gap={2} mb={3} w="full">
                                            <HStack gap={2} w="full">
                                                <Box {...infoBoxStyle}>
                                                    <Text {...infoBoxTextStyle}>
                                                        <Icon as={FaCheckDouble} mr={1} fontSize="xs" /> <strong>Linha:</strong> {ticket.lineName}
                                                    </Text>
                                                </Box>
                                                <Box {...infoBoxStyle}>
                                                    <Text {...infoBoxTextStyle}>
                                                        <Icon as={FaBox} mr={1} fontSize="xs" /> <strong>Produto:</strong> {ticket.runningProduct}
                                                    </Text>
                                                </Box>
                                            </HStack>

                                            {ticket.ticketType === 0 && (
                                                <HStack gap={2} w="full">
                                                    <Box p={2} flex={1} borderRadius="md" bg={department.systems?.bg} borderWidth="1px" borderColor={department.systems?.border}>
                                                        <Text fontSize="xs" color={department.systems?.text}>
                                                            <StaticBot size={12} style={{ marginRight: '4px', display: 'inline' }} /> <strong>Sistema:</strong> {getLineSystemName(ticket.lineSystem)}
                                                        </Text>
                                                    </Box>
                                                    <Box p={2} flex={1} borderRadius="md" bg={department.systems?.bg} borderWidth="1px" borderColor={department.systems?.border}>
                                                        <Text fontSize="xs" color={department.systems?.text}>
                                                            <StaticBot size={12} style={{ marginRight: '4px', display: 'inline' }} /> <strong>Tipo:</strong> {getSystemSupportTypeName(ticket.systemSupportType)}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                            )}

                                            {ticket.ticketType === 1 && (
                                                <>
                                                    <HStack gap={2} w="full">
                                                        <Box p={2} flex={1} borderRadius="md" bg={department.tools?.bg} borderWidth="1px" borderColor={department.tools?.border}>
                                                            <Text fontSize="xs" color={department.tools?.text}>
                                                                <StaticCctv size={12} style={{ marginRight: '4px', display: 'inline' }} /> <strong>Ferramenta:</strong> {getToolTypeName(ticket.toolType)}
                                                            </Text>
                                                        </Box>
                                                        {ticket.labelValidationType && (
                                                            <Box p={2} flex={1} borderRadius="md" bg={department.tools?.bg} borderWidth="1px" borderColor={department.tools?.border}>
                                                                <Text fontSize="xs" color={department.tools?.text}>
                                                                    <StaticCctv size={12} style={{ marginRight: '4px', display: 'inline' }} /> <strong>Config:</strong> {getLabelValidationTypeName(ticket.labelValidationType)}
                                                                </Text>
                                                            </Box>
                                                        )}
                                                    </HStack>
                                                </>
                                            )}

                                            {ticket.isLineStopped !== undefined && ticket.isLineStopped !== null && (
                                                <Box
                                                    p={2} w="full" borderRadius="md"
                                                    bg="transparent"
                                                    borderWidth="2px" borderStyle="solid"
                                                    borderColor={ticket.isLineStopped ? lineStopped.stopped.borderColor : lineStopped.running.borderColor}
                                                >
                                                    <Flex align="center" gap={2}>
                                                        <Icon
                                                            as={ticket.isLineStopped ? FaExclamationTriangle : FaCheckDouble}
                                                            fontSize="xs"
                                                            color={ticket.isLineStopped ? lineStopped.stopped.iconColor : lineStopped.running.iconColor}
                                                        />
                                                        <Text
                                                            fontSize="xs"
                                                            fontWeight="bold"
                                                            color={ticket.isLineStopped ? lineStopped.stopped.textColor : lineStopped.running.textColor}
                                                            _dark={{ color: ticket.isLineStopped ? "#FF0000" : undefined }}
                                                        >
                                                            {ticket.isLineStopped
                                                                ? `LINHA PARADA desde ${ticket.lineStoppedTime || "horário não informado"}`
                                                                : "Sem Parada de Linha"}
                                                        </Text>
                                                    </Flex>
                                                </Box>
                                            )}

                                            <Flex align="center" gap={2} color={textColor} fontSize="xs">
                                                <Icon as={FaClock} />
                                                <Text>Aberto por <strong>{ticket.requesterName || `Requester #${ticket.requesterId}`}</strong> em: {formatDateTime(ticket.createdAt)}</Text>
                                            </Flex>

                                            <Box
                                                p={2} w="full" borderRadius="md" borderWidth="1px"
                                                bg={ticket.resolverName ? signatureBox.bg : department.main.bg}
                                                borderColor={ticket.resolverName ? actionButtonBlue.borderColor : department.main.border}
                                                color={ticket.resolverName ? actionButtonBlue.bg : department.main.text}
                                            >
                                                <Flex align="center" justify="space-between" gap={2}>
                                                    <Flex
                                                        align="center"
                                                        gap={2}
                                                        fontSize="sm"
                                                        fontWeight="bold"
                                                        color={ticket.resolverName ? actionButtonBlue.bg : department.main.text}
                                                    >
                                                        <Icon as={FaUserCog} />
                                                        <Text>
                                                            {ticket.resolverName ? `Ticket assumido por: ${ticket.resolverName}` : "Aguardando Responsável..."}
                                                        </Text>
                                                    </Flex>

                                                    {!ticket.resolverName && ticket.status === 1 && canStartTicket && (
                                                        <Button
                                                            size="xs"
                                                            {...actionButtonOrange}
                                                            variant="solid"
                                                            leftIcon={<FaPlay size="10px" />}
                                                            onClick={() => handleOpenStartModal(ticket.id)}
                                                        >
                                                            Assumir
                                                        </Button>
                                                    )}

                                                    {ticket.status === 2 && currentUser?.id === ticket.resolverId && (
                                                        <Button
                                                            size="xs"
                                                            bg={successBox.bg} color={successBox.textColor} borderColor={successBox.borderColor} borderWidth="1px"
                                                            _hover={{ bg: successBox.borderColor }}
                                                            variant="solid"
                                                            leftIcon={<FaCheck size="10px" />}
                                                            onClick={() => handleResolveTicket(ticket.id)}
                                                        >
                                                            Finalizar
                                                        </Button>
                                                    )}
                                                </Flex>
                                            </Box>

                                            <Box
                                                bg={cardBg} p={3} borderRadius="md" w="full" borderWidth="1px" borderColor={borderColor}
                                            >
                                                <Text fontSize="sm" fontStyle="italic" color={textColor}>
                                                    "{ticket.observation || 'Sem observações'}"
                                                </Text>
                                            </Box>
                                        </VStack>

                                        <Box mt={4} w="full">
                                            <Flex justify="space-between" align="center" mb={3}>
                                                <Text fontSize="xs" fontWeight="bold" color={labelColor}>Progresso</Text>
                                                {getStatusBadge(ticket.status)}
                                            </Flex>
                                            <Stepper
                                                size="sm"
                                                index={ticket.status === 3 ? 3 : ticket.status - 1}
                                                colorScheme={getStatusColor(ticket.status)}
                                                mt={2}
                                            >
                                                {[1, 2, 3].map((_, i) => (
                                                    <Step key={i}>
                                                        <StepIndicator>
                                                            <StepStatus
                                                                complete={<StepIcon />}
                                                                incomplete={<StepNumber />}
                                                                active={<StepNumber />}
                                                            />
                                                        </StepIndicator>
                                                        <StepSeparator />
                                                    </Step>
                                                ))}
                                            </Stepper>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </SimpleGrid>

                        {totalPages > 1 && (
                            <HStack spacing={2} justify="center" mt={8} mb={4}>
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    isDisabled={currentPage === 1}
                                    size="sm"
                                    variant="outline"
                                    borderColor={isDarkMode ? "white" : "black"}
                                    color={isDarkMode ? "white" : "black"}
                                    _hover={{ bg: hoverBg }}
                                >
                                    Anterior
                                </Button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        size="sm"
                                        variant="outline"
                                        color={currentPage === page ? (isDarkMode ? "white" : "black") : textColor}
                                        borderColor={currentPage === page ? (isDarkMode ? "white" : "black") : borderColor}
                                        borderWidth={currentPage === page ? "2px" : "1px"}
                                        _hover={{ bg: hoverBg }}
                                    >
                                        {page}
                                    </Button>
                                ))}

                                <Button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    isDisabled={currentPage === totalPages}
                                    size="sm"
                                    variant="outline"
                                    borderColor={isDarkMode ? "white" : "black"}
                                    color={isDarkMode ? "white" : "black"}
                                    _hover={{ bg: hoverBg }}
                                >
                                    Próximo
                                </Button>
                            </HStack>
                        )}
                    </>
                )}
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent bg={modalBg} borderColor={borderColor} borderWidth="1px">
                    <ModalHeader color={titleColor}>Assumir Ticket ID {selectedTicketId}</ModalHeader>
                    <ModalCloseButton color={labelColor} />
                    <ModalBody>
                        <VStack gap={6} py={4}>
                            <Text textAlign="center" fontSize="sm" color={textColor}>
                                Insira o token de 4 dígitos informado pelo solicitante para iniciar o atendimento.
                            </Text>

                            <HStack justify="center">
                                <PinInput
                                    size="lg"
                                    autoFocus
                                    otp
                                    value={tokenInput}
                                    onChange={(val) => setTokenInput(val)}
                                >
                                    {[1, 2, 3, 4].map(i => (
                                        <PinInputField key={i} bg={inputBg} borderColor={borderColor} color={textColor} _focus={{ borderColor: department.primary }} />
                                    ))}
                                </PinInput>
                            </HStack>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting} color={labelColor} _hover={{ bg: hoverBg }}>
                            Cancelar
                        </Button>
                        <Button
                            {...actionButtonOrange}
                            onClick={handleConfirmStart}
                            isLoading={isSubmitting}
                            isDisabled={tokenInput.length < 4}
                        >
                            Confirmar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isSuccessStartOpen} onClose={onSuccessStartClose} isCentered size="md">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent bg={cardBg} borderColor={borderColor} borderWidth="1px">
                    <ModalHeader color={titleColor}>Ticket Assumido com Sucesso!</ModalHeader>
                    <ModalCloseButton color={labelColor} />
                    <ModalBody>
                        <VStack gap={6} py={4}>
                            <Box color="green.400">
                                <AnimatedCircleCheck size={60} color="currentColor" />
                            </Box>

                            <Text textAlign="center" fontSize="lg" fontWeight="bold" color={titleColor}>
                                Ticket ID {successTicketId} em Andamento
                            </Text>

                            <Text textAlign="center" fontSize="sm" color={textColor}>
                                Você assumiu este ticket. Compartilhe no grupo do WhatsApp para avisar a equipe!
                            </Text>

                            {successTicketId && (
                                <TicketResolverWhatsappTransport
                                    ticketId={successTicketId}
                                    department="automation"
                                    actionType="start"
                                    buttonText="Compartilhar que Assumi"
                                />
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="outline" onClick={onSuccessStartClose} color={labelColor} borderColor={borderColor} _hover={{ bg: hoverBg }} w="full">
                            Fechar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isSuccessResolveOpen} onClose={onSuccessResolveClose} isCentered size="md">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent bg={cardBg} borderColor={borderColor} borderWidth="1px">
                    <ModalHeader color={titleColor}>Ticket Finalizado com Sucesso!</ModalHeader>
                    <ModalCloseButton color={labelColor} />
                    <ModalBody>
                        <VStack gap={6} py={4}>
                            <Box color="green.400">
                                <AnimatedCircleCheck size={60} color="currentColor" />
                            </Box>

                            <Text textAlign="center" fontSize="lg" fontWeight="bold" color={titleColor}>
                                Ticket ID {successTicketId} Resolvido
                            </Text>

                            <Text textAlign="center" fontSize="sm" color={textColor}>
                                Parabéns! Você finalizou o atendimento. Compartilhe no grupo para informar a equipe!
                            </Text>

                            {successTicketId && (
                                <TicketResolverWhatsappTransport
                                    ticketId={successTicketId}
                                    department="automation"
                                    actionType="resolve"
                                    buttonText="Compartilhar Finalização"
                                />
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="outline" onClick={onSuccessResolveClose} color={labelColor} borderColor={borderColor} _hover={{ bg: hoverBg }} w="full">
                            Fechar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};