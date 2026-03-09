import { Box, Flex, Heading, Text, Button, VStack, Image, SimpleGrid } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { AnimatedUserRoundPlus } from "../components/icons/NewAnimatedIcons";
import { useNavigate } from "react-router-dom";
import { useColorModeValue } from "../hooks/useColorModeValue";
import logoImg from "../assets/img/new-logo-transparent-branding.svg";
import { SupportWhatsappTransport } from "../components/WhatsappTransport";

export const RequestAccess = () => {
    const navigate = useNavigate();

    const bg = useColorModeValue("gray.50", "black");
    const cardBg = useColorModeValue("white", "black");
    const borderColor = useColorModeValue("gray.200", "gray.800");
    const headingColor = useColorModeValue("gray.900", "white");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const logoFilter = useColorModeValue("invert(1)", "none");

    return (
        <Flex minH="100vh" align="center" justify="center" bg={bg} p={4}>
            <Box
                bg={cardBg}
                p={8}
                borderRadius="xl"
                boxShadow="lg"
                borderWidth="1px"
                borderColor={borderColor}

                w={{ base: "100%", md: "500px" }}
                textAlign="center"
            >
                <VStack spacing={2} mb={8}>
                    <Flex justify="center">
                        <Image
                            src={logoImg}
                            h="60px"
                            filter={logoFilter}
                            alt="Logo Ticket System"
                        />
                    </Flex>
                    <Heading size="lg" color={headingColor}>Ticket System</Heading>
                </VStack>

                <Flex justify="center" mb={4}>
                    <Box color="green.500">
                        <AnimatedUserRoundPlus size={40} />
                    </Box>
                </Flex>

                <Heading size="md" mb={2} color={headingColor}>Solicitar Acesso</Heading>

                <Text color={textColor} mb={8} fontSize="md">
                    Novos colaboradores devem solicitar cadastro via WhatsApp.<br />
                    A mensagem será <b>copiada automaticamente, cole-a no grupo!</b>.
                </Text>

                <SimpleGrid columns={2} spacing={4}>
                    <Button
                        variant="outline"
                        w="full"
                        onClick={() => navigate("/login")}
                        leftIcon={<FaArrowLeft />}
                        _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
                    >
                        Voltar
                    </Button>

                    <SupportWhatsappTransport type="request_access" isFullWidth />
                </SimpleGrid>
            </Box>
        </Flex>
    );
};