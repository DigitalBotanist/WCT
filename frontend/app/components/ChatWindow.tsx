import React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useWebSocket } from "~/hooks/useWebSocket";
import type Message from "~/interfaces/Message";
import type MessageWithAttachment from "~/interfaces/MessageWithAttachment";
import { useAuth } from "~/contexts/AuthContext";
import type AnimalInfo from "~/interfaces/AnimalInfo";
import AnimalCard from "./AnimalCard";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import type ChatSession from "~/interfaces/ChatSession";

const API_URL = import.meta.env.VITE_API_URL;

const ChatWindow = ({
    session_id,
    context,
    setCurrentTitle,
    handleAddChatSession,
}: {
    session_id: string | undefined;
    context: AnimalInfo | null;
    setCurrentTitle: (title: string) => void;
    handleAddChatSession: (session: ChatSession) => void;
}) => {
    const navigate = useNavigate();
    const { userState } = useAuth();
    const [message, setMessage] = useState<string>("");
    const [animal, setAnimal] = useState<AnimalInfo | null>(null);
    const [animalImg, setAnimalImg] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [csvFile, setCsvFile] = useState<string | "uploading" | null>(null);
    const {
        isConnected,
        sendMessage,
        disconnect,
        connect,
        sessionId,
        loading,
    } = useWebSocket(messages, setMessages);

    const handleDescribe = () => {
        if (loading) return;
        sendMessage(
            "user_request",
            "message",
            "Provide a description",
            imageBase64,
            csvFile
        );
    };

    const handleAnalyzeMigrationPattern = () => {
        if (loading) return
        setMessage("Analyze migration pattern of the csv file");
    };

    const handleShowMigrationPattern = () => {
        if(loading) return
        sendMessage(
            "user_request",
            "message",
            "Show migration pattern",
            imageBase64,
            csvFile
        );
    };

    const handleTreatLevels = () => {
        if (loading) return
        sendMessage(
            "user_request",
            "message",
            "show threat levels",
            imageBase64,
            csvFile
        );
    };

    // sending message through the socket
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();

        if (loading || csvFile == "uploading") {
            return;
        }

        // if message if empty don't send
        if (message == "") {
            return;
        }

        // if there is not current session id send create session message
        if (!sessionId.current) {
            sendMessage(
                "create_session",
                "message",
                message,
                imageBase64,
                csvFile
            );
            setMessage("");
            setImageBase64(null);
            return;
        }

        // else send the message
        sendMessage("user_request", "message", message, imageBase64, csvFile);

        // set input box to empty
        setMessage("");
        setImageBase64(null);
        setCsvFile(null);
    };

    // fetch conversation data with attachments
    const fetchConversationData = async (
        sessionId: string
    ): Promise<Message[]> => {
        try {
            console.log("conversation id: ", userState.token);
            const response = await fetch(
                `${API_URL}/conversation/${session_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${userState.token}`,
                    },
                }
            );

            const msgs: MessageWithAttachment[] = await response.json();

            console.log(msgs);

            const msgWithAttachments: MessageWithAttachment[] =
                await Promise.all(
                    msgs.map((msg) => fetchAttachmentForMessage(msg))
                );

            console.log(msgWithAttachments);
            return msgWithAttachments.map((msg) => ({
                type: "message",
                content: msg.content,
                image: msg.image,
                role: msg.role,
                migrationData: msg.migrationData,
            }));
        } catch (err: any) {
            console.log(err.message);
        }
        return [];
    };

    const fetchAnimalImage = async (image: string) => {
        const response = await fetch(`${API_URL}/animal_img/${image}`, {
            headers: {
                Authorization: `Bearer ${userState.token}`,
            },
        });
        const imgData = await response.json();
        console.log(imgData);
        setAnimalImg(imgData);
    };

    // check context
    useEffect(() => {
        if (!context) {
            setAnimal(null);
            return;
        }

        setAnimal(context);
        console.log("context", context.image);
        if (context.image) {
            fetchAnimalImage(context.image);
        }
    }, [context]);

    // check for title message
    useEffect(() => {
        if (messages.length == 0) return;

        // get all title messages
        const titleMessages = messages.filter((msg) => {
            if (msg.type == "title") return msg;
        });

        // set title if there is one
        if (titleMessages.length != 0) {
            const title = titleMessages[titleMessages.length - 1];

            if (title) setCurrentTitle(title.content);
        }

        const animalMessages = messages.filter((msg) => {
            if (msg.type == "animal") return msg;
        });

        // check if animal msgs are there
        if (animalMessages.length == 0) return;

        // set animal
        const animal = animalMessages[animalMessages.length - 1];
        if (animal && animal.animal) {
            setAnimal(animal.animal);

            if (animal.animal.image) {
                fetchAnimalImage(animal.animal.image);
            }
        }
    }, [messages]);

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
                        if (attachment.type == "migration") {
                            console.log(attachment);
                            msg.migrationData = attachmentData;
                            console.log(attachmentData);
                            console.log(msg);
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
            return;
        }

        sessionId.current = session_id; // set the current session id

        const loadConversation = async () => {
            const updatedMessages = await fetchConversationData(session_id);
            console.log("up", updatedMessages);
            setMessages(updatedMessages);
        };

        loadConversation();
    }, [session_id, userState.token]);

    useEffect(() => {
        if (isConnected && session_id) {
            sendMessage(
                "continue_session",
                "sessionId",
                `${session_id}`,
                imageBase64,
                csvFile
            );
        }
    }, [isConnected, session_id]);

    useEffect(() => {
        connect();
    }, [userState.token, session_id]);

    // change url if sessionid changes
    useEffect(() => {
        if (!sessionId.current) return;
        console.log("session id:", sessionId.current);
        handleAddChatSession({id: sessionId.current})
        navigate(`/chat/${sessionId.current}`);
    }, [sessionId.current]);

    return (
        <div className="w-full h-full flex items-center">
            {/* animal card */}
            {animal && (
                <AnimalCard
                    animal={animal}
                    animalImg={animalImg}
                    handleAnalyzeMigrationPattern={
                        handleAnalyzeMigrationPattern
                    }
                    handleDescribe={handleDescribe}
                    handleTreatLevels={handleTreatLevels}
                />
            )}
            <div className="w-full h-full flex flex-1 flex-col items-center">
                <ChatMessages messages={messages} />
                <ChatInput
                    csvFile={csvFile}
                    handleSend={handleSend}
                    imageBase64={imageBase64}
                    loading={loading}
                    message={message}
                    setCsvFile={setCsvFile}
                    setMessage={setMessage}
                    setImageBase64={setImageBase64}
                />
            </div>
        </div>
    );
};

export default ChatWindow;
