import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, SubscriptionTier } from "../types";
import * as authService from "../services/auth";
import { checkBackendReachable } from "../services/api";

interface PricingModalInfo {
  targetTier?: SubscriptionTier;
  featureName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isOfflineMode: boolean;
  subscriptionTier: SubscriptionTier;
  justUpgradedTier: SubscriptionTier | null;
  isPricingModalOpen: boolean;
  pricingModalInfo: PricingModalInfo;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => void;
  updateSubscriptionTier: (tier: SubscriptionTier) => void;
  openPricingModal: (targetTier?: SubscriptionTier, featureName?: string) => void;
  closePricingModal: () => void;
  clearJustUpgradedTier: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [token, setToken] = useState<string | null>(() => authService.getAccessToken());
  const [loading] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [justUpgradedTier, setJustUpgradedTier] = useState<SubscriptionTier | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [pricingModalInfo, setPricingModalInfo] = useState<PricingModalInfo>({});

  const subscriptionTier: SubscriptionTier = (user?.subscription_tier ?? 0) as SubscriptionTier;

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

  const updateSubscriptionTier = (tier: SubscriptionTier) => {
    const updated = authService.updateUserSubscriptionTier(tier);
    if (updated) {
      setUser(updated);
    } else if (user) {
      const manualUser = { ...user, subscription_tier: tier };
      setUser(manualUser);
      localStorage.setItem("user_profile", JSON.stringify(manualUser));
      localStorage.setItem("nutrilens_user", JSON.stringify(manualUser));
    }
    setJustUpgradedTier(tier);
    setIsPricingModalOpen(false);
  };

  const openPricingModal = (targetTier?: SubscriptionTier, featureName?: string) => {
    setPricingModalInfo({ targetTier, featureName });
    setIsPricingModalOpen(true);
  };

  const closePricingModal = () => {
    setIsPricingModalOpen(false);
    setPricingModalInfo({});
  };

  const clearJustUpgradedTier = () => {
    setJustUpgradedTier(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isOfflineMode,
        subscriptionTier,
        justUpgradedTier,
        isPricingModalOpen,
        pricingModalInfo,
        login,
        register,
        loginAsDemo,
        logout,
        updateSubscriptionTier,
        openPricingModal,
        closePricingModal,
        clearJustUpgradedTier,
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
