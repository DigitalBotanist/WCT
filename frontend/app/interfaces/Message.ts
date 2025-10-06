export default interface Message {
    type: "message" | "error" | "progress" | "connection_status" | "sessionId";
    content: string;
    role?: "system" | "user";
    image?: string;
}