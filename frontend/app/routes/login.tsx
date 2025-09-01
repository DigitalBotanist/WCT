// src/routes/login.tsx
import type { Route } from "./+types/login";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import LoginPage from "~/components/LoginPage";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Login" },
        { name: "description", content: "Login to your account" },
    ];
}

// export async function loader() {
//   const {state} = useAuth()
//   console.log(state)
//   const isLoggedIn = false; // check real auth
//   return null;
// }

export default function Login() {
    const { state, dispatch } = useAuth();
    const navigate = useNavigate();

    console.log(state);
    const handleLogin = () => {
        // Example: log the user in
        // dispatch({ type: "LOGIN", payload: { user: "John", token: "abc123" } });
        navigate("/dashboard"); // redirect after login
    };

    return <LoginPage />;
}
