import {
    Box, Heading, Text, Button, VStack, HStack, SimpleGrid,
    Icon, Input, Textarea, Flex, Spinner, chakra
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { AnimatedWrench, ArchiveIcon, AnimatedCircleCheck } from "../components/icons/NewAnimatedIcons";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import { TicketWhatsappTransport } from "../components/WhatsappTransport";
import { AxiosError } from "axios";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { ApiErrorResponse, SetupTicket, LinePrefix, ProductionLine, ProductionLinesByPrefix } from "../types";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { Alert } from "../services/alertService";

export const SetupForm = () => {
    const isDarkMode = useColorModeValue(false, true);
    const navigate = useNavigate();

    const {
        cardBg,
        textColor,
        labelColor,
        borderColor,
        inputBg,
        selectColor,
        hoverBg,
        department
    } = useDepartmentTheme("setup");

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [createdTicket, setCreatedTicket] = useState<{ id: number, token: string } | null>(null);

    const [prefixes, setPrefixes] = useState<LinePrefix[]>([]);
    const [lines, setLines] = useState<ProductionLine[]>([]);
    const [selectedPrefix, setSelectedPrefix] = useState<string>("");
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

    const [setupType, setSetupType] = useState<number | null>(null);
    const [product, setProduct] = useState<string>("");
    const [isLineStopped, setIsLineStopped] = useState(false);
    const [stoppedTime, setStoppedTime] = useState("");
    const [material, setMaterial] = useState("");
    const [observation, setObservation] = useState("");
    const [hasAnsweredStoppage, setHasAnsweredStoppage] = useState(false);
    const [isSetupHovered, setIsSetupHovered] = useState(false);
    const [isMaterialHovered, setIsMaterialHovered] = useState(false);

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
                const { data } = await api.get<ProductionLinesByPrefix[]>('/production-lines/by-prefix');

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
            setupType: setupType,
            productionLineId: selectedLineId,
            isLineStopped: isLineStopped,
            lineStoppedTime: isLineStopped ? stoppedTime : null,
            product: setupType === 0 ? product : null,
            requestedMaterial: setupType === 1 ? material : null,
            observation: observation
        };

        try {
            const { data } = await api.post<SetupTicket>(API_ENDPOINTS.SETUP_TICKETS.OPEN, payload);

            setCreatedTicket({
                id: data.id,
                token: data.confirmationToken || data.ConfirmationToken || ""
            });

            setStep(2);

        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            let msg = "Erro ao conectar com o servidor.";

            if (err.response?.status === 403) {
                msg = "Acesso negado. Apenas Monitores podem abrir tickets para o departamento de setup.";
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

    if (step === 2 && createdTicket) {
        return (
            <Box p={8} maxW="600px" mx="auto" pt="10vh">
                <Box bg={cardBg} borderRadius="2xl" boxShadow="xl" textAlign="center" p={6} borderWidth="1px" borderColor={borderColor} _dark={{ bg: "black", borderColor: "gray.300" }}>
                    <VStack gap={6}>
                        <Box color="green.400">
                            <AnimatedCircleCheck
                                size={60}
                                color="currentColor"
                                isHovered={true}
                            />
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
                            department="setup"
                        />

                        <Button colorScheme="blue" size="lg" w="full" onClick={() => navigate("/tickets/setup-list")} variant="outline">
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
            maxW="800px"
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
                <Heading size="lg" color={labelColor}>Abertura de Ticket: Setup</Heading>
            </Flex>

            <VStack gap={6} align="stretch" flex="1">

                <Box bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                    <Text fontWeight="bold" mb={4} color={labelColor}>O que você precisa?</Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        <Button
                            h="120px"
                            variant="outline"
                            bg={setupType === 0 ? department.main.buttonHex : "transparent"}
                            _dark={{ bg: setupType === 0 ? department.main.buttonHexDark : "transparent" }}
                            borderColor={setupType === 0 ? department.main.buttonHex : borderColor}
                            borderWidth={setupType === 0 ? "2px" : "1px"}
                            color={setupType === 0 ? "white" : textColor}
                            onClick={() => setSetupType(0)}
                            flexDirection="column"
                            gap={3}
                            borderRadius="xl"
                            transition="all 0.2s"
                            onMouseEnter={() => setIsSetupHovered(true)}
                            onMouseLeave={() => setIsSetupHovered(false)}
                            _hover={setupType === 0 ? {
                                bg: department.main.buttonHex,
                                _dark: { bg: department.main.buttonHexDark },
                                color: "white",
                                transform: "translateY(-2px)",
                                boxShadow: "md"
                            } : {
                                borderColor: department.main.buttonHex,
                                color: department.main.buttonHex,
                                _dark: { color: department.main.buttonHexDark, borderColor: department.main.buttonHexDark },
                                transform: "translateY(-2px)",
                                boxShadow: "md"
                            }}
                        >
                            <AnimatedWrench
                                size={32}
                                isHovered={isSetupHovered}
                                color="currentColor"
                            />
                            <Text fontSize="lg" fontWeight={setupType === 0 ? "bold" : "medium"}>
                                Setup de Linha
                            </Text>
                        </Button>

                        <Button
                            h="120px"
                            variant="outline"
                            bg={setupType === 1 ? department.material?.buttonHex : "transparent"}
                            _dark={{ bg: setupType === 1 ? department.material?.buttonHexDark : "transparent" }}
                            borderColor={setupType === 1 ? department.material?.buttonHex : borderColor}
                            borderWidth={setupType === 1 ? "2px" : "1px"}
                            color={setupType === 1 ? "white" : textColor}
                            onClick={() => setSetupType(1)}
                            flexDirection="column"
                            gap={3}
                            borderRadius="xl"
                            transition="all 0.2s"
                            onMouseEnter={() => setIsMaterialHovered(true)}
                            onMouseLeave={() => setIsMaterialHovered(false)}
                            _hover={setupType === 1 ? {
                                bg: department.material?.buttonHex,
                                _dark: { bg: department.material?.buttonHexDark },
                                color: "white",
                                transform: "translateY(-2px)",
                                boxShadow: "md"
                            } : {
                                borderColor: department.material?.buttonHex,
                                color: department.material?.buttonHex,
                                _dark: { color: department.material?.buttonHexDark, borderColor: department.material?.buttonHexDark },
                                transform: "translateY(-2px)",
                                boxShadow: "md"
                            }}
                        >
                            <ArchiveIcon
                                size={32}
                                isHovered={isMaterialHovered}
                                color="currentColor"
                            />
                            <Text fontSize="lg" fontWeight={setupType === 1 ? "bold" : "medium"}>
                                Solicitação de Material
                            </Text>
                        </Button>
                    </SimpleGrid>
                </Box>

                {setupType !== null && (
                    <Box bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
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
                                    }}
                                >
                                    <option value="">Selecione...</option>
                                    {prefixes.map((prefix) => (
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

                {/* Setup de Linha — campo produto */}
                {setupType === 0 && lineName && (
                    <Box bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                        <Text fontWeight="bold" mb={4} color={labelColor}>Qual é o produto em setup?</Text>
                        <Input
                            placeholder="Ex: DJI600"
                            bg={inputBg}
                            color={selectColor}
                            borderColor={borderColor}
                            value={product}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProduct(e.target.value)}
                            _placeholder={{ color: textColor }}
                            borderWidth="1px"
                        />
                    </Box>
                )}

                {/* Setup de Linha — linha parada */}
                {setupType === 0 && lineName && product && (
                    <Box
                        bg={cardBg}
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor={
                            hasAnsweredStoppage
                                ? isLineStopped ? "red.500" : "green.500"
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
                                            ? isLineStopped ? "red.500" : "green.500"
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
                            <Box mt={4}>
                                <Text color="red.500" fontWeight="bold" mb={2}>Horário da Parada</Text>
                                <Input
                                    type="time"
                                    bg={inputBg}
                                    color={selectColor}
                                    value={stoppedTime}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoppedTime(e.target.value)}
                                    borderColor="red.500"
                                    _hover={{ borderColor: "red.500" }}
                                    _focusVisible={{ borderColor: "red.500" }}
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {/* Solicitação de Material — campo material */}
                {setupType === 1 && lineName && (
                    <Box bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                        <Text fontWeight="bold" mb={2} color={labelColor}>Qual material você precisa?</Text>
                        <Input
                            placeholder="Ex: Mouse, Teclado, Scanner..."
                            bg={inputBg}
                            color={selectColor}
                            borderColor={borderColor}
                            value={material}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaterial(e.target.value)}
                            _placeholder={{ color: textColor }}
                        />
                    </Box>
                )}

                {/* Solicitação de Material — linha parada */}
                {setupType === 1 && lineName && material && (
                    <Box
                        bg={cardBg}
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor={
                            hasAnsweredStoppage
                                ? isLineStopped ? "red.500" : "green.500"
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
                                            ? isLineStopped ? "red.500" : "green.500"
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
                            <Box mt={4}>
                                <Text color="red.500" fontWeight="bold" mb={2}>Horário da Parada</Text>
                                <Input
                                    type="time"
                                    bg={inputBg}
                                    color={selectColor}
                                    value={stoppedTime}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoppedTime(e.target.value)}
                                    borderColor="red.500"
                                    _hover={{ borderColor: "red.500" }}
                                    _focusVisible={{ borderColor: "red.500" }}
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {(setupType === 1 && lineName && material && hasAnsweredStoppage) ||
                    (setupType === 0 && lineName && product && hasAnsweredStoppage) ? (
                    <>
                        <Box bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
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