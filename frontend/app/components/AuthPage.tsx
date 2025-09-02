import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useSignup } from "../hooks/useSignup";
import logo from "../assets/logo_with_name.svg";
import polarImg from "../assets/polar_bear.png";
import jellyImg from "../assets/jellyfish.jpg";
import type { AuthResponse } from "~/types/auth";
import type { ServerError } from "~/types/api";
import { useAuth } from "~/contexts/AuthContext";

export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);
    const { dispatch } = useAuth();

    const { login, loading: loginLoading, error: loginError } = useLogin();
    const { signup, loading: signupLoading, error: signupError } = useSignup();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let userData: AuthResponse | ServerError | null;
        if (isSignup) {
            userData = await signup(email, password);
        } else {
            userData = await login(email, password);
        }

        if (userData && "user" in userData) {
            dispatch({type: "LOGIN", payload: {user: userData.user, token: userData.access_token}})
        }
    };

    const changeState = () => {
        setIsSignup(!isSignup);
    };

    return (
        <div className="flex w-full h-screen bg-black items-center justify-center overflow-hidden absolute flex-col gap-16">
            {/* logo */}
            <img src={logo} alt="logo" className="" />

            <div className="relative w-4/7 h-5/7 rounded-4xl flex overflow-hidden bg-background-800">
                {/* sliding image */}
                <div
                    className={`w-1/2 h-full transition-transform duration-500 ${
                        isSignup ? "translate-x-full" : "translate-x-0"
                    }`}
                >
                    <img
                        src={isSignup ? jellyImg : polarImg}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* sliding form */}
                <form
                    onSubmit={handleSubmit}
                    className={`absolute top-0 right-0 w-1/2 h-full p-15 flex flex-col justify-center items-center gap-6 transition-transform duration-500 ${
                        isSignup ? "-translate-x-1/1" : "translate-x-0"
                    }`}
                >
                    <h1 className="text-5xl">
                        {isSignup ? "Sign Up" : "Login"}
                    </h1>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background-400 px-4 py-3 rounded-lg w-full"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background-400 px-4 py-3 rounded-lg w-full"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loginLoading || signupLoading}
                        className="bg-primary-600 py-3 rounded-lg w-full"
                    >
                        {isSignup
                            ? signupLoading
                                ? "Signing up..."
                                : "Sign Up"
                            : loginLoading
                              ? "Logging in..."
                              : "Login"}
                    </button>

                    {(loginError || signupError) && (
                        <p className="text-red-500">
                            {isSignup ? signupError : loginError}
                        </p>
                    )}

                    <p className="text-sm mt-2 ">
                        {isSignup ? (
                            <span>
                                Already have an account?{" "}
                                <span
                                    onClick={changeState}
                                    className="cursor-pointer text-primary-700 underline"
                                >
                                    Login
                                </span>
                            </span>
                        ) : (
                            <span>
                                New to WTC?{" "}
                                <span
                                    onClick={changeState}
                                    className="cursor-pointer text-primary-700 underline"
                                >
                                    Create new account
                                </span>
                            </span>
                        )}
                    </p>
                </form>
            </div>
        </div>
    );
}
