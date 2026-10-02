/**
 * Core API configuration and reachability detection for NutriLens.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let _backendReachable: boolean | null = null;

/**
 * Probes the backend server with a 1.5s timeout.
 * Returns true if available, false if offline/unreachable (e.g. static Vercel deploy).
 */
export async function checkBackendReachable(): Promise<boolean> {
  if (_backendReachable !== null) {
    return _backendReachable;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    _backendReachable = res.ok;
    return _backendReachable;
  } catch {
    _backendReachable = false;
    return false;
  }
}

/**
 * Reset backend reachability cache so retries can occur
 */
export function resetBackendReachabilityCache(): void {
  _backendReachable = null;
}
