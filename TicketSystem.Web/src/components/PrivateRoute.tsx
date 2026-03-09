import { Navigate, Outlet } from "react-router-dom";
import { Spinner, Flex } from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";

export const PrivateRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Flex minH="100vh" align="center" justify="center">
                <Spinner size="xl" color="blue.500" />
            </Flex>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};