// src/routes/login.tsx
import type { Route } from "./+types/auth";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import LoginPage from "~/components/AuthPage";
import { useEffect } from "react";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Auth" },
        { name: "description", content: "Login to your account" },
    ];
}

export default function Auth() {
    const { state } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (state?.token) {
            navigate("/dashboard");
        }
    }, [state?.token, navigate]);


    return <LoginPage />;
}
