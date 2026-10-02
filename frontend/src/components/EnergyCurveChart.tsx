import React, { useState, useMemo } from "react";
import {
  Activity,
  Zap,
  Droplet,
  Layers,
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

export const EnergyCurveChart: React.FC<EnergyCurveChartProps> = ({ meals }) => {
  const [selectedMealId, setSelectedMealId] = useState<string | number | "compare">("latest");
  const [showComparison, setShowComparison] = useState<boolean>(false);

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
      return [100, 115, 125, 120, 110, 105, 100, 98, 100];
    }

    const fatDamping = Math.min(12, hiddenFat * 1.2);

    if (isHighFiberRatio) {
      // High Fiber-to-Carb ratio: Viscous fiber gel blunts glucose absorption, flattening the curve
      return [
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
      return [
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
      return [
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
      return [
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
      return [
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
  }, [activeMeal, isHighFiberRatio, isRefinedLowFiber, giRating, hiddenFat]);

  // Synthetic benchmark curves
  const highSugarCurve = [100, 175, 195, 140, 72, 85, 95, 98, 100];
  const lowFiberCurve = [100, 115, 125, 128, 120, 114, 106, 102, 100];

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
          data: highSugarCurve,
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
          data: lowFiberCurve,
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
  }, [activeMeal, giRating, activeMealCurve, theme, showComparison, highSugarCurve, lowFiberCurve]);

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
          </div>
          <p className="text-xs text-[#888888] font-sans">
            Simulated metabolic trajectory based on nutrient density and cooking technique.
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

      {/* Chart Canvas Area */}
      <div className="w-full h-64 sm:h-72">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Deconstruction Insights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#2A2A2A]">
        {/* Status / Verdict Card */}
        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase border ${theme.statusBadgeBg}`}>
              {isHighFiberRatio ? "Fiber-Buffered" : isRefinedLowFiber ? "Refined Carb" : `${giRating} GI`}
            </span>
          </div>
          <p className="text-xs font-serif font-bold text-[#F5F5F0] truncate">{theme.verdict}</p>
          <p className="text-[11px] text-[#888888] leading-relaxed font-sans mt-1 line-clamp-2">{theme.summary}</p>
        </div>

        {/* Clinical Fiber & Net Carbs Buffer */}
        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <span className="text-[10px] uppercase font-medium text-[#888888] block mb-1">Fiber-to-Carb Ratio</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#78866B]/15 text-[#78866B] flex items-center justify-center font-mono font-bold text-xs">
              {(fiberCarbRatio * 100).toFixed(0)}%
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-[#F5F5F0]">
                {fiber}g Fiber <span className="text-[#888888] font-normal">/ {netCarbs}g Net C</span>
              </p>
              <p className="text-[10px] text-[#78866B]">
                {isHighFiberRatio ? "✓ Flattens Glucose Curve" : isRefinedLowFiber ? "⚠ Low Fiber (Spike Risk)" : "Moderate buffer"}
              </p>
            </div>
          </div>
        </div>

        {/* Metabolic Milestones */}
        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <span className="text-[10px] uppercase font-medium text-[#888888] block mb-1">Absorption Timing</span>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#C5A059]" />
            <div>
              <p className="text-xs font-medium text-[#F5F5F0] truncate">{theme.spikeTime}</p>
              <p className="text-[10px] text-[#888888]">{theme.crashTime}</p>
            </div>
          </div>
        </div>

        {/* Fat Cushioning */}
        <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <span className="text-[10px] uppercase font-medium text-[#888888] block mb-1">Lipid Cushioning</span>
          <div className="flex items-center gap-2">
            <Droplet className="w-3.5 h-3.5 text-[#B58A55]" />
            <div>
              <p className="text-xs font-medium text-[#F5F5F0]">
                {hiddenFat > 0 ? `~${hiddenFat}g Cooking Fats` : "Minimal Cooking Fat"}
              </p>
              <p className="text-[10px] text-[#888888]">
                {hiddenFat >= 6 ? "Delays gastric transit" : "Standard gastric transit"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
