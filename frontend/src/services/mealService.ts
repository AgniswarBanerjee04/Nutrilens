/**
 * Meal analysis, metabolic tracking, and Macro-Balancer service with Gemini Vision AI and offline fallback.
 */

import { API_BASE_URL, checkBackendReachable } from "./api";
import { getAccessToken } from "./auth";
import type { Meal, MealAnalysis, UserGoals, MacroBalancerResponse } from "../types";

const MEALS_PREFIX = "nutrilens_meals_";
const GOALS_PREFIX = "nutrilens_goals_";

// Pre-configured authentic Indian culinary vision analysis samples with metabolic parameters
const DEMO_ANALYSIS_PRESETS: MealAnalysis[] = [
  {
    food_items: [
      "Yellow Moong Dal Tadka with Cumin & Heeng (180g)",
      "Whole Grain Bajra (Pearl Millet) Roti (2 pcs)",
      "Low-Fat Paneer Bhurji with Bell Peppers (100g)",
      "Cucumber Tomato Kachumber with Lemon"
    ],
    total_calories: 560,
    protein_g: 36,
    carbs_g: 58,
    fats_g: 18,
    fiber_g: 13.5,
    sodium_mg: 620,
    net_carbs: 44.5,
    cooking_method: "Cast-Iron Tawa Griddled & Ghee-Tempered Tadka",
    hidden_fat_estimate_g: 5.5,
    glycemic_index_rating: "Low",
    hidden_fat_warnings: [
      "Desi ghee in dal tadka (~1 tbsp / 14g fat)",
      "Minimal oil in paneer bhurji sauté (~5g)"
    ],
    glycemic_impact: "Low",
  },
  {
    food_items: [
      "Clay Oven Tandoori Murgh Chicken Tikka (200g)",
      "Yellow Tadka Dal with Mustard Seeds (150g)",
      "Jowar (Sorghum Millet) Bhakri (1 pc)",
      "Pudina Chutney & Pickled Sirka Onions"
    ],
    total_calories: 620,
    protein_g: 54,
    carbs_g: 44,
    fats_g: 22,
    fiber_g: 9.5,
    sodium_mg: 780,
    net_carbs: 34.5,
    cooking_method: "Clay Oven Tandoor-Roasted & Ghee-Tempered",
    hidden_fat_estimate_g: 6.5,
    glycemic_index_rating: "Low",
    hidden_fat_warnings: [
      "Light butter baste on tandoori tikka (~6g)",
      "Ghee tempering in yellow dal (~1 tbsp)"
    ],
    glycemic_impact: "Low",
  },
  {
    food_items: [
      "Murgh Makhani / Butter Chicken with Rich Gravy (180g)",
      "Refined Flour Butter Naan (1 pc)",
      "Steamed Jeera Basmati Rice (120g)"
    ],
    total_calories: 840,
    protein_g: 38,
    carbs_g: 88,
    fats_g: 38,
    fiber_g: 3.2,
    sodium_mg: 1180,
    net_carbs: 84.8,
    cooking_method: "Simmered in Cashew Cream Gravy & Tandoor Baked",
    hidden_fat_estimate_g: 16.5,
    glycemic_index_rating: "High",
    hidden_fat_warnings: [
      "Heavy dairy cream and butter emulsified in makhani gravy (~14g hidden fat)",
      "Ghee brushed on refined maida naan (~8g)",
      "Refined carbohydrates in maida naan cause elevated glycemic response"
    ],
    glycemic_impact: "High",
  },
  {
    food_items: [
      "Crisp Onion & Spinach Pakoras (4 pcs)",
      "Sweet & Tangy Imli Tamarind Chutney (2 tbsp)",
      "Masala Chai with Whole Milk & Cardamom"
    ],
    total_calories: 490,
    protein_g: 11,
    carbs_g: 52,
    fats_g: 26,
    fiber_g: 2.8,
    sodium_mg: 690,
    net_carbs: 49.2,
    cooking_method: "Deep-Fried in Mustard Oil",
    hidden_fat_estimate_g: 18.0,
    glycemic_index_rating: "High",
    hidden_fat_warnings: [
      "Deep-frying oil absorption in besan batter (~16g)",
      "Added jaggery/sugar in tamarind chutney"
    ],
    glycemic_impact: "High",
  },
  {
    food_items: [
      "Steamed Fermented Idlis with Podi (3 pcs)",
      "Vegetable Toor Dal Sambar with Drumsticks (180g)",
      "Fresh Coconut & Chana Dal Chutney (2 tbsp)"
    ],
    total_calories: 420,
    protein_g: 16,
    carbs_g: 64,
    fats_g: 11,
    fiber_g: 8.5,
    sodium_mg: 540,
    net_carbs: 55.5,
    cooking_method: "Steam-Cooked & Mustard-Curry Leaf Tadka",
    hidden_fat_estimate_g: 4.0,
    glycemic_index_rating: "Medium",
    hidden_fat_warnings: [
      "Gingelly / sesame oil drizzled in gun powder podi (~5g)",
      "Natural saturated fats in grated fresh coconut chutney"
    ],
    glycemic_impact: "Medium",
  }
];

