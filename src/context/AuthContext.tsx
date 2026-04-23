import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/Auth.ts";
import { getMe } from "../service/AuthService.ts";

type AuthContextValue = {
    user: User | undefined;
    loading: boolean;
    error: boolean;
    setUser: (user: User | undefined) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        getMe()
            .then(setUser)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, error, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
