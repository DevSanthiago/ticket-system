import { useEffect, useState } from "react";
import type { User } from "../types";

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem("ticket_token");
            const storedUser = localStorage.getItem("ticket_user");

            if (!token || !storedUser) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch("https://localhost:7106/api/Auth/validate", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                    setUser(JSON.parse(storedUser));
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

    return { isAuthenticated, user, isLoading };
};