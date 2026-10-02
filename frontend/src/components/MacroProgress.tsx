import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Dumbbell, Zap, Droplet, Clock, HeartPulse, Sparkles } from "lucide-react";
import type { UserGoals } from "../types";

interface MacroProgressProps {
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sodium?: number;
    net_carbs?: number;
  };
  goals: UserGoals;
  lastMealTimestamp?: string | null;
}

export const MacroProgress: React.FC<MacroProgressProps> = ({
  consumed,
  goals,
  lastMealTimestamp,
}) => {
  // Clamped ratios for GPU hardware-accelerated scaleX
  const caloriesRatio = Math.min(1, Math.max(0, consumed.calories / (goals.target_calories || 1)));
  const proteinRatio = Math.min(1, Math.max(0, consumed.protein / (goals.target_protein || 1)));
  const carbsRatio = Math.min(1, Math.max(0, consumed.carbs / (goals.target_carbs || 1)));
  const fatsRatio = Math.min(1, Math.max(0, consumed.fats / (goals.target_fats || 1)));

  // Clinical Sub-Metrics: Fiber, Net Carbs, Sodium
  const consumedFiber = consumed.fiber ?? 0;
  const fiberGoal = 30; // 30g/day clinical goal
  const fiberRatio = Math.min(1, Math.max(0, consumedFiber / fiberGoal));
  const fiberPct = Math.round(fiberRatio * 100);

  const consumedNetCarbs = consumed.net_carbs !== undefined
    ? consumed.net_carbs
    : Math.max(0, consumed.carbs - consumedFiber);

  const consumedSodium = consumed.sodium ?? 0;
  const sodiumLimit = 2300; // 2300mg/day AHA / clinical limit
  const sodiumRatio = Math.min(1, Math.max(0, consumedSodium / sodiumLimit));
  const sodiumPct = Math.round(sodiumRatio * 100);
  const sodiumRemaining = Math.max(0, Math.round(sodiumLimit - consumedSodium));

  const caloriesPct = Math.round(caloriesRatio * 100);
  const proteinPct = Math.round(proteinRatio * 100);
  const carbsPct = Math.round(carbsRatio * 100);
  const fatsPct = Math.round(fatsRatio * 100);

  const caloriesRemaining = Math.max(0, Math.round(goals.target_calories - consumed.calories));

  // Circular gauge parameters
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const calStrokeDashoffset = circumference - caloriesRatio * circumference;

  // Circadian Fasting Window Logic
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fastingStats = useMemo(() => {
    if (!lastMealTimestamp) {
      return {
        hasActiveFast: false,
        elapsedHours: 0,
        formattedTime: "--",
        hours: 0,
        minutes: 0,
        progress: 0,
        isFatBurning: false,
        isGoalReached: false,
        stateTitle: "Awaiting First Meal",
        stateBadge: "Fast Inactive",
        description: "Log your first meal to initiate circadian fasting telemetry",
      };
    }

    const lastTime = new Date(lastMealTimestamp).getTime();
    const elapsedMs = Math.max(0, now.getTime() - lastTime);
    const elapsedHours = elapsedMs / (3600 * 1000);
    const hours = Math.floor(elapsedHours);
    const minutes = Math.floor((elapsedHours - hours) * 60);

    const goalHours = 14; // 14-hour intermittent fasting goal
    const progress = Math.min(1, elapsedHours / goalHours);
    const isFatBurning = elapsedHours >= 12;
    const isGoalReached = elapsedHours >= 14;

    const stateTitle = isGoalReached
      ? "Autophagy Window Active"
      : isFatBurning
      ? "Ketogenic Shift (~12h+)"
      : "Circadian Depletion";

    const stateBadge = isGoalReached
      ? "14h Achieved"
      : isFatBurning
      ? "Fat Burning State"
      : "Fasting Active";

    return {
      hasActiveFast: true,
      elapsedHours,
      formattedTime: `${hours}h ${minutes}m`,
      hours,
      minutes,
      progress,
      isFatBurning,
      isGoalReached,
      stateTitle,
      stateBadge,
      description: "Time elapsed since last logged meal",
    };
  }, [lastMealTimestamp, now]);

  const fastingStrokeDashoffset = circumference - fastingStats.progress * circumference;

  // Ring styling: subtle glowing ash-gray (#555555) that turns champagne gold (#C5A059) when 14h is reached
  const fastingRingColor = !fastingStats.hasActiveFast
    ? "#2A2A2A"
    : fastingStats.isGoalReached
    ? "#C5A059"
    : fastingStats.isFatBurning
    ? "#C5A059"
    : "#555555";

  // GPU Hardware-accelerated Spring Physics Configuration
  const springTransition = {
    type: "spring" as const,
    stiffness: 70,
    damping: 16,
  };

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Top Banner: Dual Gauge (Calorie Budget + Circadian Fasting Window) */}
      <div className="rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-[#2A2A2A] bg-[#141414] shadow-subtle">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Dual Gauges Container: Caloric Budget + Circadian Fasting Window side-by-side */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 w-full lg:w-auto">
            
            {/* 1. Main Caloric Budget Ring */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center flex-shrink-0">
                <svg className="w-32 h-32 transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#0A0A0A"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  {/* Animated Calorie Progress Arc in Soft Champagne Gold */}
                  <motion.circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#C5A059"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: calStrokeDashoffset }}
                    transition={springTransition}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                {/* Central Stats */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Flame className="w-3.5 h-3.5 text-[#C5A059] mb-0.5" />
                  <span className="text-xl font-serif font-bold tracking-tight text-[#F5F5F0]">
                    {Math.round(consumed.calories)}
                  </span>
                  <span className="text-[9px] text-[#888888] uppercase tracking-widest font-mono">
                    / {Math.round(goals.target_calories)}
                  </span>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-[11px] font-medium mb-1">
                  <Flame className="w-3 h-3" />
                  Caloric Budget &bull; {caloriesPct}%
                </div>
                <h4 className="text-base font-serif font-bold text-[#F5F5F0] tracking-tight">
                  {caloriesRemaining === 0 ? "Budget Complete" : `${caloriesRemaining} kcal left`}
                </h4>
                <p className="text-[11px] text-[#888888] font-sans">
                  Metabolic intake control
                </p>
              </div>
            </div>

            {/* Subtle Divider for desktop */}
            <div className="hidden sm:block w-[1px] h-20 bg-[#2A2A2A]" />

            {/* 2. Circadian Fasting Window Ring (Michelin Minimalist Theme) */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center flex-shrink-0">
                {/* Pulsing glow wrapper when in 12h+ Fat Burning State */}
                <motion.div
                  animate={
                    fastingStats.isFatBurning
                      ? {
                          boxShadow: [
                            "0 0 0px rgba(197, 160, 89, 0)",
                            "0 0 16px rgba(197, 160, 89, 0.4)",
                            "0 0 0px rgba(197, 160, 89, 0)",
                          ],
                        }
                      : {}
                  }
                  transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                  className="rounded-full"
                >
                  <svg className="w-32 h-32 transform -rotate-90">
                    {/* Background Track in Ash-Gray */}
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      stroke="#1F1F1F"
                      strokeWidth="7"
                      fill="transparent"
                    />
                    {/* Glowing Ash-Gray to Champagne Gold Ring */}
                    <motion.circle
                      cx="64"
                      cy="64"
                      r={radius}
                      stroke={fastingRingColor}
                      strokeWidth="7"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: fastingStrokeDashoffset }}
                      transition={springTransition}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                </motion.div>

                {/* Central Fasting Time */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059] mb-0.5" />
                  <span className="text-lg font-mono font-bold tracking-tight text-[#F5F5F0]">
                    {fastingStats.formattedTime}
                  </span>
                  <span className="text-[9px] text-[#888888] uppercase tracking-widest font-mono">
                    {fastingStats.hasActiveFast ? "/ 14h goal" : "Inactive"}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2A2A2A] text-[#888888] text-[11px] font-mono">
                    <Clock className="w-3 h-3 text-[#C5A059]" />
                    {fastingStats.hasActiveFast ? "Fasting Window" : "Fast Inactive"}
                  </span>
                  {/* Fat Burning State Badge (pulses softly if 12+ hours) */}
                  {fastingStats.hasActiveFast && fastingStats.isFatBurning && (
                    <motion.span
                      animate={{ opacity: [0.85, 1, 0.85] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-semibold"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {fastingStats.stateBadge}
                    </motion.span>
                  )}
                </div>
                <h4 className="text-base font-serif font-bold text-[#F5F5F0] tracking-tight">
                  {fastingStats.stateTitle}
                </h4>
                <p className="text-[11px] text-[#888888] font-sans">
                  {fastingStats.description}
                </p>
              </div>
            </div>

          </div>

          {/* Quick macro ratio cards (4 Pillars: Protein, Net Carbs, Fats, Sodium) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            {/* Protein Card (Champagne Gold) */}
            <div className="px-3 py-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
              <span className="text-[9px] text-[#888888] uppercase font-medium block">Protein</span>
              <span className="text-sm font-bold text-[#C5A059] font-mono">{Math.round(consumed.protein)}g</span>
              <span className="text-[9px] text-[#888888] block font-mono">of {goals.target_protein}g</span>
            </div>
            {/* Net Carbs Card (Muted Sage Green) */}
            <div className="px-3 py-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
              <span className="text-[9px] text-[#888888] uppercase font-medium block">Net Carbs</span>
              <span className="text-sm font-bold text-[#78866B] font-mono">{Math.round(consumedNetCarbs)}g</span>
              <span className="text-[9px] text-[#888888] block font-mono">{Math.round(consumedFiber)}g fiber</span>
            </div>
            {/* Fats Card (Warm Taupe) */}
            <div className="px-3 py-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
              <span className="text-[9px] text-[#888888] uppercase font-medium block">Fats</span>
              <span className="text-sm font-bold text-[#B58A55] font-mono">{Math.round(consumed.fats)}g</span>
              <span className="text-[9px] text-[#888888] block font-mono">of {goals.target_fats}g</span>
            </div>
            {/* Sodium Card (Muted Teal/Blue) */}
            <div className="px-3 py-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
              <span className="text-[9px] text-[#38BDF8] uppercase font-medium block">Sodium</span>
              <span className="text-sm font-bold text-[#38BDF8] font-mono">{Math.round(consumedSodium)}mg</span>
              <span className="text-[9px] text-[#888888] block font-mono">/ 2300mg</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4 Metric Cards: Protein, Carbohydrates & Fiber, Fats, and Sodium & Hydration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Protein Card (Soft Champagne Gold #C5A059) */}
        <div className="rounded-3xl p-5 border border-[#2A2A2A] hover:border-[#C5A059]/40 transition-colors bg-[#141414] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#F5F5F0]">Protein</h4>
                  <p className="text-[10px] text-[#888888]">Muscle repair & lean tissue</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#C5A059] px-2.5 py-0.5 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/25">
                {proteinPct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-mono font-bold text-[#F5F5F0]">
                {Math.round(consumed.protein)}
                <span className="text-xs font-normal text-[#888888] ml-0.5">g</span>
              </span>
              <span className="text-xs text-[#888888]">
                Target: <strong className="text-[#F5F5F0]">{goals.target_protein}g</strong>
              </span>
            </div>

            {/* Hardware-accelerated Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: proteinRatio }}
                transition={springTransition}
                style={{ transformOrigin: "left" }}
                className="w-full h-full rounded-full bg-[#C5A059]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-[#888888] pt-2 border-t border-[#2A2A2A]">
            <span>{Math.max(0, Math.round(goals.target_protein - consumed.protein))}g remaining</span>
            <span className="text-[#888888] font-mono">4 kcal/g</span>
          </div>
        </div>

        {/* 2. Carbohydrate Card with Clinical Fiber & Net Carbs Sub-Metrics */}
        <div className="rounded-3xl p-5 border border-[#2A2A2A] hover:border-[#78866B]/40 transition-colors bg-[#141414] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#78866B]/15 border border-[#78866B]/30 flex items-center justify-center text-[#78866B]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#F5F5F0]">Carbohydrates</h4>
                  <p className="text-[10px] text-[#888888]">Glycogen & metabolic fuel</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#78866B] px-2.5 py-0.5 rounded-full bg-[#78866B]/10 border border-[#78866B]/25">
                {carbsPct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-mono font-bold text-[#F5F5F0]">
                {Math.round(consumed.carbs)}
                <span className="text-xs font-normal text-[#888888] ml-0.5">g</span>
              </span>
              <span className="text-xs text-[#888888]">
                Target: <strong className="text-[#F5F5F0]">{goals.target_carbs}g</strong>
              </span>
            </div>

            {/* Total Carbs Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden mb-3">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: carbsRatio }}
                transition={springTransition}
                style={{ transformOrigin: "left" }}
                className="w-full h-full rounded-full bg-[#78866B]"
              />
            </div>

            {/* Clinical Sub-Metric Box: Fiber (Goal: ~30g/day) & Net Carbs */}
            <div className="p-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-semibold uppercase text-[#78866B] tracking-wider">
                  Dietary Fiber
                </span>
                <span className="font-mono text-xs font-bold text-[#F5F5F0]">
                  {Math.round(consumedFiber)}g <span className="text-[#888888] text-[10px] font-normal">/ {fiberGoal}g goal</span>
                </span>
              </div>
              {/* Mini Fiber Progress Bar */}
              <div className="w-full h-1 rounded-full bg-[#1F1F1F] overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: fiberRatio }}
                  transition={springTransition}
                  style={{ transformOrigin: "left" }}
                  className="w-full h-full rounded-full bg-[#78866B]"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1F1F1F]">
                <span className="text-[#888888]">Net Carbs (Carbs - Fiber):</span>
                <span className="font-mono font-bold text-[#A3B899]">
                  {Math.round(consumedNetCarbs)}g
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-[#888888] pt-2 border-t border-[#2A2A2A]">
            <span>{Math.max(0, Math.round(goals.target_carbs - consumed.carbs))}g remaining</span>
            <span className="text-[#78866B] font-mono">{fiberPct}% fiber goal</span>
          </div>
        </div>

        {/* 3. Fats Card (Warm Taupe / Bronze #B58A55) */}
        <div className="rounded-3xl p-5 border border-[#2A2A2A] hover:border-[#B58A55]/40 transition-colors bg-[#141414] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#B58A55]/15 border border-[#B58A55]/30 flex items-center justify-center text-[#B58A55]">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#F5F5F0]">Fats & Lipids</h4>
                  <p className="text-[10px] text-[#888888]">Hormonal health & absorption</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#B58A55] px-2.5 py-0.5 rounded-full bg-[#B58A55]/10 border border-[#B58A55]/25">
                {fatsPct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-mono font-bold text-[#F5F5F0]">
                {Math.round(consumed.fats)}
                <span className="text-xs font-normal text-[#888888] ml-0.5">g</span>
              </span>
              <span className="text-xs text-[#888888]">
                Target: <strong className="text-[#F5F5F0]">{goals.target_fats}g</strong>
              </span>
            </div>

            {/* Hardware-accelerated Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: fatsRatio }}
                transition={springTransition}
                style={{ transformOrigin: "left" }}
                className="w-full h-full rounded-full bg-[#B58A55]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-[#888888] pt-2 border-t border-[#2A2A2A]">
            <span>{Math.max(0, Math.round(goals.target_fats - consumed.fats))}g remaining</span>
            <span className="text-[#888888] font-mono">9 kcal/g</span>
          </div>
        </div>

        {/* 4. New Cardiovascular Card: Sodium & Hydration (Muted Blue/Teal Accent #38BDF8) */}
        <div className="rounded-3xl p-5 border border-[#2A2A2A] hover:border-[#38BDF8]/40 transition-colors bg-[#141414] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#F5F5F0]">Sodium & Hydration</h4>
                  <p className="text-[10px] text-[#888888]">Cardiovascular & fluid balance</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#38BDF8] px-2.5 py-0.5 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/25">
                {sodiumPct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-mono font-bold text-[#F5F5F0]">
                {Math.round(consumedSodium)}
                <span className="text-xs font-normal text-[#888888] ml-0.5">mg</span>
              </span>
              <span className="text-xs text-[#888888]">
                Daily Limit: <strong className="text-[#38BDF8]">{sodiumLimit}mg</strong>
              </span>
            </div>

            {/* Hardware-accelerated Progress Bar in Muted Blue/Teal */}
            <div className="w-full h-1.5 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: sodiumRatio }}
                transition={springTransition}
                style={{ transformOrigin: "left" }}
                className={`w-full h-full rounded-full ${
                  consumedSodium > sodiumLimit ? "bg-rose-500" : "bg-[#38BDF8]"
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-[#888888] pt-2 border-t border-[#2A2A2A]">
            <span className={consumedSodium > sodiumLimit ? "text-rose-400 font-medium" : "text-[#888888]"}>
              {consumedSodium > sodiumLimit
                ? `${Math.round(consumedSodium - sodiumLimit)}mg over limit`
                : `${sodiumRemaining}mg safe buffer`}
            </span>
            <span className="text-[#38BDF8] font-mono">
              {consumedSodium > sodiumLimit ? "Threshold Alert" : "Optimal Buffer"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
