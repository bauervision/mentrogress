export type UnitSystem = "imperial" | "metric";

export type WeighInDay = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export type Profile = {
  unitSystem: UnitSystem;
  age: number | null;
  heightCm: number | null; // keep SI internally
  weightKg: number | null;
  goalWeightKg: number | null;
  goalDateISO: string | null;
  weighInDay: WeighInDay | null;
  updatedAt: number;
  toneHex?: string; // e.g., "#ff63b5"
  toneTintAlpha?: number; // 0..1, how strong the BG tint is (default 0.06)
  toneBrightness?: number; // NEW
};

const KEY = "mentrogress_profile_v1";

export function readProfile(): Profile {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    const base = empty();
    const parsed = raw ? (JSON.parse(raw) as Partial<Profile>) : {};
    return { ...base, ...parsed };
  } catch {
    return empty();
  }
}

export function writeProfileMerge(patch: Partial<Profile>): Profile {
  const merged = { ...readProfile(), ...patch, updatedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(merged));
  return merged;
}

export const writeProfile = writeProfileMerge;

export function empty(): Profile {
  return {
    unitSystem: "imperial",
    age: null,
    heightCm: null,
    weightKg: null,
    goalWeightKg: null,
    goalDateISO: null,
    weighInDay: null,
    updatedAt: Date.now(),
    toneHex: "#ffffff",
    toneTintAlpha: 0.06,
    toneBrightness: 0.0,
  };
}

/* ---- progress slope helper ---- */
export function onTrackInfo(p: Profile) {
  if (!p.weightKg || !p.goalWeightKg || !p.goalDateISO) return null;
  const today = new Date();
  const goal = new Date(p.goalDateISO + "T00:00:00");
  const weeksLeft =
    (goal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7);
  const deltaToGoalKg = p.weightKg - p.goalWeightKg;
  const weeklyTargetKg = weeksLeft > 0 ? deltaToGoalKg / weeksLeft : 0;
  return { onTrack: true, weeklyTargetKg, deltaToGoalKg };
}

/* ---- unit helpers ---- */
export const lbToKg = (lb: number) => lb * 0.45359237;
export const kgToLb = (kg: number) => kg / 0.45359237;

export const cmToFtIn = (cm: number) => {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round((totalIn - ft * 12) * 10) / 10; // 1 decimal
  return { ft, inch };
};
export const ftInToCm = (ft: number, inch: number) => (ft * 12 + inch) * 2.54;

const KCAL_PER_KG = 7700; // ≈ 3500 kcal/lb

export function dailyEnergyPlan(p: Profile) {
  const info = onTrackInfo(p);
  if (!info) return null;

  // weeklyTargetKg > 0 means "lose X kg/week"; < 0 means "gain"
  const mode = info.weeklyTargetKg >= 0 ? "deficit" : "surplus";
  const kcalPerDay = (Math.abs(info.weeklyTargetKg) * KCAL_PER_KG) / 7;

  return {
    mode, // "deficit" | "surplus"
    kcalPerDay, // number (kcal/day)
    weeklyTargetKg: info.weeklyTargetKg, // pass through for display
  };
}
