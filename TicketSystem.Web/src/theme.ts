import { extendTheme } from "@chakra-ui/react";

export const system = extendTheme({
    fonts: {
        heading: "'Inter', sans-serif",
        body: "'Inter', sans-serif",
    },
    config: {
        initialColorMode: "dark",
        useSystemColorMode: true,
    },
});