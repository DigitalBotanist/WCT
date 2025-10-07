import logo from "app/assets/logo_with_name.svg";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import { useHistory } from "~/hooks/useHistory";
import type ChatSession from "~/interfaces/ChatSession";

const ChatMenu = ({
    history,
    currentSession,
    setCurrentSession,
}: {
    history: ChatSession[];
    currentSession: string | null;
    setCurrentSession: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    const navigate = useNavigate();

    const handleSessionClick = (session_id: string) => {
        setCurrentSession(session_id);
        navigate(`/chat/${session_id}`);
    };

    const handleNewChat = () => {
        navigate(`/chat`);
    };

    return (
        <div className="w-4/20 h-full bg-background-700 flex flex-col items-center py-5 gap-5">
            <img src={logo} alt="" className="w-40" />

            {/* new session button */}
            <button
                onClick={handleNewChat}
                className="bg-primary-900 w-9/10 p-2 rounded-full cursor-pointer hover:bg-primary-800"
            >
                New Chat
            </button>

            {/* history */}
            <div className="w-full h-full flex-1 flex flex-col overflow-auto">
                <h3 className="ml-3 text-text-700">History</h3>
                <div className="w-full flex flex-col overflow-auto p-2">
                    {history?.map((history) => (
                        <div
                            key={history.id}
                            onClick={() => handleSessionClick(history.id)}
                            className={`p-3 w-full hover:cursor-pointer ${history.id == currentSession && "bg-background-400"} hover:bg-primary-800 text-14px rounded-xl`}
                        >
                            <p className="w-full h-5 whitespace-nowrap overflow-clip overflow-ellipsis">{history.title ? history.title : "New Chat"}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatMenu;
