import {
    Box, Heading, Text, VStack, SimpleGrid, Badge, Flex, Icon,
    HStack, Button, Skeleton, Stepper, Step, StepIndicator, StepStatus, StepIcon, StepNumber, StepSeparator,
    Alert as ChakraAlert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    PinInput, PinInputField, useDisclosure
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUserCog, FaCheckDouble, FaClock, FaWrench, FaBoxOpen,
    FaExclamationTriangle, FaArrowLeft, FaKey, FaRegCircle, FaCheck, FaPlay, FaBox
} from "react-icons/fa";
import { AnimatedCircleCheck, AnimatedBadgeAlert } from "../components/icons/NewAnimatedIcons";
import { StaticWrench, StaticArchive } from "../components/icons/StaticIcons";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import { TicketFilters } from "../components/TicketFilters";
import { TicketResolverWhatsappTransport } from "../components/TicketResolverWhatsappTransport";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { AxiosError } from "axios";
import type { SetupTicket, User, ApiErrorResponse } from "../types";
import { formatDateTime } from "../helpers/date";
import { Alert } from "../services/alertService";
import { useColorModeValue } from "../hooks/useColorModeValue";

export const SetupTicketsList = () => {
    const navigate = useNavigate();
    const isDarkMode = useColorModeValue(false, true);
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
        textColor,
        hoverBg,
        inputBg,
        modalBg,
        cardShadow,
        department,
        actionButtonBlue,
        actionButtonOrange,
        successBox,
        blueBadge,
        signatureBox,
        errorBg,
        errorColor,
        lineStopped,
        emptyState,
    } = useDepartmentTheme("setup");

    const [tickets, setTickets] = useState<SetupTicket[]>([]);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [filterMyTickets, setFilterMyTickets] = useState(false);
    const [filterTypes, setFilterTypes] = useState<number[]>([]);
    const [filterStatus, setFilterStatus] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

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
            const { data } = await api.get<SetupTicket[]>(API_ENDPOINTS.SETUP_TICKETS.GET_ALL);
            setTickets(data);
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            if (err.response?.status === 401) {
                navigate("/login");
            } else {
                console.error("Erro no polling:", error);
            }
        } finally {
            setIsFirstLoad(false);
        }
    }, [navigate, isFirstLoad]);

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
            Alert.error("Token inválido", "Digite o código de 4 dígitos.", isDarkMode);
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post(`${API_ENDPOINTS.SETUP_TICKETS.BASE}/${selectedTicketId}/start`, {
                resolverId: currentUser.id,
                resolverName: currentUser.name,
                token: tokenInput
            });

            const idSalvo = selectedTicketId;
            onClose();

            setSuccessTicketId(idSalvo);
            onSuccessStartOpen();

            fetchTickets();
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            let errorMessage = "Token inválido ou erro no servidor.";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            Alert.error("Erro ao assumir", errorMessage, isDarkMode);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolveTicket = async (ticketId: number) => {
        if (!currentUser) return;

        Alert.confirm("Finalizar Atendimento?", "Deseja encerrar este ticket e enviar o checklist?", isDarkMode)
            .then(async (result) => {
                if (result.isConfirmed) {
                    setIsSubmitting(true);
                    try {
                        await api.post(`${API_ENDPOINTS.SETUP_TICKETS.BASE}/${ticketId}/resolve`, {
                            resolverId: currentUser.id,
                            token: ""
                        });

                        setSuccessTicketId(ticketId);
                        onSuccessResolveOpen();

                        fetchTickets();
                    } catch (error) {
                        const err = error as AxiosError<ApiErrorResponse>;
                        Alert.error("Erro", err.response?.data?.message || "Não foi possível finalizar.", isDarkMode);
                    } finally {
                        setIsSubmitting(false);
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
        const displayToken = ticket.confirmationToken || ticket.ConfirmationToken;
        if (filterMyTickets && !displayToken) return false;
        if (filterTypes.length > 0 && !filterTypes.includes(ticket.setupType as number)) return false;
        if (filterStatus.length > 0 && !filterStatus.includes(ticket.status as number)) return false;
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
        const borderColor = "transparent";
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
                break;
            case 3:
                label = "RESOLVIDO";
                bg = successBox.bg;
                color = successBox.textColor;
                break;
        }
        return (
            <Badge
                bg={bg}
                color={color}
                borderColor={borderColor}
                variant="subtle"
                px={2}
                borderWidth="1px"
                borderRadius="md"
            >
                {label}
            </Badge>
        );
    };

    const getTypeBadge = (type: number) => {
        const badgeProps = {
            variant: "outline",
            fontSize: "0.9rem",
            px: 3,
            py: 1,
            borderRadius: "md",
            display: "flex",
            alignItems: "center",
            borderWidth: "1px",
            boxShadow: "none",
            bg: "transparent"
        } as const;

        if (type === 0) {
            return (
                <Badge {...badgeProps} color={department.main.text} borderColor={department.main.iconColor}>
                    <Box mr={2} display="flex" alignItems="center">
                        <StaticWrench size={20} color="currentColor" />
                    </Box>
                    SETUP
                </Badge>
            );
        }

        return (
            <Badge {...badgeProps} color={department.material?.text} borderColor={department.material?.iconColor}>
                <Box mr={2} display="flex" alignItems="center">
                    <StaticArchive size={20} color="currentColor" />
                </Box>
                MATERIAL
            </Badge>
        );
    };

    const typeOptions = [
        { value: 0, label: "SETUP", color: "blue", icon: FaWrench },
        { value: 1, label: "MATERIAL", color: "orange", icon: FaBoxOpen }
    ];

    const statusOptions = [
        { value: 1, label: "Em Aberto", color: "orange", icon: FaRegCircle },
        { value: 2, label: "Em Andamento", color: "blue", icon: FaClock },
        { value: 3, label: "Resolvido", color: "green", icon: FaCheck }
    ];

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

        if (roles.includes('setup-agent')) return true;

        return false;
    };

    const canStartTicket = getCanStartTicket();

    const canFillChecklist = currentUser?.roles?.some(r =>
        ['requester', 'admin', 'tecnicosetup'].includes(r.toLowerCase())
    ) ?? false;

    return (
        <Box p={{ base: 4, md: 8 }} minH="100vh" display="flex" flexDirection="column">
            <Flex align="flex-start" justify="space-between" mb={8} direction={{ base: "column", md: "row" }} gap={4}>
                <HStack align="center" h="40px">
                    <Button variant="ghost" onClick={() => navigate("/")} mr={2} color={labelColor} _hover={{ bg: hoverBg }}>
                        <Icon as={FaArrowLeft} mr={2} /> Voltar
                    </Button>
                    <Heading size="lg" color={titleColor}>Tickets Setup: Visão Geral</Heading>
                </HStack>

                <Flex direction="column" align="flex-end" w={{ base: "full", md: "auto" }}>
                    <TicketFilters
                        filterMyTickets={filterMyTickets} setFilterMyTickets={setFilterMyTickets}
                        filterTypes={filterTypes} setFilterTypes={setFilterTypes}
                        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                        typeOptions={typeOptions} statusOptions={statusOptions} myTicketsColor="blue"
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
                                            <Skeleton height="24px" width="80px" borderRadius="md" />
                                        </HStack>
                                    </Flex>
                                    <Skeleton height="40px" width="100%" borderRadius="md" />
                                    <Skeleton height="40px" width="100%" borderRadius="md" />
                                    <Skeleton height="32px" width="100%" borderRadius="md" />
                                    <Skeleton height="40px" width="100%" borderRadius="md" />
                                    <Skeleton height="50px" width="100%" borderRadius="md" />
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
                            Nenhum ticket de setup encontrado
                        </Heading>

                        <Text mb={6} color={textColor} maxW="450px">
                            Nenhum ticket de setup encontrado com os filtros selecionados.
                        </Text>

                        <Button
                            variant="outline"
                            color={emptyState.color}
                            borderColor={emptyState.borderColor}
                            _hover={{ bg: hoverBg }}
                            onClick={handleClearFilters}
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
                                    <Box key={ticket.id} bg={cardBg} p={3} borderRadius="xl" borderWidth={department.main.border ? "1px" : "0px"} borderColor={borderColor} boxShadow={cardShadow} transition="all 0.2s" _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }} position="relative">
                                        {ticket.checklistStatus === 1 && ticket.status === 3 && (
                                            <ChakraAlert status="warning" variant="solid" bg={errorBg} borderRadius="md" mb={3} py={2} borderWidth="1px" borderColor={errorColor}>
                                                <AlertIcon boxSize="12px" color={errorColor} />
                                                {canFillChecklist ? (
                                                    <>
                                                        <Text fontSize="xs" fontWeight="bold" color={errorColor}>Checklist Pendente!</Text>
                                                        <Button size="xs" ml="auto" variant="outline" bg={cardBg} color={errorColor} borderColor={errorColor} onClick={() => navigate(`/checklists?ticket=${ticket.id}`)}>Preencher</Button>
                                                    </>
                                                ) : (
                                                    <Text fontSize="xs" fontWeight="bold" color={errorColor}>Checklist enviado ao requester</Text>
                                                )}
                                            </ChakraAlert>
                                        )}
                                        <Flex justify="space-between" align="start" mb={2}>
                                            <Text fontWeight="bold" fontSize="lg" mt={1} color={titleColor}>ID: {ticket.id} - {ticket.lineName}</Text>
                                            <HStack gap={2}>
                                                {displayToken && (
                                                    <Badge variant="outline" fontSize="0.9rem" px={3} py={1} borderRadius="md" borderWidth="1px" display="flex" alignItems="center" title="Seu Token de Confirmação" boxShadow="none" bg="transparent" color={department.main.text} borderColor={department.main.border}><Icon as={FaKey} mr={2} boxSize="16px" /> {displayToken}</Badge>
                                                )}
                                                {getTypeBadge(ticket.setupType as number)}
                                            </HStack>
                                        </Flex>
                                        <VStack align="start" gap={2} mb={3} w="full">
                                            {ticket.setupType === 0 ? (
                                                <>
                                                    {ticket.product && (
                                                        <Box p={2} w="full" borderRadius="md" bg={department.main.bg} borderWidth="1px" borderColor={department.main.border}><Flex align="center" gap={2} color={department.main.text}><Icon as={FaBox} /><Text fontWeight="bold" fontSize="sm">Produto: {ticket.product}</Text></Flex></Box>
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
                                                </>
                                            ) : (
                                                <Box p={2} w="full" borderRadius="md" bg={department.material?.bg} borderWidth="1px" borderColor={department.material?.border}><Flex align="center" gap={2} color={department.material?.text}><Box mr={2} display="flex" alignItems="center"><StaticWrench size={14} color="currentColor" /></Box><Text fontWeight="bold" fontSize="sm">Material: {ticket.requestedMaterial || "Não especificado"}</Text></Flex></Box>
                                            )}
                                            <Flex align="center" gap={2} color={textColor} fontSize="xs"><Icon as={FaClock} /> <Text>Aberto por <strong>{ticket.requesterName || `Requester #${ticket.requesterId}`}</strong> em: {formatDateTime(ticket.createdAt)}</Text></Flex>
                                            <Box p={2} w="full" borderRadius="md" borderWidth="1px" bg={ticket.resolverName ? signatureBox.bg : department.material?.bg} borderColor={ticket.resolverName ? actionButtonBlue.borderColor : department.material?.border}>
                                                <Flex align="center" justify="space-between" gap={2}><Flex align="center" gap={2} fontSize="sm" fontWeight="bold" color={ticket.resolverName ? actionButtonBlue.bg : department.material?.text}><Icon as={FaUserCog} /><Text>{ticket.resolverName ? `Téc: ${ticket.resolverName}` : "Aguardando Responsável..."}</Text></Flex>
                                                    {!ticket.resolverName && ticket.status === 1 && canStartTicket && (<Button size="xs" {...actionButtonOrange} variant="solid" leftIcon={<FaPlay size="10px" />} onClick={() => handleOpenStartModal(ticket.id)}>Assumir</Button>)}
                                                    {ticket.status === 2 && currentUser?.id === ticket.resolverId && (<Button size="xs" bg={successBox.bg} color={successBox.textColor} borderColor={successBox.borderColor} borderWidth="1px" _hover={{ bg: successBox.borderColor }} variant="solid" leftIcon={<FaCheck size="10px" />} isLoading={isSubmitting} onClick={() => handleResolveTicket(ticket.id)}>Finalizar</Button>)}</Flex>
                                            </Box>
                                            <Box bg={inputBg} p={3} borderRadius="md" w="full" borderWidth="1px" borderColor={borderColor}><Text fontSize="sm" fontStyle="italic" color={textColor}>"{ticket.observation || 'Sem observações'}"</Text></Box>
                                        </VStack>
                                        <Box mt={4} w="full">
                                            <Flex justify="space-between" align="center" mb={3}><Text fontSize="xs" fontWeight="bold" color={labelColor}>Progresso</Text>{getStatusBadge(ticket.status as number)}</Flex>
                                            <Stepper size="sm" index={ticket.status === 3 ? 3 : (ticket.status as number) - 1} colorScheme={getStatusColor(ticket.status as number)} mt={2}>{[1, 2, 3].map((_step, i) => (<Step key={i}><StepIndicator><StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} /></StepIndicator><StepSeparator /></Step>))}</Stepper>
                                            <Flex justify="space-between" mt={2} fontSize="xs" color={textColor} fontWeight="medium"><Text transform="translateX(-10%)">Aberto</Text><Text>Andamento</Text><Text transform="translateX(10%)">Resolvido</Text></Flex>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                        {totalPages > 1 && (
                            <HStack spacing={2} justify="center" mt={8} mb={4}>
                                <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} isDisabled={currentPage === 1} size="sm" variant="outline" borderColor={isDarkMode ? "white" : "black"} color={isDarkMode ? "white" : "black"} _hover={{ bg: hoverBg }}>Anterior</Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (<Button key={page} onClick={() => setCurrentPage(page)} size="sm" variant="outline" color={currentPage === page ? (isDarkMode ? "white" : "black") : textColor} borderColor={currentPage === page ? (isDarkMode ? "white" : "black") : borderColor} borderWidth={currentPage === page ? "2px" : "1px"} _hover={{ bg: hoverBg }}>{page}</Button>))}
                                <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} isDisabled={currentPage === totalPages} size="sm" variant="outline" borderColor={isDarkMode ? "white" : "black"} color={isDarkMode ? "white" : "black"} _hover={{ bg: hoverBg }}>Próximo</Button>
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
                            <Text textAlign="center" fontSize="sm" color={textColor}>Insira o token de 4 dígitos informado pelo solicitante para iniciar o atendimento.</Text>
                            <HStack justify="center">
                                <PinInput size="lg" autoFocus otp value={tokenInput} onChange={(val) => setTokenInput(val)}>
                                    {[1, 2, 3, 4].map(i => (<PinInputField key={i} bg={inputBg} borderColor={borderColor} color={textColor} _focus={{ borderColor: department.primary }} />))}
                                </PinInput>
                            </HStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting} color={labelColor} _hover={{ bg: hoverBg }}>Cancelar</Button>
                        <Button {...actionButtonOrange} onClick={handleConfirmStart} isLoading={isSubmitting} isDisabled={tokenInput.length < 4}>Confirmar</Button>
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
                            <Box color="green.400"><AnimatedCircleCheck size={60} color="currentColor" /></Box>
                            <Text textAlign="center" fontSize="lg" fontWeight="bold" color={titleColor}>Ticket ID {successTicketId} em Andamento</Text>
                            <Text textAlign="center" fontSize="sm" color={textColor}>Você assumiu este ticket. Compartilhe no grupo do WhatsApp para avisar a equipe!</Text>
                            {successTicketId && (
                                <TicketResolverWhatsappTransport
                                    ticketId={successTicketId}
                                    department="setup"
                                    actionType="start"
                                    buttonText="Compartilhar que Assumi"
                                />
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="outline" onClick={onSuccessStartClose} color={labelColor} borderColor={borderColor} _hover={{ bg: hoverBg }} w="full">Fechar</Button>
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
                            <Box color="green.400"><AnimatedCircleCheck size={60} color="currentColor" /></Box>
                            <Text textAlign="center" fontSize="lg" fontWeight="bold" color={titleColor}>Ticket ID {successTicketId} Resolvido</Text>
                            <Text textAlign="center" fontSize="sm" color={textColor}>Parabéns! Você finalizou o atendimento. Compartilhe no grupo para informar a equipe!</Text>
                            {successTicketId && (
                                <TicketResolverWhatsappTransport
                                    ticketId={successTicketId}
                                    department="setup"
                                    actionType="resolve"
                                    buttonText="Compartilhar Finalização"
                                />
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="outline" onClick={onSuccessResolveClose} color={labelColor} borderColor={borderColor} _hover={{ bg: hoverBg }} w="full">Fechar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};