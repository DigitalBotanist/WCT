import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useWebSocket } from "~/hooks/useWebSocket";
import type WebSocketMessage from "~/interfaces/WebSocketMessage";
import logo from "app/assets/logo.svg";

const API_URL = import.meta.env.VITE_API_URL;

interface ConversationMessage extends WebSocketMessage {
    attachments: [
        {
            id: string
            type: string
        },
    ];
}

const ChatWindow = () => {
    const { session_id } = useParams();
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<WebSocketMessage[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const navigate = useNavigate();
    const { isConnected, sendMessage, disconnect, connect, sessionId } =
        useWebSocket(messages, setMessages);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();

        if (message == "") {
            return;
        }
        if (!sessionId.current) {
            sendMessage("create_session", "message", message, imageBase64);
            setMessage("");
            setImageBase64(null);
            return;
        }

        sendMessage("user_request", "message", message, imageBase64);
        setMessage("");
        setImageBase64(null);
    };

    const handleAddClick = () => {
        fileInputRef.current?.click(); // Triggers the hidden file input
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const imgUrl = reader.result as string;
            resizeImage(imgUrl);
        };
        reader.readAsDataURL(file);
    };

    const resizeImage = (imgUrl: string) => {
        const img = new Image();
        img.src = imgUrl;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Set the new width and height for the image
                const newWidth = 700; // Resize to 300px wide
                const newHeight = (img.height / img.width) * newWidth; // Maintain aspect ratio

                canvas.width = newWidth;
                canvas.height = newHeight;

                // Draw the image on the canvas at the new size
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                // Get the base64-encoded resized image
                const resizedBase64 = canvas.toDataURL("image/jpeg"); // You can use "image/png" as well
                setImageBase64(resizedBase64); // Store resized base64 (without displaying it)
            }
        };
    };

    // check if session id exists
    useEffect(() => {
        if (session_id) {
            sessionId.current = session_id;

            const fetchConversation = async () => {
                try {
                    const response = await fetch(
                        `${API_URL}/conversation/${session_id}`
                    );

                    const msgs: ConversationMessage[] = await response.json();
                    console.log(msgs);
                    // Map through messages and fetch attachments
                    const data: WebSocketMessage[] = await Promise.all(
                        msgs.map(async (msg) => {
                            if (msg.attachments) {
                                // Fetch the attachment data for each attachment
                                const attachmentPromises = msg.attachments.map(
                                    async (attachment) => {
                                        try {
                                            const attachmentResponse =
                                                await fetch(
                                                    `${API_URL}/attachment/${attachment.id}`
                                                );
                                            const attachmentData =
                                                await attachmentResponse.json();
                                            if (attachment.type == 'img') {
                                                msg.image = attachmentData
                                            }
                                        } catch (error) {
                                            console.error(
                                                "Error fetching attachment:",
                                                error
                                            );
                                        }
                                    }
                                );

                                // Wait for all attachment fetch requests to complete
                                await Promise.all(attachmentPromises);
                            }

                            return {
                                type: "message",
                                content: msg.content,
                                image: msg.image,
                                role: msg.role,
                            };
                        })
                    );
                    console.log(data);
                    setMessages(data);
                } catch (err: any) {
                    console.log(err.message);
                }
            };

            fetchConversation();
        } else if (session_id == null) {
            setMessages([]);
            sessionId.current = null;
        }
    }, [session_id]);

    useEffect(() => {
        connect();
    }, []);

    useEffect(() => {
        if (!sessionId.current) return;
        console.log("session id:", sessionId.current);
        navigate(`/chat/${sessionId.current}`);
    }, [sessionId.current]);

    return (
        <div className="w-full h-full flex flex-col items-center">
            <div className="flex-1 overflow-auto flex flex-col gap-4 w-4/5 my-3">
                {messages
                    .filter((message) => message.type == "message")
                    .map((message) =>
                        message.role == "user" ? (
                            <>
                                <div className="bg-background-300 p-5 w-3/5 rounded-2xl self-end">
                                    {message.content}
                                </div>
                                {message.image && (
                                    <img
                                        className="w-3/5 self-end rounded-2xl"
                                        src={message.image}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="w-3/5 flex gap-2">
                                <img src={logo} alt="" className="w-8" />
                                <div className="bg-primary-800 p-5 flex-1 rounded-2xl">
                                    {message.content}
                                </div>
                            </div>
                        )
                    )}
            </div>
            <form className="flex gap-2 w-9/10 mb-4" onSubmit={handleSend}>
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx" // customize accepted file types
                />
                <button
                    type="button"
                    className="bg-background-600 p-4 rounded-md"
                    onClick={handleAddClick}
                >
                    Add
                </button>
                <input
                    type="text"
                    name="message"
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-4 rounded-md border-2 border-background-600 focus:outline-1 focus:outline-primary-700"
                />
                <button className="bg-primary-800 p-4 rounded-md" type="submit">
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
