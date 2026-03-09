import { Box } from "@chakra-ui/react";
import { useColorModeValue } from "../hooks/useColorModeValue";

export const Footer = () => {
    const footerColor = useColorModeValue("gray.500", "gray.400");
    const borderColor = useColorModeValue("gray.200", "gray.700");

    return (
        <Box
            mb={6}
            pt={6}
            textAlign="center"
            fontSize="xs"
            color={footerColor}
            borderTop="1px solid"
            borderColor={borderColor}
        >
            &copy; 2025 Ticket System. Todos os direitos reservados.
            <br />
            Desenvolvido por Dev Santhiago. v: 1.0.0
        </Box>
    );
};