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
        <div className="w-5/20 bg-background-700 flex flex-col items-center py-5 gap-5">
            <img src={logo} alt="" className="w-40" />

            <button onClick={handleNewChat}>New Chat</button>

            <div className="w-full">
                {history?.map((history) =>
                    history.id == currentSession ? (
                        <div
                            key={history.id}
                            onClick={() => handleSessionClick(history.id)}
                            className="p-4 w-full hover:cursor-pointer bg-background-400 hover:bg-primary-800"
                        >
                            {history.title ? history.title : "New Chat"}
                        </div>
                    ) : (
                        <div
                            key={history.id}
                            onClick={() => handleSessionClick(history.id)}
                            className="p-4 w-full hover:cursor-pointer hover:bg-primary-800"
                        >
                            {history.title ? history.title : "New Chat"}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ChatMenu;
