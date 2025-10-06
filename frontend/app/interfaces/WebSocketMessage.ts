import type Message from "./Message";

export default  interface WebSocketMessage  extends Message{
    action?: string;
    code?: string;
    sessionId?: string;
}