import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Trash2, Clock, Camera, AlertTriangle, Activity } from "lucide-react";
import type { Meal } from "../types";

interface MealHistoryProps {
  meals: Meal[];
  onDeleteMeal: (id: string | number) => void;
  onOpenSnapModal: () => void;
}

// Framer Motion container variants for staggered list cascading
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

// Framer Motion item variant for individual meal cards
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
    },
  },
  exit: { opacity: 0, scale: 0.98 },
};

export const MealHistory: React.FC<MealHistoryProps> = ({
  meals,
  onDeleteMeal,
  onOpenSnapModal,
}) => {
  const formatTime = (isoString?: string) => {
    if (!isoString) return "Today";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Today";
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5F5F0] tracking-tight">
              Culinary Diary & Meal History
            </h3>
            <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059]">
              Visual Log
            </span>
          </div>
          <p className="text-xs text-[#888888]">
            Macronutrient breakdown, portion volumes & glycemic ratings
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-[#888888] px-3 py-1 rounded-full bg-[#141414] border border-[#2A2A2A]">
          {meals.length} {meals.length === 1 ? "Dish" : "Dishes"} Logged
        </span>
      </div>

      {meals.length === 0 ? (
        <div className="rounded-3xl p-10 text-center border border-[#2A2A2A] bg-[#141414]">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center text-[#888888]">
            <Utensils className="w-6 h-6 text-[#C5A059]" />
          </div>
          <h4 className="text-base font-serif font-bold text-[#F5F5F0] mb-1">No culinary entries recorded today</h4>
          <p className="text-xs text-[#888888] max-w-sm mx-auto mb-5 leading-relaxed font-sans">
            Take a quick snap with the in-app live camera. The Vision AI engine will deconstruct ingredients, portion sizes, and macros instantly.
          </p>
          <button
            onClick={onOpenSnapModal}
            className="btn-pill-gold inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold shadow-gold-glow"
          >
            <Camera className="w-4 h-4" />
            <span>Snap Your First Dish</span>
          </button>
        </div>
      ) : (
        /* Staggered container for cascading animation */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AnimatePresence>
            {meals.map((meal) => (
              <motion.div
                key={meal.id}
                layout
                variants={itemVariants}
                className="rounded-3xl p-4.5 border border-[#2A2A2A] hover:border-[#383838] bg-[#141414] flex flex-col justify-between relative group transition-colors shadow-subtle"
              >
                <div className="flex gap-4">
                  {/* Thumbnail / Food visual badge */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#0A0A0A] flex-shrink-0 border border-[#2A2A2A] relative">
                    {meal.image_url ? (
                      <img
                        src={meal.image_url}
                        alt={meal.food_summary}
                        className="w-full h-full object-cover transition-opacity group-hover:opacity-95"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#0A0A0A]">
                        <Utensils className="w-6 h-6 text-[#C5A059]" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#0A0A0A] text-[#F5F5F0] border border-[#2A2A2A]">
                      {Math.round(meal.calories)} cal
                    </span>
                  </div>

                  {/* Meal Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-serif font-bold text-[#F5F5F0] truncate group-hover:text-[#C5A059] transition-colors">
                        {meal.food_summary}
                      </h4>
                      <button
                        onClick={() => onDeleteMeal(meal.id)}
                        title="Delete entry"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-950/20 text-[#888888] hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#888888] my-1">
                      <Clock className="w-3 h-3 text-[#888888]" />
                      <span>{formatTime(meal.timestamp)}</span>
                      {meal.cooking_method && (
                        <>
                          <span>&bull;</span>
                          <span className="truncate max-w-[150px] text-[#888888]">
                            {meal.cooking_method}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Regional / identified dishes */}
                    {meal.food_items && meal.food_items.length > 0 && (
                      <p className="text-[11px] text-[#888888] truncate mb-2">
                        {meal.food_items.join(" • ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Macro Pills in Michelin Palette (Champagne Gold P, Sage Green C, Warm Taupe F) */}
                <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2.5 border-t border-[#2A2A2A]">
                  {/* Protein */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#0A0A0A] text-[#C5A059] border border-[#2A2A2A]">
                    P: {Math.round(meal.protein)}g
                  </span>

                  {/* Carbs */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#0A0A0A] text-[#78866B] border border-[#2A2A2A]">
                    C: {Math.round(meal.carbs)}g
                  </span>

                  {/* Fats */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#0A0A0A] text-[#B58A55] border border-[#2A2A2A]">
                    F: {Math.round(meal.fats)}g
                  </span>

                  {/* Dietary Fiber & Net Carbs (if recorded) */}
                  {Number(meal.fiber_g) > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#0A0A0A] text-[#78866B] border border-[#2A2A2A]">
                      Fiber: {Math.round(meal.fiber_g!)}g
                    </span>
                  )}
                  {Number(meal.carbs) > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#0A0A0A] text-[#A3B899] border border-[#2A2A2A]">
                      Net C: {Math.round(meal.net_carbs ?? Math.max(0, meal.carbs - (meal.fiber_g || 0)))}g
                    </span>
                  )}

                  {/* Sodium (if recorded) */}
                  {Number(meal.sodium_mg) > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#0A0A0A] text-[#38BDF8] border border-[#2A2A2A]">
                      Na: {Math.round(meal.sodium_mg!)}mg
                    </span>
                  )}

                  {/* Glycemic Impact Pill */}
                  {(meal.glycemic_impact || meal.glycemic_index_rating) && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                        String(meal.glycemic_impact || meal.glycemic_index_rating).toLowerCase().includes("high")
                          ? "bg-[#9E4747]/15 text-[#9E4747] border-[#9E4747]/30"
                          : String(meal.glycemic_impact || meal.glycemic_index_rating).toLowerCase().includes("med")
                          ? "bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/30"
                          : "bg-[#78866B]/15 text-[#78866B] border-[#78866B]/30"
                      }`}
                    >
                      <Activity className="w-2.5 h-2.5" />
                      {meal.glycemic_impact || meal.glycemic_index_rating} GI
                    </span>
                  )}
                </div>

                {/* Hidden Cooking Fat Warnings */}
                {meal.hidden_fat_warnings && meal.hidden_fat_warnings.length > 0 && (
                  <div className="mt-2.5 p-2 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-medium text-[#C5A059]">
                      <AlertTriangle className="w-3 h-3 text-[#C5A059]" />
                      <span>Lipid & Cooking Oil Audit</span>
                    </div>
                    {meal.hidden_fat_warnings.map((warn, wIdx) => (
                      <p key={wIdx} className="text-[10px] text-[#888888] pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[#C5A059]">
                        {warn}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
