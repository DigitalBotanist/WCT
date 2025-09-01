import { createContext, useReducer, useContext, type ReactNode } from "react";

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
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
            };
        case "LOGOUT":
            return { ...state, user: null, token: null };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        default:
            return state;
    }
}

const AuthContext = createContext<
    { state: AuthState; dispatch: React.Dispatch<AuthAction> } | undefined
>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
