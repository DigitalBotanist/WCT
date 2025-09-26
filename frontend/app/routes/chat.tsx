import { useAuth } from "~/contexts/AuthContext";
import type { Route } from "./+types/chat";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import ChatWindow from "~/components/ChatWindow";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Chat" },
        { name: "description", content: "Chat with ai" },
    ];
}

export default function Chat() {
    const { userState } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (userState?.token == null) {
            navigate("/");
        }
    }, [userState?.token, navigate]);


    return <ChatWindow />;
}
