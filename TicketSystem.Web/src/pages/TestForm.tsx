import {
    Box, Heading, Text, Button, VStack, HStack, SimpleGrid,
    Icon, Input, Textarea, Flex, Spinner, chakra
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { AnimatedWifi, AnimatedFileStack, AnimatedCircleCheck } from "../components/icons/NewAnimatedIcons";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import { TicketWhatsappTransport } from "../components/WhatsappTransport";
import { AxiosError } from "axios";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { ApiErrorResponse, TestTicket, LinePrefix, ProductionLine, ProductionLinesByPrefix } from "../types";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { Alert } from "../services/alertService";

export const TestForm = () => {
    const isDarkMode = useColorModeValue(false, true);
    const navigate = useNavigate();

    const {
        cardBg, borderColor, inputBg, labelColor, textColor,
        selectColor, hoverBg, department
    } = useDepartmentTheme("test");

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [createdTicket, setCreatedTicket] = useState<{ id: number, token: string } | null>(null);

    const [prefixes, setPrefixes] = useState<LinePrefix[]>([]);
    const [lines, setLines] = useState<ProductionLine[]>([]);
    const [selectedPrefix, setSelectedPrefix] = useState<string>("");
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

    const [testType, setTestType] = useState<number | null>(null);
    const [product, setProduct] = useState<string>("");
    const [isLineStopped, setIsLineStopped] = useState(false);
    const [stoppedTime, setStoppedTime] = useState("");
    const [observation, setObservation] = useState("");
    const [hasAnsweredStoppage, setHasAnsweredStoppage] = useState(false);
    const [isFinalTestHovered, setIsFinalTestHovered] = useState(false);
    const [isLogHovered, setIsLogHovered] = useState(false);

    const selectedLine = lines.find(line => line.id === selectedLineId);
    const lineName = selectedLine?.lineName || "";
    const filteredLines = lines.filter(line => line.prefix === selectedPrefix);

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
                if (groupedData?.lines) {
                    setLines(groupedData.lines);
                } else {
                    setLines([]);
                }
            } catch (error) {
                console.error("Erro ao buscar linhas:", error);
                Alert.error("Erro", "Não foi possível carregar as linhas.", isDarkMode);
            }
        };
        fetchLines();
    }, [selectedPrefix, isDarkMode]);

    useEffect(() => {
        const token = localStorage.getItem("ticket_token");
        if (!token || token.trim() === "") {
            navigate("/login");
        }
    }, [navigate]);

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
            testType: testType,
            productionLineId: Number(selectedLineId),
            isLineStopped: isLineStopped,
            lineStoppedTime: isLineStopped ? stoppedTime : null,
            product: product || null,
            observation: observation
        };

        try {
            const { data } = await api.post<TestTicket>(API_ENDPOINTS.TEST.OPEN, payload);

            setCreatedTicket({
                id: data.id,
                token: data.confirmationToken || data.ConfirmationToken || ""
            });

            setStep(2);

        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            let msg = "Erro ao conectar com o servidor.";

            if (err.response?.status === 403) {
                msg = "Acesso negado. Apenas Monitores podem abrir tickets.";
            } else if (err.response?.data?.message) {
                msg = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                msg = err.response.data;
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
                            <AnimatedCircleCheck size={60} color="currentColor" />
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
                            department="test"
                        />

                        <Button colorScheme="blue" size="lg" w="full" onClick={() => navigate("/tickets/test-list")} variant="outline">
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
                <Heading size="lg" color={labelColor}>Abertura de Ticket: Teste</Heading>
            </Flex>

            <VStack gap={6} align="stretch" flex="1">
                <Box bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                    <Text fontWeight="bold" mb={4} color={labelColor}>O que você precisa?</Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        <Button
                            h="120px"
                            variant="outline"
                            bg={testType === 0 ? department.main.buttonHex : "transparent"}
                            _dark={{ bg: testType === 0 ? department.main.buttonHexDark : "transparent" }}
                            borderColor={testType === 0 ? department.main.buttonHex : borderColor}
                            borderWidth={testType === 0 ? "2px" : "1px"}
                            color={testType === 0 ? "white" : textColor}
                            onClick={() => setTestType(0)}
                            flexDirection="column"
                            gap={3}
                            borderRadius="xl"
                            transition="all 0.2s"
                            onMouseEnter={() => setIsFinalTestHovered(true)}
                            onMouseLeave={() => setIsFinalTestHovered(false)}
                            _hover={testType === 0 ? {
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
                            <AnimatedWifi size={32} isHovered={isFinalTestHovered} color="currentColor" />
                            <Text fontSize="lg" fontWeight={testType === 0 ? "bold" : "medium"}>
                                Final Teste
                            </Text>
                        </Button>

                        <Button
                            h="120px"
                            variant="outline"
                            bg={testType === 1 ? department.log?.buttonHex : "transparent"}
                            _dark={{ bg: testType === 1 ? department.log?.buttonHexDark : "transparent" }}
                            borderColor={testType === 1 ? department.log?.buttonHex : borderColor}
                            borderWidth={testType === 1 ? "2px" : "1px"}
                            color={testType === 1 ? "white" : textColor}
                            onClick={() => setTestType(1)}
                            flexDirection="column"
                            gap={3}
                            borderRadius="xl"
                            transition="all 0.2s"
                            onMouseEnter={() => setIsLogHovered(true)}
                            onMouseLeave={() => setIsLogHovered(false)}
                            _hover={testType === 1 ? {
                                bg: department.log?.buttonHex,
                                _dark: { bg: department.log?.buttonHexDark },
                                color: "white",
                                transform: "translateY(-2px)",
                                boxShadow: "md"
                            } : {
                                borderColor: department.log?.buttonHex,
                                color: department.log?.buttonHex,
                                _dark: { color: department.log?.buttonHexDark, borderColor: department.log?.buttonHexDark },
                                transform: "translateY(-2px)",
                                boxShadow: "md"
                            }}
                        >
                            <AnimatedFileStack size={32} isHovered={isLogHovered} color="currentColor" />
                            <Text fontSize="lg" fontWeight={testType === 1 ? "bold" : "medium"}>
                                Arquivos de Log
                            </Text>
                        </Button>
                    </SimpleGrid>
                </Box>

                {testType !== null && (
                    <Box bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                        <Text fontWeight="bold" mb={4} color={labelColor}>Categoria da Linha</Text>
                        <chakra.select
                            w="full" p={2} borderRadius="md" borderWidth="1px"
                            borderColor={borderColor} bg={inputBg} color={selectColor}
                            value={selectedPrefix}
                            onChange={(e) => {
                                setSelectedPrefix(e.target.value);
                                setSelectedLineId(null);
                            }}
                        >
                            <option value="">Selecione a categoria...</option>
                            {prefixes.map((prefix) => (
                                <option key={prefix.id} value={prefix.value}>
                                    {prefix.label}
                                </option>
                            ))}
                        </chakra.select>
                    </Box>
                )}

                {testType !== null && selectedPrefix && (
                    <Box bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                        <Text fontWeight="bold" mb={2} color={labelColor}>Nome da Linha</Text>
                        <chakra.select
                            w="full" p={2} borderRadius="md" borderWidth="1px"
                            borderColor={borderColor} bg={inputBg} color={selectColor}
                            value={selectedLineId ?? ""}
                            onChange={(e) => setSelectedLineId(Number(e.target.value))}
                        >
                            <option value="">Qual linha?</option>
                            {filteredLines.map((line) => (
                                <option key={line.id} value={line.id}>
                                    {line.lineName}
                                </option>
                            ))}
                        </chakra.select>
                    </Box>
                )}

                {testType !== null && lineName && (
                    <Box
                        bg={cardBg}
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
                                            ? isLineStopped
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

                {testType !== null && lineName && hasAnsweredStoppage ? (
                    <>
                        <Box bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                            <Text fontWeight="bold" mb={4} color={labelColor}>Qual é o produto?</Text>
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
                            disabled={isLoading || (isLineStopped && !stoppedTime) || !product.trim()}
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