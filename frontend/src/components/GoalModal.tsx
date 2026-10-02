import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sliders, Flame, Dumbbell, Zap, Droplet } from "lucide-react";
import type { UserGoals } from "../types";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoals: UserGoals;
  onSaveGoals: (goals: UserGoals) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  currentGoals,
  onSaveGoals,
}) => {
  const [calories, setCalories] = useState<number>(currentGoals.target_calories);
  const [protein, setProtein] = useState<number>(currentGoals.target_protein);
  const [carbs, setCarbs] = useState<number>(currentGoals.target_carbs);
  const [fats, setFats] = useState<number>(currentGoals.target_fats);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoals({
      target_calories: Number(calories) || 2000,
      target_protein: Number(protein) || 150,
      target_carbs: Number(carbs) || 200,
      target_fats: Number(fats) || 65,
    });
    onClose();
  };

  // Calculated calories from entered grams: (4 * P) + (4 * C) + (9 * F)
  const calculatedCal = protein * 4 + carbs * 4 + fats * 9;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-3xl border border-[#2A2A2A] bg-[#141414] shadow-subtle p-6 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#F5F5F0]">Nutritional Calibration</h3>
                  <p className="text-xs text-[#888888]">Adjust your daily macronutrient strategy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#C5A059] flex items-center justify-center text-[#888888] hover:text-[#F5F5F0] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {/* Calories input */}
              <div>
                <label className="text-xs font-medium text-[#888888] flex items-center gap-1.5 mb-1.5 font-sans">
                  <Flame className="w-3.5 h-3.5 text-[#C5A059]" />
                  Daily Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full glass-input px-4 py-2.5 rounded-full font-mono text-sm font-bold bg-[#0A0A0A] border-[#2A2A2A] text-[#F5F5F0]"
                  required
                />
              </div>

              {/* Protein input (Champagne Gold) */}
              <div>
                <label className="text-xs font-medium text-[#888888] flex items-center gap-1.5 mb-1.5 font-sans">
                  <Dumbbell className="w-3.5 h-3.5 text-[#C5A059]" />
                  Target Protein (grams)
                </label>
                <input
                  type="number"
                  min="0"
                  max="800"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full glass-input px-4 py-2.5 rounded-full font-mono text-sm font-bold bg-[#0A0A0A] border-[#2A2A2A] text-[#C5A059]"
                  required
                />
              </div>

              {/* Carbs input (Muted Sage Green) */}
              <div>
                <label className="text-xs font-medium text-[#888888] flex items-center gap-1.5 mb-1.5 font-sans">
                  <Zap className="w-3.5 h-3.5 text-[#78866B]" />
                  Target Carbohydrates (grams)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full glass-input px-4 py-2.5 rounded-full font-mono text-sm font-bold bg-[#0A0A0A] border-[#2A2A2A] text-[#78866B]"
                  required
                />
              </div>

              {/* Fats input (Warm Taupe) */}
              <div>
                <label className="text-xs font-medium text-[#888888] flex items-center gap-1.5 mb-1.5 font-sans">
                  <Droplet className="w-3.5 h-3.5 text-[#B58A55]" />
                  Target Fats & Lipids (grams)
                </label>
                <input
                  type="number"
                  min="0"
                  max="400"
                  value={fats}
                  onChange={(e) => setFats(Number(e.target.value))}
                  className="w-full glass-input px-4 py-2.5 rounded-full font-mono text-sm font-bold bg-[#0A0A0A] border-[#2A2A2A] text-[#B58A55]"
                  required
                />
              </div>

              {/* Macro Grams to Calorie Check */}
              <div className="p-3 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-between text-xs text-[#888888]">
                <span>Calculated Macro Sum:</span>
                <span className="font-mono font-bold text-[#F5F5F0]">{calculatedCal} kcal</span>
              </div>

              {/* Actions: Pill-shaped buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-pill-outline px-5 py-2.5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pill-gold flex-1 py-2.5 px-5 flex items-center justify-center gap-2 text-xs font-semibold shadow-gold-glow"
                >
                  <Check className="w-4 h-4" />
                  Save Targets
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
