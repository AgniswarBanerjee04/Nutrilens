import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Lock, Sparkles, Moon, Brain, Shield, ArrowRight, Zap, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { SubscriptionTier } from "../types";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier?: SubscriptionTier;
  featureName?: string;
}

interface TierPlan {
  id: SubscriptionTier;
  level: string;
  name: string;
  targetAudience: string;
  tagline: string;
  price: string;
  period: string;
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  clinicalHighlight: string;
}

const PLANS: TierPlan[] = [
  {
    id: 1,
    level: "Tier 1",
    name: "Plus",
    targetAudience: "Casual health optimizers",
    tagline: "Foundational AI Guidance",
    price: "₹499",
    period: "month",
    icon: Sparkles,
    features: [
      "Daily AI Food Summaries",
      "Advanced Meal History",
      "Ad-free Experience",
    ],
    clinicalHighlight: "Daily clinical text summaries delivered by AI Trainer based on logged meals.",
  },
  {
    id: 2,
    level: "Tier 2",
    name: "Pro",
    targetAudience: "Advanced biohackers",
    tagline: "Deep Sleep & Interactive Coaching",
    price: "₹799",
    period: "month",
    popular: true,
    icon: Moon,
    features: [
      "Everything in Plus",
      "Deep Sleep & Autophagy Tracking",
      "Real-time AI Chat Coach",
      "Dynamic Fasting Alerts",
    ],
    clinicalHighlight: "Deep Sleep tracking synchronized with real-time AI metabolic coaching.",
  },
  {
    id: 3,
    level: "Tier 3",
    name: "Clinical",
    targetAudience: "Medical-grade tracking",
    tagline: "Sleep-Metabolic Correlation Engine",
    price: "₹999",
    period: "month",
    icon: Brain,
    features: [
      "Everything in Pro",
      "Sleep-Metabolic Correlation Engine",
      "Predictive Blood Glucose Curves",
      "Priority VIP Support",
    ],
    clinicalHighlight: "Dynamic meal recalibration mathematically compensating for circadian sleep debt.",
  },
];

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  targetTier,
  featureName,
}) => {
  const { subscriptionTier, updateSubscriptionTier } = useAuth();

  if (!isOpen) return null;

  const handleSimulateUpgrade = (tier: SubscriptionTier) => {
    updateSubscriptionTier(tier);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md">
        {/* Backdrop tap to dismiss */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-5xl bg-[#141414] border border-[#2A2A2A] rounded-3xl shadow-2xl p-5 sm:p-8 my-auto max-h-[90vh] overflow-y-auto z-10 font-sans"
        >
          {/* Subtle gold accent lighting in background (low GPU overhead) */}
          <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-[#D4AF37]/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-[#78866B]/10 blur-2xl pointer-events-none" />

          {/* Close button with 44px minimum touch target */}
          <button
            onClick={onClose}
            aria-label="Close pricing modal"
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0] hover:border-[#D4AF37] transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 pt-2 sm:pt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-mono font-medium mb-3">
              <Crown className="w-3.5 h-3.5" />
              <span>NutriLens Membership Plans</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F0] tracking-tight">
              Elevate Your Metabolic Intelligence
            </h2>

            {featureName ? (
              <p className="text-xs sm:text-sm text-[#D4AF37] mt-2 font-sans flex items-center justify-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  <strong>{featureName}</strong> is locked on your current tier. Select a tier below to unlock instantly.
                </span>
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-[#888888] mt-2 font-sans leading-relaxed">
                Choose the clinical tier calibrated for your metabolic lifestyle. Instant local activation with INR pricing.
              </p>
            )}
          </div>

          {/* Tier Cards: Mobile Vertical Stack (flex-col gap-6) & Desktop Side-by-Side (md:grid md:grid-cols-3 md:gap-5) */}
          <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-5 relative z-10">
            {PLANS.map((plan) => {
              const isCurrent = subscriptionTier === plan.id;
              const isTargeted = targetTier === plan.id;
              const Icon = plan.icon;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 ${
                    plan.popular
                      ? "bg-[#141414] border-2 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.18)]"
                      : "bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#383838]"
                  } ${isTargeted && !isCurrent ? "ring-2 ring-[#DFBE7A]/60" : ""}`}
                >
                  {/* Popular Badge on Pro Tier */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-sans font-bold uppercase tracking-wider shadow-md whitespace-nowrap">
                      Most Popular &bull; Pro
                    </div>
                  )}

                  {/* Top Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#D4AF37]">
                        {plan.level}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#D4AF37]">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F5F0]">
                        {plan.name}
                      </h3>
                      <span className="text-[10px] uppercase font-mono text-[#888888] tracking-wider">
                        {plan.targetAudience}
                      </span>
                    </div>

                    <p className="text-xs text-[#888888] font-sans mt-0.5">
                      {plan.tagline}
                    </p>

                    {/* Price in INR */}
                    <div className="mt-4 pb-4 border-b border-[#2A2A2A]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F5F0] font-mono">
                          {plan.price}
                        </span>
                        <span className="text-xs text-[#888888] font-sans">
                          /{plan.period}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#78866B] mt-1.5 font-sans leading-snug">
                        {plan.clinicalHighlight}
                      </p>
                    </div>

                    {/* Clean Bulleted Features with Champagne Gold Checkmarks */}
                    <div className="py-4 space-y-3">
                      <p className="text-[10px] uppercase font-mono text-[#888888] tracking-wider font-semibold">
                        Included Features
                      </p>
                      <ul className="space-y-2.5">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-[#F5F5F0]">
                            <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button (with 44px touch target) */}
                  <div className="pt-4 border-t border-[#2A2A2A] mt-2">
                    {isCurrent ? (
                      <div className="w-full min-h-[44px] py-3 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] text-center text-xs font-semibold text-[#78866B] flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Active Tier</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSimulateUpgrade(plan.id)}
                        className={`w-full min-h-[44px] py-3 px-5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          plan.popular
                            ? "btn-pill-gold shadow-gold-glow"
                            : "btn-pill-outline hover:border-[#D4AF37]"
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>Simulate Upgrade</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Free Tier Selector / Reset Footer */}
          <div className="mt-8 pt-4 border-t border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#888888]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#78866B]" />
              <span>
                Current Tier:{" "}
                <strong className="text-[#F5F5F0]">
                  {subscriptionTier === 0
                    ? "Free Plan (Tier 0)"
                    : subscriptionTier === 1
                    ? "Plus (Tier 1)"
                    : subscriptionTier === 2
                    ? "Pro (Tier 2)"
                    : "Clinical (Tier 3)"}
                </strong>
              </span>
            </div>

            {subscriptionTier > 0 && (
              <button
                type="button"
                onClick={() => handleSimulateUpgrade(0)}
                className="min-h-[44px] sm:min-h-0 py-2 sm:py-0 text-xs sm:text-[11px] text-[#888888] hover:text-[#D4AF37] underline underline-offset-4 transition-colors"
              >
                Reset to Free Plan for evaluation
              </button>
            )}

            <div className="text-[10px] text-[#888888]/80 font-sans text-center sm:text-right">
              Instant simulated checkout &bull; Local resilient session &bull; Zero external API dependencies
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
