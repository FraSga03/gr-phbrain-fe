import { createContext, useContext, useEffect, useState, type ReactNode, useMemo } from "react";
import type { User } from "../types/Auth.ts";
import { getMe } from "../service/AuthService.ts";

type AuthContextValue = {
    user: User | undefined;
    loading: boolean;
    error: boolean;
    profilePicture: string | null;
    setUser: (user: User | undefined) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const profilePicture = useMemo(
        () => user ?
            `https://ui-avatars.com/api/?name=${user.username.at(0)}${user.username.at(-1)}&background=1e40af&color=fff`
            : null,
        [user]
    );

    useEffect(() => {
        getMe()
            .then(setUser)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, error, profilePicture, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
