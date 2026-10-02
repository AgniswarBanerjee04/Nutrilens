import React, { useState, useMemo } from "react";
import {
  Activity,
  Layers,
  AlertTriangle,
  Moon,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { Meal } from "../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EnergyCurveChartProps {
  meals: Meal[];
  sleepHours?: number;
}

// 4-Hour Timeline Milestones (9 sample points from 0 to 240 mins)
const TIME_LABELS = [
  "0m",
  "30m",
  "60m (1h)",
  "90m",
  "120m (2h)",
  "150m",
  "180m (3h)",
  "210m",
  "240m (4h)",
];

const HIGH_SUGAR_CURVE = [100, 175, 195, 140, 72, 85, 95, 98, 100];
const LOW_FIBER_CURVE = [100, 115, 125, 128, 120, 114, 106, 102, 100];

export const EnergyCurveChart: React.FC<EnergyCurveChartProps> = ({ meals, sleepHours }) => {
  const [selectedMealId, setSelectedMealId] = useState<string | number | "compare">("latest");
  const [showComparison, setShowComparison] = useState<boolean>(false);

  const isSleepDeprived = sleepHours !== undefined && sleepHours < 6.0;

  // Active meal resolution
  const activeMeal: Meal | null = useMemo(() => {
    if (!meals || meals.length === 0) return null;
    if (selectedMealId === "latest" || selectedMealId === "compare") {
      return meals[0];
    }
    return meals.find((m) => String(m.id) === String(selectedMealId)) || meals[0];
  }, [meals, selectedMealId]);

  const giRating = activeMeal?.glycemic_index_rating || activeMeal?.glycemic_impact || "Low";
  const hiddenFat = activeMeal?.hidden_fat_estimate_g || 0;
  const carbs = activeMeal?.carbs || 0;
  const fiber = activeMeal?.fiber_g || 0;
  const netCarbs = activeMeal?.net_carbs ?? Math.max(0, carbs - fiber);
  const fiberCarbRatio = carbs > 0 ? (fiber / carbs) : (fiber > 0 ? 1 : 0);
  const isHighFiberRatio = fiberCarbRatio >= 0.20 || fiber >= 8;
  const isRefinedLowFiber = (carbs >= 30 && fiberCarbRatio < 0.10) || (giRating === "High" && fiberCarbRatio < 0.15);

  // Synthesize realistic blood glucose trajectory
  const activeMealCurve = useMemo(() => {
    if (!activeMeal) {
      const defaultCurve = [100, 115, 125, 120, 110, 105, 100, 98, 100];
      if (isSleepDeprived) {
        return defaultCurve.map((v, i) => i === 0 ? v : Math.round(100 + (v - 100) * 1.25));
      }
      return defaultCurve;
    }

    const fatDamping = Math.min(12, hiddenFat * 1.2);
    let baseCurve: number[];

    if (isHighFiberRatio) {
      // High Fiber-to-Carb ratio: Viscous fiber gel blunts glucose absorption, flattening the curve
      baseCurve = [
        100,
        Math.round(108 - fatDamping * 0.2),
        Math.round(116 - fatDamping * 0.25),
        Math.round(119 - fatDamping * 0.2),
        Math.round(115 - fatDamping * 0.15),
        Math.round(110),
        106,
        102,
        100,
      ];
    } else if (isRefinedLowFiber) {
      // High in refined carbs & low in fiber: Sharp spike and subsequent reactive hypoglycemic crash
      baseCurve = [
        100,
        Math.round(168 - fatDamping * 0.4),
        Math.round(188 - fatDamping * 0.5),
        Math.round(144 - fatDamping * 0.3),
        Math.max(65, Math.round(72 + fatDamping * 0.4)),
        Math.round(84),
        94,
        98,
        100,
      ];
    } else if (giRating === "High") {
      baseCurve = [
        100,
        Math.round(152 - fatDamping * 0.4),
        Math.round(175 - fatDamping * 0.5),
        Math.round(138 - fatDamping * 0.3),
        Math.max(70, Math.round(78 + fatDamping * 0.4)),
        Math.round(88),
        96,
        99,
        100,
      ];
    } else if (giRating === "Medium") {
      baseCurve = [
        100,
        Math.round(124 - fatDamping * 0.3),
        Math.round(138 - fatDamping * 0.35),
        Math.round(130 - fatDamping * 0.25),
        Math.round(118),
        Math.round(110),
        104,
        101,
        100,
      ];
    } else {
      baseCurve = [
        100,
        Math.round(112 - fatDamping * 0.2),
        Math.round(122 - fatDamping * 0.25),
        Math.round(125 - fatDamping * 0.2),
        Math.round(118),
        Math.round(112),
        106,
        102,
        100,
      ];
    }

    // Acute Insulin Resistance shift: Sleep deficit (< 6h) elevates glycemic peak by ~18% and delays clearance
    if (isSleepDeprived) {
      return baseCurve.map((val, idx) => {
        if (idx === 0) return val;
        const delta = val - 100;
        if (delta > 0) {
          return Math.round(100 + delta * 1.22);
        } else {
          return Math.max(58, Math.round(val - 8));
        }
      });
    }

    return baseCurve;
  }, [activeMeal, isHighFiberRatio, isRefinedLowFiber, giRating, hiddenFat, isSleepDeprived]);

  // Theme styling based on Clinical Fiber & Glycemic Classification (Michelin Minimalist palette)
  const theme = useMemo(() => {
    if (isHighFiberRatio) {
      return {
        lineColor: "#78866B", // Muted Sage Green
        gradientStart: "rgba(120, 134, 107, 0.25)",
        gradientEnd: "rgba(120, 134, 107, 0.0)",
        statusBadgeBg: "bg-[#78866B]/15 text-[#78866B] border-[#78866B]/30",
        spikeTime: "Buffered Plateau (~116 mg/dL)",
        crashTime: "Zero Post-Prandial Crash",
        verdict: "Fiber-Flattened Glycemic Plateau",
        summary: `High dietary fiber-to-carb ratio (${(fiberCarbRatio * 100).toFixed(0)}%) forms a viscous gel matrix, flattening systemic glucose absorption and maintaining sustained mitochondrial energy.`,
      };
    }
    if (isRefinedLowFiber || giRating === "High") {
      return {
        lineColor: "#9E4747", // Muted Wine
        gradientStart: "rgba(158, 71, 71, 0.25)",
        gradientEnd: "rgba(158, 71, 71, 0.0)",
        statusBadgeBg: "bg-[#9E4747]/15 text-[#9E4747] border-[#9E4747]/30",
        spikeTime: "Sharp Spike @ T+45-60m (~188 mg/dL)",
        crashTime: "Reactive Hypoglycemic Drop @ T+120m (~72 mg/dL)",
        verdict: "Refined Carb Surge & Reactive Crash",
        summary: `High refined carbohydrate density with low dietary fiber (<${Math.max(1, Math.round(fiberCarbRatio * 100))}% ratio) triggers a rapid glucose surge followed by an insulin over-correction and energy drop.`,
      };
    }
    if (giRating === "Medium") {
      return {
        lineColor: "#C5A059", // Soft Champagne Gold
        gradientStart: "rgba(197, 160, 89, 0.22)",
        gradientEnd: "rgba(197, 160, 89, 0.0)",
        statusBadgeBg: "bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/30",
        spikeTime: "Gradual Peak @ T+60m (~138 mg/dL)",
        crashTime: "Gradual Normalization",
        verdict: "Balanced Glycemic Distribution",
        summary: "Balanced macronutrient distribution with moderate fiber. Controlled insulin demand with steady cellular energy.",
      };
    }
    return {
      lineColor: "#78866B", // Soft Sage Green
      gradientStart: "rgba(120, 134, 107, 0.22)",
      gradientEnd: "rgba(120, 134, 107, 0.0)",
      statusBadgeBg: "bg-[#78866B]/15 text-[#78866B] border-[#78866B]/30",
      spikeTime: "Minimal Rise @ T+60m (~122 mg/dL)",
      crashTime: "Steady Normoglycemia",
      verdict: "Optimal Metabolic Plateau",
      summary: "Complex whole food composition with cellular integrity maintains flat blood glucose across the 4-hour window.",
    };
  }, [isHighFiberRatio, isRefinedLowFiber, fiberCarbRatio, giRating]);

  // Chart configuration
  const chartData: ChartData<"line"> = useMemo(() => {
    const datasets = [
      {
        label: `${activeMeal ? activeMeal.food_summary : "Analyzed Meal"} (${giRating} GI)`,
        data: activeMealCurve,
        borderColor: theme.lineColor,
        backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 260);
          gradient.addColorStop(0, theme.gradientStart);
          gradient.addColorStop(1, theme.gradientEnd);
          return gradient;
        },
        borderWidth: 2,
        pointBackgroundColor: theme.lineColor,
        pointBorderColor: "#0A0A0A",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: true,
      },
    ];

    if (showComparison) {
      datasets.push(
        {
          label: "Benchmark: High GI Spike",
          data: HIGH_SUGAR_CURVE,
          borderColor: "rgba(158, 71, 71, 0.6)",
          backgroundColor: "transparent",
          borderWidth: 1.5,
          pointBackgroundColor: "#9E4747",
          pointBorderColor: "#0A0A0A",
          pointBorderWidth: 1,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.35,
          fill: false,
        } as unknown as (typeof datasets)[0],
        {
          label: "Benchmark: Low GI Sustained",
          data: LOW_FIBER_CURVE,
          borderColor: "rgba(197, 160, 89, 0.6)",
          backgroundColor: "transparent",
          borderWidth: 1.5,
          pointBackgroundColor: "#C5A059",
          pointBorderColor: "#0A0A0A",
          pointBorderWidth: 1,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.35,
          fill: false,
        } as unknown as (typeof datasets)[0]
      );
    }

    return {
      labels: TIME_LABELS,
      datasets,
    };
  }, [activeMeal, giRating, activeMealCurve, theme, showComparison]);

  const chartOptions: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: showComparison,
          position: "top",
          labels: {
            color: "#888888",
            font: { size: 11, family: "Inter, sans-serif" },
            boxWidth: 10,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "rgba(20, 20, 20, 0.98)",
          titleColor: "#F5F5F0",
          bodyColor: "#888888",
          borderColor: "#2A2A2A",
          borderWidth: 1,
          padding: 10,
          titleFont: { size: 11, weight: "bold", family: "Playfair Display, Georgia, serif" },
          bodyFont: { size: 10, family: "Inter, sans-serif" },
          callbacks: {
            label: (context) => {
              const val = Number(context.parsed.y);
              const delta = Math.round(val - 100);
              const deltaStr = delta >= 0 ? `+${delta}%` : `${delta}%`;
              return ` ${context.dataset.label}: ${val}% (${deltaStr} from baseline)`;
            },
            afterBody: (tooltipItems) => {
              const index = tooltipItems[0]?.dataIndex;
              if (index === 1 || index === 2) {
                return "\n• Post-prandial absorption & glucose release";
              }
              if (index === 4 && giRating === "High") {
                return "\n• Reactive glycemic dip";
              }
              if (index >= 4 && giRating === "Low") {
                return "\n• Sustained cellular energy delivery";
              }
              return "";
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(42, 42, 42, 0.6)",
          },
          ticks: {
            color: "#888888",
            font: { size: 10, family: "Inter, sans-serif" },
          },
        },
        y: {
          min: 50,
          max: 220,
          grid: {
            color: "rgba(42, 42, 42, 0.6)",
          },
          ticks: {
            color: "#888888",
            stepSize: 40,
            callback: (val) => `${val}%`,
            font: { size: 10, family: "Inter, sans-serif" },
          },
        },
      },
    }),
    [showComparison, giRating]
  );

  return (
    <div className="rounded-3xl p-6 sm:p-7 border border-[#2A2A2A] bg-[#141414] shadow-subtle space-y-6">
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5F5F0] tracking-tight">
              Post-Prandial Glycemic & Energy Curve
            </h3>
            <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#78866B]/15 border border-[#78866B]/30 text-[#78866B]">
              4-Hour Projection
            </span>
            {isSleepDeprived && (
              <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#9E4747]/20 border border-[#9E4747]/40 text-[#DFBE7A] flex items-center gap-1 font-mono">
                <Moon className="w-3 h-3" />
                <span>Sleep Debt Active</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#888888] font-sans">
            Simulated metabolic trajectory based on nutrient density, cooking technique, and circadian recovery.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {meals && meals.length > 1 && (
            <select
              value={selectedMealId}
              onChange={(e) => setSelectedMealId(e.target.value)}
              className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-[#2A2A2A] bg-[#0A0A0A] text-[#F5F5F0] cursor-pointer hover:border-[#C5A059] transition-colors"
            >
              <option value="latest" className="bg-[#141414] text-[#F5F5F0]">Latest Dish</option>
              {meals.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#141414] text-[#F5F5F0]">
                  {m.food_summary.slice(0, 24)}...
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowComparison((prev) => !prev)}
            className={`btn-pill-outline flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium transition-colors ${
              showComparison
                ? "border-[#C5A059] text-[#C5A059]"
                : "border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {showComparison ? "Hide Benchmarks" : "Compare Benchmarks"}
          </button>
        </div>
      </div>

      {/* High Insulin Resistance / Cravings Risk Warning Banner */}
      {isSleepDeprived && (
        <div className="p-4 rounded-2xl bg-[#9E4747]/15 border border-[#9E4747]/40 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#9E4747]/25 border border-[#9E4747]/50 flex items-center justify-center shrink-0 mt-0.5 text-[#DFBE7A]">
            <AlertTriangle className="w-4 h-4 text-[#DFBE7A]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F5F5F0]">
                High Insulin Resistance / Cravings Risk Detected
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold bg-[#9E4747]/30 text-[#DFBE7A]">
                Sleep Debt Warning
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#888888] mt-1 font-sans leading-relaxed">
              Logged sleep duration is under 6 hours ({sleepHours?.toFixed(1)}h). Nocturnal sleep debt downregulates peripheral GLUT-4 glucose transporters by ~25-30% and elevates daytime ghrelin. Post-prandial glycemic peaks will be amplified (+18%) and delayed, triggering intense afternoon sugar/carb cravings.
            </p>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="w-full h-64 sm:h-72">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Deconstruction Insights Grid - Spacious 2x2 Layout with p-6 internal padding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#2A2A2A]">
        {/* Status / Glycemic Classification */}
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex flex-col justify-between hover:border-[#C5A059]/30 transition-colors">
          <div>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium block mb-2">
              Glycemic Impact
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059] font-mono leading-tight">
              {isSleepDeprived ? "Elevated Risk" : isHighFiberRatio ? "Buffered Flat" : isRefinedLowFiber ? "Rapid Surge" : `${giRating} Impact`}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#2A2A2A]/50">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase border mb-1.5 ${
              isSleepDeprived ? "bg-[#9E4747]/15 text-[#DFBE7A] border-[#9E4747]/30" : theme.statusBadgeBg
            }`}>
              {isSleepDeprived ? "Insulin Resistance Alert" : isHighFiberRatio ? "Fiber-Buffered Matrix" : isRefinedLowFiber ? "Refined Carbohydrate" : `${giRating} Glycemic Profile`}
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              {isSleepDeprived
                ? `Sleep deficit (${sleepHours?.toFixed(1)}h) downregulates peripheral GLUT-4 transporters, amplifying post-prandial glycemic surge.`
                : theme.summary}
            </p>
          </div>
        </div>

        {/* Clinical Fiber & Net Carbs Buffer */}
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex flex-col justify-between hover:border-[#C5A059]/30 transition-colors">
          <div>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium block mb-2">
              Fiber Buffer
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059] font-mono leading-tight">
              {fiber}g <span className="text-base font-sans font-normal text-neutral-400">Fiber</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#2A2A2A]/50">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-400 font-mono">{netCarbs}g Net Carbohydrates</span>
              <span className="font-mono text-[#78866B] font-bold">{(fiberCarbRatio * 100).toFixed(0)}% Ratio</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {isHighFiberRatio
                ? "✓ Viscous cellular gel matrix slows enzymatic digestion and blunts systemic blood glucose elevation."
                : isRefinedLowFiber
                ? "⚠ Sub-threshold fiber concentration triggers accelerated enzymatic breakdown and rapid glucose surge."
                : "Moderate dietary fiber provides baseline post-prandial glycemic cushioning."}
            </p>
          </div>
        </div>

        {/* Absorption Milestones / Peak Velocity */}
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex flex-col justify-between hover:border-[#C5A059]/30 transition-colors">
          <div>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium block mb-2">
              Absorption Timing
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059] font-mono leading-tight">
              T+45-60m <span className="text-base font-sans font-normal text-neutral-400">Peak</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#2A2A2A]/50 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Peak Milestone:</span>
              <span className="font-medium text-[#F5F5F0]">{theme.spikeTime}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Resolution Phase:</span>
              <span className="text-neutral-400">{theme.crashTime}</span>
            </div>
          </div>
        </div>

        {/* Lipid Cushioning */}
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex flex-col justify-between hover:border-[#C5A059]/30 transition-colors">
          <div>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium block mb-2">
              Lipid Cushioning
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059] font-mono leading-tight">
              {hiddenFat > 0 ? `${hiddenFat}g` : "0g"} <span className="text-base font-sans font-normal text-neutral-400">Lipids</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#2A2A2A]/50">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-400">{hiddenFat > 0 ? "Tempered preparation lipids" : "Minimal oil formulation"}</span>
              <span className="font-mono text-neutral-400">{hiddenFat >= 6 ? "Delayed Transit" : "Standard Transit"}</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {hiddenFat >= 6
                ? "Lipid emulsion delays gastric emptying, prolonging stable mitochondrial energy release."
                : "Controlled fat proportion promotes rapid gastric clearance with sustained satiety."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