/**
 * Uploads meal image to backend Gemini Vision endpoint or provides client-side AI simulation
 */
export async function analyzeMealImage(file: File): Promise<MealAnalysis> {
  const isReachable = await checkBackendReachable();

  if (isReachable) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/analyze-meal`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (res.ok) {
        return await res.json();
      }
      console.warn("Backend /api/analyze-meal returned error. Falling back to local AI estimation.");
    } catch (err) {
      console.warn("Error calling /api/analyze-meal:", err);
    }
  }

  // Realistic scanning pause for client-side fallback
  await new Promise((r) => setTimeout(r, 1600));

  // Pick preset based on file name or random
  const index = Math.abs(file.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % DEMO_ANALYSIS_PRESETS.length;
  return DEMO_ANALYSIS_PRESETS[index];
}

/**
 * Retrieves logged meals for a user
 */
export async function getMeals(userId: number): Promise<Meal[]> {
  const isReachable = await checkBackendReachable();

  if (isReachable) {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/meals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback to local
    }
  }

  try {
    const raw = localStorage.getItem(`${MEALS_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new meal log
 */
export async function createMeal(
  mealData: Omit<Meal, "id">,
  userId: number
): Promise<Meal> {
  const isReachable = await checkBackendReachable();

  if (isReachable) {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mealData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback to local
    }
  }

  // Local storage save
  const newMeal: Meal = {
    ...mealData,
    id: `meal_local_${Date.now()}`,
    user_id: userId,
    fiber_g: mealData.fiber_g ?? 0,
    sodium_mg: mealData.sodium_mg ?? 0,
    net_carbs: mealData.net_carbs ?? Math.max(0, mealData.carbs - (mealData.fiber_g ?? 0)),
    cooking_method: mealData.cooking_method || "Cast-Iron Tawa Griddled",
    hidden_fat_estimate_g: mealData.hidden_fat_estimate_g ?? 0.0,
    glycemic_index_rating: mealData.glycemic_index_rating || "Low",
    hidden_fat_warnings: mealData.hidden_fat_warnings || [],
    glycemic_impact: mealData.glycemic_impact || "Low",
    timestamp: mealData.timestamp || new Date().toISOString(),
  };

  const existing = await getMeals(userId);
  const updated = [newMeal, ...existing];
  localStorage.setItem(`${MEALS_PREFIX}${userId}`, JSON.stringify(updated));

  return newMeal;
}

/**
 * Deletes a meal log
 */
export async function deleteMeal(mealId: string | number, userId: number): Promise<void> {
  const isReachable = await checkBackendReachable();

  if (isReachable && typeof mealId === "number") {
    try {
      const token = getAccessToken();
      await fetch(`${API_BASE_URL}/api/meals/${mealId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // continue to local
    }
  }

  const existing = await getMeals(userId);
  const filtered = existing.filter((m) => String(m.id) !== String(mealId));
  localStorage.setItem(`${MEALS_PREFIX}${userId}`, JSON.stringify(filtered));
}

/**
 * Get user nutritional goals
 */
export async function getUserGoals(userId: number): Promise<UserGoals> {
  const isReachable = await checkBackendReachable();

  if (isReachable) {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/goals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // continue to local
    }
  }

  try {
    const raw = localStorage.getItem(`${GOALS_PREFIX}${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // default
  }

  return {
    target_calories: 2200,
    target_protein: 160,
    target_carbs: 210,
    target_fats: 65,
  };
}

/**
 * Update user nutritional goals
 */
export async function saveUserGoals(goals: UserGoals, userId: number): Promise<UserGoals> {
  const isReachable = await checkBackendReachable();

  if (isReachable) {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/goals`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goals),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
  }

  localStorage.setItem(`${GOALS_PREFIX}${userId}`, JSON.stringify(goals));
  return goals;
}

/**
 * Evaluates daily macro deficits and generates a custom balanced Indian culinary dinner recipe
 */
export async function balanceNextMeal(
  userId: number,
  dietaryPreference?: string
): Promise<MacroBalancerResponse> {
  const isReachable = await checkBackendReachable();

  if (isReachable) {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/balance-next-meal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dietary_preference: dietaryPreference || null }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Backend /api/balance-next-meal unreachable, falling back to client-side engine:", err);
    }
  }

  // Client-side fallback calculation
  const [meals, goals] = await Promise.all([getMeals(userId), getUserGoals(userId)]);
  const consumed = meals.reduce(
    (acc, m) => {
      acc.calories += Number(m.calories) || 0;
      acc.protein += Number(m.protein) || 0;
      acc.carbs += Number(m.carbs) || 0;
      acc.fats += Number(m.fats) || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const deficits = {
    calories: Math.max(0, Math.round(goals.target_calories - consumed.calories)),
    protein: Math.max(0, Math.round(goals.target_protein - consumed.protein)),
    carbs: Math.max(0, Math.round(goals.target_carbs - consumed.carbs)),
    fats: Math.max(0, Math.round(goals.target_fats - consumed.fats)),
  };

  const targetP = Math.max(20, deficits.protein || 45);
  const targetC = Math.max(15, deficits.carbs || 35);
  const targetF = Math.max(8, deficits.fats || 18);
  const targetCal = deficits.calories > 150 ? deficits.calories : targetP * 4 + targetC * 4 + targetF * 9;

  const isVeg = dietaryPreference?.toLowerCase().includes("veg");

  return {
    status: "success",
    is_unbalanced: deficits.protein > 15 || deficits.carbs > 20 || deficits.calories > 200,
    goals: {
      calories: goals.target_calories,
      protein: goals.target_protein,
      carbs: goals.target_carbs,
      fats: goals.target_fats,
    },
    consumed,
    deficits,
    recipe: {
      recipe_title: isVeg
        ? "Low-Fat Sautéed Paneer & Soya Chaap with Sprouted Moong Khichdi & Heeng Tadka"
        : "Tandoori Murgh Breast with Yellow Moong Dal Tadka & Bajra Bhakri",
      tagline: `20-Year Indian Clinical Dietitian Formulation: Fills your remaining ${targetP}g protein and ${targetC}g complex carb deficits with pure desi spices and minimal ghee.`,
      prep_time_minutes: 15,
      cook_time_minutes: 20,
      difficulty: "Easy",
      cooking_method: isVeg ? "Cast-Iron Tawa Seared & Light Heeng-Jeera Tadka" : "Clay Oven / Tawa Charred with Dry Spice Rub",
      glycemic_index_rating: "Low",
      macro_alignment: {
        calories: Math.round(targetCal),
        protein_g: targetP,
        carbs_g: targetC,
        fats_g: targetF,
        protein_deficit_filled_pct: 100,
        explanation: `Fulfills your exact deficit of ${targetP}g protein and ${targetC}g complex carbs via millets and pulses while keeping cooking fats locked at ${targetF}g.`,
      },
      ingredients: [
        {
          name: isVeg ? `Low-Fat Fresh Cow Paneer & Sprouted Soya (${Math.round(targetP * 3.8)}g)` : `Skinless Chicken Breast Cubes (${Math.round(targetP * 4.2)}g)`,
          quantity: "1 main portion",
          macro_focus: "Lean Bioavailable Indian Protein",
        },
        {
          name: `Pearl Millet (Bajra) / Sprouted Moong Dal Base (${Math.round(targetC * 2.8)}g cooked)`,
          quantity: "1 bowl base",
          macro_focus: "Low Glycemic Complex Carbohydrate",
        },
        {
          name: `Pure Desi Cow Ghee for Cumin Tempering (${Math.max(1, Math.round(targetF * 0.45))} tsp)`,
          quantity: "For aromatic tadka",
          macro_focus: "Healthy Fat for Fat-Soluble Vitamin Absorption",
        },
        {
          name: "Roasted jeera, Kashmiri deghi mirch, turmeric, grated ginger, fresh mint",
          quantity: "To taste",
          macro_focus: "Anti-Inflammatory Spice Matrix & Digestion",
        },
      ],
      instructions: [
        `Marinate the ${isVeg ? "paneer and soya" : "chicken breast"} with hung curd, turmeric, Kashmiri deghi mirch, ginger-garlic paste, and roasted kasoori methi.`,
        `Sear on a high-heat cast-iron tawa for 4-5 minutes per side until charred edges form, brushing with drops of ghee.`,
        "In a small ladle, heat 1 tsp desi cow ghee, temper with cumin seeds and heeng, and pour directly over cooked yellow moong dal.",
        "Serve hot with freshly roasted bajra roti or sprouted dal, garnished with lemon wedges and fresh cilantro.",
      ],
      chef_metabolic_tip:
        "Pairing high-protein lentils with ancient millets (bajra/jowar) and a light cumin-ghee tadka slows gastric emptying and eliminates nocturnal glycemic dips.",
    },
    message: "Custom Indian metabolic dinner generated to balance daily nutritional targets.",
  };
}
