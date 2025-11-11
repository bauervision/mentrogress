// src/lib/gatekeeper.ts (only the exported function signature/body changed)
import { readProfile, kgToLb, lbToKg } from "./profile";

export type GateVerdict = "green" | "amber" | "red";
export type LastBest = {
  weightKg: number;
  reps: number;
  isoDate: string;
} | null;

export type GateResult = {
  verdict: GateVerdict;
  title: string;
  detail: string;
  suggestedWeightKg?: number;
  suggestedWeightDisplay?: string;
  regression?: boolean; // true if below last session's load
};

function tier(n?: number | null) {
  if (!n || n < 6) return "novice";
  if (n < 24) return "intermediate";
  return "trained";
}
function pctCap(
  age: number | null | undefined,
  t: "novice" | "intermediate" | "trained"
) {
  const base = t === "novice" ? 0.1 : t === "intermediate" ? 0.08 : 0.06;
  const ageCut = !age
    ? 0
    : age >= 60
    ? -0.03
    : age >= 50
    ? -0.02
    : age >= 40
    ? -0.01
    : 0;
  return Math.max(0.03, base + ageCut);
}
function absCapKg(age: number | null | undefined, t: string) {
  const lb = !age
    ? t === "novice"
      ? 7.5
      : 12.5
    : age >= 60
    ? 5
    : age >= 50
    ? 7.5
    : t === "novice"
    ? 7.5
    : 12.5;
  return lbToKg(lb);
}

export function gatekeepSet(opts: {
  // safety caps use this (best in window before the date)
  bestBefore: LastBest;
  // progress check uses this (immediate last set before the date)
  lastSet: LastBest;
  weight: number; // entered in current units
  reps: number;
  units?: "imperial" | "metric";
  age?: number | null;
  recentSessionsForExercise?: number;
}): GateResult {
  const p = readProfile();
  const units = opts.units ?? p.unitSystem ?? "imperial";
  const age = opts.age ?? p.age ?? null;
  const t = tier(opts.recentSessionsForExercise ?? null);

  // If truly first ever set → baseline amber
  if (!opts.lastSet && !opts.bestBefore) {
    return {
      verdict: "amber",
      title: "New lift — establish your baseline",
      detail:
        age && age >= 50
          ? "Start conservatively and focus on flawless form this week."
          : "Build a stable baseline over the next 2–3 sessions.",
    };
  }

  const wKg = units === "imperial" ? lbToKg(opts.weight) : opts.weight;
  const reps = Math.max(1, opts.reps);

  const best = opts.bestBefore ?? opts.lastSet!;
  const last = opts.lastSet ?? best;

  const lastLoad = last.weightKg * last.reps;
  const newLoad = wKg * reps;

  const capPct = pctCap(age, t);
  const capAbs = absCapKg(age, t);

  const pctIncrease = lastLoad > 0 ? (newLoad - lastLoad) / lastLoad : 0;
  const absIncreasePerSetKg = wKg - last.weightKg;
  const repCrash =
    wKg >= last.weightKg && reps < Math.max(1, Math.round(last.reps * 0.6));

  // regression vs last session?
  const regression = newLoad < lastLoad * 0.98; // >2% below last time

  // within caps and no crash → tentatively green
  if (pctIncrease <= capPct && absIncreasePerSetKg <= capAbs && !repCrash) {
    if (regression) {
      return {
        verdict: "amber",
        title: "Below last session",
        detail:
          "Not every day climbs—focus on crisp form and nail recovery. Progress resumes with consistency.",
        regression: true,
      };
    }
    return {
      verdict: "green",
      title: "Solid progression",
      detail:
        "Mentzer would be proud — disciplined increase with room for perfect form and strong recovery.",
    };
  }

  // suggest safer weight within caps
  const capByPct = (last.weightKg * last.reps * (1 + capPct)) / reps;
  const capByAbs = last.weightKg + capAbs;
  const suggestedKg = Math.min(capByPct, capByAbs);
  const suggestedDisplay =
    units === "imperial"
      ? `${Math.round(kgToLb(suggestedKg))} lb`
      : `${Math.round(suggestedKg)} kg`;

  if (repCrash && pctIncrease <= capPct && absIncreasePerSetKg <= capAbs) {
    return {
      verdict: "amber",
      title: "Watch the rep drop",
      detail:
        "This weight may be too aggressive today. Keep form pristine; consider 1–2 fewer reps or a small deload next set.",
      suggestedWeightKg: suggestedKg,
      suggestedWeightDisplay: suggestedDisplay,
    };
  }

  return {
    verdict: "red",
    title: "Caution — jump exceeds safe range",
    detail:
      "I’d caution against this jump right now. Build power at a slightly lower weight to avoid injury and preserve recovery.",
    suggestedWeightKg: suggestedKg,
    suggestedWeightDisplay: suggestedDisplay,
  };
}
