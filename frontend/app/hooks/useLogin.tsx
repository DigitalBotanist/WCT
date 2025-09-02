import { useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import type { ServerError } from "~/types/api";
import type { AuthResponse } from "~/types/auth";

const API_URL = import.meta.env.VITE_API_URL;

interface UseLoingReturn {
    login: (
        email: string,
        password: string
    ) => Promise<AuthResponse | ServerError | null>;
    error: string | null;
    loading: boolean;
}

export function useLogin(): UseLoingReturn {
    const { dispatch } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function login(email: string, password: string) {
        setLoading(true);
        setError(null);
        try {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
            });

            const data: AuthResponse | ServerError = await response.json();
            if (!response.ok) {
                if ("detail" in data)
                    throw new Error(data.detail.error || "Login Error");
            }

            return data;
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(error));
            }
            return null;
        } finally {
            setLoading(false);
        }
    }

    return { login, loading, error };
}
