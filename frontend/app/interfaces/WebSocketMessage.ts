import type Message from "./Message";
import type MessageWithAttachment from "./MessageWithAttachment";

export default  interface WebSocketMessage  extends MessageWithAttachment{
    action?: string;
    code?: string;
    sessionId?: string;
}