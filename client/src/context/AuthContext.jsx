// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user_logged_in, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);  
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
        try {
            const res = await fetch("/api/auth/status", { credentials: "include" }); // ensure cookies travel
            const data = await res.json();
            setLoggedIn(data.user_logged_in);
            setUser(data.user); // store the full user if logged in
        } catch (err) {
            console.error("Auth check failed:", err);
        } finally {
            setLoading(false);
        }
        }
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user_logged_in, user, loading, setLoggedIn, setUser }}>
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth()
{
    return useContext(AuthContext);
}
