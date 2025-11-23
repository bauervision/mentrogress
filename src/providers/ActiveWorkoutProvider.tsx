// src/providers/ActiveWorkoutProvider.tsx
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ActiveWorkout = {
  templateId: string | null;
  isRunning: boolean;
  startedAt: number | null; // epoch ms of last (re)start
  elapsedBeforeMs: number; // accumulated time from prior runs
};

export type ActiveWorkoutCtx = {
  active: ActiveWorkout;
  selectTemplate: (templateId: string) => void;
  start: (templateId: string) => void; // start or switch & start
  pause: () => void;
  resume: () => void;
  end: () => void; // clear everything
  elapsedMs: () => number; // compute "now"
};

const KEY = "mentrogress_active_workout_v1";
const Ctx = createContext<ActiveWorkoutCtx | null>(null);

// ---- helpers ----
const numOrZero = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const numOrNull = (v: unknown) =>
  Number.isFinite(Number(v)) ? Number(v) : null;
const boolOr = (v: unknown, fb: boolean) => (typeof v === "boolean" ? v : fb);

function normalize(raw: any): ActiveWorkout {
  return {
    templateId:
      typeof raw?.templateId === "string" && raw.templateId.length
        ? raw.templateId
        : null,
    isRunning: boolOr(raw?.isRunning, false),
    startedAt: numOrNull(raw?.startedAt),
    elapsedBeforeMs: numOrZero(raw?.elapsedBeforeMs),
  };
}

// ---- provider ----
export function ActiveWorkoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // src/providers/ActiveWorkoutProvider.tsx

  const [active, setActive] = useState<ActiveWorkout>(() => {
    const blank: ActiveWorkout = {
      templateId: null,
      isRunning: false,
      startedAt: null,
      elapsedBeforeMs: 0,
    };

    if (typeof window === "undefined") {
      return blank;
    }

    try {
      // 🔥 Full wipe of any previous active session on app load
      localStorage.setItem(KEY, JSON.stringify(blank));
    } catch {
      // ignore storage errors
    }

    return blank;
  });

  // persist on change
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(active));
      // optional cross-tab/local listeners
      window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    } catch {}
  }, [active]);

  const computeElapsed = () => {
    const base = numOrZero(active.elapsedBeforeMs);
    if (active.isRunning && active.startedAt != null) {
      const delta = Date.now() - active.startedAt;
      return base + (Number.isFinite(delta) ? Math.max(0, delta) : 0);
    }
    return base;
  };

  const api = useMemo<ActiveWorkoutCtx>(
    () => ({
      active,

      // 🔹 just choose a template, don't start the clock
      selectTemplate: (templateId: string) =>
        setActive((prev) => ({
          templateId,
          isRunning: false,
          startedAt: null,
          elapsedBeforeMs:
            prev.templateId === templateId
              ? numOrZero(prev.elapsedBeforeMs)
              : 0,
        })),

      // 🔸 keep start() as "select + start running"
      start: (templateId: string) =>
        setActive((prev) => ({
          templateId,
          isRunning: true,
          startedAt: Date.now(),
          elapsedBeforeMs:
            prev.templateId === templateId
              ? numOrZero(prev.elapsedBeforeMs)
              : 0,
        })),

      pause: () =>
        setActive((prev) => {
          if (!prev.isRunning || prev.startedAt == null) return prev;
          const add = Date.now() - prev.startedAt;
          return {
            ...prev,
            isRunning: false,
            startedAt: null,
            elapsedBeforeMs:
              numOrZero(prev.elapsedBeforeMs) +
              (Number.isFinite(add) ? Math.max(0, add) : 0),
          };
        }),

      resume: () =>
        setActive((prev) => {
          if (!prev.templateId || prev.isRunning) return prev;
          return { ...prev, isRunning: true, startedAt: Date.now() };
        }),

      end: () =>
        setActive({
          templateId: null,
          isRunning: false,
          startedAt: null,
          elapsedBeforeMs: 0,
        }),

      elapsedMs: computeElapsed,
    }),
    [active]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useActiveWorkout() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error(
      "useActiveWorkout must be used inside ActiveWorkoutProvider"
    );
  return ctx;
}
