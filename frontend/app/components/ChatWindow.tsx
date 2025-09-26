import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useWebSocket } from "~/hooks/useWebSocket";

const ChatWindow = () => {
    const { session_id } = useParams()
    const [message, setMessage] = useState<string>("");
    const navigate = useNavigate()
    const {
        isConnected,
        messages,
        sendMessage,
        disconnect,
        connect,
        sessionId,
        setSessionId
    } = useWebSocket();

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();

        if(message == '') {
            return
        }
        if (!sessionId){
            sendMessage("create_session", "message", message);
            setMessage("")
            return; 
        }

        sendMessage("user_request", "message", message);
    };

    useEffect(() => {
        if (session_id) {
            setSessionId(sessionId)
        }


    }, [])

    useEffect(() => {
        connect();
    }, []);

    useEffect(() => {
        if (!sessionId) return; 
        console.log("session id:", sessionId);
        navigate(`/chat/${sessionId}`)
    }, [sessionId]);

    return (
        <div className="w-full h-full flex flex-col items-center">
            <div className="flex-1">
                {messages
                    .filter((message) => message.type == "message")
                    .map((message) => (
                        <div>{message.content}</div>
                    ))}
            </div>
            <form className="flex gap-2 w-9/10" onSubmit={handleSend}>
                <button className="bg-background-600 p-4 rounded-md">
                    Add
                </button>
                <input
                    type="text"
                    name="message"
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-4 rounded-md border-2 border-background-600"
                />
                <button className="bg-primary-800 p-4 rounded-md" type="submit">
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;

