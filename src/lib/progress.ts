// lib/progress.ts
import type { SetEntryLog } from "./logs";

export type FlatLog = SetEntryLog & { exerciseId: string };

export type LogEntry = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string; // ISO
};

// last N days inclusive (N=28 default)
export function windowByDays(entries: FlatLog[], days = 28) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return entries.filter((e) => {
    const t = new Date(e.isoDate + "T00:00:00").getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
}

export function totalVolumeKg(entries: FlatLog[]) {
  return entries.reduce((s, e) => s + e.weightKg * e.reps, 0);
}

const within = (d: Date, start: Date, end: Date) => d >= start && d <= end;

export function sliceByDate(entries: LogEntry[], start: Date, end: Date) {
  return entries.filter((e) => within(new Date(e.date), start, end));
}

export function totalVolume(entries: LogEntry[]) {
  return entries.reduce((s, e) => s + e.weight * e.reps, 0);
}
export function bestSet(entries: FlatLog[]) {
  let best: FlatLog | null = null;
  let score = -Infinity;
  for (const e of entries) {
    const s = e.weightKg * e.reps;
    if (s > score) {
      score = s;
      best = e;
    }
  }
  return best ? { entry: best, scoreKgReps: score } : null;
}

export function byDayVolume(entries: LogEntry[]) {
  // returns [{date: 'YYYY-MM-DD', volume}]
  const map = new Map<string, number>();
  for (const e of entries) {
    const d = new Date(e.date);
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + e.weight * e.reps);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, volume]) => ({ date, volume }));
}

export function workoutDaysCount(entries: FlatLog[]) {
  return new Set(entries.map((e) => e.isoDate)).size;
}

export function byDayVolumeKg(entries: FlatLog[]) {
  const map = new Map<string, number>(); // YYYY-MM-DD -> volume
  for (const e of entries) {
    const k = e.isoDate;
    map.set(k, (map.get(k) ?? 0) + e.weightKg * e.reps);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, volumeKgReps]) => ({ date, volumeKgReps }));
}
