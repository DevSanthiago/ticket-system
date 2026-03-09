import { useColorModeValue } from "./useColorModeValue";
import type { TicketDepartment as Department, DepartmentThemeData } from "../types";

export const useDepartmentTheme = (department: Department = "setup") => {
    const isLight = useColorModeValue(true, false);

    const cardBg = useColorModeValue("white", "black");

    const borderColor = useColorModeValue("gray.200", "gray.600");

    const inputBg = useColorModeValue("gray.50", "black");

    const searchBg = useColorModeValue("white", "black");
    const readOnlyInputBg = useColorModeValue("gray.200", "gray.800");
    const labelColor = useColorModeValue("gray.900", "gray.100");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const titleColor = useColorModeValue("gray.800", "whiteAlpha.900");
    const selectColor = useColorModeValue("gray.900", "gray.100");
    const hoverBg = useColorModeValue("gray.100", "whiteAlpha.200");
    const hoverButtonTextColor = useColorModeValue("gray.600", "white");
    const emptyStateBg = useColorModeValue("white", "black");
    const modalBg = useColorModeValue("white", "black");
    const emptyStateTitle = useColorModeValue("gray.700", "white");
    const emptyStateText = useColorModeValue("gray.500", "gray.400");

    const cardShadow = useColorModeValue("xl", "md");
    const cardBorder = useColorModeValue("1px solid", "none");
    const cardBorderColor = useColorModeValue("gray.200", "transparent");

    const errorBg = useColorModeValue("red.100", "rgba(120, 0, 0, 0.3)");
    const errorColor = useColorModeValue("red.700", "red.200");

    const getActionCardColors = (colorScheme: string) => {
        const lightBgColors: Record<string, string> = {
            blue: "blue.100", orange: "orange.100", red: "red.100", purple: "purple.100", green: "green.100", blackAlpha: "gray.100", gray: "gray.100"
        };
        const darkBgColors: Record<string, string> = {
            blue: "blue.900", orange: "orange.900", red: "red.900", purple: "purple.900", green: "green.900", blackAlpha: "whiteAlpha.50", gray: "gray.800"
        };

        const lightIconColors: Record<string, string> = {
            blue: "blue.700", orange: "orange.500", red: "red.600", purple: "purple.700", green: "green.700", blackAlpha: "gray.800", gray: "gray.600"
        };
        const darkIconColors: Record<string, string> = {
            blue: "blue.200", orange: "orange.200", red: "red.200", purple: "purple.200", green: "green.200", blackAlpha: "white", gray: "gray.200"
        };

        const badgeColors: Record<string, string> = {
            blue: "blue.600", orange: "orange.400", red: "red.700", purple: "purple.600", green: "green.600", blackAlpha: "gray.900", gray: "gray.600"
        };

        const darkHoverBtnColors: Record<string, string> = {
            blue: "blue.400", orange: "orange.400", red: "red.400", purple: "purple.400", green: "green.400", blackAlpha: "whiteAlpha.900", gray: "gray.400"
        };

        const lightIconHoverColors: Record<string, string> = {
            blue: "blue.800", orange: "orange.800", red: "red.800", purple: "purple.800", green: "green.800", blackAlpha: "gray.900", gray: "gray.800"
        };
        const darkIconHoverColors: Record<string, string> = {
            blue: "blue.400", orange: "orange.400", red: "red.400", purple: "purple.400", green: "green.400", blackAlpha: "white", gray: "white"
        };

        const cockpitButtonColors: Record<string, string> = {
            blue: "blue.500", orange: "orange.500", purple: "purple.500", green: "green.500", red: "red.500"
        };

        const cockpitButtonHoverColors: Record<string, string> = {
            blue: "blue.600", orange: "orange.600", purple: "purple.600", green: "green.600", red: "red.600"
        };

        return {
            topBg: isLight ? lightBgColors[colorScheme] : darkBgColors[colorScheme],
            bottomBg: isLight ? "gray.300" : "gray.700",
            iconColor: isLight ? lightIconColors[colorScheme] : darkIconColors[colorScheme],
            badgeBg: badgeColors[colorScheme],
            hoverButtonBg: isLight ? "white" : darkHoverBtnColors[colorScheme],
            hoverIconColor: isLight ? lightIconColors[colorScheme] : "gray.900",
            groupHoverIconColor: isLight ? lightIconHoverColors[colorScheme] : darkIconHoverColors[colorScheme],
            cockpitButtonBg: cockpitButtonColors[colorScheme],
            cockpitButtonHoverBg: cockpitButtonHoverColors[colorScheme]
        };
    };

    const actionButtonBlue = {
        bg: isLight ? "blue.500" : "blue.200",
        color: isLight ? "white" : "gray.900",
        border: "1px solid",
        borderColor: isLight ? "blue.500" : "blue.200",
        _hover: {
            bg: isLight ? "blue.600" : "blue.600",
            borderColor: "blue.600",
            color: isLight ? "black" : "white",
            transform: "translateY(-1px)",
            boxShadow: "md"
        },
        _active: {
            bg: "blue.700",
            color: "white"
        }
    };

    const actionButtonOrange = {
        bg: isLight ? "orange.400" : "orange.200",
        color: isLight ? "white" : "gray.900",
        border: "1px solid",
        borderColor: isLight ? "orange.400" : "orange.200",
        _hover: {
            bg: isLight ? "orange.500" : "orange.600",
            borderColor: isLight ? "orange.500" : "orange.600",
            color: isLight ? "black" : "white",
            transform: "translateY(-1px)",
            boxShadow: "md"
        },
        _active: {
            bg: "orange.700",
            color: "white"
        }
    };

    const actionButtonRed = {
        bg: isLight ? "red.500" : "red.500",
        color: "white",
        _hover: {
            bg: isLight ? "red.600" : "red.600",
            transform: "translateY(-1px)",
            boxShadow: "md"
        },
        _active: { bg: "red.700" }
    };

    const successBox = {
        bg: isLight ? "green.50" : "green.900",
        border: "1px solid",
        borderColor: isLight ? "green.200" : "green.700",
        textColor: isLight ? "green.700" : "green.200",
        iconColor: "green.500"
    };

    const criticalBox = {
        bg: isLight ? "red.50" : "rgba(254, 178, 178, 0.1)",
        border: "1px solid",
        borderColor: isLight ? "red.200" : "red.800",
        textColor: isLight ? "red.700" : "red.200",
        iconColor: isLight ? "red.500" : "red.400"
    };

    const blueBadge = {
        bg: isLight ? "blue.100" : "blue.900",
        border: "1px solid",
        borderColor: isLight ? "blue.200" : "blue.700",
        textColor: isLight ? "blue.800" : "blue.200",
    };

    const signatureBox = {
        bg: isLight ? "blue.50" : "rgba(66, 153, 225, 0.1)",
        border: "2px dashed",
        borderColor: "blue.300",
        textLabel: isLight ? "blue.700" : "blue.200",
        textValue: isLight ? "blue.600" : "blue.300",
        iconColor: "blue.500"
    };

    const selectAllBox = {
        bg: isLight ? "blue.50" : "blue.900",
        border: "1px solid",
        borderColor: isLight ? "blue.200" : "blue.700",
        textColor: isLight ? "blue.700" : "blue.200"
    };

    const lineStopped = {
        stopped: {
            borderColor: "#FF0000",
            textColor: "#FF0000",
            iconColor: "#FF0000",
        },
        running: {
            borderColor: "#00C853",
            textColor: "#00C853",
            iconColor: "#00C853",
        }
    };

    const emptyState = {
        color: isLight ? "red.600" : "#ff2d55",
        borderColor: isLight ? "red.600" : "#ff2d55",
    };

    const departments: Record<Department, DepartmentThemeData> = {
        setup: {
            primary: isLight ? "#2563eb" : "#3b82f6",
            badge: isLight ? "orange.100" : "orange.900",
            badgeText: isLight ? "orange.700" : "orange.200",
            main: {
                text: isLight ? "blue.700" : "blue.300",
                bg: isLight ? "blue.50" : "rgba(37, 99, 235, 0.1)",
                border: isLight ? "blue.200" : "blue.400",
                iconColor: isLight ? "blue.600" : "blue.400",
                buttonHex: "#2563eb",
                buttonHexDark: "#3b82f6"
            },
            material: {
                text: isLight ? "orange.700" : "orange.300",
                bg: isLight ? "orange.50" : "rgba(255, 107, 53, 0.1)",
                border: isLight ? "orange.200" : "orange.400",
                iconColor: isLight ? "orange.600" : "orange.400",
                buttonHex: "#ff6b35",
                buttonHexDark: "#ff8c42"
            }
        },
        test: {
            primary: isLight ? "#10b981" : "#34d399",
            badge: isLight ? "orange.100" : "orange.900",
            badgeText: isLight ? "orange.700" : "orange.200",
            main: {
                text: isLight ? "green.700" : "green.300",
                bg: isLight ? "green.50" : "rgba(16, 185, 129, 0.1)",
                border: isLight ? "green.200" : "green.400",
                iconColor: isLight ? "green.600" : "green.400",
                buttonHex: "#10b981",
                buttonHexDark: "#34d399"
            },
            log: {
                text: isLight ? "yellow.700" : "yellow.300",
                bg: isLight ? "yellow.50" : "rgba(245, 158, 11, 0.1)",
                border: isLight ? "yellow.200" : "yellow.400",
                iconColor: isLight ? "yellow.600" : "yellow.400",
                buttonHex: "#f59e0b",
                buttonHexDark: "#fbbf24"
            }
        },
        automation: {
            primary: isLight ? "#f59e0b" : "#fbbf24",
            badge: isLight ? "orange.100" : "orange.900",
            badgeText: isLight ? "orange.700" : "orange.200",
            main: {
                text: isLight ? "orange.700" : "orange.300",
                bg: isLight ? "orange.50" : "rgba(245, 158, 11, 0.1)",
                border: isLight ? "orange.200" : "orange.400",
                iconColor: isLight ? "orange.600" : "orange.400",
                buttonHex: "#f59e0b",
                buttonHexDark: "#fbbf24"
            },
            systems: {
                text: isLight ? "purple.700" : "purple.300",
                bg: isLight ? "purple.50" : "rgba(147, 112, 219, 0.1)",
                border: isLight ? "purple.200" : "purple.400",
                iconColor: isLight ? "purple.600" : "purple.400",
                buttonHex: "#7c3aed",
                buttonHexDark: "#a78bfa"
            },
            tools: {
                text: isLight ? "cyan.700" : "cyan.300",
                bg: isLight ? "cyan.50" : "rgba(6, 182, 212, 0.1)",
                border: isLight ? "cyan.200" : "cyan.400",
                iconColor: isLight ? "cyan.600" : "cyan.400",
                buttonHex: "#06b6d4",
                buttonHexDark: "#0891b2"
            }
        },
        software: {
            primary: isLight ? "#8b5cf6" : "#c084fc",
            badge: isLight ? "purple.100" : "rgba(139, 92, 246, 0.15)",
            badgeText: isLight ? "purple.700" : "#d8b4fe",
            badgeBorder: isLight ? "purple.300" : "#c084fc",
            main: {
                text: isLight ? "#7c3aed" : "#a78bfa",
                bg: isLight ? "purple.50" : "rgba(139, 92, 246, 0.1)",
                border: isLight ? "#8b5cf6" : "#a78bfa",
                iconColor: isLight ? "#7c3aed" : "#a78bfa",
                buttonHex: "#8b5cf6",
                buttonHexDark: "#a78bfa"
            },
            attention: {
                text: isLight ? "orange.700" : "orange.300",
                bg: isLight ? "orange.50" : "rgba(255, 107, 53, 0.1)",
                border: isLight ? "orange.400" : "orange.500",
                iconColor: isLight ? "orange.600" : "orange.400",
                buttonHex: "#ff6b35",
                buttonHexDark: "#ff8c42"
            }
        },
    };

    const iconHeaderColor = useColorModeValue("black", "white");

    return {
        cardBg,
        textColor,
        titleColor,
        labelColor,
        borderColor,
        inputBg,
        searchBg,
        readOnlyInputBg,
        selectColor,
        hoverBg,
        hoverButtonTextColor,
        cardShadow,
        cardBorder,
        cardBorderColor,
        errorBg,
        errorColor,
        modalBg,
        emptyStateBg,
        emptyStateTitle,
        emptyStateText,
        iconHeaderColor,
        successBox,
        lineStopped,
        emptyState,
        blueBadge,
        signatureBox,
        selectAllBox,
        criticalBox,
        actionButtonRed,
        actionButtonBlue,
        actionButtonOrange,
        getActionCardColors,
        department: departments[department],
    };
};