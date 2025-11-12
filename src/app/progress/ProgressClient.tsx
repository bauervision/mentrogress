"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LiftOnMount from "@/components/LiftOnMount";
import { allEntriesAsc } from "@/lib/logs";
import {
  windowByDays,
  totalVolumeKg,
  bestSet,
  byDayVolumeKg,
  workoutDaysCount,
  type FlatLog,
} from "@/lib/progress";
import { useMemo, useSyncExternalStore } from "react";
import { readProfile } from "@/lib/profile";

// ---- units helpers ----
type Units = "metric" | "imperial";
const KG_TO_LB = 2.20462262185;
function useProfileVersion() {
  return useSyncExternalStore<number>(
    (onChange) => {
      const handler = () => onChange();
      window.addEventListener("storage", handler);
      window.addEventListener("mentrogress:profile", handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener("mentrogress:profile", handler);
      };
    },
    () => Number(localStorage.getItem("mentrogress_profile_v1:version") || "0"),
    () => 0
  );
}

function useUnits(): "imperial" | "metric" {
  // re-run when profile version bumps
  useProfileVersion();
  const u = readProfile().unitSystem;
  return u === "imperial" ? "imperial" : "metric";
}

function convertWeight(wKg: number, units: Units) {
  return units === "imperial" ? wKg * KG_TO_LB : wKg;
}
function convertVolume(volKgReps: number, units: Units) {
  // volume = weight * reps; only weight changes unit
  return units === "imperial" ? volKgReps * KG_TO_LB : volKgReps;
}
function unitLabel(units: Units) {
  return units === "imperial" ? "lb·reps" : "kg·reps";
}

function useLocalStorageVersion() {
  return useSyncExternalStore<number>(
    (onChange) => {
      const handler = () => onChange();
      window.addEventListener("storage", handler);
      window.addEventListener("mentrogress:logs", handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener("mentrogress:logs", handler);
      };
    },
    () => Number(localStorage.getItem("mentrogress_logs_v1:version") || "0"),
    () => 0
  );
}

export default function ProgressClient() {
  // re-render when logs change
  useLocalStorageVersion();

  const units = useUnits();

  const data = useMemo(() => {
    const all = allEntriesAsc() as FlatLog[];
    const recent = windowByDays(all, 28);

    // compute in kg first
    const volumeKg = totalVolumeKg(recent);
    const dailyKg = byDayVolumeKg(recent);
    const best = bestSet(recent);
    const days = workoutDaysCount(recent);

    // convert for display if needed
    const volume = convertVolume(volumeKg, units);
    const daily = dailyKg.map((d) => ({
      date: d.date,
      volumeKgReps: convertVolume(d.volumeKgReps, units),
    }));
    const bestDisplay =
      best &&
      ({
        ...best,
        entry: {
          ...best.entry,
          weightDisplay: convertWeight(best.entry.weightKg, units),
        },
      } as const);

    const min = daily.length
      ? Math.min(...daily.map((d) => d.volumeKgReps))
      : 0;
    const max = daily.length
      ? Math.max(...daily.map((d) => d.volumeKgReps))
      : 0;

    return { recent, volume, best: bestDisplay, days, daily, min, max };
  }, [units]);

  return (
    <ProtectedRoute>
      <AppLayout>
        <LiftOnMount>
          <main className="p-4 max-w-xl mx-auto space-y-4">
            <header className="flex items-end justify-between">
              <h2 className="text-xl font-semibold accent-outline">Progress</h2>
              <p className="text-xs opacity-70">Last 28 days</p>
            </header>

            {/* KPI Row */}
            <section className="grid grid-cols-3 gap-2">
              <KpiCard
                label="Total Volume"
                value={fmtInt(data.volume)}
                suffix={unitLabel(units)}
              />
              <KpiCard
                label="Best Set"
                value={
                  data.best
                    ? `${round1(data.best.entry.weightDisplay)}×${
                        data.best.entry.reps
                      }`
                    : "—"
                }
                hint={data.best ? data.best.entry.isoDate : undefined}
              />
              <KpiCard label="Active Days" value={String(data.days)} />
            </section>

            {/* Daily Volume chart */}
            <section
              className="rounded-2xl border p-3 bg-(--surface)"
              style={{ borderColor: "var(--stroke)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Daily Volume</h3>
                <span className="text-xs opacity-70">{unitLabel(units)}</span>
              </div>

              <InlineSparkline values={data.daily.map((d) => d.volumeKgReps)} />

              <div className="mt-2 grid grid-cols-2 text-xs opacity-75">
                <span>Min: {fmtInt(data.min)}</span>
                <span className="text-right">Max: {fmtInt(data.max)}</span>
              </div>
            </section>

            {/* Milestones placeholder */}
            <section
              className="rounded-2xl border p-3 bg-(--surface)"
              style={{ borderColor: "var(--stroke)" }}
            >
              <h3 className="text-sm font-medium mb-1">Milestones</h3>
              <p className="text-sm opacity-75">
                PRs & 1RM estimates per exercise coming next.
              </p>
            </section>
          </main>
        </LiftOnMount>
      </AppLayout>
    </ProtectedRoute>
  );
}

function KpiCard({
  label,
  value,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-2xl border p-3 bg-(--surface)"
      style={{ borderColor: "var(--stroke)" }}
    >
      <div className="text-[11px] opacity-70">{label}</div>
      <div className="text-lg font-semibold tracking-tight">
        <span style={{ color: "var(--accent)" }}>{value}</span>
        {suffix && <span className="text-xs opacity-60 ml-1">{suffix}</span>}
      </div>
      {hint && (
        <div className="text-[11px] opacity-60 truncate mt-1">{hint}</div>
      )}
    </div>
  );
}

function fmtInt(n: number) {
  const v = Math.round(Number.isFinite(n) ? n : 0);
  return v.toLocaleString();
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}

// Minimal inline sparkline (responsive width, fixed 64px height)
function InlineSparkline({ values }: { values: number[] }) {
  const h = 64;
  const pad = 4;
  const w = 360;
  const xs = values.length ? values : [0];
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  const span = max - min || 1;

  const pts = xs.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(xs.length - 1, 1);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16 block">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
