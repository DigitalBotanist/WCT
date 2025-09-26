import { useAuth } from "~/contexts/AuthContext";
import type { Route } from "./+types/chat";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import ChatWindow from "~/components/ChatWindow";

import logo from "app/assets/logo_with_name.svg"

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

    return (
        <div className="w-[100vw] h-[100vh] flex">
            <div className="w-5/20 bg-background-700 flex flex-col items-center p-5">
                <img src={logo} alt="" className="w-40"/> 
            </div>
            <ChatWindow />
        </div>
    );
}
