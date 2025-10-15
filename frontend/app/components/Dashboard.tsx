import { useHistory } from "~/hooks/useHistory";
import ChatMenu from "./ChatMenu";
import ChatWindow from "./ChatWindow";
import type ChatSession from "~/interfaces/ChatSession";
import { useEffect, useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { useParams } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const { userState } = useAuth();
    const { loading, error, getHistory } = useHistory();
    const { session_id } = useParams();

    const [history, setHistory] = useState<ChatSession[]>([]);
    const [currentSession, setCurrentSession] = useState<string | null>(null);

    const handleDeleteChatSession = async (session_id: string) => {
        const response = await fetch(`${API_URL}/chat_session/${session_id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${userState.token}`,
            },
        });

        if (response.ok) {
            setHistory((prev) =>
                prev.filter((session) => session.id != session_id)
            );
        } else {
            console.error("Failed to delete session");
        }
    };

    const handleAddChatSession = (session: ChatSession) => {
        if (history.filter(s => s.id == session.id).length != 0) return
        setHistory(prev => ([session, ...prev]))
    }

    useEffect(() => {
        if (userState.token == null) {
            return;
        }

        async function fetchHistory() {
            const ch = await getHistory();
            if (!ch) {
                setHistory([]);
                return;
            }
            console.log(ch);
            setHistory(ch);
        }

        fetchHistory();
    }, [userState.token]);

    const setCurrentTitle = (title: string) => {
        setHistory((prev) => {
            return prev.map((session) =>
                session.id === session_id ? { ...session, title } : session
            );
        });
    };

    const getContextFromSession = () => {
        if (!session_id) return null;

        const session = history.filter(
            (session) => session.id == session_id
        )[0];

        console.log(session)

        if (!session || session.context == undefined || !session.context.name ) {
            return null;
        } else {
            return session.context;
        }
    };

    useEffect(() => {
        if (session_id == undefined) {
            setCurrentSession(null);
            return;
        }
        setCurrentSession(session_id);
    }, [session_id]);

    return (
        <div className="w-full h-full flex">
            <ChatMenu
                history={history}
                currentSession={currentSession}
                setCurrentSession={setCurrentSession}
                handleDeleteChatSession={handleDeleteChatSession}
            />
            <ChatWindow
                session_id={session_id}
                setCurrentTitle={setCurrentTitle}
                context={getContextFromSession()}
                handleAddChatSession={handleAddChatSession}
            />
        </div>
    );
};

export default Dashboard;
