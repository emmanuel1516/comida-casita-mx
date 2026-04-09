import { createContext, useContext, useEffect, useState, useMemo } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (tokenValue, userData) => {
        localStorage.setItem("token", tokenValue);
        localStorage.setItem("user", JSON.stringify(userData));
        setToken(tokenValue);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken("");
        setUser(null);
    };

    useEffect(() => {
        const savedToken = localStorage.getItem("token") || "";
        const savedUser = localStorage.getItem("user");
        setToken(savedToken);
        setUser(savedUser ? JSON.parse(savedUser) : null);
    }, []);

    const value = useMemo(
        () => ({
            token,
            user,
            isAuthenticated: Boolean(token),
            login,
            logout,
        }),
        [token, user, login, logout]
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);