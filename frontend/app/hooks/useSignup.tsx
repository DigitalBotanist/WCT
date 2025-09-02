import { useState } from "react";
import type { ServerError } from "~/types/api";
import type { AuthResponse } from "~/types/auth";

const API_URL = import.meta.env.VITE_API_URL;

interface UseSignupReturn {
    signup: (email: string, password: string) => Promise<AuthResponse | null>;
    loading: boolean;
    error: string | null;
}

export function useSignup(): UseSignupReturn {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function signup(
        email: string,
        password: string
    ): Promise<AuthResponse | null> {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data: AuthResponse | ServerError = await response.json();

            if (!response.ok)
                if ("detail" in data) {
                    throw new Error(data?.detail?.error || "Signup Error");
                }

            return data as AuthResponse;
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
    return { loading, error, signup };
}
