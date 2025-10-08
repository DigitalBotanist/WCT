import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useWebSocket } from "~/hooks/useWebSocket";
import type WebSocketMessage from "~/interfaces/WebSocketMessage";
import logo from "~/assets/logo.svg";
import { resizeImage } from "~/utils/imageUtils";
import type Message from "~/interfaces/Message";
import type MessageWithAttachment from "~/interfaces/MessageWithAttachment";
import { useAuth } from "~/contexts/AuthContext";
import { marked } from "marked";
import type AnimalInfo from "~/interfaces/AnimalInfo";
import AnimalInfoButton from "~/components/AnimalInfoButton";

const API_URL = import.meta.env.VITE_API_URL;

const ChatWindow = ({
    session_id,
    context,
    setCurrentTitle,
}: {
    session_id: string | undefined;
    context: AnimalInfo | null;
    setCurrentTitle: (title: string) => void;
}) => {
    const navigate = useNavigate();
    const { userState } = useAuth();
    const [message, setMessage] = useState<string>("");
    const [animal, setAnimal] = useState<AnimalInfo | null>(null);
    const [animalImg, setAnimalImg] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null); // file input field
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
        sendMessage(
            "user_request",
            "message",
            "Provide a description",
            imageBase64,
            csvFile
        );
    };

    const handleAnalyzeMigrationPattern = () => {
        sendMessage(
            "user_request",
            "message",
            "Analyze the migration pattern",
            imageBase64,
            csvFile
        );
    };

    const handleShowMigrationPattern = () => {
        sendMessage(
            "user_request",
            "message",
            "Show migration pattern",
            imageBase64,
            csvFile
        );
    };

    const handleTreatLevels = () => {
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

        if (loading || csvFile == 'uploading') {
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

        setImageBase64(null)
        setCsvFile(null)
        const filetype = file.type;

        if (filetype.startsWith("image")) {
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
        } else if (filetype === "text/csv") {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    console.log("is csv data: ", true);

                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                        setCsvFile("uploading")
                        const response = await fetch(`${API_URL}/attachment/csv`, {
                            method: 'POST',
                            body: formData,
                            headers: {
                                Authorization: `Bearer ${userState.token}`,
                            }
                        });
                
                        if (response.ok) {

                        const result = await response.json();
                        console.log("File uploaded successfully:", result);
                        setCsvFile(result.id)
                        } else {
                            setCsvFile("error while uploading. upload again")
                        }
                    } catch (error) {
                        console.error("Error uploading file:", error);
                    }
                } catch (error: any) {
                    console.error("Error resizing the image: ", error);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileRemove = () => {
        setImageBase64(null);
        setCsvFile(null)
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
            setMessages(updatedMessages);
        };

        loadConversation();
    }, [session_id, userState.token]);

    // useEffect(() => {
    //     if (!isConnected) {
    //         connect()
    //         if (sessionId.current)
    //     }
    // }, [sessionId.current])

    // connect the socket in the first rendering

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
        navigate(`/chat/${sessionId.current}`);
    }, [sessionId.current]);

    return (
        <div className="w-full h-full flex items-center">
            {/* animal window */}
            {animal && (
                <div className="text-text-300 w-3/8 flex m-3 rounded-xl flex-col gap-4  p-3 bg-gradient-to-br from-primary-600 via-primary-900 to-primary-700">
                    <div className="flex-1 bg-background-700 rounded-4xl p-2 flex gap-2 flex-col items-center">
                        <div className="flex flex-col items-center">
                            <h3 className="font-bold">{animal.name}</h3>
                            <h3 className="text-sm">
                                {animal.scientific_name}
                            </h3>
                        </div>

                        {/* img */}
                        {animalImg && (
                            <img
                                src={animalImg}
                                alt=""
                                className="rounded-2xl h-[300px] object-cover"
                            />
                        )}

                        <div className="text-sm rounded-2xl flex flex-col gap-1 items-center w-full bg-background-800 p-2">
                            <h3>Taxonomy</h3>
                            <div className="w-full flex gap-2 items-center">
                                <div className="flex-1 flex flex-col items-center bg-background-400 p-2 rounded-lg">
                                    <h4 className="font-bold">Phylum</h4>
                                    <p>{animal.phylum}</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center bg-background-400 p-2 rounded-lg">
                                    <h4 className="font-bold">Class</h4>
                                    <p>{animal.class}</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center bg-background-400 p-2 rounded-lg">
                                    <h4 className="font-bold">Order</h4>
                                    <p>{animal.order}</p>
                                </div>
                            </div>
                            <div className="w-full flex gap-2 items-center">
                                <div className="flex-1 flex flex-col items-center bg-background-400 p-2 rounded-lg">
                                    <h4 className="font-bold">Family</h4>
                                    <p>{animal.family}</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center bg-background-400 p-2 rounded-lg">
                                    <h4 className="font-bold">Genus</h4>
                                    <p>{animal.genus}</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center bg-background-400 p-2 rounded-lg">
                                    <h4 className="font-bold">Species</h4>
                                    <p>{animal.species}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm rounded-2xl flex flex-col gap-1 items-center w-full bg-background-800 p-2">
                            <h3>Habitat</h3>
                            <div className="w-full flex gap-2 items-center">
                                <div className="flex-1 flex flex-col items-center bg-background-400 p-2 rounded-lg">
                                    <h4 className="font-bold">Locations</h4>
                                    <p>{animal.locations}</p>
                                </div>
                                <div className="flex flex-col items-center bg-background-400 p-2 rounded-lg">
                                    <h4 className="font-bold">Climate</h4>
                                    <p>{animal.climate}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm rounded-2xl flex flex-col gap-1 items-center w-full bg-background-800 p-2">
                            <h3>Diet</h3>
                            <div className="w-full flex gap-2 items-center">
                                <div className="flex flex-col items-center bg-background-400 p-2 rounded-lg">
                                    <h4 className="font-bold">Order</h4>
                                    <p>{animal.order}</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center bg-background-400 p-2 rounded-lg overflow-clip overflow-ellipsis whitespace-nowrap">
                                    <h4 className="font-bold">Food</h4>
                                    <p>{animal.diet}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <AnimalInfoButton
                            text="Describe"
                            handleClick={handleDescribe}
                        />
                        <AnimalInfoButton
                            text="Analyze migration"
                            handleClick={handleAnalyzeMigrationPattern}
                        />
                        <AnimalInfoButton
                            text="Show migration pattern"
                            handleClick={handleShowMigrationPattern}
                        />
                        <AnimalInfoButton
                            text="Treat levels"
                            handleClick={handleTreatLevels}
                        />
                        <button className="bg-red-900 p-3 rounded-lg">
                            Describe
                        </button>
                    </div>
                </div>
            )}
            <div className="w-full h-full flex flex-col items-center">
                {/* messages */}
                <div className="flex-1 overflow-auto flex flex-col gap-4 w-4/5 my-3">
                    {messages
                        .filter((message) => message.type == "message")
                        .map((message) =>
                            // user messages
                            message.role == "user" ? (
                                <>
                                    {message.image && (
                                        <img
                                            className="w-3/5 self-end rounded-2xl"
                                            src={message.image}
                                        />
                                    )}
                                    {message.csv && (
                                            <div
                                                className="p-3 text-text-200 self-end rounded-2xl bg-linear-to-r from-teal-900 to-teal-600"
                                            >
                                                <p>csv file attached</p>
                                                <a className="text-sm underline font-bold" href={`${API_URL}/attachment/${message.csv}`}>open file</a>
                                            </div>
                                    )}
                                    <div
                                        className="bg-background-300 p-5 w-3/5 rounded-2xl self-end"
                                        dangerouslySetInnerHTML={{
                                            __html: marked(message.content),
                                        }}
                                    ></div>
                                </>
                            ) : (
                                // system messages
                                <div className="w-3/5 flex gap-2 items-start">
                                    <img
                                        src={logo}
                                        alt=""
                                        className="w-8 mt-4"
                                    />
                                    <div
                                        className="bg-primary-800 p-5 flex-1 rounded-2xl"
                                        dangerouslySetInnerHTML={{
                                            __html: marked(message.content),
                                        }}
                                    ></div>
                                </div>
                            )
                        )}
                </div>
                <form
                    className="relative flex gap-2 w-19/20 mb-4"
                    onSubmit={handleSend}
                >
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
                    <div className="w-full">
                        {imageBase64 && (
                            <div className="flex justify-between gap-3 absolute -translate-y-[120%] right-0 p-3 bg-linear-to-r from-teal-900 to-teal-600  rounded-xl">
                                <p>Image attached</p>
                                <div
                                    className="text-red-600/70 font-extrabold cursor-pointer"
                                    onClick={handleFileRemove}
                                >
                                    X
                                </div>
                            </div>
                        )}
                        {csvFile && (
                            <div className="flex itemce justify-between gap-5 absolute -translate-y-[120%] right-0 p-3 bg-linear-to-r from-teal-900 to-teal-600 rounded-xl">
                                <div className="">
                                    <h4 className="text-sm">csv file: </h4>
                                    <p>{csvFile == 'uploading' ? 'uploading' : 'csv file attached'}</p>
                                </div>
                                <div
                                    className="text-red-600/70 font-extrabold cursor-pointer"
                                    onClick={handleFileRemove}
                                >
                                    X
                                </div>
                            </div>
                        )}
                        <input
                            type="text"
                            name="message"
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-4 rounded-md border-2 border-background-600 focus:outline-1 focus:outline-primary-700"
                        />
                    </div>
                    <button
                        className="bg-primary-800 p-4 rounded-md hover:bg-primary-700 disabled:bg-background-500 disabled:hover:bg-background-500 cursor-pointer"
                        type="submit"
                        disabled={loading || (csvFile == 'uploading')}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
