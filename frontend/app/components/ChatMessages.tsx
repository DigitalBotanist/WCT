import React from "react";
import { marked } from "marked";
import type Message from "~/interfaces/Message";
import logo from "~/assets/logo.svg";
const MigrationMap = React.lazy(() => import("~/components/MigrationMap"));

const API_URL = import.meta.env.VITE_API_URL;

interface ChatMessagesProps {
    messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
    const filteredMessages = messages.filter(
        (message) => message.type == "message"
    );
    return (
        <div className="flex-1 overflow-auto flex flex-col gap-4 w-4/5 my-3">
            {filteredMessages.length != 0 ? (
                filteredMessages.map((message) =>
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
                                <div className="p-3 text-text-200 self-end rounded-2xl bg-linear-to-r from-teal-900 to-teal-600">
                                    <p>csv file attached</p>
                                    <a
                                        className="text-sm underline font-bold"
                                        href={`${API_URL}/attachment/${message.csv}`}
                                    >
                                        open file
                                    </a>
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
                            <img src={logo} alt="" className="w-8 mt-4" />
                            <div className="w-full">
                                <div
                                    className="bg-primary-800 p-5 flex-1 rounded-2xl"
                                    dangerouslySetInnerHTML={{
                                        __html: marked(message.content),
                                    }}
                                ></div>
                                {message.migrationData &&
                                    typeof window !== "undefined" && (
                                        <MigrationMap
                                            data={message.migrationData.resting}
                                            title="Resting"
                                        />
                                    )}
                                {message.migrationData &&
                                    typeof window !== "undefined" && (
                                        <MigrationMap
                                            data={
                                                message.migrationData.stopover
                                            }
                                            title="Stopover"
                                        />
                                    )}
                            </div>
                        </div>
                    )
                )
            ) : (
                <div className="relative flex justify-center items-center h-full w-full overflow-hidden">
                    <div className="h-3/10 flex flex-col justify-center items-center gap-5 ">
                        <img className="w-40 hover:animate-pulse" src={logo} alt="" />
                        <h1 className="text-3xl font-semibold text-text-400">
                            How can I help you?
                        </h1>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatMessages;
