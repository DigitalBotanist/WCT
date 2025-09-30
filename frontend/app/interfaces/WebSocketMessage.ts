
export default  interface WebSocketMessage {
    action?: string;
    type: "message" | "error" | "progress" | "connection_status" | "sessionId";
    content: string;
    role?: "system" | "user";
    code?: string;
    data?: any;
    sessionId?: string;
    image?: string;
}