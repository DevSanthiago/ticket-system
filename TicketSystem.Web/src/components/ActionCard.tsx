import { Box, Text, VStack, Button, Badge, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useDepartmentTheme } from "../hooks/useDepartmentTheme";
import type { ActionCardProps } from "../types";

export const ActionCard = ({ title, description, subDescription, icon: AnimatedIcon, colorScheme, onClick, extraElement }: ActionCardProps) => {
    const {
        cardBg,
        cardShadow,
        cardBorder,
        cardBorderColor,
        titleColor,
        getActionCardColors
    } = useDepartmentTheme();

    const theme = getActionCardColors(colorScheme);
    const tags = subDescription.split(',').map(tag => tag.trim());
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Box
            className="group"
            borderRadius="2xl"
            overflow="hidden"
            h="100%"
            display="flex"
            flexDirection="column"
            boxShadow={cardShadow}
            border={cardBorder}
            borderColor={cardBorderColor}
            bg={cardBg}
            transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
            _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
            cursor="pointer"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            position="relative"
        >
            <Box position="absolute" top={0} right={0} zIndex={10}>
                {extraElement}
            </Box>

            <Flex
                bg={theme.topBg}
                flex="1"
                position="relative"
                align="center"
                justify="center"
                minH="220px"
                p={6}
                overflow="hidden"
            >
                <Badge
                    position="absolute"
                    top={4}
                    left={4}
                    variant="outline"
                    bg="transparent"
                    color={theme.iconColor}
                    borderColor={theme.iconColor}
                    fontSize="sm"
                    fontWeight="bold"
                    px={3}
                    py={1}
                    borderRadius="md"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    lineHeight="1"
                    zIndex={1}
                    borderWidth="1px"
                >
                    {title}
                </Badge>

                <Box
                    color={theme.iconColor}
                    transition="color 0.3s ease"
                    _groupHover={{ color: theme.groupHoverIconColor }}
                >
                    <AnimatedIcon
                        size={80}
                        strokeWidth={1.5}
                        isHovered={isHovered}
                    />
                </Box>
            </Flex>

            <Box
                bg={theme.bottomBg}
                p={6}
                position="relative"
                minH="220px"
            >
                <VStack align="start" gap={3} mb={6} pr={10}>
                    <Text
                        fontWeight="bold"
                        color={titleColor}
                        fontSize="md"
                        lineHeight="1.2"
                    >
                        {description}
                    </Text>

                    <Flex gap={2} wrap="wrap">
                        {tags.map((tag, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                bg="transparent"
                                color={theme.iconColor}
                                borderColor={theme.iconColor}
                                borderWidth="1px"
                                px={2}
                                py={1}
                                borderRadius="md"
                                whiteSpace="normal"
                                textAlign="center"
                                fontSize="xs"
                                fontWeight="bold"
                                textTransform="none"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </Flex>
                </VStack>

                <Button
                    position="absolute"
                    bottom={4}
                    right={4}
                    rounded="full"
                    w="50px"
                    h="50px"
                    bg={theme.badgeBg}
                    color="white"
                    transition="all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)"
                    boxShadow="md"
                    transform="rotate(45deg)"
                    _groupHover={{
                        transform: "rotate(0deg) scale(1.1)",
                        bg: theme.hoverButtonBg,
                        color: theme.hoverIconColor
                    }}
                >
                    <Plus size={24} strokeWidth={3} />
                </Button>
            </Box>
        </Box>
    );
};