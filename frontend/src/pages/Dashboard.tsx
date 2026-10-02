import React, { useState, useEffect } from "react";
import { Camera, Calendar, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { MacroProgress } from "../components/MacroProgress";
import { EnergyCurveChart } from "../components/EnergyCurveChart";
import { DeepSleepWidget } from "../components/DeepSleepWidget";
import { MacroBalancerCard } from "../components/MacroBalancerCard";
import { MealHistory } from "../components/MealHistory";
import { SnapMealModal } from "../components/SnapMealModal";
import { CameraModal } from "../components/CameraModal";
import { GoalModal } from "../components/GoalModal";
import { AICoachDrawer, AICoachFAB } from "../components/AICoachDrawer";
import { PricingModal } from "../components/PricingModal";
import { TierUnlockCelebration } from "../components/TierUnlockCelebration";
import { SleepTrackingModal } from "../components/SleepTrackingModal";
import { BottomNav } from "../components/BottomNav";
import { getMeals, createMeal, deleteMeal, getUserGoals, saveUserGoals } from "../services/mealService";
import { getSleepData, saveSleepData, getDefaultSleepData } from "../services/sleepService";
import type { Meal, UserGoals, SleepData } from "../types";

interface DashboardProps {
  onOpenSettings?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenSettings }) => {
  const {
    user,
    isPricingModalOpen,
    pricingModalInfo,
    openPricingModal,
    closePricingModal,
    justUpgradedTier,
    clearJustUpgradedTier,
  } = useAuth();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<UserGoals>({
    target_calories: 2200,
    target_protein: 160,
    target_carbs: 210,
    target_fats: 65,
  });
  const [sleepData, setSleepData] = useState<SleepData>(() =>
    user ? getSleepData(user.id) : getDefaultSleepData()
  );
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCoachDrawerOpen, setIsCoachDrawerOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [, setLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const [fetchedMeals, fetchedGoals] = await Promise.all([
          getMeals(user.id),
          getUserGoals(user.id),
        ]);
        setMeals(fetchedMeals);
        setGoals(fetchedGoals);
        setSleepData(getSleepData(user.id));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSaveSleep = (data: Partial<SleepData>) => {
    if (!user) return;
    const updated = saveSleepData(user.id, data);
    setSleepData(updated);
  };

  // Aggregate consumed macros including clinical metabolic metrics
  const consumed = meals.reduce(
    (acc, m) => {
      acc.calories += Number(m.calories) || 0;
      acc.protein += Number(m.protein) || 0;
      acc.carbs += Number(m.carbs) || 0;
      acc.fats += Number(m.fats) || 0;
      acc.fiber += Number(m.fiber_g) || 0;
      acc.sodium += Number(m.sodium_mg) || 0;
      const netC = m.net_carbs !== undefined && m.net_carbs !== null
        ? Number(m.net_carbs)
        : Math.max(0, (Number(m.carbs) || 0) - (Number(m.fiber_g) || 0));
      acc.net_carbs += netC;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sodium: 0, net_carbs: 0 }
  );

  const lastMealTimestamp = meals.length > 0 ? meals[0].timestamp : null;

  const handleMealLogged = async (newMealData: Omit<Meal, "id">) => {
    if (!user) return;
    try {
      const saved = await createMeal(newMealData, user.id);
      setMeals((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Failed to save meal:", err);
    }
  };

  const handleDeleteMeal = async (mealId: string | number) => {
    if (!user) return;
    try {
      await deleteMeal(mealId, user.id);
      setMeals((prev) => prev.filter((m) => String(m.id) !== String(mealId)));
    } catch (err) {
      console.error("Failed to delete meal:", err);
    }
  };

  const handleSaveGoals = async (updatedGoals: UserGoals) => {
    if (!user) return;
    try {
      const saved = await saveUserGoals(updatedGoals, user.id);
      setGoals(saved);
    } catch (err) {
      console.error("Failed to save goals:", err);
    }
  };

  // Today formatted
  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#888888] flex flex-col selection:bg-[#C5A059] selection:text-[#0A0A0A]">
      {/* Top Navbar in Michelin Minimalist Palette */}
      <Navbar
        onOpenSnapModal={() => setIsCameraModalOpen(true)}
        onOpenGoalsModal={() => setIsGoalModalOpen(true)}
        onOpenSettings={onOpenSettings}
        onOpenSleepModal={() => setIsSleepModalOpen(true)}
        onOpenAICoach={() => setIsCoachDrawerOpen(true)}
        lastMealTimestamp={lastMealTimestamp}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-8">
        {/* Hero Greeting and Snap Call-to-action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#888888] mb-1 font-sans">
              <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{todayStr}</span>
              <span>&bull;</span>
              <span className="text-[#78866B] font-mono">Michelin Wellness Protocol</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F0] tracking-tight">
              Welcome, <span className="text-[#C5A059]">{user?.name || "Patron"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] mt-1 max-w-xl font-sans leading-relaxed">
              Refined nutritional deconstruction. Snap haute cuisine, plated dishes, and whole foods for instantaneous macro analytics and glycemic impact.
            </p>
          </div>

          {/* Prominent Snap Meal Button with Pill Shape & Champagne Gold Fade */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCameraModalOpen(true)}
              className="btn-pill-gold px-6 py-3.5 flex items-center gap-3 text-xs sm:text-sm font-semibold shadow-gold-glow"
            >
              <div className="w-7 h-7 rounded-full bg-[#0A0A0A] flex items-center justify-center text-[#C5A059]">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-xs sm:text-sm font-serif font-bold text-[#0A0A0A] block tracking-wide">
                  Snap Meal Photo
                </span>
                <span className="text-[10px] text-[#0A0A0A]/80 font-sans flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-[#0A0A0A]" />
                  Launch Live Camera
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Macro Progress Visualization Engine in Michelin Palette */}
        <MacroProgress
          consumed={consumed}
          goals={goals}
          lastMealTimestamp={lastMealTimestamp}
        />

        {/* Premium Feature: Deep Sleep & Autophagy Tracker (Tier 2+) */}
        <DeepSleepWidget
          sleepData={sleepData}
          onSaveSleep={handleSaveSleep}
          onOpenPricingModal={() => openPricingModal(2, "Deep Sleep & Autophagy Protocol")}
        />

        {/* 4-Hour Post-Meal Metabolic Energy Curve (Line Chart) with Sleep-Debt Sensitivity */}
        <EnergyCurveChart meals={meals} sleepHours={sleepData.hours_slept} />

        {/* AI Macro-Balancer Engine */}
        {user && (
          <MacroBalancerCard
            userId={user.id}
            consumed={consumed}
            goals={goals}
            onLogMeal={handleMealLogged}
          />
        )}

        {/* Staggered Cascading Meal History Feed */}
        <MealHistory
          meals={meals}
          onDeleteMeal={handleDeleteMeal}
          onOpenSnapModal={() => setIsCameraModalOpen(true)}
        />
      </main>

      {/* Sleek Glassmorphism Mobile Bottom Navigation Bar (Home, Sleep, Snap FAB, AI Coach) */}
      <BottomNav
        onOpenSnapModal={() => setIsCameraModalOpen(true)}
        onOpenSleepModal={() => setIsSleepModalOpen(true)}
        onOpenAICoach={() => setIsCoachDrawerOpen(true)}
      />

      {/* Premium Feature: AI Personal Food Trainer FAB (Tier 1+) */}
      <AICoachFAB onOpen={() => setIsCoachDrawerOpen(true)} />

      {/* AI Personal Food Trainer Slide-Out Drawer */}
      <AICoachDrawer
        isOpen={isCoachDrawerOpen}
        onClose={() => setIsCoachDrawerOpen(false)}
        meals={meals}
        sleepData={sleepData}
      />

      {/* Tier Selection & Simulated Upgrade Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={closePricingModal}
        targetTier={pricingModalInfo.targetTier}
        featureName={pricingModalInfo.featureName}
      />

      {/* Framer Motion Tier Upgrade Pulse Animation */}
      <TierUnlockCelebration
        tier={justUpgradedTier}
        onClose={clearJustUpgradedTier}
      />

      {/* Deep Sleep Telemetry Modal */}
      <SleepTrackingModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        sleepData={sleepData}
        onSaveSleep={handleSaveSleep}
      />

      {/* In-App Live Camera Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(file) => {
          setCapturedFile(file);
          setIsCameraModalOpen(false);
          setIsSnapModalOpen(true);
        }}
      />

      {/* Meal Analysis & Adjustment Modal */}
      <SnapMealModal
        isOpen={isSnapModalOpen}
        onClose={() => {
          setIsSnapModalOpen(false);
          setCapturedFile(null);
        }}
        onMealLogged={handleMealLogged}
        initialFile={capturedFile}
        onOpenLiveCamera={() => {
          setIsSnapModalOpen(false);
          setIsCameraModalOpen(true);
        }}
      />

      {/* Goals Calibration Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoals={goals}
        onSaveGoals={handleSaveGoals}
      />
    </div>
  );
};
