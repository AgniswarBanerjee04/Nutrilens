export type SubscriptionTier = 0 | 1 | 2 | 3; // 0 = Free, 1 = Plus, 2 = Pro, 3 = Clinical

export interface User {
  id: number;
  email: string;
  name: string;
  created_at?: string;
  subscription_tier?: SubscriptionTier;
}

export interface SleepData {
  hours_slept: number;
  deep_sleep_hours?: number;
  sleep_quality: "Restorative" | "Normal" | "Fragmented";
  autophagy_score?: number; // 0-100
  notes?: string;
  logged_at?: string;
}

export interface AICoachMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
  suggested_meal?: string;
  metabolic_focus?: string;
}

export interface AICoachResponse {
  reply: string;
  suggested_meal?: string;
  metabolic_focus?: string;
  glycemic_recommendation?: string;
}

export interface UserGoals {
  id?: number;
  user_id?: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
}

export interface Meal {
  id: number | string;
  user_id?: number;
  image_url?: string;
  food_summary: string;
  food_items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber_g?: number;
  sodium_mg?: number;
  net_carbs?: number;
  cooking_method?: string;
  hidden_fat_estimate_g?: number;
  glycemic_index_rating?: "Low" | "Medium" | "High" | string;
  hidden_fat_warnings?: string[];
  glycemic_impact?: "Low" | "Medium" | "High" | string;
  timestamp: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  is_offline_fallback?: boolean;
}

export interface MealAnalysis {
  food_items: string[];
  total_calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g?: number;
  sodium_mg?: number;
  net_carbs?: number;
  cooking_method?: string;
  hidden_fat_estimate_g?: number;
  glycemic_index_rating?: "Low" | "Medium" | "High" | string;
  hidden_fat_warnings?: string[];
  glycemic_impact?: "Low" | "Medium" | "High" | string;
}

export interface RecipeMacroAlignment {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  protein_deficit_filled_pct?: number;
  explanation?: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  macro_focus?: string;
}

export interface Recipe {
  recipe_title: string;
  tagline: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty: "Easy" | "Medium" | "Advanced" | string;
  cooking_method: string;
  glycemic_index_rating: "Low" | "Medium" | "High" | string;
  macro_alignment: RecipeMacroAlignment;
  ingredients: RecipeIngredient[];
  instructions: string[];
  chef_metabolic_tip?: string;
}

export interface MacroBalancerResponse {
  status: string;
  is_unbalanced: boolean;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  deficits: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  recipe: Recipe;
  message?: string;
}
