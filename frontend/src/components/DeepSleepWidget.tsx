import React, { useState, useEffect } from "react";
import { Moon, Lock, Sparkles, AlertTriangle, ShieldCheck, Zap, BedDouble, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { SleepData } from "../types";

interface DeepSleepWidgetProps {
  sleepData: SleepData;
  onSaveSleep: (data: Partial<SleepData>) => void;
  onOpenPricingModal: () => void;
}

export const DeepSleepWidget: React.FC<DeepSleepWidgetProps> = ({
  sleepData,
  onSaveSleep,
  onOpenPricingModal,
}) => {
  const { subscriptionTier } = useAuth();
  const isLocked = subscriptionTier < 2;

  const [hours, setHours] = useState<number>(sleepData.hours_slept);
  const [quality, setQuality] = useState<SleepData["sleep_quality"]>(sleepData.sleep_quality);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  useEffect(() => {
    setHours(sleepData.hours_slept);
    setQuality(sleepData.sleep_quality);
  }, [sleepData]);

  const handleUpdate = (newHours: number, newQuality: SleepData["sleep_quality"]) => {
    setHours(newHours);
    setQuality(newQuality);
    onSaveSleep({ hours_slept: newHours, sleep_quality: newQuality });
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  const isSleepDeprived = hours < 6.0;

  // Locked View for Tier < 2
  if (isLocked) {
    return (
      <div
        onClick={onOpenPricingModal}
        className="relative rounded-3xl border border-[#2A2A2A] bg-[#141414] shadow-subtle p-6 sm:p-7 overflow-hidden cursor-pointer group transition-all duration-300 hover:border-[#C5A059]/60"
      >
        {/* Background dummy preview blurred with glassmorphism */}
        <div className="filter blur-md opacity-25 select-none pointer-events-none transition-all group-hover:opacity-35">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C5A059]/20" />
              <div className="h-5 w-40 bg-[#2A2A2A] rounded" />
            </div>
            <div className="h-5 w-24 bg-[#2A2A2A] rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="h-20 bg-[#0A0A0A] rounded-2xl" />
            <div className="h-20 bg-[#0A0A0A] rounded-2xl" />
            <div className="h-20 bg-[#0A0A0A] rounded-2xl" />
          </div>
          <div className="h-10 bg-[#0A0A0A] rounded-xl" />
        </div>

        {/* Lock Overlay with Glassmorphism and Elegant Champagne Gold Lock Icon */}
        <div className="absolute inset-0 bg-black/65 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="w-12 h-12 rounded-full bg-[#0A0A0A] border border-[#C5A059] shadow-gold-glow flex items-center justify-center text-[#C5A059] mb-3 group-hover:scale-110 transition-transform">
            <Lock className="w-5 h-5 text-[#C5A059]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            <span>Level 2 (Pro) Exclusive</span>
          </div>

          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#F5F5F0] tracking-tight">
            Deep Sleep & Autophagy Tracker
          </h3>

          <p className="text-xs text-[#888888] font-sans max-w-md mt-1.5 leading-relaxed">
            Correlate nocturnal slow-wave sleep depth with circadian insulin sensitivity, autophagy renewal, and daily carbohydrate craving risks.
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPricingModal();
            }}
            className="mt-4 btn-pill-gold min-h-[44px] px-6 py-2.5 text-xs font-semibold shadow-gold-glow flex items-center gap-2"
          >
            <span>Unlock with Pro</span>
            <span className="text-[10px] opacity-80">(₹799/mo)</span>
          </button>
        </div>
      </div>
    );
  }

  // Unlocked View for Tier >= 2
  return (
    <div className="rounded-3xl border border-[#2A2A2A] bg-[#141414] shadow-subtle p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center">
              <Moon className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5F5F0] tracking-tight">
              Deep Sleep & Autophagy Protocol
            </h3>
            <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#78866B]/15 border border-[#78866B]/30 text-[#78866B] font-mono">
              Tier {subscriptionTier}: Active
            </span>
          </div>
          <p className="text-xs text-[#888888] font-sans">
            Circadian rest telemetry. Influences glucose receptor sensitivity and insulin dynamics.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-[#888888] mr-1 hidden md:inline">Quick Test:</span>
          <button
            onClick={() => handleUpdate(5.0, "Fragmented")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              hours < 6.0
                ? "bg-[#9E4747]/20 border-[#9E4747] text-[#DFBE7A]"
                : "bg-[#0A0A0A] border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0]"
            }`}
          >
            &lt; 6h (Deficit Test)
          </button>
          <button
            onClick={() => handleUpdate(7.5, "Restorative")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              hours === 7.5 && quality === "Restorative"
                ? "bg-[#78866B]/20 border-[#78866B] text-[#78866B]"
                : "bg-[#0A0A0A] border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0]"
            }`}
          >
            7.5h (Optimal)
          </button>
          <button
            onClick={() => handleUpdate(8.5, "Restorative")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              hours === 8.5
                ? "bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]"
                : "bg-[#0A0A0A] border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0]"
            }`}
          >
            8.5h (Deep)
          </button>
        </div>
      </div>

      {/* Critical Insulin Resistance Warning if Sleep < 6h */}
      {isSleepDeprived && (
        <div className="p-4 rounded-2xl bg-[#9E4747]/15 border border-[#9E4747]/40 flex items-start gap-3 text-[#F5F5F0]">
          <div className="w-8 h-8 rounded-full bg-[#9E4747]/20 border border-[#9E4747]/60 flex items-center justify-center shrink-0 mt-0.5 text-[#F5F5F0]">
            <AlertTriangle className="w-4 h-4 text-[#DFBE7A]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F5F5F0]">
                High Insulin Resistance & Cravings Risk
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold bg-[#9E4747]/30 text-[#DFBE7A]">
                Sleep Debt Alert
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#888888] mt-1 font-sans leading-relaxed">
              Logging under 6 hours of sleep (<strong className="text-[#F5F5F0]">{hours}h</strong>) impairs peripheral GLUT-4 glucose uptake by ~25-30% and elevates daytime ghrelin (appetite hormone). Expect heightened afternoon carb cravings and exaggerated post-prandial glycemic peaks.
            </p>
          </div>
        </div>
      )}

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Hours Slept */}
        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <span className="text-[10px] uppercase font-medium text-[#888888] block mb-1">
            Total Sleep Duration
          </span>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className={`text-xl sm:text-2xl font-serif font-bold ${isSleepDeprived ? "text-[#9E4747]" : "text-[#F5F5F0]"}`}>
                {hours.toFixed(1)}
              </span>
              <span className="text-xs text-[#888888] font-sans">hours</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              isSleepDeprived
                ? "bg-[#9E4747]/15 border-[#9E4747]/40 text-[#DFBE7A]"
                : "bg-[#78866B]/15 border-[#78866B]/30 text-[#78866B]"
            }`}>
              {isSleepDeprived ? "Sleep Deficit" : "Optimal Rest"}
            </span>
          </div>
        </div>

        {/* Metric 2: Autophagy Index */}
        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <span className="text-[10px] uppercase font-medium text-[#888888] block mb-1">
            Autophagy Score
          </span>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#C5A059]">
                {sleepData.autophagy_score ?? 80}
              </span>
              <span className="text-xs text-[#888888] font-sans">/100</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#C5A059]/15 flex items-center justify-center text-[#C5A059]">
              <Zap className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Metric 3: Deep Sleep Est. */}
        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <span className="text-[10px] uppercase font-medium text-[#888888] block mb-1">
            Slow-Wave Deep Sleep
          </span>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#F5F5F0]">
                {sleepData.deep_sleep_hours?.toFixed(1) ?? (hours * 0.28).toFixed(1)}
              </span>
              <span className="text-xs text-[#888888] font-sans">hrs (28%)</span>
            </div>
            <BedDouble className="w-4 h-4 text-[#78866B]" />
          </div>
        </div>

        {/* Metric 4: Sleep Quality State */}
        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <span className="text-[10px] uppercase font-medium text-[#888888] block mb-1">
            Circadian State
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-serif font-bold text-[#F5F5F0] truncate">
              {quality}
            </span>
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
          </div>
          <p className="text-[10px] text-[#888888] mt-1 truncate">
            {isSleepDeprived ? "Elevated morning cortisol" : "Restorative parasympathetic"}
          </p>
        </div>
      </div>

      {/* Interactive Controls Area */}
      <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-serif font-bold text-[#F5F5F0]">
            Log Sleep Duration & Architecture
          </span>
          {isSavedRecently && (
            <span className="text-[11px] text-[#78866B] flex items-center gap-1 font-medium">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Telemetry Updated & Synced to Energy Curve</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hours Slider & Value */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#888888]">Hours Slept:</span>
              <span className="font-mono font-bold text-[#C5A059]">{hours.toFixed(1)} hrs</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="11.0"
              step="0.5"
              value={hours}
              onChange={(e) => handleUpdate(parseFloat(e.target.value), quality)}
              className="w-full accent-[#C5A059] bg-[#141414] h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#888888] font-mono mt-1">
              <span>3h (Severe Debt)</span>
              <span>6h (Threshold)</span>
              <span>8h (Ideal)</span>
              <span>11h</span>
            </div>
          </div>

          {/* Quality Pill Selector */}
          <div>
            <span className="text-xs text-[#888888] block mb-1.5">Sleep Quality / Architecture:</span>
            <div className="grid grid-cols-3 gap-2">
              {(["Restorative", "Normal", "Fragmented"] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleUpdate(hours, q)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    quality === q
                      ? "bg-[#C5A059]/15 border-[#C5A059] text-[#C5A059] shadow-gold-glow"
                      : "bg-[#141414] border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0]"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
