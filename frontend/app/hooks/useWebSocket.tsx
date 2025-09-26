// hooks/useWebSocket.ts
import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "~/contexts/AuthContext";

interface WebSocketMessage {
    action?: string;
    type:
        | "message"
        | "error"
        | "progress"
        | "connection_status"
        | "sessionId"
        | "image"
        | "document";
    content: string;
    role?: "system" | "user";
    code?: string;
    data?: any;
    sessionId?: string;
}

export const useWebSocket = () => {
    const { userState } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState<null | string>(null);
    const [messages, setMessages] = useState<WebSocketMessage[]>([]);
    const ws = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        if (!userState.user) return;
        if (!userState.token == null) return;

        try {
            ws.current = new WebSocket(
                `ws://localhost:8000/ws?token=${encodeURIComponent(userState.token || "")}`
            );

            ws.current.onopen = () => {
                setIsConnected(true);
                setMessages((prev) => [
                    ...prev,
                    {
                        type: "connection_status",
                        content: "Connected to chat",
                    },
                ]);
            };

            ws.current.onmessage = (event) => {
                const data: WebSocketMessage = JSON.parse(event.data);
                console.log(data);
                setMessages((prev) => [...prev, data]);

                if (data.type == "sessionId") {
                    setSessionId(data.content);
                }
                console.log(messages);
            };

            ws.current.onclose = (event) => {
                setIsConnected(false);
                setMessages((prev) => [
                    ...prev,
                    {
                        type: "connection_status",
                        content: `Disconnected: ${event.reason || "Unknown reason"}`,
                    },
                ]);
            };

            ws.current.onerror = (error) => {
                console.error("WebSocket error:", error);
                setMessages((prev) => [
                    ...prev,
                    {
                        type: "error",
                        content: "Connection error",
                    },
                ]);
            };
        } catch (error) {
            console.error("Failed to create WebSocket:", error);
        }
    }, [userState]);

    const disconnect = useCallback(() => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
            setIsConnected(false);
        }
    }, []);

    const sendMessage = useCallback(
        (
            action: string,
            type: "message" | "image" | "document",
            content: string
        ) => {
            const msg: WebSocketMessage = sessionId
                ? {
                      action: action,
                      type: type,
                      content: content,
                      role: "user",
                      sessionId,
                  }
                : {
                      action: action,
                      type: type,
                      content: content,
                      role: "user",
                  };
            if (ws.current && isConnected) {
                ws.current.send(JSON.stringify(msg));
                setMessages((prev) => [...prev, msg]);
            }
        },
        [isConnected]
    );

    // Auto-connect on mount and when dependencies change
    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return {
        isConnected,
        messages,
        sendMessage,
        disconnect,
        connect,
        sessionId,
        setSessionId,
    };
};
