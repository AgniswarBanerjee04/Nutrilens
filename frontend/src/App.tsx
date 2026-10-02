import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Navbar } from "./components/Navbar";
import { Camera } from "lucide-react";
import { getUserGoals, saveUserGoals } from "./services/mealService";
import type { UserGoals } from "./types";

// Hardware-accelerated lightweight page transition (opacity and subtle y only)
const pageTransitionVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const pageTransitionConfig = {
  duration: 0.2,
  ease: "easeOut" as const,
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [activeAppView, setActiveAppView] = useState<"dashboard" | "settings">("dashboard");
  const [userGoals, setUserGoals] = useState<UserGoals>({
    target_calories: 2200,
    target_protein: 160,
    target_carbs: 210,
    target_fats: 65,
  });

  // Load user goals when user becomes authenticated
  useEffect(() => {
    if (user) {
      getUserGoals(user.id).then((g) => setUserGoals(g));
    }
  }, [user]);

  const handleSaveGoals = async (updated: UserGoals) => {
    if (user) {
      const saved = await saveUserGoals(updated, user.id);
      setUserGoals(saved);
    }
  };

  // 1. Initial hydration loading state with Michelin Minimalist Palette
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 text-[#F5F5F0]">
        <div className="w-14 h-14 rounded-full bg-[#141414] border border-[#2A2A2A] shadow-gold-glow flex items-center justify-center text-[#C5A059]">
          <Camera className="w-6 h-6 animate-pulse" />
        </div>
        <div className="text-center font-sans">
          <p className="text-base font-serif font-bold tracking-tight text-[#F5F5F0]">
            Nutri<span className="text-[#C5A059]">Lens</span> &bull; Michelin Edition
          </p>
          <p className="text-xs text-[#888888]">Hydrating Visual Macronutrient Intelligence...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated user layout:
  // Global Navbar displays both "Log In" and "Sign Up" side-by-side
  // Body renders AuthPage with side-by-side tabs ("Sign In" and "Create Account")
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#888888] flex flex-col selection:bg-[#C5A059] selection:text-[#0A0A0A]">
        <Navbar onSelectAuthTab={(tab) => setAuthTab(tab)} />
        <main className="flex-1 flex items-center justify-center">
          <AuthPage initialTab={authTab} onTabChange={(tab) => setAuthTab(tab)} />
        </main>
      </div>
    );
  }

  // Authenticated user layout:
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#888888] selection:bg-[#C5A059] selection:text-[#0A0A0A]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAppView}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransitionConfig}
          className="w-full min-h-screen"
        >
          {activeAppView === "settings" ? (
            <Settings
              onBackToDashboard={() => setActiveAppView("dashboard")}
              currentGoals={userGoals}
              onSaveGoals={handleSaveGoals}
            />
          ) : (
            <Dashboard onOpenSettings={() => setActiveAppView("settings")} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
