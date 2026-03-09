import {
    Box, Heading, Text, Button, VStack, SimpleGrid, HStack,
    Icon, Input, Textarea, Flex, Spinner, chakra
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { AnimatedCctv, AnimatedLaptopCheck, AnimatedChartSpline, AnimatedCircleCheck } from "../components/icons/NewAnimatedIcons";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import { TicketWhatsappTransport } from "../components/WhatsappTransport";
import { AxiosError } from "axios";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { ApiErrorResponse, AutomationTicket, LinePrefix, ProductionLine, ProductionLinesByPrefix } from "../types";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { Alert } from "../services/alertService";

const allowedCategoriesForTools = ["SA", "ML"];

export const AutomationForm = () => {
    const isDarkMode = useColorModeValue(false, true);
    const navigate = useNavigate();

    const {
        cardBg,
        borderColor,
        inputBg,
        labelColor,
        textColor,
        selectColor,
        hoverBg,
        department
    } = useDepartmentTheme("automation");

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [createdTicket, setCreatedTicket] = useState<{ id: number, token: string } | null>(null);

    const [hoveredSystemButton, setHoveredSystemButton] = useState(false);
    const [hoveredToolButton, setHoveredToolButton] = useState(false);
    const [hoveredLabelValidation, setHoveredLabelValidation] = useState(false);
    const [hoveredProduct, setHoveredProduct] = useState(false);

    const [ticketType, setTicketType] = useState<number | null>(null);
    const [prefixes, setPrefixes] = useState<LinePrefix[]>([]);
    const [lines, setLines] = useState<ProductionLine[]>([]);
    const [selectedPrefix, setSelectedPrefix] = useState<string>("");
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
    const [isLineStopped, setIsLineStopped] = useState(false);
    const [stoppedTime, setStoppedTime] = useState("");
    const [hasAnsweredStoppage, setHasAnsweredStoppage] = useState(false);
    const [runningProduct, setRunningProduct] = useState<string>("");
    const [lineSystem, setLineSystem] = useState<number | null>(null);
    const [systemSupportType, setSystemSupportType] = useState<number | null>(null);
    const [toolType, setToolType] = useState<number | null>(null);
    const [labelValidationType, setLabelValidationType] = useState<number | null>(null);
    const [observation, setObservation] = useState("");

    const lineCategory = selectedPrefix;
    const selectedLine = lines.find(line => line.id === selectedLineId);
    const lineName = selectedLine?.lineName || "";
    const filteredLines = lines.filter(line => line.prefix === selectedPrefix);

    useEffect(() => {
        const token = localStorage.getItem("ticket_token");
        if (!token || token.trim() === "") {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        const fetchPrefixes = async () => {
            try {
                const { data } = await api.get<LinePrefix[]>('/production-lines/prefixes');
                setPrefixes(data);
            } catch (error) {
                console.error("Erro ao buscar prefixos:", error);
                Alert.error("Erro", "Não foi possível carregar as categorias de linha.", isDarkMode);
            }
        };

        fetchPrefixes();
    }, [isDarkMode]);

    useEffect(() => {
        if (!selectedPrefix) {
            setLines([]);
            return;
        }

        const fetchLines = async () => {
            try {
                const { data } = await api.get<ProductionLinesByPrefix[]>(
                    '/production-lines/by-prefix'
                );

                const groupedData = data.find(group => group.prefix === selectedPrefix);

                if (groupedData && groupedData.lines) {
                    setLines(groupedData.lines);
                } else {
                    setLines([]);
                }
            } catch (error) {
                console.error("Erro ao buscar linhas:", error);
                Alert.error("Erro", "Não foi possível carregar as linhas de produção.", isDarkMode);
                setLines([]);
            }
        };

        fetchLines();
    }, [selectedPrefix, isDarkMode]);

    const handleSubmit = async () => {
        setIsLoading(true);

        const token = localStorage.getItem("ticket_token");
        if (!token || token.trim() === "") {
            Alert.error("Sessão Expirada", "Por favor, faça login novamente.", isDarkMode)
                .then(() => {
                    localStorage.removeItem("ticket_token");
                    localStorage.removeItem("ticket_user");
                    navigate("/login");
                });
            setIsLoading(false);
            return;
        }

        const payload = {
            requesterId: 0,
            ticketType: ticketType,
            productionLineId: selectedLineId,
            isLineStopped: isLineStopped,
            lineStoppedTime: isLineStopped ? stoppedTime : null,
            runningProduct: runningProduct,
            lineSystem: ticketType === 0 ? lineSystem : null,
            systemSupportType: ticketType === 0 ? systemSupportType : null,
            toolType: ticketType === 1 ? toolType : null,
            labelValidationType:
                ticketType === 1 && toolType === 0 ? labelValidationType : null,
            produtoProduct:
                ticketType === 1 && toolType === 1 ? runningProduct : null,
            observation: observation
        };

        try {
            const { data } = await api.post<AutomationTicket>(API_ENDPOINTS.AUTOMATION.OPEN, payload);

            setCreatedTicket({
                id: data.id,
                token: data.confirmationToken || data.ConfirmationToken || ""
            });

            setStep(4);

        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            console.error("Erro ao abrir ticket:", err);

            let msg = "Erro ao conectar com o servidor.";

            if (err.response?.status === 403) {
                msg = "Acesso negado. Apenas Monitores podem abrir tickets para o departamento de automação.";
            } else if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    msg = err.response.data;
                } else if (err.response.data.message) {
                    msg = err.response.data.message;
                }
            }

            Alert.error("Erro na Solicitação", msg, isDarkMode);
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 4 && createdTicket) {
        return (
            <Box p={8} maxW="600px" mx="auto" pt="10vh">
                <Box
                    bg={cardBg}
                    _dark={{ bg: "black", borderColor: "gray.300" }}
                    borderRadius="2xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    boxShadow="xl"
                    textAlign="center"
                    p={6}
                >
                    <VStack gap={6}>
                        <Box color="green.400">
                            <AnimatedCircleCheck size={60} />
                        </Box>

                        <Heading size="lg" color="green.500">Ticket ID {createdTicket.id} Aberto!</Heading>
                        <Text color={textColor}>Informe o código abaixo para o responsável:</Text>

                        <Box bg={inputBg} p={4} borderRadius="xl" w="100%">
                            <Text fontSize="4xl" fontWeight="black" letterSpacing="widest" color="blue.600" _dark={{ color: "blue.300" }}>
                                {createdTicket.token}
                            </Text>
                        </Box>

                        <TicketWhatsappTransport
                            ticketId={createdTicket.id}
                            department="automation"
                        />

                        <Button colorScheme="blue" size="lg" w="full" onClick={() => navigate("/tickets/automation-list")} variant="outline">
                            Voltar ao Painel
                        </Button>
                    </VStack>
                </Box>
            </Box>
        );
    }

    return (
        <Flex
            direction="column"
            p={{ base: 4, md: 8 }}
            maxW="900px"
            mx="auto"
            minH="calc(100vh - 100px)"
        >
            <Flex align="center" mb={8}>
                <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    mr={4}
                    color={labelColor}
                    _hover={{ bg: hoverBg }}
                >
                    <Icon as={FaArrowLeft} mr={2} /> Voltar
                </Button>
                <Heading size="lg" color={labelColor}>Abertura de Ticket: Automação</Heading>
            </Flex>

            <VStack gap={6} align="stretch" flex="1">
                <Box bg={cardBg} _dark={{ bg: "black", borderColor: "gray.300" }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                    <Text fontWeight="bold" mb={4} color={labelColor}>O que você precisa?</Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        <Button
                            h="120px"
                            variant="outline"
                            bg={ticketType === 0 ? department.systems?.buttonHex : "transparent"}
                            _dark={{ bg: ticketType === 0 ? department.systems?.buttonHexDark : "transparent" }}
                            borderColor={ticketType === 0 ? department.systems?.buttonHex : borderColor}
                            borderWidth={ticketType === 0 ? "2px" : "1px"}
                            color={ticketType === 0 ? "white" : textColor}
                            onClick={() => {
                                setTicketType(0);
                                setToolType(null);
                            }}
                            flexDirection="column"
                            gap={3}
                            borderRadius="xl"
                            transition="all 0.2s"
                            _hover={ticketType === 0 ? {
                                bg: department.systems?.buttonHex,
                                _dark: { bg: department.systems?.buttonHexDark },
                                color: "white",
                                transform: "translateY(-2px)",
                                boxShadow: "md"
                            } : {
                                borderColor: department.systems?.buttonHex,
                                color: department.systems?.buttonHex,
                                _dark: { color: department.systems?.buttonHexDark, borderColor: department.systems?.buttonHexDark },
                                transform: "translateY(-2px)",
                                boxShadow: "md"
                            }}
                            onMouseEnter={() => setHoveredSystemButton(true)}
                            onMouseLeave={() => setHoveredSystemButton(false)}
                        >
                            <AnimatedLaptopCheck size={32} isHovered={hoveredSystemButton} />
                            <Text fontSize="lg" fontWeight={ticketType === 0 ? "bold" : "medium"}>
                                Sistemas da Linha
                            </Text>
                        </Button>

                        <Button
                            h="120px"
                            variant="outline"
                            bg={ticketType === 1 ? department.tools?.buttonHex : "transparent"}
                            _dark={{ bg: ticketType === 1 ? department.tools?.buttonHexDark : "transparent" }}
                            borderColor={ticketType === 1 ? department.tools?.buttonHex : borderColor}
                            borderWidth={ticketType === 1 ? "2px" : "1px"}
                            color={ticketType === 1 ? "white" : textColor}
                            onClick={() => {
                                setTicketType(1);
                                setLineSystem(null);
                                setSystemSupportType(null);
                            }}
                            flexDirection="column"
                            gap={3}
                            borderRadius="xl"
                            transition="all 0.2s"
                            _hover={ticketType === 1 ? {
                                bg: department.tools?.buttonHex,
                                _dark: { bg: department.tools?.buttonHexDark },
                                color: "white",
                                transform: "translateY(-2px)",
                                boxShadow: "md"
                            } : {
                                borderColor: department.tools?.buttonHex,
                                color: department.tools?.buttonHex,
                                _dark: { color: department.tools?.buttonHexDark, borderColor: department.tools?.buttonHexDark },
                                transform: "translateY(-2px)",
                                boxShadow: "md"
                            }}
                            onMouseEnter={() => setHoveredToolButton(true)}
                            onMouseLeave={() => setHoveredToolButton(false)}
                        >
                            <AnimatedCctv size={32} isHovered={hoveredToolButton} />
                            <Text fontSize="lg" fontWeight={ticketType === 1 ? "bold" : "medium"}>
                                Postos da Linha
                            </Text>
                        </Button>
                    </SimpleGrid>
                </Box>

                {ticketType !== null && (
                    <Box bg={cardBg} _dark={{ bg: "black", borderColor: "gray.300" }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                        <Text fontWeight="bold" mb={4} color={labelColor}>Informações da Linha</Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                            <Box>
                                <Text fontWeight="bold" mb={2} color={labelColor}>Categoria da Linha</Text>
                                <chakra.select
                                    w="full"
                                    p={2}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    bg={inputBg}
                                    color={selectColor}
                                    value={selectedPrefix}
                                    onChange={(e) => {
                                        setSelectedPrefix(e.target.value);
                                        setSelectedLineId(null);
                                        setToolType(null);
                                        setLabelValidationType(null);
                                    }}
                                >
                                    <option value="">Selecione...</option>
                                    {prefixes
                                        .filter((prefix) => {
                                            if (ticketType === 1) {
                                                return allowedCategoriesForTools.includes(prefix.value);
                                            }
                                            if (ticketType === 0) {
                                                return prefix.value !== "SA";
                                            }
                                            return true;
                                        })
                                        .map((prefix) => (
                                            <option key={prefix.id} value={prefix.value}>
                                                {prefix.label}
                                            </option>
                                        ))}
                                </chakra.select>
                            </Box>

                            <Box>
                                <Text fontWeight="bold" mb={2} color={labelColor}>Nome da Linha</Text>
                                <chakra.select
                                    w="full"
                                    p={2}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    bg={inputBg}
                                    color={selectColor}
                                    value={selectedLineId ?? ""}
                                    disabled={!selectedPrefix}
                                    onChange={(e) => setSelectedLineId(Number(e.target.value))}
                                >
                                    <option value="">
                                        {!selectedPrefix ? "Selecione a categoria" : "Qual linha?"}
                                    </option>

                                    {filteredLines.map((line) => (
                                        <option key={line.id} value={line.id}>
                                            {line.lineName}
                                        </option>
                                    ))}
                                </chakra.select>
                            </Box>
                        </SimpleGrid>
                    </Box>
                )}

                {ticketType !== null && lineName && (
                    <Box
                        bg={cardBg}
                        _dark={{ bg: "black" }}
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor={
                            hasAnsweredStoppage
                                ? isLineStopped
                                    ? "red.500"
                                    : "green.500"
                                : borderColor
                        }
                        p={6}
                        transition="all 0.3s ease-in-out"
                    >
                        <HStack justify="space-between" mb={isLineStopped ? 4 : 0}>
                            <VStack align="start" gap={0}>
                                <Text
                                    fontWeight="bold"
                                    color={
                                        hasAnsweredStoppage
                                            ? hasAnsweredStoppage && isLineStopped
                                                ? "red.500"
                                                : "green.500"
                                            : labelColor
                                    }
                                >
                                    A linha está parada?
                                </Text>
                                <Text fontSize="sm" color={textColor}>Selecione a situação atual.</Text>
                            </VStack>

                            <HStack gap={3}>
                                <Button
                                    onClick={() => {
                                        setIsLineStopped(false);
                                        setStoppedTime("");
                                        setHasAnsweredStoppage(true);
                                    }}
                                    colorScheme="green"
                                    variant="ghost"
                                    size="sm"
                                    fontWeight={!isLineStopped && hasAnsweredStoppage ? "bold" : "normal"}
                                >
                                    NÃO
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsLineStopped(true);
                                        setHasAnsweredStoppage(true);
                                    }}
                                    colorScheme="red"
                                    variant="ghost"
                                    size="sm"
                                    fontWeight={isLineStopped && hasAnsweredStoppage ? "bold" : "normal"}
                                >
                                    SIM
                                </Button>
                            </HStack>
                        </HStack>

                        {isLineStopped && (
                            <Box mt={4} animation="fadeIn 0.3s">
                                <Text color="red.500" fontWeight="bold" mb={2}>Horário da Parada</Text>
                                <Input
                                    type="time"
                                    bg={inputBg}
                                    color={selectColor}
                                    value={stoppedTime}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setStoppedTime(e.target.value)
                                    }
                                    borderColor={isLineStopped ? "red.500" : "gray.600"}
                                    _hover={{ borderColor: isLineStopped ? "red.500" : "gray.500" }}
                                    _focusVisible={{
                                        borderColor: isLineStopped ? "red.500" : "blue.400"
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {ticketType !== null && lineName && hasAnsweredStoppage && (
                    <Box bg={cardBg} _dark={{ bg: "black", borderColor: "gray.300" }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                        <Box>
                            <Text fontWeight="bold" mb={2} color={labelColor}>Qual produto está rodando?</Text>
                            <Input
                                placeholder="Ex: UB263"
                                bg={inputBg}
                                color={selectColor}
                                borderColor={borderColor}
                                value={runningProduct}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRunningProduct(e.target.value)}
                                _placeholder={{ color: textColor }}
                            />
                        </Box>
                    </Box>
                )}

                {ticketType === 0 && lineName && runningProduct && hasAnsweredStoppage && (
                    <Box bg={cardBg} _dark={{ bg: "black", borderColor: "gray.300" }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                        <Text fontWeight="bold" mb={4} color={labelColor}>Para qual desses sistemas você precisa de suporte?</Text>
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                            {[
                                { id: 0, label: "Monitoring" },
                                { id: 1, label: "Modular System" },
                                { id: 2, label: "Industrial System" }
                            ].map((system) => (
                                <Button
                                    key={system.id}
                                    h="100px"
                                    variant="outline"
                                    bg={lineSystem === system.id ? department.systems?.buttonHex : "transparent"}
                                    _dark={{ bg: lineSystem === system.id ? department.systems?.buttonHexDark : "transparent" }}
                                    borderColor={lineSystem === system.id ? department.systems?.buttonHex : borderColor}
                                    borderWidth={lineSystem === system.id ? "2px" : "1px"}
                                    color={lineSystem === system.id ? "white" : textColor}
                                    onClick={() => {
                                        setLineSystem(system.id);
                                        setSystemSupportType(null);
                                    }}
                                    flexDirection="column"
                                    gap={2}
                                    borderRadius="xl"
                                    transition="all 0.2s"
                                    _hover={lineSystem === system.id ? {
                                        bg: department.systems?.buttonHex,
                                        _dark: { bg: department.systems?.buttonHexDark },
                                        transform: "translateY(-2px)",
                                        boxShadow: "md"
                                    } : {
                                        borderColor: department.systems?.buttonHex,
                                        color: department.systems?.buttonHex,
                                        _dark: { color: department.systems?.buttonHexDark, borderColor: department.systems?.buttonHexDark },
                                        transform: "translateY(-2px)",
                                        boxShadow: "md"
                                    }}
                                >
                                    <Text fontSize="lg" fontWeight={lineSystem === system.id ? "bold" : "medium"}>
                                        {system.label}
                                    </Text>
                                </Button>
                            ))}
                        </SimpleGrid>

                        {lineSystem !== null && (
                            <Box mt={6}>
                                <Text fontWeight="bold" mb={4} color={labelColor}>Qual é o tipo de suporte?</Text>
                                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                                    {[
                                        { id: 0, label: "Cadastro de Produto" },
                                        { id: 1, label: "Peso não sobe na Balança" },
                                        { id: 2, label: "Instalação de Software" }
                                    ].map((support) => (
                                        <Button
                                            key={support.id}
                                            h="100px"
                                            variant="outline"
                                            bg={systemSupportType === support.id ? department.systems?.buttonHex : "transparent"}
                                            _dark={{ bg: systemSupportType === support.id ? department.systems?.buttonHexDark : "transparent" }}
                                            borderColor={systemSupportType === support.id ? department.systems?.buttonHex : borderColor}
                                            borderWidth={systemSupportType === support.id ? "2px" : "1px"}
                                            color={systemSupportType === support.id ? "white" : textColor}
                                            onClick={() => setSystemSupportType(support.id)}
                                            flexDirection="column"
                                            gap={2}
                                            borderRadius="xl"
                                            transition="all 0.2s"
                                            _hover={systemSupportType === support.id ? {
                                                bg: department.systems?.buttonHex,
                                                _dark: { bg: department.systems?.buttonHexDark },
                                                transform: "translateY(-2px)",
                                                boxShadow: "md"
                                            } : {
                                                borderColor: department.systems?.buttonHex,
                                                color: department.systems?.buttonHex,
                                                _dark: { color: department.systems?.buttonHexDark, borderColor: department.systems?.buttonHexDark },
                                                transform: "translateY(-2px)",
                                                boxShadow: "md"
                                            }}
                                        >
                                            <Text fontSize="md" fontWeight={systemSupportType === support.id ? "bold" : "medium"}>
                                                {support.label}
                                            </Text>
                                        </Button>
                                    ))}
                                </SimpleGrid>
                            </Box>
                        )}
                    </Box>
                )}

                {ticketType === 1 && lineName && runningProduct && hasAnsweredStoppage && (
                    <Box bg={cardBg} _dark={{ bg: "black", borderColor: "gray.300" }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                        <Text fontWeight="bold" mb={4} color={labelColor}>Para qual posto da linha você precisa de suporte?</Text>
                        <SimpleGrid columns={{ base: 1, md: 1 }} gap={4}>
                            {lineCategory === "ML" && (
                                <Button
                                    h="120px"
                                    w="full"
                                    variant="outline"
                                    bg={toolType === 0 ? department.tools?.buttonHex : "transparent"}
                                    _dark={{ bg: toolType === 0 ? department.tools?.buttonHexDark : "transparent" }}
                                    borderColor={toolType === 0 ? department.tools?.buttonHex : borderColor}
                                    borderWidth={toolType === 0 ? "2px" : "1px"}
                                    color={toolType === 0 ? "white" : textColor}
                                    onClick={() => {
                                        setToolType(0);
                                    }}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    gap={3}
                                    borderRadius="xl"
                                    transition="all 0.2s"
                                    _hover={toolType === 0 ? {
                                        bg: department.tools?.buttonHex,
                                        _dark: { bg: department.tools?.buttonHexDark },
                                        color: "white",
                                        transform: "translateY(-2px)",
                                        boxShadow: "md"
                                    } : {
                                        borderColor: department.tools?.buttonHex,
                                        color: department.tools?.buttonHex,
                                        _dark: { color: department.tools?.buttonHexDark, borderColor: department.tools?.buttonHexDark },
                                        transform: "translateY(-2px)",
                                        boxShadow: "md"
                                    }}
                                    onMouseEnter={() => setHoveredLabelValidation(true)}
                                    onMouseLeave={() => setHoveredLabelValidation(false)}
                                >
                                    <AnimatedCctv size={28} isHovered={hoveredLabelValidation} />
                                    <Text fontSize="lg" fontWeight={toolType === 0 ? "bold" : "medium"}>
                                        Label Validation
                                    </Text>
                                </Button>
                            )}

                            {lineCategory === "SA" && (
                                <Button
                                    h="120px"
                                    w="full"
                                    variant="outline"
                                    bg={toolType === 1 ? department.tools?.buttonHex : "transparent"}
                                    _dark={{ bg: toolType === 1 ? department.tools?.buttonHexDark : "transparent" }}
                                    borderColor={toolType === 1 ? department.tools?.buttonHex : borderColor}
                                    borderWidth={toolType === 1 ? "2px" : "1px"}
                                    color={toolType === 1 ? "white" : textColor}
                                    onClick={() => {
                                        setToolType(1);
                                        setLabelValidationType(null);
                                    }}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    gap={3}
                                    borderRadius="xl"
                                    transition="all 0.2s"
                                    _hover={toolType === 1 ? {
                                        bg: department.tools?.buttonHex,
                                        _dark: { bg: department.tools?.buttonHexDark },
                                        color: "white",
                                        transform: "translateY(-2px)",
                                        boxShadow: "md"
                                    } : {
                                        borderColor: department.tools?.buttonHex,
                                        color: department.tools?.buttonHex,
                                        _dark: { color: department.tools?.buttonHexDark, borderColor: department.tools?.buttonHexDark },
                                        transform: "translateY(-2px)",
                                        boxShadow: "md"
                                    }}
                                    onMouseEnter={() => setHoveredProduct(true)}
                                    onMouseLeave={() => setHoveredProduct(false)}
                                >
                                    <AnimatedChartSpline size={28} isHovered={hoveredProduct} />
                                    <Text fontSize="lg" fontWeight={toolType === 1 ? "bold" : "medium"}>
                                        Ensaio de Product
                                    </Text>
                                </Button>
                            )}
                        </SimpleGrid>

                        {toolType === 0 && lineCategory === "ML" && (
                            <Box mt={6}>
                                <Text fontWeight="bold" mb={4} color={labelColor}>Qual configuração você precisa?</Text>
                                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                                    {[
                                        { id: 0, label: "Configurar Câmera do Apontamento" },
                                        { id: 1, label: "Configurar Câmera do Double Check" },
                                        { id: 2, label: "Configuração Total" }
                                    ].map((config) => (
                                        <Button
                                            key={config.id}
                                            h="100px"
                                            variant="outline"
                                            bg={labelValidationType === config.id ? department.tools?.buttonHex : "transparent"}
                                            _dark={{ bg: labelValidationType === config.id ? department.tools?.buttonHexDark : "transparent" }}
                                            borderColor={labelValidationType === config.id ? department.tools?.buttonHex : borderColor}
                                            borderWidth={labelValidationType === config.id ? "2px" : "1px"}
                                            color={labelValidationType === config.id ? "white" : textColor}
                                            onClick={() => setLabelValidationType(config.id)}
                                            flexDirection="column"
                                            gap={2}
                                            borderRadius="xl"
                                            transition="all 0.2s"
                                            _hover={labelValidationType === config.id ? {
                                                bg: department.tools?.buttonHex,
                                                _dark: { bg: department.tools?.buttonHexDark },
                                                transform: "translateY(-2px)",
                                                boxShadow: "md"
                                            } : {
                                                borderColor: department.tools?.buttonHex,
                                                color: department.tools?.buttonHex,
                                                _dark: { color: department.tools?.buttonHexDark, borderColor: department.tools?.buttonHexDark },
                                                transform: "translateY(-2px)",
                                                boxShadow: "md"
                                            }}
                                        >
                                            <Text fontSize="sm" fontWeight={labelValidationType === config.id ? "bold" : "medium"}>
                                                {config.label}
                                            </Text>
                                        </Button>
                                    ))}
                                </SimpleGrid>
                            </Box>
                        )}
                    </Box>
                )}

                {ticketType !== null && lineCategory && lineName && runningProduct && hasAnsweredStoppage && (
                    (ticketType === 0 && lineSystem !== null && systemSupportType !== null) ||
                    (ticketType === 1 && toolType !== null && (
                        (toolType === 0 && labelValidationType !== null) ||
                        (toolType === 1)
                    ))
                ) ? (
                    <>
                        <Box bg={cardBg} _dark={{ bg: "black", borderColor: "gray.300" }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                            <Text fontWeight="bold" mb={2} color={labelColor}>Observações</Text>
                            <Textarea
                                placeholder="Para facilitar e melhorar o atendimento, informe o máximo de detalhes da sua solicitação."
                                bg={inputBg}
                                color={selectColor}
                                borderColor={borderColor}
                                value={observation}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservation(e.target.value)}
                                _placeholder={{ color: textColor }}
                            />
                        </Box>

                        <Button
                            colorScheme="blue"
                            size="lg"
                            w="full"
                            onClick={handleSubmit}
                            disabled={isLoading || (isLineStopped && !stoppedTime)}
                        >
                            {isLoading ? <Spinner size="sm" mr={2} /> : null}
                            Confirmar e Abrir Ticket
                        </Button>
                    </>
                ) : null}

            </VStack>
        </Flex>
    );
};