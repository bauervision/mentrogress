"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LiftOnMount from "@/components/LiftOnMount";
import MiniToast from "@/components/MiniToast";
import { useEffect, useState } from "react";
import {
  readProfile,
  type Profile,
  onTrackInfo,
  kgToLb,
  lbToKg,
  cmToFtIn,
  ftInToCm,
  dailyEnergyPlan,
  writeProfileMerge,
} from "@/lib/profile";
import ToggleButton from "@/components/ToggleButton";
import DatePicker from "@/components/DatePicker";
import TonePicker from "@/components/TonePicker";
import { Save } from "lucide-react";
import { DangerZoneAllData } from "@/components/DangerZoneAllData";

export default function ProfileClient() {
  const [p, setP] = useState<Profile>(readProfile());
  const [toast, setToast] = useState<string | null>(null);

  // local UI fields for imperial inputs
  const { ft, inch } = p.heightCm ? cmToFtIn(p.heightCm) : { ft: "", inch: "" };
  const weightLb = p.weightKg != null ? round1(kgToLb(p.weightKg)) : "";
  const goalLb = p.goalWeightKg != null ? round1(kgToLb(p.goalWeightKg)) : "";

  useEffect(() => setP(readProfile()), []);

  function save() {
    writeProfileMerge(p);
    setToast("Profile saved ✓");
    setTimeout(() => setToast(null), 1400);
  }

  const info = onTrackInfo(p);
  const energy = dailyEnergyPlan(p);

  return (
    <ProtectedRoute>
      <AppLayout>
        <LiftOnMount>
          <main className="p-4 max-w-md mx-auto space-y-3">
            {toast && <MiniToast text={toast} />}

            {/* Header with sticky Save button */}
            <div className="flex items-center justify-between gap-2">
              <h2
                className="justify-self-start text-3xl accent-outline"
                style={{
                  fontFamily: "var(--font-brand), system-ui, sans-serif",
                }}
              >
                Profile & Goals
              </h2>
              <button
                onClick={save}
                aria-label="Save profile"
                title="Save profile"
                className="accent-btn rounded-xl p-3"
              >
                <Save className="w-5 h-5 stroke-black!" />
              </button>
            </div>

            {/* Units toggle */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-2 flex">
              <ToggleButton
                active={p.unitSystem === "imperial"}
                onClick={() =>
                  setP((prev) => ({ ...prev, unitSystem: "imperial" }))
                }
              >
                Imperial (lb / ft·in)
              </ToggleButton>
              <ToggleButton
                active={p.unitSystem === "metric"}
                onClick={() =>
                  setP((prev) => ({ ...prev, unitSystem: "metric" }))
                }
              >
                Metric (kg / cm)
              </ToggleButton>
            </div>

            {/* Row 1: Age + Height */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age">
                <input
                  className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                  inputMode="numeric"
                  value={p.age ?? ""}
                  onChange={(e) =>
                    setP({ ...p, age: numOrNull(e.target.value) })
                  }
                />
              </Field>

              {/* Height (unit-aware) */}
              {p.unitSystem === "imperial" ? (
                <Field label="Height (ft / in)">
                  <div className="flex gap-2">
                    <input
                      className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                      inputMode="numeric"
                      placeholder="ft"
                      value={ft ?? ""}
                      onChange={(e) => {
                        const ftVal = numOrZero(e.target.value);
                        const cm = ftInToCm(ftVal, Number(inch) || 0);
                        setP({ ...p, heightCm: cm });
                      }}
                    />
                    <input
                      className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                      inputMode="decimal"
                      placeholder="in"
                      value={inch ?? ""}
                      onChange={(e) => {
                        const inVal = numOrZero(e.target.value);
                        const cm = ftInToCm(Number(ft) || 0, inVal);
                        setP({ ...p, heightCm: cm });
                      }}
                    />
                  </div>
                </Field>
              ) : (
                <Field label="Height (cm)">
                  <input
                    className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                    inputMode="decimal"
                    value={p.heightCm ?? ""}
                    onChange={(e) =>
                      setP({ ...p, heightCm: numOrNull(e.target.value) })
                    }
                  />
                </Field>
              )}
            </div>

            {/* Row 2: Current + Goal weight */}
            <div className="grid grid-cols-2 gap-3">
              {p.unitSystem === "imperial" ? (
                <>
                  <Field label="Current weight (lb)">
                    <input
                      className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                      inputMode="decimal"
                      value={weightLb}
                      onChange={(e) => {
                        const lb = numOrNull(e.target.value);
                        setP({
                          ...p,
                          weightKg: lb != null ? lbToKg(lb) : null,
                        });
                      }}
                    />
                  </Field>
                  <Field label="Goal weight (lb)">
                    <input
                      className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                      inputMode="decimal"
                      value={goalLb}
                      onChange={(e) => {
                        const lb = numOrNull(e.target.value);
                        setP({
                          ...p,
                          goalWeightKg: lb != null ? lbToKg(lb) : null,
                        });
                      }}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Current weight (kg)">
                    <input
                      className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                      inputMode="decimal"
                      value={p.weightKg ?? ""}
                      onChange={(e) =>
                        setP({ ...p, weightKg: numOrNull(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Goal weight (kg)">
                    <input
                      className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                      inputMode="decimal"
                      value={p.goalWeightKg ?? ""}
                      onChange={(e) =>
                        setP({ ...p, goalWeightKg: numOrNull(e.target.value) })
                      }
                    />
                  </Field>
                </>
              )}
            </div>

            {/* Goal date */}
            <Field label="Goal date">
              <DatePicker
                value={p.goalDateISO}
                onChange={(iso) => setP({ ...p, goalDateISO: iso })}
              />
            </Field>

            {/* Weigh-in day */}
            <Field label="Weekly weigh-in day">
              <select
                className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                value={p.weighInDay ?? ""}
                onChange={(e) =>
                  setP({ ...p, weighInDay: (e.target.value || null) as any })
                }
              >
                <option value="">Choose a day</option>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            {/* Weekly target (unit-aware) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StatCard
                label="Weekly target"
                value={
                  info
                    ? p.unitSystem === "imperial"
                      ? fmtPerWeekLb(info.weeklyTargetKg)
                      : fmtPerWeekKg(info.weeklyTargetKg)
                    : "—"
                }
                hint={
                  info
                    ? hintFor(info, p.unitSystem)
                    : "Set current weight, goal weight, and goal date to see a weekly target."
                }
              />

              <StatCard
                label="Daily energy plan"
                value={
                  energy
                    ? `${Math.round(energy.kcalPerDay / 10) * 10} kcal/day ${
                        energy.mode
                      }`
                    : "—"
                }
                hint={
                  energy
                    ? energy.mode === "deficit"
                      ? "Estimated daily calorie deficit to meet your weekly target."
                      : "Estimated daily calorie surplus to meet your weekly target."
                    : "Set weight, goal weight, and goal date to see a daily plan."
                }
              />
            </div>
            <TonePicker />
            <DangerZoneAllData />
          </main>
        </LiftOnMount>
      </AppLayout>
    </ProtectedRoute>
  );
}

/* — helpers — */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm opacity-80">{label}</span>
      {children}
    </label>
  );
}
const numOrNull = (v: string) => {
  const n = Number(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && v !== "" ? n : null;
};
const numOrZero = (v: string) => {
  const n = Number(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const round1 = (n: number) => Math.round(n * 10) / 10;

function fmtPerWeekKg(x: number) {
  const s = Math.abs(x).toFixed(2);
  return `${x >= 0 ? "-" : "+"}${s} kg/wk`;
}
function fmtPerWeekLb(x: number) {
  const lb = kgToLb(x);
  const s = Math.abs(lb).toFixed(2);
  return `${lb >= 0 ? "-" : "+"}${s} lb/wk`;
}
function hintFor(
  info: ReturnType<typeof onTrackInfo>,
  units: "imperial" | "metric"
) {
  const kg = Math.abs(info?.deltaToGoalKg ?? 0);
  if (units === "imperial") {
    const lb = kgToLb(kg);
    return `To ${info!.deltaToGoalKg >= 0 ? "lose" : "gain"} ${lb.toFixed(
      1
    )} lb by your goal date.`;
  }
  return `To ${info!.deltaToGoalKg >= 0 ? "lose" : "gain"} ${kg.toFixed(
    1
  )} kg by your goal date.`;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
      {/* Center the row content vertically with a comfortable min height */}
      <div className="min-h-8 flex items-center justify-between">
        <span className="text-sm opacity-80">{label}</span>
        <span className="accent-outline text-2xl font-semibold tracking-tight">
          {value}
        </span>
      </div>
      <div className="mt-1 text-xs opacity-70">{hint}</div>
    </div>
  );
}
