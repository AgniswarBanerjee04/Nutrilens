import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  Sparkles,
  ChefHat,
  Clock,
  Flame,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
  HeartPulse,
} from "lucide-react";
import { balanceNextMeal } from "../services/mealService";
import type { Meal, UserGoals, MacroBalancerResponse } from "../types";

interface MacroBalancerCardProps {
  userId: number;
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  goals: UserGoals;
  onLogMeal: (meal: Omit<Meal, "id">) => void;
}

const DIETARY_OPTIONS = [
  { id: "omnivore", label: "Balanced / Whole Foods" },
  { id: "vegetarian", label: "Plant-Forward" },
  { id: "high-protein", label: "High Protein" },
  { id: "millets", label: "Complex Grains" },
  { id: "low-carb", label: "Low Carb" },
];

export const MacroBalancerCard: React.FC<MacroBalancerCardProps> = ({
  userId,
  consumed,
  goals,
  onLogMeal,
}) => {
  const [dietaryPref, setDietaryPref] = useState<string>("omnivore");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [balancerData, setBalancerData] = useState<MacroBalancerResponse | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  // Remaining deficits
  const deficitCalories = Math.max(0, Math.round(goals.target_calories - consumed.calories));
  const deficitProtein = Math.max(0, Math.round(goals.target_protein - consumed.protein));
  const deficitCarbs = Math.max(0, Math.round(goals.target_carbs - consumed.carbs));
  const deficitFats = Math.max(0, Math.round(goals.target_fats - consumed.fats));

  const isUnbalanced = deficitProtein > 15 || deficitCarbs > 20 || deficitCalories > 200;

  const handleGenerateRecipe = async () => {
    setIsLoading(true);
    setIsLogged(false);
    try {
      const result = await balanceNextMeal(userId, dietaryPref);
      setBalancerData(result);
    } catch (err) {
      console.error("Failed to generate balanced recipe:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLog = () => {
    if (!balancerData || !balancerData.recipe) return;
    const r = balancerData.recipe;

    onLogMeal({
      food_summary: r.recipe_title,
      food_items: r.ingredients.map((i) => `${i.name} (${i.quantity})`),
      calories: r.macro_alignment.calories,
      protein: r.macro_alignment.protein_g,
      carbs: r.macro_alignment.carbs_g,
      fats: r.macro_alignment.fats_g,
      cooking_method: r.cooking_method,
      hidden_fat_estimate_g: Math.round(r.macro_alignment.fats_g * 0.25),
      glycemic_index_rating: r.glycemic_index_rating || "Low",
      hidden_fat_warnings: [
        "Tempered oil/fats calculated into lipid distribution",
        "Slow complex carbohydrates provide sustained energy"
      ],
      glycemic_impact: r.glycemic_index_rating || "Low",
      timestamp: new Date().toISOString(),
    });

    setIsLogged(true);
  };

  return (
    <div className="rounded-3xl p-6 sm:p-7 border border-[#2A2A2A] bg-[#141414] shadow-subtle relative overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#C5A059] flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#F5F5F0] tracking-tight">
                AI Culinary Macro-Balancer
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
                <Sparkles className="w-3 h-3" />
                Adaptive Precision Chef
              </span>
            </div>
            <p className="text-xs text-[#888888] mt-0.5 font-sans">
              Evaluates daily caloric gaps and formulates a targeted meal to complete macro distribution.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isUnbalanced ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Macro Deficit Detected: Curated Dinner Prescribed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#78866B]/15 border border-[#78866B]/30 text-[#78866B] text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Macros In Equilibrium</span>
            </div>
          )}
        </div>
      </div>

      {/* Remaining Daily Deficits Overview */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
          <span className="text-[10px] text-[#888888] uppercase font-medium block">Remaining Energy</span>
          <span className="text-lg font-serif font-bold text-[#C5A059] font-mono">{deficitCalories}</span>
          <span className="text-[10px] text-[#888888] block">kcal budget gap</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
          <span className="text-[10px] text-[#888888] uppercase font-medium block">Protein Deficit</span>
          <span className="text-lg font-serif font-bold text-[#C5A059] font-mono">
            {deficitProtein}
            <span className="text-xs font-normal text-[#888888] ml-0.5">g</span>
          </span>
          <span className="text-[10px] text-[#888888] block">needs closing</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
          <span className="text-[10px] text-[#888888] uppercase font-medium block">Carbs Allowance</span>
          <span className="text-lg font-serif font-bold text-[#78866B] font-mono">
            {deficitCarbs}
            <span className="text-xs font-normal text-[#888888] ml-0.5">g</span>
          </span>
          <span className="text-[10px] text-[#888888] block">complex preferred</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
          <span className="text-[10px] text-[#888888] uppercase font-medium block">Lipid Room</span>
          <span className="text-lg font-serif font-bold text-[#B58A55] font-mono">
            {deficitFats}
            <span className="text-xs font-normal text-[#888888] ml-0.5">g</span>
          </span>
          <span className="text-[10px] text-[#888888] block">healthy fats remaining</span>
        </div>
      </div>

      {/* Culinary Preference Selector & Trigger Button */}
      <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-medium text-[#888888] flex-shrink-0 mr-1">
            Culinary Focus:
          </span>
          {DIETARY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setDietaryPref(opt.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                dietaryPref === opt.id
                  ? "bg-[#C5A059] text-[#0A0A0A] font-semibold shadow-gold-glow"
                  : "bg-[#141414] text-[#888888] hover:text-[#F5F5F0] border border-[#2A2A2A]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateRecipe}
          disabled={isLoading}
          className="btn-pill-gold flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold shadow-gold-glow disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0A0A0A]" />
              Formulating Dish...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
              Prescribe Dinner
            </>
          )}
        </button>
      </div>

      {/* Generated Recipe Card */}
      <AnimatePresence>
        {balancerData && balancerData.recipe && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-6 p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-[#2A2A2A] shadow-subtle"
          >
            {/* Title & Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#2A2A2A]">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
                    {balancerData.recipe.cooking_method}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#78866B]/15 text-[#78866B] border border-[#78866B]/30">
                    {balancerData.recipe.glycemic_index_rating} Glycemic Index
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-mono text-[#888888] border border-[#2A2A2A]">
                    Difficulty: {balancerData.recipe.difficulty}
                  </span>
                </div>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F5F0] tracking-tight">
                  {balancerData.recipe.recipe_title}
                </h4>
                <p className="text-xs sm:text-sm text-[#888888] mt-1 max-w-2xl leading-relaxed">
                  {balancerData.recipe.tagline}
                </p>
              </div>

              {/* Timing & Quick Log Action */}
              <div className="flex flex-col sm:items-end gap-2.5">
                <div className="flex items-center gap-3 text-xs text-[#888888] font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#888888]" />
                    Prep: {balancerData.recipe.prep_time_minutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#C5A059]" />
                    Cook: {balancerData.recipe.cook_time_minutes}m
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleQuickLog}
                  disabled={isLogged}
                  className={`btn-pill-gold flex items-center gap-2 px-5 py-2 text-xs font-semibold shadow-gold-glow ${
                    isLogged
                      ? "bg-[#78866B]/20 text-[#78866B] border border-[#78866B]/40 cursor-default shadow-none"
                      : ""
                  }`}
                >
                  {isLogged ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#78866B]" />
                      Logged to Meals Feed
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-[#0A0A0A]" />
                      Quick-Log This Dish
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Target Macro Match Banner */}
            <div className="mt-4 p-3 rounded-2xl bg-[#141414] border border-[#2A2A2A] flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] flex items-center justify-center">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#888888] tracking-wider block">
                    Deficit Alignment
                  </span>
                  <p className="text-xs text-[#F5F5F0]">
                    {balancerData.recipe.macro_alignment.explanation}
                  </p>
                </div>
              </div>

              {/* Exact macro pills */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-3 py-1 rounded-full bg-[#0A0A0A] text-[#F5F5F0] border border-[#2A2A2A] font-bold">
                  {Math.round(balancerData.recipe.macro_alignment.calories)} kcal
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0A0A0A] text-[#C5A059] border border-[#2A2A2A] font-bold">
                  +{Math.round(balancerData.recipe.macro_alignment.protein_g)}g P
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0A0A0A] text-[#78866B] border border-[#2A2A2A] font-bold">
                  +{Math.round(balancerData.recipe.macro_alignment.carbs_g)}g C
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0A0A0A] text-[#B58A55] border border-[#2A2A2A] font-bold">
                  +{Math.round(balancerData.recipe.macro_alignment.fats_g)}g F
                </span>
              </div>
            </div>

            {/* Ingredients & Cooking Method Grid */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ingredients */}
              <div className="p-4 rounded-2xl bg-[#141414] border border-[#2A2A2A]">
                <h5 className="text-xs font-serif font-bold text-[#F5F5F0] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#C5A059]" />
                  Curated Ingredients & Portions
                </h5>
                <ul className="space-y-2">
                  {balancerData.recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start justify-between text-xs gap-2">
                      <span className="text-[#F5F5F0] font-medium">• {ing.name}</span>
                      <span className="text-[11px] font-mono text-[#C5A059] bg-[#0A0A0A] px-2.5 py-0.5 rounded-full border border-[#2A2A2A] whitespace-nowrap">
                        {ing.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-2xl bg-[#141414] border border-[#2A2A2A]">
                <h5 className="text-xs font-serif font-bold text-[#F5F5F0] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-[#78866B]" />
                  Preparation & Cooking Technique
                </h5>
                <ol className="space-y-2 text-xs text-[#888888]">
                  {balancerData.recipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="font-mono font-bold text-[#C5A059] flex-shrink-0">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Clinical Dietitian Tip */}
            {balancerData.recipe.chef_metabolic_tip && (
              <div className="mt-4 p-3.5 rounded-2xl bg-[#141414] border border-[#2A2A2A] flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-serif font-bold text-[#C5A059] uppercase tracking-wider block">
                    Culinary Nutrition Principle:
                  </span>
                  <p className="text-xs text-[#888888] mt-0.5 leading-relaxed">
                    {balancerData.recipe.chef_metabolic_tip}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
