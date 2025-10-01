import logo from "app/assets/logo_with_name.svg";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import { useHistory } from "~/hooks/useHistory";
import type ChatSession from "~/interfaces/ChatSession";

const ChatMenu = () => {
    const { loading, error, getHistory } = useHistory();

    const [history, setHistory] = useState<ChatSession[] | null>(null);
    const { userState } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (userState == null) {
            return;
        }

        async function fetchHistory() {
            const ch = await getHistory();
            console.log(ch);
            setHistory(ch);
        }

        fetchHistory();
    }, [userState.token]);

    const handleSessionClick = (session_id: string) => {
        navigate(`/chat/${session_id}`);
    };

    const handleNewChat = () => {
        navigate(`/chat`)
    }

    return (
        <div className="w-5/20 bg-background-700 flex flex-col items-center py-5 gap-5">
            <img src={logo} alt="" className="w-40" />

            <button onClick={handleNewChat}>New Chat</button>

            <div className="w-full">
                {history?.map((history) => (
                    <div
                        key={history.id}
                        onClick={() => handleSessionClick(history.id)}
                        className="p-4 bg-background-400 w-full hover:cursor-pointer hover:bg-primary-800"
                    >
                        {history.title ? history.title : "New Chat"}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatMenu;
