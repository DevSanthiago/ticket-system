import { Box, Grid, Badge, Skeleton, SkeletonText, SkeletonCircle, VStack, HStack } from "@chakra-ui/react";
import { ActionCard } from "../components/ActionCard";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatedBotMessageSquare, AnimatedWrench, AnimatedFileCog, AnimatedFolderCog, AnimatedAirplay, AnimatedClipboardCheck } from "../components/icons/NewAnimatedIcons";

export const Dashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const badgeColor = useColorModeValue("blue.700", "blue.200");
    const badgeBorder = useColorModeValue("blue.700", "blue.200");
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");

    const stored = localStorage.getItem("ticket_user");
    const userRoles: string[] = stored ? (JSON.parse(stored).roles ?? []) : [];
    const userRolesLower = userRoles.map((r: string) => r.toLowerCase());

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const getChecklistCard = () => {
        if (userRolesLower.some(r => r.includes("tecnico") || r.includes("responsável"))) {
            return {
                description: "Confira a caixa de entrada de checklists dos seus atendimentos em linha!",
                subDescription: "Caixa de entrada, Histórico de checklists, Engenharia de Setup, Monitores, Produção."
            };
        } else {
            return {
                description: "Confira sua caixa de entrada e preencha checklists pendentes!",
                subDescription: "Caixa de entrada, Histórico de checklists, Engenharia de Setup, Monitores, Produção."
            };
        }
    };

    const shouldShowChecklistCard = () => {
        return userRolesLower.some(r =>
            ["admin", "requester", "setup-agent"].includes(r)
        );
    };

    const checklistCard = getChecklistCard();

    const LoadingSkeletonCard = () => (
        <Box
            p={6}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            bg={cardBg}
            height="100%"
            minH="320px"
            display="flex"
            flexDirection="column"
        >
            <VStack align="stretch" spacing={4} flex={1}>
                <HStack spacing={3} align="center">
                    <SkeletonCircle
                        size="12"
                        startColor="gray.100"
                        endColor="gray.300"
                        _dark={{ startColor: "gray.700", endColor: "gray.600" }}
                    />
                    <SkeletonText
                        noOfLines={1}
                        skeletonHeight="6"
                        width="60%"
                        startColor="gray.100"
                        endColor="gray.300"
                        _dark={{ startColor: "gray.700", endColor: "gray.600" }}
                    />
                </HStack>

                <SkeletonText
                    mt={2}
                    noOfLines={3}
                    spacing={3}
                    skeletonHeight="4"
                    startColor="gray.100"
                    endColor="gray.300"
                    _dark={{ startColor: "gray.700", endColor: "gray.600" }}
                />

                <Box mt="auto">
                    <SkeletonText
                        noOfLines={2}
                        spacing={2}
                        skeletonHeight="3"
                        startColor="gray.100"
                        endColor="gray.300"
                        _dark={{ startColor: "gray.700", endColor: "gray.600" }}
                    />
                </Box>

                <Skeleton
                    height="40px"
                    width="100%"
                    borderRadius="md"
                    mt={2}
                    startColor="gray.100"
                    endColor="gray.300"
                    _dark={{ startColor: "gray.700", endColor: "gray.600" }}
                />
            </VStack>
        </Box>
    );

    return (
        <Box p={8} w="100%">
            <Skeleton
                isLoaded={!isLoading}
                height="36px"
                width="160px"
                mb={6}
                borderRadius="md"
                startColor="gray.100"
                endColor="gray.300"
                _dark={{ startColor: "gray.700", endColor: "gray.600" }}
                display="flex"
                alignItems="center"
            >
                <Badge
                    variant="outline"
                    bg="transparent"
                    color={badgeColor}
                    borderColor={badgeBorder}
                    borderWidth="1px"
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="md"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    lineHeight="1"
                >
                    Painel de ações
                </Badge>
            </Skeleton>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={6}>
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <LoadingSkeletonCard key={index} />
                    ))
                ) : (
                    <>
                        <ActionCard
                            title="Tickets Automação"
                            colorScheme="blue"
                            icon={AnimatedBotMessageSquare}
                            description="Se o problema da sua linha for software, você deve abrir um ticket para o departamento de engenharia de automação."
                                subDescription="Suporte aos sistemas, Modular System, Industrial System, Monitoring, Sistemas do produto, Cameras/Label Validation"
                            onClick={() => navigate("/opentickets/automation")}
                        />
                        <ActionCard
                            title="Tickets Setup"
                            colorScheme="orange"
                            icon={AnimatedWrench}
                            description="Se o problema da sua linha for falta de material ou montagem de linha, você deve abrir um ticket para o departamento de setup."
                            subDescription="Suporte para setup de linha, Fornecimento de materiais, Equipamentos"
                            onClick={() => navigate("/opentickets/setup")}
                        />
                        <ActionCard
                            title="Tickets TI e COPIA3"
                            colorScheme="gray"
                            icon={AnimatedFileCog}
                            description="Se o problema da sua linha for com impressoras ou conexão com a rede corporativa, você deve abrir um ticket para o departamento de TI ou COPIA3."
                            subDescription="Suporte a redes, Impressoras, E-mails corporativos, Usuários intranet"
                            onClick={() => {
                                const url = "https://chamados.empresa.com.br/";
                                window.open(url, "_blank");
                            }}
                        />
                        <ActionCard
                            title="Ticket Teste"
                            colorScheme="green"
                            icon={AnimatedFolderCog}
                            description="Se o problema da sua linha for com final test e arquivos de log para linhas da ML, você deve abrir um ticket para o departamento de teste."
                            subDescription="ML, Suporte a redes e máquinas, Final teste, Ajustes para arquivos de log"
                            onClick={() => navigate("/opentickets/test")}
                        />
                        <ActionCard
                            title="Ticket Software"
                            colorScheme="purple"
                            icon={AnimatedAirplay}
                            description="Se o problema da sua linha for chave Windows ou atualização de Software, você deve abrir um ticket para o departamento de software. "
                            subDescription="Chave Windows, Atualização de Firmware, Atualização de Software"
                            onClick={() => navigate("/opentickets/software")}
                        />
                        {shouldShowChecklistCard() && (
                            <ActionCard
                                title="Checklists"
                                colorScheme="red"
                                icon={AnimatedClipboardCheck}
                                description={checklistCard.description}
                                subDescription={checklistCard.subDescription}
                                onClick={() => navigate("/checklists")}
                            />
                        )}
                    </>
                )}
            </Grid>
        </Box>
    );
};