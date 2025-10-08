// hooks/useWebSocket.ts
import React, { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import type Message from "~/interfaces/Message";

import type WebSocketMessage  from "~/interfaces/WebSocketMessage";

export const useWebSocket = (messages: Message[], setMessages: React.Dispatch<React.SetStateAction<WebSocketMessage[]>>) => {
    const { userState } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false)
    const sessionId = useRef<null | string>(null);
    const ws = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        if (!userState.user) return;
        if (!userState.token == null) return;

        try {
            ws.current = new WebSocket(
                `ws://localhost:8000/ws?token=${encodeURIComponent(userState.token || "")}`
            );

            ws.current.onopen = () => {
                setIsConnected(false);
                setMessages((prev) => [
                    ...prev,
                    {
                        type: "connection_status",
                        content: "Connected to chat",
                    },
                ]);
                setIsConnected(true);
                console.log("socket connected")
            };

            ws.current.onmessage = (event) => {
                const data: WebSocketMessage = JSON.parse(event.data);

                console.log(data)
                if (data.type == "sessionId") {
                    console.log("setting session id", data.content)
                    sessionId.current = data.content
                    return 
                }

                if (data.action == 'connection_status') {
                    setIsConnected(true)
                }

                if (data.type == 'status' && data.content == 'done') {
                    setLoading(false) 
                }

                console.log(data);
                setMessages((prev) => [...prev, data]);
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
            type: "message" | "sessionId",
            content: string,
            image: string | null
        ) => {
            console.log("session id in sendmessage: ", sessionId.current, "action:", action)
            const msg: WebSocketMessage = sessionId.current
                ? image
                    ? {
                          action: action,
                          type: type,
                          content: content,
                          role: "user",
                          sessionId: sessionId.current,
                          image,
                      }
                    : {
                          action: action,
                          type: type,
                          content: content,
                          role: "user",
                          sessionId: sessionId.current,
                      }
                : {
                      action: action,
                      type: type,
                      content: content,
                      role: "user",
                  };
            if (ws.current && isConnected && ws.current.readyState === WebSocket.OPEN) {
                console.log("sending.......................", msg)
                ws.current.send(JSON.stringify(msg));
                setLoading(true)
                setMessages((prev) => [...prev, msg]);
            }
        },
        [isConnected, ws.current]
    );

    // Auto-connect on mount and when dependencies change
    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);


    return {
        isConnected,
        sendMessage,
        disconnect,
        connect,
        sessionId,
        loading
    };
};
