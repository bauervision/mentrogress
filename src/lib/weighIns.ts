import { readProfile, kgToLb } from "./profile";
import { storageKey } from "./storageKeys";
import { TrackStatus, WeighIn } from "./types";

const KEY = storageKey("weighins");

export function listWeighIns(): WeighIn[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as WeighIn[];
  } catch {
    return [];
  }
}

export function addWeighIn(entry: WeighIn) {
  const all = listWeighIns()
    .filter((w) => w.isoDate !== entry.isoDate)
    .concat(entry)
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
}

export function lastN(n = 6) {
  return listWeighIns().slice(-n);
}

export function weeksBetween(aISO: string, bISO: string) {
  const a = new Date(aISO + "T00:00:00");
  const b = new Date(bISO + "T00:00:00");
  return (Number(b) - Number(a)) / (1000 * 60 * 60 * 24 * 7);
}

export function onTrackStatus(): { status: TrackStatus; msg: string } | null {
  const p = readProfile();
  if (!p.goalDateISO || p.weightKg == null || p.goalWeightKg == null)
    return null;

  const data = listWeighIns();
  if (data.length < 2) return null;

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  const deltaKg = latest.weightKg - prev.weightKg;
  const weeks = Math.max(weeksBetween(prev.isoDate, latest.isoDate), 1 / 7);
  const actualPerWeek = deltaKg / weeks; // + = gained, - = lost

  const totalDeltaToGoal = p.goalWeightKg - (latest.weightKg ?? p.weightKg);
  const totalWeeksLeft = Math.max(
    weeksBetween(latest.isoDate, p.goalDateISO),
    0.01
  );
  const neededPerWeek = totalDeltaToGoal / totalWeeksLeft; // + gain, - lose

  // compare needed vs actual
  const diff = Math.abs(actualPerWeek - neededPerWeek);
  // thresholds (kg/wk), ~0.1 kg ≈ 0.22 lb
  const greenTol = 0.11,
    amberTol = 0.22;

  let status: TrackStatus = "green";
  if (diff > amberTol) status = "red";
  else if (diff > greenTol) status = "amber";

  const toStr = (kg: number) => `${kgToLb(Math.abs(kg)).toFixed(1)} lb/wk`;

  const msg =
    status === "green"
      ? `On track — ${toStr(actualPerWeek)} vs target ${toStr(neededPerWeek)}.`
      : status === "amber"
      ? `Slightly off — ${toStr(actualPerWeek)} vs ${toStr(
          neededPerWeek
        )}. Adjust steps/intake.`
      : `Off track — ${toStr(actualPerWeek)} vs ${toStr(
          neededPerWeek
        )}. Tighten recovery & nutrition.`;

  return { status, msg };
}
