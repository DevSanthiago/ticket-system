import { useEffect, useState } from "react";

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem("ticket_token");

            if (!token || token.trim() === "") {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch("https://localhost:7106/api/Auth/validate", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem("ticket_token");
                    localStorage.removeItem("ticket_user");
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Erro ao validar token:", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, []);

    return { isAuthenticated, isLoading };
};