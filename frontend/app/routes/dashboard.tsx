import { useAuth } from "~/contexts/AuthContext";
import type {Route} from "./+types/dashboard"
import { useNavigate } from "react-router";
import { useEffect } from "react";
import ChatWindow from "~/components/ChatWindow";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Auth" },
        { name: "description", content: "Login to your account" },
    ];
}


export default function Dashboard() {
    const {userState} = useAuth(); 
    const navigate = useNavigate()


    useEffect(() => {
        if (!userState?.token) {
            navigate("/");
        }
    }, [userState?.token, navigate]);

    return (
        <div className="w-[100vw] h-[100vh]">
            dashboard
            <div className="h-9/10"><ChatWindow/></div>
        </div>
    )

}