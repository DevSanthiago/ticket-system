import { Box, Flex, Heading, Text, Input, Button, VStack, Icon, IconButton, Spinner, Image } from "@chakra-ui/react";
import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { AnimatedEyeLogin, AnimatedEyeOff } from "../components/icons/NewAnimatedIcons";
import { useColorModeValue } from "../hooks/useColorModeValue";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Alert } from "../services/alertService";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import logoImg from "../assets/img/new-logo-transparent-branding.svg";
import { Footer } from "../components/Footer";
import type { ApiErrorResponse, LoginResponse } from "../types";

export const Login = () => {
    const navigate = useNavigate();

    const isDarkMode = useColorModeValue(false, true);
    const bg = useColorModeValue("gray.50", "black");
    const cardBg = useColorModeValue("white", "black");
    const borderColor = useColorModeValue("gray.200", "gray.800");

    const inputBg = useColorModeValue("gray.100", "gray.700");
    const iconColor = useColorModeValue("gray.500", "gray.400");
    const placeholderColor = useColorModeValue("gray.500", "gray.400");
    const labelColor = useColorModeValue("gray.900", "gray.100");
    const headingColor = useColorModeValue("gray.900", "white");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const logoFilter = useColorModeValue("invert(1)", "none");

    const [registration, setRegistration] = useState("");
    const [password, setPassword] = useState("");
    const [passwordHovered, setPasswordHovered] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!registration || !password) {
            Alert.error("Campos obrigatórios", "Por favor, preencha a matrícula e senha.", isDarkMode);
            return;
        }

        setIsLoading(true);

        try {
            const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
                registration: parseInt(registration),
                password
            });

            localStorage.setItem("ticket_token", data.token);
            localStorage.setItem("ticket_user", JSON.stringify(data.user));

            navigate("/");

        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            let errorMsg = "Erro ao conectar com o servidor.";

            if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.message) {
                errorMsg = err.message;
            }

            Alert.error("Falha no Login", errorMsg, isDarkMode);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && registration && password) {
            handleLogin();
        }
    };

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg={bg}
        >
            <Box
                bg={cardBg}
                p={8}
                borderRadius="xl"
                boxShadow="lg"
                borderWidth="1px"
                borderColor={borderColor}
                w={{ base: "90%", md: "600px" }}
                textAlign="center"
            >
                <Flex justify="center" mb={6}>
                    <Image
                        src={logoImg}
                        alt="Logo Ticket System"
                        h="80px"
                        objectFit="contain"
                        filter={logoFilter}
                    />
                </Flex>

                <Heading size="lg" mb={2} color={headingColor}>Ticket System</Heading>
                <Text fontSize="sm" color={textColor} mb={6}>
                    Use as suas credenciais corporativas para acessar o sistema
                </Text>

                <VStack gap={4} align="stretch">

                    <Box textAlign="left">
                        <Text fontSize="sm" fontWeight="medium" mb={1} color={labelColor}>Usuário</Text>
                        <Box position="relative">
                            <Icon
                                as={FaUser}
                                color={iconColor}
                                position="absolute"
                                left={3}
                                top="50%"
                                transform="translateY(-50%)"
                                zIndex={2}
                            />
                            <Input
                                type="number"
                                placeholder="Digite sua matrícula"
                                value={registration}
                                onChange={(e) => setRegistration(e.target.value)}
                                onKeyDown={handleKeyPress}
                                pl={10}
                                bg={inputBg}
                                color={labelColor}
                                border="1px solid transparent"
                                _placeholder={{ color: placeholderColor }}
                                _focus={{
                                    bg: inputBg,
                                    borderWidth: "1px",
                                    borderColor: "blue.500",
                                    outline: "none"
                                }}
                            />
                        </Box>
                    </Box>

                    <Box textAlign="left">
                        <Text fontSize="sm" fontWeight="medium" mb={1} color={labelColor}>Senha</Text>
                        <Box position="relative">
                            <Icon
                                as={FaLock}
                                color={iconColor}
                                position="absolute"
                                left={3}
                                top="50%"
                                transform="translateY(-50%)"
                                zIndex={2}
                            />
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyPress}
                                pl={10}
                                pr={10}
                                bg={inputBg}
                                color={labelColor}
                                border="1px solid transparent"
                                _placeholder={{ color: placeholderColor }}
                                _focus={{
                                    bg: inputBg,
                                    borderWidth: "1px",
                                    borderColor: "blue.500",
                                    outline: "none"
                                }}
                            />
                            <Box
                                position="absolute"
                                right={1}
                                top="50%"
                                transform="translateY(-50%)"
                                zIndex={2}
                            >
                                <IconButton
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                    variant="ghost"
                                    color={iconColor}
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                    onMouseEnter={() => setPasswordHovered(true)}
                                    onMouseLeave={() => setPasswordHovered(false)}
                                    icon={
                                        showPassword
                                            ? <AnimatedEyeOff size={18} isHovered={passwordHovered} />
                                            : <AnimatedEyeLogin size={18} isHovered={passwordHovered} />
                                    }
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Flex justify="space-between" align="center" mt={2}>
                        <Button
                            variant="link"
                            fontSize="xs"
                            color="blue.500"
                            fontWeight="normal"
                            onClick={() => window.open("http://localhost:84/", "_blank")}
                        >
                            Esqueci minha senha
                        </Button>
                        <Button
                            variant="link"
                            fontSize="xs"
                            color="blue.500"
                            fontWeight="normal"
                            onClick={() => window.open("http://localhost:84/auth/request-account", "_blank")}
                        >
                            Ainda não tenho acesso
                        </Button>
                    </Flex>

                    <Button
                        w="full"
                        bg={useColorModeValue("black", "gray.700")}
                        color="white"
                        _hover={{ bg: useColorModeValue("gray.800", "gray.600") }}
                        variant="solid"
                        mt={2}
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner size="sm" color="white" /> : "ENTRAR"}
                    </Button>

                </VStack>

                <Box mt={8}>
                    <Footer />
                </Box>
            </Box>
        </Flex>
    );
};