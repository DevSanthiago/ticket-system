"use client";

import {
    Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
    Button, VStack, FormControl, FormLabel, Checkbox, Textarea, Box,
    Flex, Icon, Text, Divider, Heading, Badge, Image, Input, SimpleGrid, useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useColorModeValue
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaSignature, FaCalendarAlt } from "react-icons/fa";
import { AnimatedFileText, AnimatedFileCheck2 } from "../components/icons/NewAnimatedIcons";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import type { ChecklistFormProps, ParsedChecklistContent } from "../types";
import logo from '../assets/img/logo.png';
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { Alert } from "../services/alertService";

const itensChecklist = [
    "1. Conferir o escoamento da linha",
    "2. Documento de linha",
    "3. Layout",
    "4. Ajustar bancadas conforme o layout",
    "5. Cabo de rede",
    "6. Scanner de qr code ou barra",
    "7. Mouses",
    "8. Teclados",
    "9. Parafusadeira",
    "10. Soprador",
    "11. Verificar se as bancadas estão corretas",
    "12. Ligar todas as bancadas",
    "13. Verificar as mantas das bancadas",
    "14. Verificar os fios de aterramentos",
    "15. Seladora",
    "16. Balança",
    "17. Requester",
    "18. Notebook",
    "19. CPUs",
    "20. Máquinas Laser",
    "21. Ionizador",
    "22. Conferir o funcionamento de todos os equipamentos abastecidos",
    "23. Conferir estruturação da linha",
    "24. Recolher equipamentos que não estão no layout ou no proceso",
    "25. Validação de 5S da linha junto ao requester/lider",
    "26. Verificar postos críticos e instalar placas conforme a IT",
    "27. Conferir a instalação de mouse pads nas bancadas"
];

