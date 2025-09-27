import {
    createContext,
    useReducer,
    useContext,
    type ReactNode,
    useEffect,
} from "react";

interface AuthState {
    user: string | null;
    token: string | null;
    loading: boolean;
}

type AuthAction =
    | { type: "LOGIN"; payload: { user: string; token: string } }
    | { type: "LOGOUT" }
    | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = { user: null, token: null, loading: false };

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "LOGIN":
            localStorage.setItem(
                "user",
                JSON.stringify(action.payload)
            );
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
            };
        case "LOGOUT":
            localStorage.removeItem("user");
            return { ...state, user: null, token: null };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        default:
            return state;
    }
}

const AuthContext = createContext<
    { userState: AuthState; dispatch: React.Dispatch<AuthAction> } | undefined
>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [ userState, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsed = JSON.parse(userData);
            dispatch({
                type: "LOGIN",
                payload: { user: parsed.user, token: parsed.token },
            });
        }
    }, []);
    return (
        <AuthContext.Provider value={{ userState, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
