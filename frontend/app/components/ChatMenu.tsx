import logo from "~/assets/logo_with_name.svg";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import { useHistory } from "~/hooks/useHistory";
import type ChatSession from "~/interfaces/ChatSession";
import TrashIcon from "./TrashIcon";
import logout from "~/assets/logout.svg";

const ChatMenu = ({
    history,
    currentSession,
    setCurrentSession,
    handleDeleteChatSession,
}: {
    history: ChatSession[];
    currentSession: string | null;
    setCurrentSession: React.Dispatch<React.SetStateAction<string | null>>;
    handleDeleteChatSession: (session_id: string) => void;
}) => {
    const navigate = useNavigate();
    const { userState, dispatch } = useAuth();

    const handleSessionClick = (session_id: string) => {
        setCurrentSession(session_id);
        navigate(`/chat/${session_id}`);
    };

    const handleNewChat = () => {
        navigate(`/chat`);
    };

    return (
        <div className="w-4/20 h-full bg-background-700 flex flex-col items-center justify-between">
            <div className="w-full flex flex-col items-center py-5 gap-5 overflow-auto">
                <Link to='/'>
                <img src={logo} alt="" className="w-40" />
                </Link>
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
                                className={`cursor-pointer flex items-center px-2 justify-between gap-1 hover:bg-primary-800  ${history.id == currentSession && "bg-background-400"} text-14px rounded-xl`}
                            >
                                <p
                                    onClick={() =>
                                        handleSessionClick(history.id)
                                    }
                                    className="p-3 hover:cursor-pointerflex-1 w-full rounded-xl whitespace-nowrap overflow-clip overflow-ellipsis"
                                >
                                    {history.title ? history.title : "New Chat"}
                                </p>
                                <TrashIcon
                                    onClick={() =>
                                        handleDeleteChatSession(history.id)
                                    }
                                    className="z-10 cursor-pointer text-text-900 p-0.3 rounded-sm hover:text-red-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-full p-2 bg-background-600 flex justify-between items-center">
                <div className="">{userState.user}</div>
                <div
                    className="cursor-pointer hover:bg-red-500/20 rounded-sm p-3"
                    onClick={() =>
                        dispatch({
                            type: "LOGOUT",
                        })
                }
                >
                    <img src={logout} alt="" />
                </div>
            </div>
        </div>
    );
};

export default ChatMenu;
