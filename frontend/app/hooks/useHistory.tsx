import { useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import type ChatSession from "~/interfaces/ChatSession";

const API_URL = import.meta.env.VITE_API_URL;

interface useHistoryReturn {
    loading: boolean;
    getHistory: () => Promise<ChatSession[] | null>;
    error: string | null;
}

export const useHistory = (): useHistoryReturn => {
    const { userState } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function getHistory() {
        const response = await fetch(`${API_URL}/chat_sessions`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${userState.token}`,
            },
        });

        if (response.ok) {
            const data: ChatSession[] = await response.json();
            const chatSessions: ChatSession[] = data.map((session) => ({
                id: session.id,
                title: session.title,
                context: session.context,
            }));
            return chatSessions
        }

        return null
    }

    return {getHistory, loading, error}
};
