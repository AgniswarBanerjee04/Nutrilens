import type { SleepData } from "../types";

const SLEEP_PREFIX = "nutrilens_sleep_";

export function getDefaultSleepData(): SleepData {
  return {
    hours_slept: 7.5,
    deep_sleep_hours: 2.2,
    sleep_quality: "Restorative",
    autophagy_score: 84,
    notes: "Deep restorative slow-wave sleep. Optimal cellular renewal.",
    logged_at: new Date().toISOString(),
  };
}

export function calculateAutophagyScore(hoursSlept: number, quality: SleepData["sleep_quality"]): number {
  let base = 50;
  if (hoursSlept >= 8) base = 90;
  else if (hoursSlept >= 7) base = 80;
  else if (hoursSlept >= 6) base = 60;
  else base = 35; // under 6 hours

  if (quality === "Restorative") base = Math.min(100, base + 10);
  else if (quality === "Fragmented") base = Math.max(20, base - 15);

  return Math.round(base);
}

export function getSleepData(userId: number): SleepData {
  try {
    const raw = localStorage.getItem(`${SLEEP_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load sleep data from localStorage:", err);
  }
  return getDefaultSleepData();
}

export function saveSleepData(userId: number, data: Partial<SleepData>): SleepData {
  const current = getSleepData(userId);
  const hours = data.hours_slept !== undefined ? Number(data.hours_slept) : current.hours_slept;
  const quality = data.sleep_quality || current.sleep_quality;
  const deepSleep = data.deep_sleep_hours !== undefined 
    ? Number(data.deep_sleep_hours) 
    : Math.round(hours * 0.28 * 10) / 10;
  const score = calculateAutophagyScore(hours, quality);

  let defaultNote = "Circadian balance maintained.";
  if (hours < 6) {
    defaultNote = "Sleep deficit (< 6h) triggers acute GLUT-4 downregulation and daytime ghrelin spikes.";
  } else if (quality === "Restorative") {
    defaultNote = "Optimal slow-wave deep sleep. Autophagy cellular turnover maximized.";
  }

  const updated: SleepData = {
    hours_slept: hours,
    deep_sleep_hours: deepSleep,
    sleep_quality: quality,
    autophagy_score: score,
    notes: data.notes || defaultNote,
    logged_at: new Date().toISOString(),
  };

  localStorage.setItem(`${SLEEP_PREFIX}${userId}`, JSON.stringify(updated));
  return updated;
}
