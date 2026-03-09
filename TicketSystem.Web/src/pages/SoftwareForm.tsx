import {
    Box, Heading, Text, Button, VStack, HStack, SimpleGrid,
    Icon, Input, Textarea, Flex, Spinner, chakra
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { AnimatedCircleCheck, AnimatedAirplay } from "../components/icons/NewAnimatedIcons";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import { TicketWhatsappTransport } from "../components/WhatsappTransport";
import { AxiosError } from "axios";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { ApiErrorResponse, LinePrefix, ProductionLine, ProductionLinesByPrefix } from "../types";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { Alert } from "../services/alertService";

const SECTORS = [
    { id: 0, label: "AT SAC", isProduction: false },
    { id: 1, label: "SAC SP", isProduction: false },
    { id: 2, label: "RCA", isProduction: false },
    { id: 3, label: "APLICAÇÕES", isProduction: false },
    { id: 4, label: "QUALIDADE", isProduction: false },
    { id: 5, label: "AT PRODUÇÃO", isProduction: true },
    { id: 6, label: "PRODUÇÃO", isProduction: true },
    { id: 7, label: "PRODUÇÃO / QUALIDADE", isProduction: true },
];

const PROBLEMS_BY_SECTOR: Record<number, { id: number, label: string }[]> = {
    0: [
        { id: 0, label: "Sem Cadastro de BIOS" },
        { id: 1, label: "Divergência Hardware" },
        { id: 2, label: "Vincular/Desvincular Chaves" },
        { id: 3, label: "Erro em Teste" },
        { id: 4, label: "Imagem Não Disponível" },
    ],
    1: [
        { id: 5, label: "Problemas Diversos" },
    ],
    2: [
        { id: 6, label: "Bugs" },
        { id: 7, label: "Dúvidas" },
        { id: 8, label: "Solicitação Nova Feature" },
    ],
    3: [
        { id: 6, label: "Bugs" },
        { id: 7, label: "Dúvidas" },
        { id: 8, label: "Solicitação Nova Feature" },
    ],
    4: [
        { id: 9, label: "Relatórios" },
    ],
    5: getProductionProblems(),
    6: getProductionProblems(),
    7: getProductionProblems(),
};

function getProductionProblems() {
    return [
        { id: 10, label: "Erro de Rede" },
        { id: 11, label: "Erro ao Enviar Log" },
        { id: 12, label: "Erro no Download" },
        { id: 13, label: "Erro no Gravador DPK" },
        { id: 14, label: "Erro na Balança" },
        { id: 15, label: "Lentidão Atualização" },
        { id: 16, label: "Lentidão Download" },
        { id: 17, label: "Reparo Sistema" },
        { id: 18, label: "Abertura OS" },
        { id: 19, label: "Cadastros" },
        { id: 20, label: "Outros" },
    ];
}

export const SoftwareForm = () => {
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
    } = useDepartmentTheme("software");

    const primaryColor = department.main.buttonHex;
    const primaryColorDark = department.main.buttonHexDark;

    const [isLoading, setIsLoading] = useState(false);
    const [createdTicket, setCreatedTicket] = useState<{ id: number, token: string } | null>(null);

    const [selectedSector, setSelectedSector] = useState<number | null>(null);
    const [selectedProblem, setSelectedProblem] = useState<number | null>(null);

    const [prefixes, setPrefixes] = useState<LinePrefix[]>([]);
    const [lines, setLines] = useState<ProductionLine[]>([]);
    const [selectedPrefix, setSelectedPrefix] = useState<string>("");
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
    const [postLocationText, setPostLocationText] = useState<string>("");

    const [necessaryInfo, setNecessaryInfo] = useState("");

    const [isLineStopped, setIsLineStopped] = useState(false);
    const [stoppedTime, setStoppedTime] = useState("");
    const [hasAnsweredStoppage, setHasAnsweredStoppage] = useState(false);

    const isProductionSector = selectedSector !== null && SECTORS.find(s => s.id === selectedSector)?.isProduction;
    const filteredLines = lines.filter(line => line.prefix === selectedPrefix);

    useEffect(() => {
        const token = localStorage.getItem("ticket_token");
        if (!token || token.trim() === "") {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        if (isProductionSector) {
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
        }
    }, [isProductionSector, isDarkMode]);

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
                setLines([]);
            }
        };
        fetchLines();
    }, [selectedPrefix]);

    const handleSubmit = async () => {
        if (selectedSector === null || selectedProblem === null) return;

        if (!necessaryInfo.trim()) {
            Alert.error("Atenção", "Por favor, preencha as informações necessárias.", isDarkMode);
            return;
        }

        if (isProductionSector && !selectedLineId) {
            Alert.error("Atenção", "Selecione a linha de produção.", isDarkMode);
            return;
        }
        if (!isProductionSector && !postLocationText.trim()) {
            Alert.error("Atenção", "Informe a localização do posto.", isDarkMode);
            return;
        }

        setIsLoading(true);

        const payload = {
            sector: selectedSector,
            problem: selectedProblem,
            productionLineId: isProductionSector ? selectedLineId : null,
            postLocation: !isProductionSector ? postLocationText : null,
            necessaryInfo: necessaryInfo,
            isLineStopped: isProductionSector ? isLineStopped : null,
            lineStoppedTime: isProductionSector && isLineStopped ? stoppedTime : null,
        };

        try {
            const { data } = await api.post(API_ENDPOINTS.SOFTWARE.OPEN, payload);

            setCreatedTicket({
                id: data.id,
                token: data.confirmationToken || data.ConfirmationToken || ""
            });
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            console.error("Erro ao abrir ticket:", err);
            let msg = "Erro ao conectar com o servidor.";

            if (err.response?.status === 403) msg = "Acesso negado. Você não tem permissão para abrir tickets de software.";
            else if (err.response?.data?.message) msg = err.response.data.message;
            else if (typeof err.response?.data === 'string') msg = err.response.data;

            Alert.error("Erro na Solicitação", msg, isDarkMode);
        } finally {
            setIsLoading(false);
        }
    };

    if (createdTicket) {
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
                        <Box color="purple.400">
                            <AnimatedCircleCheck size={60} />
                        </Box>

                        <Heading size="lg" color="purple.500">Ticket ID {createdTicket.id} Aberto!</Heading>
                        <Text color={textColor}>Informe o código abaixo para o responsável de software:</Text>

                        <Box bg={inputBg} p={4} borderRadius="xl" w="100%">
                            <Text fontSize="4xl" fontWeight="black" letterSpacing="widest" color="purple.600" _dark={{ color: "purple.300" }}>
                                {createdTicket.token}
                            </Text>
                        </Box>

                        <TicketWhatsappTransport
                            ticketId={createdTicket.id}
                            department="software"
                        />

                        <Button colorScheme="purple" size="lg" w="full" onClick={() => navigate("/tickets/software-list")} variant="outline">
                            Voltar ao Painel
                        </Button>
                    </VStack>
                </Box>
            </Box>
        );
    }

    return (
        <Flex direction="column" p={{ base: 4, md: 8 }} maxW="900px" mx="auto" minH="calc(100vh - 100px)">
            <Flex align="center" mb={8}>
                <Button variant="ghost" onClick={() => navigate("/")} mr={4} color={labelColor} _hover={{ bg: hoverBg }}>
                    <Icon as={FaArrowLeft} mr={2} /> Voltar
                </Button>
                <Heading size="lg" color={labelColor}>Ticket: Software</Heading>
            </Flex>

            <VStack gap={6} align="stretch" flex="1">

                <Box bg={cardBg} _dark={{ bg: "black", borderColor: "gray.300" }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                    <Text fontWeight="bold" mb={4} color={labelColor}>Qual é o seu departamento?</Text>
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                        {SECTORS.map((sector) => (
                            <Button
                                key={sector.id}
                                h="100px"
                                variant="outline"
                                bg={selectedSector === sector.id ? primaryColor : "transparent"}
                                _dark={{ bg: selectedSector === sector.id ? primaryColorDark : "transparent" }}
                                borderColor={selectedSector === sector.id ? primaryColor : borderColor}
                                borderWidth={selectedSector === sector.id ? "2px" : "1px"}
                                color={selectedSector === sector.id ? "white" : textColor}
                                onClick={() => {
                                    setSelectedSector(sector.id);
                                    setSelectedProblem(null);
                                    setPostLocationText("");
                                    setSelectedPrefix("");
                                    setSelectedLineId(null);
                                    setIsLineStopped(false);
                                    setStoppedTime("");
                                    setHasAnsweredStoppage(false);
                                }}
                                flexDirection="column"
                                gap={2}
                                borderRadius="xl"
                                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                            >
                                <Icon as={AnimatedAirplay} boxSize={6} />
                                <Text fontSize="sm" whiteSpace="normal" textAlign="center">{sector.label}</Text>
                            </Button>
                        ))}
                    </SimpleGrid>
                </Box>

                {selectedSector !== null && (
                    <Box bg={cardBg} _dark={{ bg: "black", borderColor: "gray.300" }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                        <Text fontWeight="bold" mb={4} color={labelColor}>Qual é o problema?</Text>
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                            {PROBLEMS_BY_SECTOR[selectedSector]?.map((prob) => (
                                <Button
                                    key={prob.id}
                                    h="auto"
                                    py={4}
                                    variant="outline"
                                    bg={selectedProblem === prob.id ? primaryColor : "transparent"}
                                    _dark={{ bg: selectedProblem === prob.id ? primaryColorDark : "transparent" }}
                                    borderColor={selectedProblem === prob.id ? primaryColor : borderColor}
                                    borderWidth={selectedProblem === prob.id ? "2px" : "1px"}
                                    color={selectedProblem === prob.id ? "white" : textColor}
                                    onClick={() => setSelectedProblem(prob.id)}
                                    whiteSpace="normal"
                                    textAlign="center"
                                    borderRadius="xl"
                                    _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                                >
                                    {prob.label}
                                </Button>
                            ))}
                        </SimpleGrid>
                    </Box>
                )}

                {selectedSector !== null && selectedProblem !== null && (
                    <Box bg={cardBg} _dark={{ bg: "black", borderColor: "gray.300" }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                        <Text fontWeight="bold" mb={4} color={labelColor}>Localização</Text>

                        {isProductionSector ? (
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                                <Box>
                                    <Text mb={2} color={labelColor}>Categoria da Linha</Text>
                                    <chakra.select
                                        w="full" p={2} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={inputBg} color={selectColor}
                                        value={selectedPrefix}
                                        onChange={(e) => {
                                            setSelectedPrefix(e.target.value);
                                            setSelectedLineId(null);
                                            setIsLineStopped(false);
                                            setStoppedTime("");
                                            setHasAnsweredStoppage(false);
                                        }}
                                    >
                                        <option value="">Selecione...</option>
                                        {prefixes.map((p) => (
                                            <option key={p.id} value={p.value}>{p.label}</option>
                                        ))}
                                    </chakra.select>
                                </Box>
                                <Box>
                                    <Text mb={2} color={labelColor}>Nome da Linha</Text>
                                    <chakra.select
                                        w="full" p={2} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={inputBg} color={selectColor}
                                        value={selectedLineId ?? ""}
                                        disabled={!selectedPrefix}
                                        onChange={(e) => {
                                            setSelectedLineId(Number(e.target.value));
                                            setIsLineStopped(false);
                                            setStoppedTime("");
                                            setHasAnsweredStoppage(false);
                                        }}
                                    >
                                        <option value="">{!selectedPrefix ? "Selecione a categoria" : "Qual linha?"}</option>
                                        {filteredLines.map((line) => (
                                            <option key={line.id} value={line.id}>{line.lineName}</option>
                                        ))}
                                    </chakra.select>
                                </Box>
                            </SimpleGrid>
                        ) : (
                            <Box>
                                <Text mb={2} color={labelColor}>Onde você está?</Text>
                                <Input
                                    placeholder="Descreva em detalhes a localização do seu posto de trabalho e setor."
                                    bg={inputBg} color={selectColor} borderColor={borderColor}
                                    value={postLocationText}
                                    onChange={(e) => setPostLocationText(e.target.value)}
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {isProductionSector && selectedLineId && (
                    <Box
                        bg={cardBg}
                        _dark={{ bg: "black" }}
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
                                    onChange={(e) => setStoppedTime(e.target.value)}
                                    borderColor="red.500"
                                    _hover={{ borderColor: "red.500" }}
                                    _focusVisible={{ borderColor: "red.500" }}
                                />
                            </Box>
                        )}
                    </Box>
                )}


                {selectedSector !== null && selectedProblem !== null && (
                    (isProductionSector && selectedLineId && hasAnsweredStoppage) ||
                    (!isProductionSector && postLocationText.trim())
                ) && (
                        <Box bg={cardBg} _dark={{ bg: "black", borderColor: "gray.300" }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
                            <Text fontWeight="bold" mb={2} color={labelColor}>Informações Necessárias</Text>
                            <Text fontSize="sm" color="gray.500" mb={2}>
                                Descreva o SKU, Lote, detalhes do erro ou o que for relevante para o problema selecionado.
                            </Text>
                            <Textarea
                                placeholder="Para agilizar o atendimento, digite aqui o máximo de detalhes..."
                                bg={inputBg} color={selectColor} borderColor={borderColor}
                                value={necessaryInfo}
                                onChange={(e) => setNecessaryInfo(e.target.value)}
                                minH="120px"
                            />

                            <Button
                                mt={6} colorScheme="purple" size="lg" w="full"
                                onClick={handleSubmit}
                                isLoading={isLoading}
                                loadingText="Abrindo Ticket..."
                                isDisabled={isLoading || (!!isProductionSector && isLineStopped && !stoppedTime)}
                            >
                                {isLoading ? <Spinner size="sm" mr={2} /> : null}
                                Confirmar e Abrir Ticket
                            </Button>
                        </Box>
                    )}

            </VStack>
        </Flex>
    );
};