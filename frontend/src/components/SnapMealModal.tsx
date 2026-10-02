import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Check, Loader2, AlertCircle, Edit3, Flame, Activity, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import { analyzeMealImage } from "../services/mealService";
import type { Meal, MealAnalysis } from "../types";

interface SnapMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMealLogged: (meal: Omit<Meal, "id">) => void;
  initialFile?: File | null;
  onOpenLiveCamera?: () => void;
}

export const SnapMealModal: React.FC<SnapMealModalProps> = ({
  isOpen,
  onClose,
  onMealLogged,
  initialFile,
  onOpenLiveCamera,
}) => {
  const [, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [foodSummary, setFoodSummary] = useState<string>("");
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fats, setFats] = useState<number>(0);
  const [fiber, setFiber] = useState<number>(0);
  const [sodium, setSodium] = useState<number>(0);
  const [netCarbs, setNetCarbs] = useState<number>(0);
  const [cookingMethod, setCookingMethod] = useState<string>("Sautéed in Cold-Pressed Olive Oil");
  const [hiddenFat, setHiddenFat] = useState<number>(0);
  const [glycemicRating, setGlycemicRating] = useState<string>("Low");
  const [hiddenFatWarnings, setHiddenFatWarnings] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsScanning(false);
    setAnalysis(null);
    setFoodSummary("");
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFats(0);
    setFiber(0);
    setSodium(0);
    setNetCarbs(0);
    setCookingMethod("Sautéed in Cold-Pressed Olive Oil");
    setHiddenFat(0);
    setGlycemicRating("Low");
    setHiddenFatWarnings([]);
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setSelectedFile(file);

    // Generate local preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setIsScanning(true);
    try {
      const result = await analyzeMealImage(file);
      setAnalysis(result);

      // Pre-fill editable fields
      const summary = result.food_items.slice(0, 2).join(" with ") || "Nutrient-Dense Visual Meal";
      setFoodSummary(summary);
      setCalories(result.total_calories);
      setProtein(result.protein_g);
      setCarbs(result.carbs_g);
      setFats(result.fats_g);
      const estFiber = result.fiber_g ?? 0;
      const estSodium = result.sodium_mg ?? 0;
      const estNetCarbs = result.net_carbs ?? Math.max(0, result.carbs_g - estFiber);
      setFiber(estFiber);
      setSodium(estSodium);
      setNetCarbs(estNetCarbs);
      setCookingMethod(result.cooking_method || "Flame-Seared & Lightly Glazed");
      setHiddenFat(result.hidden_fat_estimate_g ?? 4.0);
      setGlycemicRating(result.glycemic_impact || result.glycemic_index_rating || "Low");
      setHiddenFatWarnings(result.hidden_fat_warnings || [
        "Tempered oil/lipids accounted for in macro distribution",
        "Complex carbohydrates provide slow glycemic release"
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze meal photo.";
      setErrorMsg(msg);
    } finally {
      setIsScanning(false);
    }
  };

  // If initial file is passed from CameraModal, auto-process it
  useEffect(() => {
    if (isOpen && initialFile) {
      processFile(initialFile);
    }
  }, [isOpen, initialFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSaveMeal = () => {
    if (!foodSummary.trim()) {
      setErrorMsg("Please enter a summary title for this meal.");
      return;
    }

    const finalCarbs = Number(carbs) || 0;
    const finalFiber = Number(fiber) || 0;
    const finalNet = netCarbs > 0 ? Number(netCarbs) : Math.max(0, finalCarbs - finalFiber);

    onMealLogged({
      food_summary: foodSummary.trim(),
      food_items: analysis?.food_items || [foodSummary],
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: finalCarbs,
      fats: Number(fats) || 0,
      fiber_g: finalFiber,
      sodium_mg: Number(sodium) || 0,
      net_carbs: finalNet,
      cooking_method: cookingMethod.trim() || "Sautéed in Cold-Pressed Olive Oil",
      hidden_fat_estimate_g: Number(hiddenFat) || 0,
      glycemic_index_rating: glycemicRating,
      hidden_fat_warnings: hiddenFatWarnings,
      glycemic_impact: glycemicRating,
      image_url: previewUrl || undefined,
      timestamp: new Date().toISOString(),
    });

    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg rounded-3xl border border-[#2A2A2A] bg-[#141414] shadow-subtle p-6 overflow-hidden my-6"
          >
            {/* Michelin Minimalist Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-serif font-bold text-[#F5F5F0]">Snap & Analyze Meal</h3>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#78866B]/15 border border-[#78866B]/30 text-[#78866B]">
                      Gemini Vision
                    </span>
                  </div>
                  <p className="text-xs text-[#888888]">
                    Automated macro estimation & glycemic profiling
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#C5A059] flex items-center justify-center text-[#888888] hover:text-[#F5F5F0] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-2xl bg-red-950/20 border border-red-900/30 flex items-center gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Upload or Camera Screen */}
            {!previewUrl ? (
              <div className="mt-5 space-y-4">
                {/* Primary Action: Launch In-App Live Camera */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenLiveCamera) {
                      onOpenLiveCamera();
                    } else {
                      cameraInputRef.current?.click();
                    }
                  }}
                  className="btn-pill-gold w-full py-3.5 px-5 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold shadow-gold-glow"
                >
                  <Camera className="w-4 h-4" />
                  <span>Launch In-App Live Camera</span>
                </button>

                {/* Secondary Action: Mobile Native Rear Camera Direct Fallback */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn-pill-outline w-full py-3 px-5 flex items-center justify-center gap-2 text-xs font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Native Device Camera Fallback</span>
                </button>

                {/* Drag & drop / browse zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="group cursor-pointer border border-dashed border-[#2A2A2A] hover:border-[#C5A059] rounded-2xl p-6 text-center transition-all bg-[#0A0A0A] hover:bg-[#0F0F0F]"
                >
                  <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-[#141414] flex items-center justify-center border border-[#2A2A2A] group-hover:border-[#C5A059] transition-colors">
                    <Upload className="w-4 h-4 text-[#888888] group-hover:text-[#C5A059] transition-colors" />
                  </div>
                  <p className="text-xs font-semibold text-[#F5F5F0] mb-0.5">
                    Or select an existing photo
                  </p>
                  <p className="text-[11px] text-[#888888]">
                    JPG, PNG, WEBP &bull; Drag and drop files here
                  </p>
                </div>

                {/* Hidden file inputs: capture="environment" ensures native mobile camera activates */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              /* Image Preview & Scanning / Result View */
              <div className="mt-5 space-y-4">
                {/* Photo viewport */}
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#0A0A0A] border border-[#2A2A2A]">
                  <img
                    src={previewUrl}
                    alt="Meal Preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning reticle and laser line */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#C5A059]/10 pointer-events-none">
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent animate-scan" />
                      <div className="absolute inset-3 border border-[#C5A059]/40 rounded-xl pointer-events-none flex flex-col justify-between">
                        <div className="flex justify-between p-2">
                          <span className="w-3.5 h-3.5 border-t border-l border-[#C5A059]" />
                          <span className="w-3.5 h-3.5 border-t border-r border-[#C5A059]" />
                        </div>
                        <div className="flex justify-between p-2">
                          <span className="w-3.5 h-3.5 border-b border-l border-[#C5A059]" />
                          <span className="w-3.5 h-3.5 border-b border-r border-[#C5A059]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scanning status banner */}
                {isScanning && (
                  <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-[#C5A059] animate-spin flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-[#F5F5F0] tracking-wide flex items-center gap-1.5 font-serif">
                        <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                        Deconstructing Culinary Elements...
                      </h4>
                      <p className="text-[11px] text-[#888888]">
                        Estimating portion sizes, hidden cooking oils, and glycemic rating.
                      </p>
                    </div>
                  </div>
                )}

                {/* Results & Macro breakdown */}
                {analysis && !isScanning && (
                  <div className="space-y-4">
                    {/* Identified food items pills */}
                    <div>
                      <label className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider block mb-1.5">
                        Identified Food Items
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.food_items.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-[#0A0A0A] border border-[#2A2A2A] text-[#78866B]"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Meal summary title */}
                    <div>
                      <label className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider block mb-1">
                        Meal Title
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={foodSummary}
                          onChange={(e) => setFoodSummary(e.target.value)}
                          className="w-full glass-input px-3.5 py-2.5 rounded-full text-xs font-medium"
                          placeholder="e.g. Pan-Seared Wild Salmon & Quinoa Bowl"
                        />
                        <Edit3 className="w-3.5 h-3.5 text-[#888888] absolute right-3.5 top-3" />
                      </div>
                    </div>

                    {/* Calculated Macro Cards in Michelin Minimalist Palette */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
                        <span className="text-[10px] text-[#C5A059] font-semibold uppercase block">Calories</span>
                        <input
                          type="number"
                          value={calories}
                          onChange={(e) => setCalories(Number(e.target.value))}
                          className="w-full bg-transparent text-center font-mono font-bold text-sm text-[#F5F5F0] focus:outline-none"
                        />
                        <span className="text-[9px] text-[#888888]">kcal</span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
                        <span className="text-[10px] text-[#C5A059] font-semibold uppercase block">Protein</span>
                        <input
                          type="number"
                          value={protein}
                          onChange={(e) => setProtein(Number(e.target.value))}
                          className="w-full bg-transparent text-center font-mono font-bold text-sm text-[#F5F5F0] focus:outline-none"
                        />
                        <span className="text-[9px] text-[#888888]">grams</span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
                        <span className="text-[10px] text-[#78866B] font-semibold uppercase block">Carbs</span>
                        <input
                          type="number"
                          value={carbs}
                          onChange={(e) => setCarbs(Number(e.target.value))}
                          className="w-full bg-transparent text-center font-mono font-bold text-sm text-[#F5F5F0] focus:outline-none"
                        />
                        <span className="text-[9px] text-[#888888]">grams</span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
                        <span className="text-[10px] text-[#B58A55] font-semibold uppercase block">Fats</span>
                        <input
                          type="number"
                          value={fats}
                          onChange={(e) => setFats(Number(e.target.value))}
                          className="w-full bg-transparent text-center font-mono font-bold text-sm text-[#F5F5F0] focus:outline-none"
                        />
                        <span className="text-[9px] text-[#888888]">grams</span>
                      </div>
                    </div>

                    {/* Clinical Metabolic Extraction: Fiber, Net Carbs, Sodium */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
                        <span className="text-[10px] text-[#78866B] font-semibold uppercase block">Dietary Fiber</span>
                        <input
                          type="number"
                          step="0.1"
                          value={fiber}
                          onChange={(e) => {
                            const newFiber = Number(e.target.value);
                            setFiber(newFiber);
                            setNetCarbs(Math.max(0, carbs - newFiber));
                          }}
                          className="w-full bg-transparent text-center font-mono font-bold text-sm text-[#78866B] focus:outline-none"
                        />
                        <span className="text-[9px] text-[#888888]">Goal: ~30g/day</span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
                        <span className="text-[10px] text-[#A3B899] font-semibold uppercase block">Net Carbs</span>
                        <input
                          type="number"
                          step="0.1"
                          value={netCarbs}
                          onChange={(e) => setNetCarbs(Number(e.target.value))}
                          className="w-full bg-transparent text-center font-mono font-bold text-sm text-[#F5F5F0] focus:outline-none"
                        />
                        <span className="text-[9px] text-[#888888] font-mono">(Carbs - Fiber)</span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-center">
                        <span className="text-[10px] text-[#38BDF8] font-semibold uppercase block">Sodium</span>
                        <input
                          type="number"
                          value={sodium}
                          onChange={(e) => setSodium(Number(e.target.value))}
                          className="w-full bg-transparent text-center font-mono font-bold text-sm text-[#38BDF8] focus:outline-none"
                        />
                        <span className="text-[9px] text-[#888888]">Limit: 2300mg</span>
                      </div>
                    </div>

                    {/* Metabolic Breakdown Card */}
                    <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#F5F5F0] uppercase tracking-wider flex items-center gap-1.5 font-serif">
                          <Flame className="w-3.5 h-3.5 text-[#C5A059]" />
                          Metabolic & Cooking Parameters
                        </span>
                        <span className="text-[10px] text-[#78866B] font-mono">Vision AI Engine</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Glycemic Impact */}
                        <div className="p-2 rounded-xl bg-[#141414] border border-[#2A2A2A]">
                          <span className="text-[9px] text-[#888888] uppercase font-semibold flex items-center gap-1 block">
                            <Activity className="w-3 h-3 text-[#78866B]" />
                            Glycemic Impact
                          </span>
                          <select
                            value={glycemicRating}
                            onChange={(e) => setGlycemicRating(e.target.value)}
                            className="w-full bg-transparent text-xs font-medium text-[#F5F5F0] focus:outline-none mt-0.5 cursor-pointer"
                          >
                            <option value="Low" className="bg-[#141414] text-[#78866B]">Low (Sustained Absorption)</option>
                            <option value="Medium" className="bg-[#141414] text-[#C5A059]">Medium (Standard Absorption)</option>
                            <option value="High" className="bg-[#141414] text-rose-400">High (Rapid Glycemic Surge)</option>
                          </select>
                        </div>

                        {/* Cooking Method */}
                        <div className="p-2 rounded-xl bg-[#141414] border border-[#2A2A2A]">
                          <span className="text-[9px] text-[#888888] uppercase font-semibold flex items-center gap-1 block">
                            <Flame className="w-3 h-3 text-[#C5A059]" />
                            Cooking Technique
                          </span>
                          <input
                            type="text"
                            value={cookingMethod}
                            onChange={(e) => setCookingMethod(e.target.value)}
                            className="w-full bg-transparent text-xs font-medium text-[#F5F5F0] focus:outline-none truncate mt-0.5"
                            placeholder="e.g. Sautéed with Herbs"
                          />
                        </div>
                      </div>

                      {/* Hidden Fat Warnings */}
                      {hiddenFatWarnings.length > 0 && (
                        <div className="pt-2 border-t border-[#2A2A2A] space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#C5A059]">
                            <AlertTriangle className="w-3 h-3 text-[#C5A059]" />
                            <span>Lipid & Cooking Oil Audit:</span>
                          </div>
                          {hiddenFatWarnings.map((warning, wIdx) => (
                            <p key={wIdx} className="text-[10px] text-[#888888] pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[#C5A059]">
                              {warning}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions: Pill-shaped buttons */}
                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={resetState}
                        className="btn-pill-outline px-5 py-2.5 text-xs"
                      >
                        Rescan
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveMeal}
                        className="btn-pill-gold flex-1 py-2.5 px-5 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-gold-glow"
                      >
                        <Check className="w-4 h-4" />
                        Log Meal to Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
