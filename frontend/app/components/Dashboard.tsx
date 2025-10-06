import { useHistory } from "~/hooks/useHistory";
import ChatMenu from "./ChatMenu";
import ChatWindow from "./ChatWindow";
import type ChatSession from "~/interfaces/ChatSession";
import { useEffect, useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { useParams } from "react-router";

const Dashboard = () => {
    const { userState } = useAuth();
    const { loading, error, getHistory } = useHistory();
    const { session_id } = useParams();

    const [history, setHistory] = useState<ChatSession[]>([]);
    const [currentSession, setCurrentSession] = useState<string | null>(null);

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

    useEffect(() => {
        if (session_id == undefined) {
            setCurrentSession(null);
            return
        }
        setCurrentSession(session_id)
    }, [session_id]);

    return (
        <div className="w-full h-full flex">
            <ChatMenu
                history={history}
                currentSession={currentSession}
                setCurrentSession={setCurrentSession}
            />
            <ChatWindow
                session_id={session_id}
                setCurrentTitle={setCurrentTitle}
            />
        </div>
    );
};

export default Dashboard;
