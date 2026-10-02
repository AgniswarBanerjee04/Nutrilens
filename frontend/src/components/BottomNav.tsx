import React from "react";
import { motion } from "framer-motion";
import { Home, Camera, Moon, ChefHat, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface BottomNavProps {
  onOpenSnapModal: () => void;
  onOpenSleepModal: () => void;
  onOpenAICoach: () => void;
  onScrollToTop?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenSnapModal,
  onOpenSleepModal,
  onOpenAICoach,
  onScrollToTop,
}) => {
  const { subscriptionTier, openPricingModal } = useAuth();

  const handleHomeClick = () => {
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSleepClick = () => {
    if (subscriptionTier < 2) {
      openPricingModal(2, "Deep Sleep & Recovery Tracker");
    } else {
      onOpenSleepModal();
    }
  };

  const handleAICoachClick = () => {
    if (subscriptionTier < 1) {
      openPricingModal(1, "AI Personal Food Trainer");
    } else {
      onOpenAICoach();
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A]/92 backdrop-blur-md border-t border-[#2A2A2A] px-3 py-1.5 pb-safe"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Home Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={handleHomeClick}
          aria-label="Navigate to Home"
          className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 text-neutral-400 hover:text-[#C5A059] transition-colors"
        >
          <Home className="w-5 h-5 text-[#C5A059]" />
          <span className="text-[10px] font-sans font-medium">Home</span>
        </motion.button>

        {/* 2. Deep Sleep Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={handleSleepClick}
          aria-label="Open Deep Sleep Tracking"
          className="relative min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 text-neutral-400 hover:text-[#C5A059] transition-colors"
        >
          <div className="relative">
            <Moon className="w-5 h-5 text-[#C5A059]" />
            {subscriptionTier < 2 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#141414] border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
                <Lock className="w-2 h-2 text-[#C5A059]" />
              </span>
            )}
          </div>
          <span className="text-[10px] font-sans font-medium">Sleep</span>
        </motion.button>

        {/* 3. Center Elevated Snap Button (44px+ touch target) */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.90 }}
          onClick={onOpenSnapModal}
          aria-label="Snap Meal Photo"
          className="relative -mt-5 flex flex-col items-center justify-center group focus:outline-none"
        >
          <div className="w-12 h-12 min-h-[44px] min-w-[44px] rounded-full bg-[#C5A059] text-[#0A0A0A] flex items-center justify-center shadow-gold-glow border-4 border-[#0A0A0A] transition-transform group-active:scale-95">
            <Camera className="w-5 h-5 text-[#0A0A0A]" />
          </div>
          <span className="text-[10px] font-sans font-bold text-[#F5F5F0] mt-0.5">Snap</span>
        </motion.button>

        {/* 4. AI Coach Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={handleAICoachClick}
          aria-label="Open AI Personal Food Trainer"
          className="relative min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 text-neutral-400 hover:text-[#C5A059] transition-colors"
        >
          <div className="relative">
            <ChefHat className="w-5 h-5 text-[#C5A059]" />
            {subscriptionTier < 1 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#141414] border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
                <Lock className="w-2 h-2 text-[#C5A059]" />
              </span>
            )}
          </div>
          <span className="text-[10px] font-sans font-medium">AI Coach</span>
        </motion.button>
      </div>
    </nav>
  );
};
