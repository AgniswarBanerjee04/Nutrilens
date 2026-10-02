/**
 * Authentication service with seamless Vercel / Offline localStorage Fallback.
 *
 * Implements:
 * - Real FastAPI backend communication for register/login/me
 * - CRITICAL FALLBACK: Intercepts network failures / unreachable backend
 *   and manages credentials via 'nutrilens_mock_users' in localStorage
 * - Instant Demo Access bypassing all validation with pre-populated health logs
 */

import { API_BASE_URL, checkBackendReachable } from "./api";
import type { User, AuthResponse, UserGoals, Meal } from "../types";

const TOKEN_KEY = "auth_token";
const CURRENT_USER_KEY = "user_profile";
const LEGACY_TOKEN_KEY = "nutrilens_token";
const LEGACY_USER_KEY = "nutrilens_user";
const MOCK_USERS_KEY = "nutrilens_mock_users";
const GOALS_PREFIX = "nutrilens_goals_";
const MEALS_PREFIX = "nutrilens_meals_";

interface MockUserEntry {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: string;
}

/**
 * Persists authentication tokens and user profiles to both primary and fallback keys
 */
export function persistSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
}

/**
 * Helper to retrieve stored mock users
 */
function getMockUsers(): MockUserEntry[] {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Helper to persist mock users
 */
function saveMockUsers(users: MockUserEntry[]): void {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

/**
 * Register a new user with real backend or localStorage fallback
 */
export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  const isReachable = await checkBackendReachable();

  if (isReachable) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password, name: trimmedName }),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        persistSession(data.access_token, data.user);
        return data;
      }

      // If backend explicitly returned a 400 (e.g. user already exists)
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Registration failed on server.");
    } catch (err: unknown) {
      // If error is network-related, fall through to offline fallback
      if (err instanceof Error && !err.message.includes("already exists")) {
        console.warn("Backend unavailable. Switching to localStorage fallback:", err.message);
      } else {
        throw err;
      }
    }
  }

  // --- LOCALSTORAGE FALLBACK ENGINE ---
  const mockUsers = getMockUsers();
  const existing = mockUsers.find((u) => u.email === normalizedEmail);
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const newMockUser: MockUserEntry = {
    id: Date.now(),
    email: normalizedEmail,
    password: password,
    name: trimmedName,
    created_at: new Date().toISOString(),
  };

  mockUsers.push(newMockUser);
  saveMockUsers(mockUsers);

  const userObj: User = {
    id: newMockUser.id,
    email: newMockUser.email,
    name: newMockUser.name,
    created_at: newMockUser.created_at,
  };

  const mockToken = `nutrilens_local_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  persistSession(mockToken, userObj);

  // Initialize default goals in local storage
  const defaultGoals: UserGoals = {
    target_calories: 2200,
    target_protein: 160,
    target_carbs: 210,
    target_fats: 65,
  };
  localStorage.setItem(`${GOALS_PREFIX}${userObj.id}`, JSON.stringify(defaultGoals));

  return {
    access_token: mockToken,
    token_type: "bearer",
    user: userObj,
    is_offline_fallback: true,
  };
}

/**
 * Login user with backend or localStorage fallback
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const normalizedEmail = email.trim().toLowerCase();
  const isReachable = await checkBackendReachable();

  if (isReachable) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        persistSession(data.access_token, data.user);
        return data;
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Invalid credentials.");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("credentials")) {
        throw err;
      }
      console.warn("Backend unavailable for login. Falling back to local accounts.");
    }
  }

  // --- LOCALSTORAGE FALLBACK ENGINE ---
  const mockUsers = getMockUsers();
  const foundUser = mockUsers.find((u) => u.email === normalizedEmail);

  if (!foundUser || foundUser.password !== password) {
    throw new Error("Incorrect email or password.");
  }

  const userObj: User = {
    id: foundUser.id,
    email: foundUser.email,
    name: foundUser.name,
    created_at: foundUser.created_at,
  };

  const mockToken = `nutrilens_local_jwt_${Date.now()}`;
  persistSession(mockToken, userObj);

  return {
    access_token: mockToken,
    token_type: "bearer",
    user: userObj,
    is_offline_fallback: true,
  };
}

/**
 * Instant Demo Access: Bypasses credentials, initializes rich Indian culinary sample data
 */
export function loginAsDemo(): AuthResponse {
  const demoUser: User = {
    id: 9999,
    email: "alexander@nutrilens.ai",
    name: "Alexander Cole",
    created_at: new Date().toISOString(),
  };

  const demoToken = `nutrilens_demo_token_${Date.now()}`;
  persistSession(demoToken, demoUser);

  // Initialize demo goals
  const demoGoals: UserGoals = {
    target_calories: 2350,
    target_protein: 175,
    target_carbs: 220,
    target_fats: 68,
  };
  localStorage.setItem(`${GOALS_PREFIX}${demoUser.id}`, JSON.stringify(demoGoals));

  // Initialize rich Indian culinary sample logged meals for today if not already present
  const existingMealsRaw = localStorage.getItem(`${MEALS_PREFIX}${demoUser.id}`);
  if (!existingMealsRaw) {
    const sampleMeals: Meal[] = [
      {
        id: "meal_demo_1",
        user_id: demoUser.id,
        food_summary: "Moong Dal Chilla with Mint Chutney & Paneer Filling",
        food_items: [
          "Sprouted Moong Batter Chillas (2 pcs)",
          "Low-Fat Paneer & Jeera Filling (75g)",
          "Pudina-Dhania Chutney (2 tbsp)",
          "Desi Ghee Crisp Brush"
        ],
        calories: 460,
        protein: 32,
        carbs: 40,
        fats: 18,
        cooking_method: "Cast-Iron Tawa Griddled with Pure Desi Ghee",
        hidden_fat_estimate_g: 4.5,
        glycemic_index_rating: "Low",
        hidden_fat_warnings: [
          "Desi ghee brushed on cast-iron tawa (~1 tbsp)",
          "Slow complex carbs from whole sprouted moong"
        ],
        glycemic_impact: "Low",
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "meal_demo_2",
        user_id: demoUser.id,
        food_summary: "Tandoori Murgh Tikka with Dal Tadka & Bajra Roti",
        food_items: [
          "Clay Oven Tandoori Chicken Breast (180g)",
          "Yellow Moong Dal Tadka (150g)",
          "Whole Grain Bajra (Pearl Millet) Roti (1 pc)",
          "Kachumber Salad with Saffron-Lemon Dressing"
        ],
        calories: 610,
        protein: 50,
        carbs: 46,
        fats: 22,
        cooking_method: "Clay Oven Tandoor-Roasted & Ghee-Tempered Tadka",
        hidden_fat_estimate_g: 6.5,
        glycemic_index_rating: "Low",
        hidden_fat_warnings: [
          "Desi ghee tadka on dal (~1.5 tbsp hidden fat)",
          "Tandoori butter basting glaze (~5g)"
        ],
        glycemic_impact: "Low",
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80"
      }
    ];
    localStorage.setItem(`${MEALS_PREFIX}${demoUser.id}`, JSON.stringify(sampleMeals));
  }

  return {
    access_token: demoToken,
    token_type: "bearer",
    user: demoUser,
    is_offline_fallback: true,
  };
}

/**
 * Log out user: Clears both primary and legacy token/profile keys
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

/**
 * Get current session user from user_profile or legacy nutrilens_user key
 */
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Get current access token from auth_token or legacy nutrilens_token key
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}
