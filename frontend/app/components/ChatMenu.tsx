import logo from "app/assets/logo_with_name.svg"
import { useEffect, useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { useHistory } from "~/hooks/useHistory";
import type ChatSession from "~/interfaces/ChatSession";

const ChatMenu = () => {
    const {
        loading, 
        error, 
        getHistory
    } = useHistory()

    const [history, setHistory] = useState<ChatSession[] |null >(null)
    const {userState} = useAuth()

    useEffect(() => {
        if (userState == null) {
            return 
        }

        async function fetchHistory() {
            const ch = await getHistory()
            console.log(ch)
            setHistory(ch)
        }

        fetchHistory()
    }, [userState.token])

    return (
        <div className="w-5/20 bg-background-700 flex flex-col items-center p-5">
            <img src={logo} alt="" className="w-40" />

            <div>
                {history?.map(history => (
                    <div>{history.title ? history.title : "New Chat"}</div>
                ))}
                </div>            
        </div>
    );
};

export default ChatMenu;
