import { useAuth } from "~/contexts/AuthContext";
import type {Route} from "./+types/dashboard"
import { useNavigate } from "react-router";
import { useEffect } from "react";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Auth" },
        { name: "description", content: "Login to your account" },
    ];
}


export default function Dashboard() {
    const {state} = useAuth(); 
    const navigate = useNavigate()


    useEffect(() => {
        if (!state?.token) {
            navigate("/");
        }
    }, [state?.token, navigate]);

    return (
        <div>
            dashboard
        </div>
    )

}