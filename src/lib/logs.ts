import { storageKey } from "./storageKeys";
import { SetEntryLog, Store } from "./types";

// src/lib/logs.ts

const KEY = storageKey("logs");

function uid() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as any) : {};
    // MIGRATION: ensure every row has id + createdAt
    let changed = false;
    const out: Store = {};
    for (const [exId, arr] of Object.entries(parsed as Store)) {
      const fixed = (arr || []).map((row: any) => {
        const id = typeof row.id === "string" && row.id.length ? row.id : uid();
        const createdAt =
          typeof row.createdAt === "number" && Number.isFinite(row.createdAt)
            ? row.createdAt
            : new Date((row.isoDate ?? "1970-01-01") + "T00:00:00").getTime();
        if (id !== row.id || createdAt !== row.createdAt) changed = true;
        return {
          id,
          isoDate: String(row.isoDate ?? "1970-01-01"),
          weightKg: Number(row.weightKg ?? 0),
          reps: Number(row.reps ?? 0),
          createdAt,
        } as SetEntryLog;
      });
      out[exId] = fixed;
    }
    if (changed) localStorage.setItem(KEY, JSON.stringify(out));
    return out;
  } catch {
    return {};
  }
}

function writeStore(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));

  // bump a lightweight version token + notify this tab
  const verKey = KEY + ":version";
  const next = (Number(localStorage.getItem(verKey) || "0") + 1).toString();
  localStorage.setItem(verKey, next);
  try {
    window.dispatchEvent(new Event(storageKey("logs")));
  } catch {}
}

function sortChronoAsc(a: SetEntryLog, b: SetEntryLog) {
  if (a.isoDate === b.isoDate) {
    const ca = Number.isFinite(a.createdAt) ? a.createdAt : 0;
    const cb = Number.isFinite(b.createdAt) ? b.createdAt : 0;
    return ca - cb;
  }
  return a.isoDate.localeCompare(b.isoDate);
}

export function listSetsAsc(exerciseId: string): SetEntryLog[] {
  const s = readStore();
  return (s[exerciseId] || []).slice().sort(sortChronoAsc);
}

export function addSet(
  exerciseId: string,
  entry: Omit<SetEntryLog, "id" | "createdAt">
) {
  const s = readStore();
  const arr = s[exerciseId] || [];
  const row: SetEntryLog = { id: uid(), createdAt: Date.now(), ...entry };
  arr.push(row);
  s[exerciseId] = arr;
  writeStore(s);
  return row;
}

export function updateSet(
  exerciseId: string,
  id: string,
  patch: Partial<Omit<SetEntryLog, "id" | "createdAt">>
) {
  const s = readStore();
  const arr = s[exerciseId] || [];
  const i = arr.findIndex((x) => x.id === id);
  if (i >= 0) {
    arr[i] = { ...arr[i], ...patch };
    writeStore({ ...s, [exerciseId]: arr });
  }
}

export function removeSet(exerciseId: string, id: string) {
  const s = readStore();
  const arr = (s[exerciseId] || []).filter((x) => x.id !== id);
  s[exerciseId] = arr;
  writeStore(s);
}

// Chronological helpers
export function lastSetBefore(
  exerciseId: string,
  isoDate: string
): SetEntryLog | null {
  const all = listSetsAsc(exerciseId);
  for (let i = all.length - 1; i >= 0; i--) {
    if (all[i].isoDate <= isoDate) return all[i];
  }
  return null;
}
export function bestBefore(
  exerciseId: string,
  isoDate: string,
  weeks = 6
): { weightKg: number; reps: number; isoDate: string } | null {
  const all = listSetsAsc(exerciseId);
  const end = new Date(isoDate + "T00:00:00").getTime();
  const start = end - weeks * 7 * 24 * 60 * 60 * 1000;

  const pool = all.filter((x) => {
    const t = new Date(x.isoDate + "T00:00:00").getTime();
    return t <= end && t >= start;
  });
  const candidates = pool.length
    ? pool
    : all.filter((x) => new Date(x.isoDate + "T00:00:00").getTime() <= end);

  let best: SetEntryLog | null = null;
  let bestLoad = -Infinity;
  for (const e of candidates) {
    const load = e.weightKg * e.reps;
    if (load > bestLoad) {
      best = e;
      bestLoad = load;
    }
  }
  return best
    ? { weightKg: best.weightKg, reps: best.reps, isoDate: best.isoDate }
    : null;
}

export function listAllAsc(): { exerciseId: string; entries: SetEntryLog[] }[] {
  const s = readStore();
  return Object.entries(s).map(([exerciseId, arr]) => ({
    exerciseId,
    entries: (arr || []).slice().sort(sortChronoAsc),
  }));
}

export function allEntriesAsc(): (SetEntryLog & { exerciseId: string })[] {
  const s = readStore();
  const out: (SetEntryLog & { exerciseId: string })[] = [];
  for (const [exerciseId, arr] of Object.entries(s)) {
    for (const row of (arr || []).slice().sort(sortChronoAsc)) {
      out.push({ ...row, exerciseId });
    }
  }
  return out;
}
