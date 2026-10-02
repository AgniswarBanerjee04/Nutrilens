import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  Camera,
  LogOut,
  Sliders,
  ShieldCheck,
  WifiOff,
  Settings as SettingsIcon,
  LogIn,
  UserPlus,
  Clock,
  Crown,
  Moon,
  ChefHat,
  Lock,
} from "lucide-react";

interface NavbarProps {
  onOpenSnapModal?: () => void;
  onOpenGoalsModal?: () => void;
  onOpenSettings?: () => void;
  onOpenSleepModal?: () => void;
  onOpenAICoach?: () => void;
  onSelectAuthTab?: (tab: "login" | "signup") => void;
  lastMealTimestamp?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSnapModal,
  onOpenGoalsModal,
  onOpenSettings,
  onOpenSleepModal,
  onOpenAICoach,
  onSelectAuthTab,
  lastMealTimestamp,
}) => {
  const { user, logout, isOfflineMode, subscriptionTier, openPricingModal } = useAuth();

  // Dynamic fasting calculation: strictly based on last logged meal or inactive if none
  const hasActiveFast = Boolean(lastMealTimestamp);
  let fastingHours = 0;
  let fastingMinutes = 0;

  if (lastMealTimestamp) {
    const elapsed = Math.max(0, Date.now() - new Date(lastMealTimestamp).getTime());
    fastingHours = elapsed / (3600 * 1000);
    fastingMinutes = Math.floor((fastingHours % 1) * 60);
  }

  const isFatBurning = hasActiveFast && fastingHours >= 12;
  const isGoalReached = hasActiveFast && fastingHours >= 14;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#141414] border-b border-[#2A2A2A] px-4 lg:px-8 py-3 transition-colors font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand in Michelin Minimalist Style */}
        <div className="flex items-center gap-3 shrink-0">
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

        {/* Center Clinical Navigation Controls (Sleep, AI Trainer, Fasting, Tier) - Visible on md+ */}
        {user && (
          <div className="hidden md:flex items-center gap-2 lg:gap-2.5 flex-wrap justify-center">
            {/* 1. Deep Sleep Tracking Button */}
            <button
              type="button"
              onClick={() => {
                if (subscriptionTier < 2) {
                  openPricingModal(2, "Deep Sleep & Recovery Tracker");
                } else {
                  onOpenSleepModal?.();
                }
              }}
              title={
                subscriptionTier < 2
                  ? "Deep Sleep Recovery (Locked - Upgrade to Pro)"
                  : "Open Deep Sleep & Autophagy Recovery"
              }
              className={`relative min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
                subscriptionTier >= 2
                  ? "bg-[#0A0A0A] border-[#2A2A2A] text-[#F5F5F0] hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  : "bg-[#0A0A0A]/80 border-[#2A2A2A] text-neutral-400 hover:border-[#D4AF37]/50 hover:text-[#DFBE7A]"
              }`}
            >
              <Moon className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Sleep Recovery</span>
              {subscriptionTier < 2 && (
                <span className="w-3.5 h-3.5 rounded-full bg-[#141414] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Lock className="w-2 h-2 text-[#D4AF37]" />
                </span>
              )}
            </button>

            {/* 2. AI Food Trainer Button */}
            <button
              type="button"
              onClick={() => {
                if (subscriptionTier < 1) {
                  openPricingModal(1, "AI Personal Food Trainer");
                } else {
                  onOpenAICoach?.();
                }
              }}
              title={
                subscriptionTier < 1
                  ? "AI Food Trainer (Locked - Upgrade to Plus)"
                  : "Open AI Personal Food Trainer"
              }
              className={`relative min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
                subscriptionTier >= 1
                  ? "bg-[#0A0A0A] border-[#2A2A2A] text-[#F5F5F0] hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  : "bg-[#0A0A0A]/80 border-[#2A2A2A] text-neutral-400 hover:border-[#D4AF37]/50 hover:text-[#DFBE7A]"
              }`}
            >
              <ChefHat className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>AI Trainer</span>
              {subscriptionTier < 1 && (
                <span className="w-3.5 h-3.5 rounded-full bg-[#141414] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Lock className="w-2 h-2 text-[#D4AF37]" />
                </span>
              )}
            </button>

            {/* 3. Circadian Fasting Window Badge */}
            <div
              title={
                hasActiveFast
                  ? `Circadian Fasting Window: ${Math.floor(fastingHours)}h ${fastingMinutes}m elapsed`
                  : "Circadian Fasting: Inactive (Awaiting First Meal)"
              }
              className={`hidden lg:flex min-h-[44px] items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-mono border transition-all ${
                isGoalReached
                  ? "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37]"
                  : isFatBurning
                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]"
                  : "bg-[#0A0A0A] border-[#2A2A2A] text-neutral-400"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{hasActiveFast ? `${Math.floor(fastingHours)}h Fasting` : "Fast Inactive"}</span>
              {isFatBurning && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              )}
            </div>

            {/* 4. Subscription Tier Badge */}
            <button
              onClick={() => openPricingModal()}
              title="View or Change Subscription Tier"
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-mono font-medium border transition-all ${
                subscriptionTier === 3
                  ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#DFBE7A] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  : subscriptionTier === 2
                  ? "bg-[#D4AF37]/15 border-[#D4AF37]/60 text-[#D4AF37]"
                  : subscriptionTier === 1
                  ? "bg-[#78866B]/15 border-[#78866B]/40 text-[#78866B]"
                  : "bg-[#0A0A0A] border-[#2A2A2A] text-neutral-400 hover:border-[#D4AF37] hover:text-[#D4AF37]"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                {subscriptionTier === 0
                  ? "Free Plan"
                  : subscriptionTier === 1
                  ? "Plus"
                  : subscriptionTier === 2
                  ? "Pro"
                  : "Clinical"}
              </span>
              {subscriptionTier === 0 && (
                <span className="text-[9px] uppercase font-bold text-[#D4AF37] ml-0.5">Upgrade</span>
              )}
            </button>
          </div>
        )}

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">

          {/* Status Badge */}
          <div
            title={isOfflineMode ? "Running in local resilient mode (PWA offline fallback)" : "FastAPI & Gemini Vision Connected"}
            className="hidden xl:flex min-h-[44px] items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border bg-[#0A0A0A] border-[#2A2A2A]"
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[#D4AF37]">Local Resilient</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#78866B]" />
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
                className="btn-pill-outline min-h-[44px] flex items-center gap-1.5 px-4 py-2 text-xs font-medium"
              >
                <LogIn className="w-4 h-4 text-[#D4AF37]" />
                <span>Log In</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectAuthTab && onSelectAuthTab("signup")}
                className="btn-pill-gold min-h-[44px] flex items-center gap-1.5 px-4 py-2 text-xs font-semibold shadow-gold-glow"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            /* Authenticated Actions */
            <div className="flex items-center gap-2">
              {/* Quick Snap Action on Desktop (Pill-shaped Champagne Gold with 44px height) */}
              {onOpenSnapModal && (
                <button
                  onClick={onOpenSnapModal}
                  className="hidden md:flex btn-pill-gold min-h-[44px] items-center gap-1.5 px-4 py-2 text-xs font-semibold shadow-gold-glow"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Meal</span>
                </button>
              )}

              {/* Goals Adjustment Modal Trigger (44px touch target) */}
              {onOpenGoalsModal && (
                <button
                  onClick={onOpenGoalsModal}
                  title="Adjust Macro Goals"
                  aria-label="Adjust Macro Goals"
                  className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#D4AF37] text-neutral-400 hover:text-[#F5F5F0] transition-colors flex items-center justify-center"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              )}

              {/* Settings Page Navigation Trigger (44px touch target) */}
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  title="Settings & Nutritional Protocol"
                  aria-label="Settings and Protocol"
                  className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#D4AF37] text-neutral-400 hover:text-[#F5F5F0] transition-colors flex items-center justify-center"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
              )}

              {/* User Profile & Logout (44px touch targets) */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#2A2A2A]">
                <div className="w-9 h-9 rounded-full bg-[#0A0A0A] border border-[#D4AF37]/50 flex items-center justify-center text-xs font-serif font-bold text-[#D4AF37]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-[#F5F5F0] leading-tight truncate max-w-[120px]">{user.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate max-w-[120px]">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full hover:bg-red-950/25 text-neutral-400 hover:text-red-400 transition-colors flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
