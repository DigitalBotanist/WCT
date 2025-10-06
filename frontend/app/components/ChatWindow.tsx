import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useWebSocket } from "~/hooks/useWebSocket";
import type WebSocketMessage from "~/interfaces/WebSocketMessage";
import logo from "app/assets/logo.svg";
import { resizeImage } from "~/utils/imageUtils";
import type Message from "~/interfaces/Message";
import type MessageWithAttachment from "~/interfaces/MessageWithAttachment";
import { useAuth } from "~/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const ChatWindow = () => {
    const navigate = useNavigate();
    const { userState } = useAuth();
    const { session_id } = useParams();
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null); // file input field
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const { isConnected, sendMessage, disconnect, connect, sessionId } =
        useWebSocket(messages, setMessages);

    // sending message through the socket
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();

        // if message if empty don't send
        if (message == "") {
            return;
        }

        // if there is not current session id send create session message
        if (!sessionId.current) {
            sendMessage("create_session", "message", message, imageBase64);
            setMessage("");
            setImageBase64(null);
            return;
        }

        // else send the message
        sendMessage("user_request", "message", message, imageBase64);

        // set input box to empty
        setMessage("");
        setImageBase64(null);
    };

    // adding files
    const handleAddClick = () => {
        fileInputRef.current?.click();
    };

    // handle file attachments
    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const imgUrl = reader.result as string;
                const resizeBase64Image = await resizeImage(imgUrl); // resize the image
                console.log(resizeBase64Image);
                setImageBase64(resizeBase64Image);
            } catch (error: any) {
                console.error("Error resizing the image: ", error);
            }
        };
        reader.readAsDataURL(file);
    };

    // fetch conversation data with attachments
    const fetchConversationData = async (
        sessionId: string
    ): Promise<Message[]> => {
        try {
            console.log("conversation id: ", userState.token)
            const response = await fetch(
                `${API_URL}/conversation/${session_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${userState.token}`,
                    },
                }
            );

            const msgs: MessageWithAttachment[] = await response.json();

            const msgWithAttachments: MessageWithAttachment[] =
                await Promise.all(
                    msgs.map((msg) => fetchAttachmentForMessage(msg))
                );

            return msgWithAttachments.map((msg) => ({
                type: "message",
                content: msg.content,
                image: msg.image,
                role: msg.role,
            }));
        } catch (err: any) {
            console.log(err.message);
        }
        return [];
    };

    // fetch each attachment
    const fetchAttachmentForMessage = async (msg: MessageWithAttachment) => {
        if (msg.attachments) {
            // Fetch the attachment data for each attachment
            await Promise.all(
                msg.attachments.map(async (attachment) => {
                    try {
                        const attachmentResponse = await fetch(
                            `${API_URL}/attachment/${attachment.id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${userState.token}`,
                                },
                            }
                        );
                        const attachmentData = await attachmentResponse.json();
                        if (attachment.type == "img") {
                            msg.image = attachmentData; // add image data to the message.image
                        }
                    } catch (error) {
                        console.error("Error fetching attachment:", error);
                    }
                })
            );
        }

        return msg;
    };

    // check if session id exists and get conversation data
    // or if session id is null reset all the messages
    useEffect(() => {
        // if session id is null reset all
        if (session_id == null) {
            setMessages([]);
            sessionId.current = null;
            return;
        }

        if (userState.token == null) {
            return 
        }

        sessionId.current = session_id; // set the current session id

        const loadConversation = async () => {
            const updatedMessages = await fetchConversationData(session_id);
            setMessages(updatedMessages);
        };

        loadConversation();
    }, [session_id, userState]);

    // connect the socket in the first rendering
    useEffect(() => {
        connect();
    }, [userState]);

    // change url if sessionid changes
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
                    accept="image/*,.pdf,.doc,.docx,.csv" // customize accepted file types
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
