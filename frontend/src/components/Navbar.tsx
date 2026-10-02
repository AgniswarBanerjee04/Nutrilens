import React from "react";
import { useAuth } from "../context/AuthContext";
import { Camera, LogOut, Sliders, ShieldCheck, WifiOff, Settings as SettingsIcon, LogIn, UserPlus, Clock } from "lucide-react";

interface NavbarProps {
  onOpenSnapModal?: () => void;
  onOpenGoalsModal?: () => void;
  onOpenSettings?: () => void;
  onSelectAuthTab?: (tab: "login" | "signup") => void;
  lastMealTimestamp?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSnapModal,
  onOpenGoalsModal,
  onOpenSettings,
  onSelectAuthTab,
  lastMealTimestamp,
}) => {
  const { user, logout, isOfflineMode } = useAuth();

  let fastingHours = 13.5;
  if (lastMealTimestamp) {
    const elapsed = Math.max(0, Date.now() - new Date(lastMealTimestamp).getTime());
    fastingHours = elapsed / (3600 * 1000);
  }
  const isFatBurning = fastingHours >= 12;
  const isGoalReached = fastingHours >= 14;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#141414] border-b border-[#2A2A2A] px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand in Michelin Minimalist Style */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0A0A0A] border border-[#2A2A2A]">
            <Camera className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-[#F5F5F0]">
                Nutri<span className="text-[#C5A059]">Lens</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#78866B]">
                Michelin Edition
              </span>
            </div>
            <p className="text-[10px] text-[#888888] hidden sm:block font-sans">
              Visual Macro & Glycemic Intelligence
            </p>
          </div>
        </div>

        {/* Center / Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Circadian Fasting Window Badge (when authenticated) */}
          {user && (
            <div
              title={`Circadian Fasting Window: ${Math.floor(fastingHours)}h ${Math.floor((fastingHours % 1) * 60)}m elapsed`}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border transition-all ${
                isGoalReached
                  ? "bg-[#C5A059]/15 border-[#C5A059]/40 text-[#C5A059]"
                  : isFatBurning
                  ? "bg-[#C5A059]/10 border-[#C5A059]/30 text-[#C5A059]"
                  : "bg-[#0A0A0A] border-[#2A2A2A] text-[#888888]"
              }`}
            >
              <Clock className="w-3 h-3 text-[#C5A059]" />
              <span>{Math.floor(fastingHours)}h Fasting</span>
              {isFatBurning && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              )}
            </div>
          )}

          {/* Status Badge */}
          <div
            title={isOfflineMode ? "Running in local resilient mode (PWA offline fallback)" : "FastAPI & Gemini Vision Connected"}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border bg-[#0A0A0A] border-[#2A2A2A]"
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3 h-3 text-[#C5A059]" />
                <span className="text-[#C5A059]">Local Resilient</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3 text-[#78866B]" />
                <span className="text-[#78866B]">Vision AI Active</span>
              </>
            )}
          </div>

          {/* Unauthenticated View: Side-by-side Login & Sign Up buttons in Navbar */}
          {!user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectAuthTab && onSelectAuthTab("login")}
                className="btn-pill-outline flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium"
              >
                <LogIn className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Log In</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectAuthTab && onSelectAuthTab("signup")}
                className="btn-pill-gold flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold shadow-gold-glow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            /* Authenticated Actions */
            <div className="flex items-center gap-2.5">
              {/* Quick Snap Action (Pill-shaped Champagne Gold) */}
              {onOpenSnapModal && (
                <button
                  onClick={onOpenSnapModal}
                  className="btn-pill-gold flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold shadow-gold-glow"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Snap Meal</span>
                </button>
              )}

              {/* Goals Adjustment Modal Trigger */}
              {onOpenGoalsModal && (
                <button
                  onClick={onOpenGoalsModal}
                  title="Adjust Macro Goals"
                  className="p-2 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#C5A059] text-[#888888] hover:text-[#F5F5F0] transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Settings Page Navigation Trigger */}
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  title="Settings & Nutritional Protocol"
                  className="p-2 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#C5A059] text-[#888888] hover:text-[#F5F5F0] transition-colors"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                </button>
              )}

              {/* User Profile & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#2A2A2A]">
                <div className="w-7 h-7 rounded-full bg-[#0A0A0A] border border-[#C5A059]/40 flex items-center justify-center text-xs font-serif font-bold text-[#C5A059]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-[#F5F5F0] leading-tight truncate max-w-[120px]">{user.name}</p>
                  <p className="text-[10px] text-[#888888] truncate max-w-[120px]">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-full hover:bg-red-950/20 text-[#888888] hover:text-red-400 transition-colors ml-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
