import { listSetsAsc } from "@/lib/logs";
import { Template } from "@/lib/templates";
import { SavedSet } from "@/lib/types";

export const isoToday = () => new Date().toISOString().slice(0, 10);
export const KG2LB = 2.2046226218;
export const fmtDuration = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export function gatherSessionSetsFor(
  template: Template | null,
  preferToday = true
) {
  if (!template) return { sets: [] as SavedSet[], date: null as string | null };

  const byDate = new Map<string, SavedSet[]>();
  for (const ex of template.exercises || []) {
    for (const row of listSetsAsc(ex.id)) {
      const arr = byDate.get(row.isoDate) ?? [];
      arr.push({
        exerciseId: ex.id,
        isoDate: row.isoDate,
        weightKg: row.weightKg,
        reps: row.reps,
      });
      byDate.set(row.isoDate, arr);
    }
  }
  const dates = Array.from(byDate.keys()).sort(); // asc
  if (dates.length === 0) return { sets: [], date: null };
  const today = isoToday();

  const pick =
    preferToday && byDate.has(today) ? today : dates[dates.length - 1];
  return { sets: byDate.get(pick) ?? [], date: pick };
}