export const ChecklistForm = ({ isOpen, onClose, ticket, currentUser, onSuccess }: ChecklistFormProps) => {
    const {
        isOpen: isConfirmOpen,
        onOpen: onOpenConfirm,
        onClose: onCloseConfirm
    } = useDisclosure();

    const isDarkMode = useColorModeValue(false, true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const [hoverPdf, setHoverPdf] = useState(false);
    const [hoverSubmit, setHoverSubmit] = useState(false);

    const {
        modalBg,
        borderColor,
        inputBg,
        readOnlyInputBg,
        titleColor,
        successBox,
        actionButtonRed,
        signatureBox,
        selectAllBox
    } = useDepartmentTheme("setup");

    const [formData, setFormData] = useState({
        produtoAtual: "",
        produtoSetup: "",
        liderLinha: "",
        observacao: "",
        checks: new Array(itensChecklist.length).fill(false)
    });

    const isRequester = currentUser?.roles?.some(r => r.toLowerCase() === 'requester') ?? false;
    const isResolverSetup = currentUser?.roles?.some(r => r.toLowerCase() === 'setup-agent') ?? false;
    const isChecklistCompleted = !!ticket?.checklistContent;
    const isViewMode = !isRequester && isChecklistCompleted;
    const canDownloadPdf = (isRequester || isResolverSetup) && isChecklistCompleted;

    const allChecked = formData.checks.every(Boolean);
    const isIndeterminate = formData.checks.some(Boolean) && !allChecked;

    const handleConfirmSelectAll = () => {
        const newChecks = new Array(itensChecklist.length).fill(true);
        setFormData({ ...formData, checks: newChecks });
        onCloseConfirm();
        Alert.success("Checklist preenchido!", "", isDarkMode);
    };

    const handleMasterCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onOpenConfirm();
        } else {
            const newChecks = new Array(itensChecklist.length).fill(false);
            setFormData({ ...formData, checks: newChecks });
        }
    };

    const handleDownloadPdf = async () => {
        if (!ticket || !canDownloadPdf) return;

        setIsDownloading(true);
        const token = localStorage.getItem("token") || localStorage.getItem("ticket_token");
        const API_BASE_URL = "https://localhost:7106/api";

        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SETUP_TICKETS.DOWNLOAD_PDF(ticket.id)}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Erro ao baixar PDF");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `checklist_setup_${ticket.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            Alert.success("Sucesso", "PDF baixado com sucesso!", isDarkMode);
        } catch (error) {
            console.error("Erro ao baixar PDF:", error);
            Alert.error("Erro ao baixar PDF", error instanceof Error ? error.message : "Erro desconhecido", isDarkMode);
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        if (isOpen && ticket) {
            if (ticket.checklistContent) {
                try {
                    const parsedData = JSON.parse(ticket.checklistContent);
                    const content: ParsedChecklistContent = typeof parsedData === 'string'
                        ? JSON.parse(parsedData)
                        : parsedData;

                    setFormData({
                        produtoAtual: content.produtoAtual || ticket.product || "",
                        produtoSetup: content.produtoSetup || "",
                        observacao: content.observacao || "",
                        liderLinha: content.liderLinha || "",
                        checks: content.checks || new Array(itensChecklist.length).fill(false)
                    });
                } catch (e) {
                    console.error("Erro ao parsear checklist:", e);
                    setFormData({
                        produtoAtual: ticket.product || "",
                        produtoSetup: "",
                        observacao: "",
                        liderLinha: "",
                        checks: new Array(itensChecklist.length).fill(false)
                    });
                }
            } else {
                setFormData({
                    produtoAtual: ticket.product || "",
                    produtoSetup: "",
                    observacao: "",
                    liderLinha: "",
                    checks: new Array(itensChecklist.length).fill(false)
                });
            }
        }
    }, [isOpen, ticket]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "--/--/-- --:--";
        try {
            return new Date(dateString).toLocaleString('pt-BR');
        } catch {
            return "--/--/-- --:--";
        }
    };

    const handleSubmit = async () => {
        if (isViewMode) return;

        if (!formData.produtoAtual || !formData.produtoSetup) {
            Alert.error("Campos obrigatórios", "Informe os produtos.", isDarkMode);
            return;
        }

        if (!ticket) return;

        setIsSubmitting(true);
        const token = localStorage.getItem("token") || localStorage.getItem("ticket_token");

        const checklistToSave = {
            ...formData,
            assinadoPor: currentUser?.name,
            dataAssinatura: new Date().toLocaleString()
        };

        try {
            const response = await fetch("https://localhost:7106/api/setup-tickets/submit-checklist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ticketId: ticket.id,
                    checklistContent: JSON.stringify(checklistToSave)
                })
            });

            if (response.ok) {
                Alert.success("Sucesso", "Checklist enviado com sucesso!", isDarkMode);
                onSuccess();
                onClose();
            } else {
                Alert.error("Erro ao enviar", "Não foi possível processar o checklist.", isDarkMode);
            }
        } catch (error) {
            console.error(error);
            Alert.error("Erro de conexão", "Falha ao comunicar com o servidor.", isDarkMode);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!ticket) return null;

    return (
        <Drawer placement="bottom" onClose={onClose} isOpen={isOpen} size="xl">
            <DrawerOverlay backdropFilter="blur(3px)" />

            <DrawerContent
                borderTopRadius="24px"
                maxH="90vh"
                maxW="900px"
                mx="auto"
                bg={modalBg}
                boxShadow="2xl"
                borderTopWidth="1px"
                borderColor={borderColor}
            >
                <DrawerCloseButton />

                <DrawerHeader borderBottomWidth="1px" py={4} borderColor={borderColor}>
                    <Flex align="center" justify="space-between">
                        <Box w="180px" flexShrink={0}>
                            <Image src={logo} alt="Logo" h="40px" w="auto" objectFit="contain" />
                        </Box>
                        <Box flex="1" textAlign="center" px={4}>
                            <Heading size="md" mb={1} color={titleColor}>Checklist Engenharia de Setup</Heading>
                            <Flex justify="center" gap={2} align="center" mb={3}>
                                <Badge colorScheme="orange">Ticket ID {ticket.id}</Badge>
                                <Text fontSize="sm" color="gray.500">{ticket.lineName}</Text>
                            </Flex>
                            <Flex justify="center" gap={2} wrap="wrap">
                                <Badge variant="outline" colorScheme="gray" fontSize="sm">Emissão: 16/10/2024</Badge>
                                <Badge variant="outline" colorScheme="gray" fontSize="sm">Rev 02: 15/04/2025</Badge>
                                <Badge variant="outline" colorScheme="gray" fontSize="sm">Elaborado: Renato Miranda</Badge>
                                <Badge variant="outline" colorScheme="gray" fontSize="sm">Aprovado: Helton Giacomini</Badge>
                            </Flex>
                        </Box>
                        <Box w="180px" flexShrink={0} textAlign="right" display="flex" alignItems="center" justifyContent="flex-end">
                            <Text fontSize="3xl" fontWeight="bold" fontFamily="sans-serif" color={titleColor}>FI 12 70</Text>
                        </Box>
                    </Flex>
                </DrawerHeader>

                <DrawerBody px={{ base: 4, md: 8 }} py={6}>
                    <VStack spacing={6} align="stretch">
                        {canDownloadPdf && (
                            <Box bg={successBox.bg} borderWidth={successBox.border} borderColor={successBox.borderColor} borderRadius="lg" p={3}>
                                <Flex align="center" gap={2}>
                                    <AnimatedFileCheck2 isHovered={true} size={20} color={successBox.iconColor} />
                                    <Text fontSize="sm" fontWeight="medium" color={successBox.textColor}>
                                        Checklist preenchido! Download do PDF disponível.
                                    </Text>
                                </Flex>
                            </Box>
                        )}

                        <Box bg={inputBg} p={5} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                <FormControl isRequired={isRequester}>
                                    <FormLabel fontWeight="bold">Produto Atual (Rodando)</FormLabel>
                                    <Input bg={readOnlyInputBg} value={formData.produtoAtual} isReadOnly={true} />
                                </FormControl>
                                <FormControl isRequired={isRequester}>
                                    <FormLabel fontWeight="bold">Produto em Setup (Entrando)</FormLabel>
                                    <Input placeholder={isViewMode ? "" : "Informe o produto"} bg={modalBg} value={formData.produtoSetup} isReadOnly={isViewMode} onChange={(e) => setFormData({ ...formData, produtoSetup: e.target.value.toUpperCase() })} />
                                </FormControl>
                                <FormControl><FormLabel fontWeight="bold">Departamento atuante:</FormLabel><Input value="Engenharia Industrial" bg={readOnlyInputBg} isReadOnly={true} /></FormControl>
                                <FormControl isRequired={isRequester}>
                                    <FormLabel fontWeight="bold">Lider da linha:</FormLabel>
                                    <Input placeholder={isViewMode ? "" : "Informe a sua liderança"} bg={modalBg} value={formData.liderLinha} isReadOnly={isViewMode} onChange={(e) => setFormData({ ...formData, liderLinha: e.target.value.toUpperCase() })} />
                                </FormControl>
                            </SimpleGrid>
                        </Box>

                        <Box p={2}>
                            <Heading size="sm" mb={4} textTransform="uppercase" color="gray.500">Itens de Verificação</Heading>
                            <Box sx={{ columnCount: { base: 1, md: 2, lg: 4 }, columnGap: "2rem" }}>
                                {itensChecklist.map((itemLabel, index) => (
                                    <Box key={index} mb={4} sx={{ breakInside: "avoid" }}>
                                        <Checkbox size="lg" colorScheme="green" isDisabled={isViewMode} isChecked={formData.checks[index]} onChange={(e) => {
                                            const newChecks = [...formData.checks];
                                            newChecks[index] = e.target.checked;
                                            setFormData({ ...formData, checks: newChecks });
                                        }}>
                                            <Text fontWeight="bold" fontSize="sm" mt={1}>{itemLabel}</Text>
                                        </Checkbox>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {isRequester && (
                            <Box mb={6} p={4} bg={selectAllBox.bg} borderRadius="md" borderWidth={selectAllBox.border} borderColor={selectAllBox.borderColor}>
                                <Checkbox isChecked={allChecked} isIndeterminate={isIndeterminate} onChange={handleMasterCheckboxChange} colorScheme="blue" size="lg" isDisabled={isViewMode}>
                                    <Text fontWeight="bold" color={selectAllBox.textColor}>Selecionar Todos os Itens</Text>
                                </Checkbox>
                            </Box>
                        )}

                        <Modal isOpen={isConfirmOpen} onClose={onCloseConfirm} isCentered>
                            <ModalOverlay />
                            <ModalContent bg={modalBg} borderColor={borderColor} borderWidth="1px">
                                <ModalHeader>Confirmação de Preenchimento</ModalHeader>
                                <ModalBody>
                                    <Text>Tem certeza que quer preencher todo o checklist? Essa ação não poderá ser desfeita.</Text>
                                </ModalBody>
                                <ModalFooter>
                                    <Button variant="ghost" mr={3} onClick={onCloseConfirm}>Cancelar</Button>
                                    <Button colorScheme="blue" onClick={handleConfirmSelectAll}>Sim, preencher tudo</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        <FormControl>
                            <FormLabel fontWeight="bold">Observações do Requester</FormLabel>
                            <Textarea placeholder={isViewMode ? "Sem observações." : "Descreva suas observações..."} rows={3} value={formData.observacao} isReadOnly={isViewMode} onChange={(e) => setFormData({ ...formData, observacao: e.target.value })} bg={inputBg} />
                        </FormControl>

                        <Box borderWidth={signatureBox.border} borderColor={signatureBox.borderColor} borderStyle="dashed" borderRadius="lg" p={4} bg={signatureBox.bg} textAlign="center">
                            <Icon as={FaSignature} boxSize={5} color={signatureBox.iconColor} mb={1} />
                            <Text fontSize="xs" fontWeight="bold" color={signatureBox.textLabel}>{isViewMode ? "Assinado por:" : "Assinado digitalmente por:"}</Text>
                            <Text fontFamily="Caveat" fontSize="2xl" fontWeight="700" color={signatureBox.textValue} mb={3}>{isViewMode ? ticket.requesterName : currentUser?.name}</Text>
                            <Divider borderColor={signatureBox.borderColor} mb={3} />
                            <Flex justify="center" gap={8} align="center" wrap="wrap">
                                <Box><Text fontSize="xs" color="gray.500">Início:</Text><Text fontSize="sm" fontWeight="bold">{formatDate(ticket.startedAt || ticket.StartedAt)}</Text></Box>
                                <Icon as={FaCalendarAlt} boxSize={5} color="gray.400" />
                                <Box><Text fontSize="xs" color="gray.500">Término:</Text><Text fontSize="sm" fontWeight="bold">{formatDate(ticket.finishedAt || ticket.FinishedAt)}</Text></Box>
                            </Flex>
                        </Box>
                    </VStack>
                </DrawerBody>

                <DrawerFooter borderTopWidth="1px" pb={6} borderColor={borderColor}>
                    <Flex w="100%" gap={3}>
                        <Button variant="outline" onClick={onClose} h="50px" flex={1}>{isViewMode ? "Fechar" : "Cancelar"}</Button>
                        {canDownloadPdf && (
                            <Button {...actionButtonRed} onClick={handleDownloadPdf} isLoading={isDownloading} h="50px" flex={1}
                                onMouseEnter={() => setHoverPdf(true)} onMouseLeave={() => setHoverPdf(false)}
                                leftIcon={<AnimatedFileText isHovered={hoverPdf} size={20} />}>
                                Baixar PDF
                            </Button>
                        )}
                        {isRequester && !isChecklistCompleted && (
                            <Button colorScheme="green" onClick={handleSubmit} isLoading={isSubmitting} h="50px" flex={1}
                                onMouseEnter={() => setHoverSubmit(true)} onMouseLeave={() => setHoverSubmit(false)}
                                leftIcon={<AnimatedFileCheck2 isHovered={hoverSubmit} size={20} />}>
                                Confirmar e Enviar
                            </Button>
                        )}
                    </Flex>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};