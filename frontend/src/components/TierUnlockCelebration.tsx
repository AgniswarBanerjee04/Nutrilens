import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Crown } from "lucide-react";
import type { SubscriptionTier } from "../types";

interface TierUnlockCelebrationProps {
  tier: SubscriptionTier | null;
  onClose: () => void;
}

const TIER_NAMES: Record<SubscriptionTier, string> = {
  0: "Free Protocol",
  1: "Plus Protocol",
  2: "Pro Connoisseur Protocol",
  3: "Clinical Haute Protocol",
};

const TIER_DESCRIPTIONS: Record<SubscriptionTier, string> = {
  0: "Standard visual macro intelligence",
  1: "Basic AI Food Trainer unlocked (daily text summaries)",
  2: "Deep Sleep & Autophagy Tracking + Real-time AI Coach unlocked",
  3: "Sleep-Metabolic Correlation Engine & Circadian Autophagy unlocked",
};

export const TierUnlockCelebration: React.FC<TierUnlockCelebrationProps> = ({ tier, onClose }) => {
  useEffect(() => {
    if (tier !== null) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [tier, onClose]);

  if (tier === null) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
        {/* Full-screen subtle golden radiance pulse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.45, 0.15, 0] }}
          transition={{ duration: 3.5, ease: "easeOut" }}
          className="absolute inset-0 bg-radial from-[#C5A059]/20 via-[#C5A059]/5 to-transparent pointer-events-none"
        />

        {/* Expanding golden aura rings */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0.9, borderColor: "#DFBE7A" }}
          animate={{ scale: 2.4, opacity: 0, borderColor: "#C5A059" }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          className="absolute w-80 h-80 rounded-full border-2 border-[#C5A059] pointer-events-none"
        />
        <motion.div
          initial={{ scale: 0.2, opacity: 0.7 }}
          animate={{ scale: 3.0, opacity: 0 }}
          transition={{ duration: 2.8, ease: "easeOut", delay: 0.2 }}
          className="absolute w-80 h-80 rounded-full border border-[#DFBE7A]/40 pointer-events-none"
        />

        {/* Floating Celebration Toast */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="pointer-events-auto relative max-w-md w-full bg-[#141414]/95 backdrop-blur-xl border border-[#C5A059] rounded-3xl p-6 shadow-2xl shadow-[#C5A059]/20 text-center"
        >
          {/* Subtle gold ray gradient */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#C5A059]/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Crown / Sparkle badge */}
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 20 }}
              className="w-14 h-14 rounded-full bg-[#0A0A0A] border-2 border-[#C5A059] flex items-center justify-center text-[#C5A059] shadow-gold-glow mb-3"
            >
              {tier >= 2 ? <Crown className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
            </motion.div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold">
              Subscription Status Upgraded
            </span>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F5F0] mt-1 tracking-tight">
              {TIER_NAMES[tier]}
            </h3>

            <p className="text-xs text-[#888888] font-sans mt-2 max-w-xs leading-relaxed">
              {TIER_DESCRIPTIONS[tier]}
            </p>

            <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#78866B]/15 border border-[#78866B]/30 text-[#78866B] text-[11px] font-medium font-sans">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Features Instantly Unlocked</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
