import React, { useState } from "react";
import {
  User,
  Sliders,
  Flame,
  Dumbbell,
  Zap,
  Droplet,
  Save,
  ArrowLeft,
  Key,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { UserGoals } from "../types";

interface SettingsProps {
  onBackToDashboard: () => void;
  currentGoals: UserGoals;
  onSaveGoals: (goals: UserGoals) => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({
  onBackToDashboard,
  currentGoals,
  onSaveGoals,
}) => {
  const { user, isOfflineMode } = useAuth();
  const [goals, setGoals] = useState<UserGoals>(currentGoals);
  const [isSaved, setIsSaved] = useState(false);
  const [metabolicMode, setMetabolicMode] = useState("Balanced Glycemic Control");
  const [oilSensitivity, setOilSensitivity] = useState("Strict (Flag > 4g Hidden Fats)");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveGoals(goals);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const tokenPreview = localStorage.getItem("auth_token") || localStorage.getItem("nutrilens_token") || "No active token";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#888888] flex flex-col font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#141414] border-b border-[#2A2A2A] px-4 lg:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="w-8 h-8 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0] hover:border-[#C5A059] flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#F5F5F0]">Settings & Protocol Calibration</h2>
              <p className="text-xs text-[#888888]">AI Vision Sensitivity & User Preferences</p>
            </div>
          </div>

          <button
            onClick={onBackToDashboard}
            className="btn-pill-outline px-4 py-1.5 text-xs font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </header>

      {/* Main Settings Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-7">
        {/* User Session & Auth Persistence Card */}
        <section className="rounded-3xl p-6 sm:p-7 border border-[#2A2A2A] bg-[#141414] shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#F5F5F0]">User Session & Identity</h3>
                <p className="text-xs text-[#888888]">Persistent localStorage session active</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-medium uppercase bg-[#78866B]/15 text-[#78866B] border border-[#78866B]/30">
              Hydrated On Reload
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-[10px] text-[#888888] block uppercase font-medium">User Name</span>
              <span className="text-sm font-serif font-bold text-[#F5F5F0] mt-0.5 block">{user?.name || "Patron"}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-[10px] text-[#888888] block uppercase font-medium">Email Account</span>
              <span className="text-sm font-medium text-[#F5F5F0] mt-0.5 block truncate">{user?.email || "user@nutrilens.ai"}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-[10px] text-[#888888] block uppercase font-medium">Engine Mode</span>
              <span className="text-sm font-medium text-[#78866B] mt-0.5 block">
                {isOfflineMode ? "Local Resilient PWA" : "FastAPI Cloud Connected"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] flex items-center gap-2 text-xs text-[#888888] px-4">
            <Key className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
            <span className="font-mono text-[11px] truncate">
              Active Token: <strong className="text-[#F5F5F0]">{tokenPreview.slice(0, 36)}...</strong>
            </span>
          </div>
        </section>

        {/* Vision AI Sensitivity Settings */}
        <section className="rounded-3xl p-6 sm:p-7 border border-[#2A2A2A] bg-[#141414] shadow-subtle space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-full bg-[#78866B]/15 text-[#78866B] border border-[#78866B]/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#F5F5F0]">Vision AI Sensitivity</h3>
              <p className="text-xs text-[#888888]">Configure hidden lipid auditing and glycemic trajectories</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#888888] block mb-1.5">
                Hidden Cooking Fat Sensitivity
              </label>
              <select
                value={oilSensitivity}
                onChange={(e) => setOilSensitivity(e.target.value)}
                className="w-full glass-input text-xs font-medium px-4 py-2.5 rounded-full border-[#2A2A2A] bg-[#0A0A0A] text-[#F5F5F0] cursor-pointer"
              >
                <option value="Strict (Flag > 4g Hidden Fats)" className="bg-[#141414]">Strict (Flag &gt; 4g Hidden Oils/Butter)</option>
                <option value="Moderate (Flag > 8g Hidden Fats)" className="bg-[#141414]">Moderate (Flag &gt; 8g Hidden Oils/Butter)</option>
                <option value="Relaxed (Gourmet Mode)" className="bg-[#141414]">Relaxed (Gourmet Mode)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#888888] block mb-1.5">
                Glycemic Absorption Focus
              </label>
              <select
                value={metabolicMode}
                onChange={(e) => setMetabolicMode(e.target.value)}
                className="w-full glass-input text-xs font-medium px-4 py-2.5 rounded-full border-[#2A2A2A] bg-[#0A0A0A] text-[#F5F5F0] cursor-pointer"
              >
                <option value="Balanced Glycemic Control" className="bg-[#141414]">Balanced Glycemic Control</option>
                <option value="High Satiety Plateau" className="bg-[#141414]">High Satiety Plateau (Complex Millets & Legumes)</option>
                <option value="Endurance Carb Replenishment" className="bg-[#141414]">Endurance Carb Replenishment</option>
              </select>
            </div>
          </div>
        </section>

        {/* Nutritional Goals Form */}
        <section className="rounded-3xl p-6 sm:p-7 border border-[#2A2A2A] bg-[#141414] shadow-subtle space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#F5F5F0]">Daily Macronutrient Protocol</h3>
              <p className="text-xs text-[#888888]">Target caloric ceiling and baseline macros</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Calories */}
              <div>
                <label className="text-xs font-medium text-[#888888] flex items-center gap-1 mb-1">
                  <Flame className="w-3.5 h-3.5 text-[#C5A059]" />
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  value={goals.target_calories}
                  onChange={(e) => setGoals({ ...goals, target_calories: Number(e.target.value) })}
                  className="w-full glass-input px-4 py-2.5 rounded-full font-mono text-xs font-bold bg-[#0A0A0A] border-[#2A2A2A] text-[#F5F5F0]"
                  required
                />
              </div>

              {/* Protein */}
              <div>
                <label className="text-xs font-medium text-[#888888] flex items-center gap-1 mb-1">
                  <Dumbbell className="w-3.5 h-3.5 text-[#C5A059]" />
                  Protein (grams)
                </label>
                <input
                  type="number"
                  value={goals.target_protein}
                  onChange={(e) => setGoals({ ...goals, target_protein: Number(e.target.value) })}
                  className="w-full glass-input px-4 py-2.5 rounded-full font-mono text-xs font-bold bg-[#0A0A0A] border-[#2A2A2A] text-[#C5A059]"
                  required
                />
              </div>

              {/* Carbs */}
              <div>
                <label className="text-xs font-medium text-[#888888] flex items-center gap-1 mb-1">
                  <Zap className="w-3.5 h-3.5 text-[#78866B]" />
                  Carbs (grams)
                </label>
                <input
                  type="number"
                  value={goals.target_carbs}
                  onChange={(e) => setGoals({ ...goals, target_carbs: Number(e.target.value) })}
                  className="w-full glass-input px-4 py-2.5 rounded-full font-mono text-xs font-bold bg-[#0A0A0A] border-[#2A2A2A] text-[#78866B]"
                  required
                />
              </div>

              {/* Fats */}
              <div>
                <label className="text-xs font-medium text-[#888888] flex items-center gap-1 mb-1">
                  <Droplet className="w-3.5 h-3.5 text-[#B58A55]" />
                  Fats (grams)
                </label>
                <input
                  type="number"
                  value={goals.target_fats}
                  onChange={(e) => setGoals({ ...goals, target_fats: Number(e.target.value) })}
                  className="w-full glass-input px-4 py-2.5 rounded-full font-mono text-xs font-bold bg-[#0A0A0A] border-[#2A2A2A] text-[#B58A55]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="btn-pill-gold flex items-center gap-2 px-6 py-2.5 text-xs font-semibold shadow-gold-glow"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#0A0A0A]" />
                    <span>Protocol Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#0A0A0A]" />
                    <span>Save Targets</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};
