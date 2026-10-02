import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";
import * as authService from "../services/auth";
import { checkBackendReachable } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isOfflineMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [token, setToken] = useState<string | null>(() => authService.getAccessToken());
  const [loading] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  useEffect(() => {
    // 1. Authentication Persistence: Check auth_token or user_profile in localStorage on mount
    try {
      const storedToken = localStorage.getItem("auth_token") || localStorage.getItem("nutrilens_token");
      const storedProfile = localStorage.getItem("user_profile") || localStorage.getItem("nutrilens_user");

      if (storedToken || storedProfile) {
        if (storedProfile) {
          try {
            const parsedUser = JSON.parse(storedProfile);
            setUser(parsedUser);
          } catch {
            const fallbackUser = authService.getCurrentUser();
            if (fallbackUser) setUser(fallbackUser);
          }
        }
        if (storedToken) {
          setToken(storedToken);
        }
      }
    } catch (err) {
      console.error("Error reading auth session from localStorage:", err);
    }

    // Check backend reachability in background without blocking authenticated view
    checkBackendReachable()
      .then((reachable) => {
        setIsOfflineMode(!reachable);
      })
      .catch(() => {
        setIsOfflineMode(true);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    setToken(res.access_token);
    if (res.is_offline_fallback) {
      setIsOfflineMode(true);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await authService.register(email, password, name);
    setUser(res.user);
    setToken(res.access_token);
    if (res.is_offline_fallback) {
      setIsOfflineMode(true);
    }
  };

  const loginAsDemo = () => {
    const res = authService.loginAsDemo();
    setUser(res.user);
    setToken(res.access_token);
    setIsOfflineMode(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isOfflineMode,
        login,
        register,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
