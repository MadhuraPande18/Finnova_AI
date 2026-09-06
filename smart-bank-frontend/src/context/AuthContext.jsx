import { createContext, useContext, useState, useCallback } from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth";

const AuthContext = createContext(null);

const TOKEN_KEY = "smartbank_token";
const USERNAME_KEY = "smartbank_username";

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY));
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback(async (user, password) => {
    const result = await apiLogin(user, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USERNAME_KEY, result.username);
    setToken(result.token);
    setUsername(result.username);
    return result;
  }, []);

  const register = useCallback(async (user, password) => {
    return apiRegister(user, password);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername(null);
  }, []);

  const value = {
    username,
    token,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
