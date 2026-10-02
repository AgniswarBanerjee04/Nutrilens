import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Moon,
  Zap,
  BedDouble,
  ShieldCheck,
  AlertTriangle,
  Save,
  CheckCircle2,
} from "lucide-react";
import { calculateAutophagyScore } from "../services/sleepService";
import type { SleepData } from "../types";

interface SleepTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sleepData: SleepData;
  onSaveSleep: (data: Partial<SleepData>) => void;
}

export const SleepTrackingModal: React.FC<SleepTrackingModalProps> = ({
  isOpen,
  onClose,
  sleepData,
  onSaveSleep,
}) => {
  const initialHours = Math.floor(sleepData.hours_slept || 7.5);
  const initialMinutes = Math.round(((sleepData.hours_slept || 7.5) % 1) * 60);

  const [hours, setHours] = useState<number>(initialHours);
  const [minutes, setMinutes] = useState<number>(initialMinutes);
  const [quality, setQuality] = useState<SleepData["sleep_quality"]>(sleepData.sleep_quality || "Restorative");
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const h = Math.floor(sleepData.hours_slept || 7.5);
      const m = Math.round(((sleepData.hours_slept || 7.5) % 1) * 60);
      setHours(h);
      setMinutes(m);
      setQuality(sleepData.sleep_quality || "Restorative");
      setIsSaved(false);
    }
  }, [isOpen, sleepData]);

  if (!isOpen) return null;

  const totalDecimalHours = Math.round((hours + minutes / 60) * 10) / 10;
  const isSleepDeprived = totalDecimalHours < 6.0;
  const liveAutophagyScore = calculateAutophagyScore(totalDecimalHours, quality);
  const estimatedDeepSleep = Math.round(totalDecimalHours * 0.28 * 10) / 10;

  const handleApplyPreset = (presetHours: number, presetQuality: SleepData["sleep_quality"]) => {
    const h = Math.floor(presetHours);
    const m = Math.round((presetHours % 1) * 60);
    setHours(h);
    setMinutes(m);
    setQuality(presetQuality);
  };

  const handleSave = () => {
    onSaveSleep({
      hours_slept: totalDecimalHours,
      deep_sleep_hours: estimatedDeepSleep,
      sleep_quality: quality,
      autophagy_score: liveAutophagyScore,
    });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-[#141414] border border-[#2A2A2A] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto overflow-hidden z-10 font-sans"
        >
          {/* Subtle gold gradient accent on top */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#C5A059] via-[#DFBE7A] to-[#78866B]" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0] hover:border-[#C5A059] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-full bg-[#0A0A0A] border border-[#C5A059] flex items-center justify-center text-[#C5A059] shadow-gold-glow">
                <Moon className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F5F0] tracking-tight">
                Deep Sleep & Autophagy Recovery
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059]">
                Circadian Telemetry
              </span>
            </div>
            <p className="text-xs text-[#888888] font-sans">
              Log nocturnal sleep duration and architecture to adjust insulin receptor dynamics, autophagy turnover, and post-prandial glycemic buffering.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="mb-6 p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
              Clinical Presets:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset(5.0, "Fragmented")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-medium border transition-colors ${
                  totalDecimalHours < 6.0
                    ? "bg-[#9E4747]/20 border-[#9E4747] text-[#DFBE7A]"
                    : "bg-[#141414] border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0]"
                }`}
              >
                &lt; 6h (Deficit Test)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(7.5, "Restorative")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-medium border transition-colors ${
                  totalDecimalHours === 7.5 && quality === "Restorative"
                    ? "bg-[#78866B]/20 border-[#78866B] text-[#78866B]"
                    : "bg-[#141414] border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0]"
                }`}
              >
                7.5h (Optimal Rest)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(8.5, "Restorative")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-medium border transition-colors ${
                  totalDecimalHours === 8.5
                    ? "bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]"
                    : "bg-[#141414] border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0]"
                }`}
              >
                8.5h (Autophagy Peak)
              </button>
            </div>
          </div>

          {/* Duration & Quality Inputs Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Hours & Minutes Duration Input */}
            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium block mb-3">
                Sleep Duration (Hours & Mins)
              </span>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-[#888888] mb-1">
                    <span>Hours:</span>
                    <span className="font-mono font-bold text-[#C5A059]">{hours}h</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="1"
                    value={hours}
                    onChange={(e) => setHours(parseInt(e.target.value, 10))}
                    className="w-full accent-[#C5A059] bg-[#141414] h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-[#888888] mb-1">
                    <span>Minutes:</span>
                    <span className="font-mono font-bold text-[#C5A059]">{minutes}m</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="55"
                    step="5"
                    value={minutes}
                    onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
                    className="w-full accent-[#C5A059] bg-[#141414] h-2 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#2A2A2A]/50">
                <span className="text-xs text-neutral-400">Total Duration:</span>
                <span className="text-lg font-serif font-bold text-[#C5A059] font-mono">
                  {hours}h {minutes}m <span className="text-xs font-normal text-neutral-400">({totalDecimalHours}h)</span>
                </span>
              </div>
            </div>

            {/* Quality Architecture Selector */}
            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium block mb-3">
                  Sleep Architecture / Quality
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["Restorative", "Normal", "Fragmented"] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        quality === q
                          ? "bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059] shadow-gold-glow font-bold"
                          : "bg-[#141414] border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0]"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-[#888888] mt-3">
                {quality === "Restorative"
                  ? "✓ Uninterrupted delta slow-wave sleep. Peak parasympathetic recovery."
                  : quality === "Normal"
                  ? "Standard circadian sleep cycles with baseline restorative windows."
                  : "⚠ Fragmented micro-arousals. Blunts morning insulin sensitivity."}
              </p>
            </div>
          </div>

          {/* Live Clinical Telemetry Projection Grid (Spacious 2x2 with p-6) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Autophagy Score */}
            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex flex-col justify-between">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium block mb-1">
                Autophagy Recovery Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059] font-mono">
                  {liveAutophagyScore}
                </span>
                <span className="text-sm font-sans text-neutral-400">/ 100</span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#2A2A2A]/50 flex items-center justify-between text-xs text-neutral-400">
                <span>Cellular renewal turnover</span>
                <Zap className="w-3.5 h-3.5 text-[#C5A059]" />
              </div>
            </div>

            {/* Slow-Wave Deep Sleep */}
            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex flex-col justify-between">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium block mb-1">
                Slow-Wave Deep Sleep
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059] font-mono">
                  {estimatedDeepSleep}
                </span>
                <span className="text-sm font-sans text-neutral-400">hours (28%)</span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#2A2A2A]/50 flex items-center justify-between text-xs text-neutral-400">
                <span>Delta stage N3 restoration</span>
                <BedDouble className="w-3.5 h-3.5 text-[#78866B]" />
              </div>
            </div>
          </div>

          {/* Glucose Sensitivity & Cravings Risk Banner */}
          <div className={`p-4 rounded-2xl border mb-6 flex items-start gap-3 ${
            isSleepDeprived
              ? "bg-[#9E4747]/15 border-[#9E4747]/40 text-[#F5F5F0]"
              : "bg-[#78866B]/15 border-[#78866B]/30 text-[#F5F5F0]"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
              isSleepDeprived
                ? "bg-[#9E4747]/20 border-[#9E4747]/50 text-[#DFBE7A]"
                : "bg-[#78866B]/20 border-[#78866B]/50 text-[#78866B]"
            }`}>
              {isSleepDeprived ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-serif font-bold">
                  {isSleepDeprived
                    ? "High Insulin Resistance & Cravings Risk"
                    : "Optimal Glycemic & Insulin Sensitivity"}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold ${
                  isSleepDeprived
                    ? "bg-[#9E4747]/30 text-[#DFBE7A]"
                    : "bg-[#78866B]/30 text-[#78866B]"
                }`}>
                  {isSleepDeprived ? "Sleep Debt Alert" : "Normoglycemic Window"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-relaxed">
                {isSleepDeprived
                  ? `Logging ${totalDecimalHours}h of sleep (< 6.0h threshold) suppresses peripheral GLUT-4 glucose transporters by ~25-30% and elevates daytime ghrelin. The Energy Curve projection is automatically elevated (+18%) with delayed post-prandial clearance.`
                  : `Sleep duration of ${totalDecimalHours}h provides sufficient circadian restoration. Receptors maintain high baseline insulin sensitivity with steady energy plateaus.`}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              className="btn-pill-outline px-5 py-2.5 text-xs font-medium"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaved}
              className="btn-pill-gold flex items-center gap-2 px-6 py-2.5 text-xs font-semibold shadow-gold-glow"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#0A0A0A]" />
                  <span>Telemetry Saved & Synced</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#0A0A0A]" />
                  <span>Save Sleep & Sync Energy Curve</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
