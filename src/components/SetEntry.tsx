"use client";
import { useMemo, useState } from "react";
import { readProfile } from "@/lib/profile";
import {
  addSet,
  listSetsAsc,
  lastSetBefore,
  bestBefore,
  updateSet,
  removeSet,
  type SetEntryLog,
} from "@/lib/logs";
import { gatekeepSet } from "@/lib/gatekeeper";
import GateBanner from "./GateBanner";
import {
  Pencil,
  Trash2,
  Check,
  X,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import Sparkline from "./Sparkline";

const isoToday = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export default function SetEntry({
  exerciseId,
  label,
  recentSessionsForExercise = 0,
  onSaved,
}: {
  exerciseId: string;
  label: string;
  recentSessionsForExercise?: number;
  onSaved?: (saved: {
    isoDate: string;
    weightKg: number;
    reps: number;
  }) => void;
}) {
  const units = readProfile().unitSystem ?? "imperial";
  const [w, setW] = useState("");
  const [r, setR] = useState("");
  const [v, setV] = useState(0); // refresh tick
  const [collapsed, setCollapsed] = useState(false);
  const [lastSummary, setLastSummary] = useState<string>("");
  const [showRecent, setShowRecent] = useState(false);
  const today = isoToday();

  const best = useMemo(
    () => bestBefore(exerciseId, today),
    [exerciseId, today, v]
  );
  const last = useMemo(
    () => lastSetBefore(exerciseId, today),
    [exerciseId, today, v]
  );

  const verdict = useMemo(() => {
    const weight = Number(w);
    const reps = Number(r);
    if (!weight || !reps) return null;
    return gatekeepSet({
      bestBefore: best,
      lastSet: last,
      weight,
      reps,
      units,
      recentSessionsForExercise,
    });
  }, [w, r, units, best, last, recentSessionsForExercise]);

  function saveSet() {
    const weightKg = units === "imperial" ? lbToKg(Number(w)) : Number(w);
    const reps = Number(r) || 0;
    if (!weightKg || !reps) return;
    const today = isoToday();
    addSet(exerciseId, { isoDate: today, weightKg, reps });
    setR(""); // keep weight handy
    setV((x) => x + 1);

    const wtDisp =
      units === "imperial"
        ? `${Math.round(kgToLb(weightKg))} lb`
        : `${Math.round(weightKg)} kg`;
    setLastSummary(`${wtDisp} × ${reps} on ${today}`);
    setCollapsed(true);
    onSaved?.({ isoDate: today, weightKg, reps });
  }

  const recent = useMemo(
    () => listSetsAsc(exerciseId).slice().reverse().slice(0, 6),
    [exerciseId, v]
  );

  if (collapsed) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2
              className="w-5 h-5"
              style={{ color: "var(--accent)" }}
            />
            {label}
          </div>
          <button
            className="rounded border px-2 py-1 text-xs"
            style={{ borderColor: "var(--stroke)" }}
            onClick={() => setCollapsed(false)}
          >
            Edit
          </button>
        </div>

        <div className="text-xs opacity-80">Completed: {lastSummary}</div>

        {/* Accordion trigger */}
        {!!recent.length && (
          <>
            <button
              onClick={() => setShowRecent((s) => !s)}
              className="w-full rounded-lg border px-2 py-1 text-left text-xs flex items-center justify-between"
              style={{ borderColor: "var(--stroke)" }}
            >
              <span className="opacity-70">Recent sets</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showRecent ? "rotate-180" : ""
                }`}
              />
            </button>

            {showRecent && (
              <div className="mt-2">
                <RecentList
                  exerciseId={exerciseId}
                  items={recent}
                  units={units}
                  onChange={() => setV((x) => x + 1)}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
      <div className="text-sm opacity-80">{label}</div>

      {verdict && (
        <GateBanner
          verdict={verdict.verdict}
          title={verdict.title}
          detail={verdict.detail}
          suggestion={verdict.suggestedWeightDisplay}
          onUseSuggestion={
            verdict.suggestedWeightKg
              ? () => {
                  const val =
                    units === "imperial"
                      ? Math.round(kgToLb(verdict.suggestedWeightKg!))
                      : Math.round(verdict.suggestedWeightKg!);
                  setW(String(val));
                }
              : undefined
          }
        />
      )}

      <div className="grid grid-cols-3 gap-2">
        <input
          className="rounded-xl px-3 py-2 bg-black/40 border border-white/10"
          placeholder={units === "imperial" ? "Weight (lb)" : "Weight (kg)"}
          inputMode="decimal"
          value={w}
          onChange={(e) => setW(e.target.value)}
        />
        <input
          className="rounded-xl px-3 py-2 bg-black/40 border border-white/10"
          placeholder="Reps"
          inputMode="numeric"
          value={r}
          onChange={(e) => setR(e.target.value)}
        />

        <button
          onClick={saveSet}
          className="accent-btn w-full rounded-xl px-3 py-2 font-medium"
        >
          Save set
        </button>
      </div>

      {!!recent.length && (
        <>
          <button
            onClick={() => setShowRecent((s) => !s)}
            className="w-full rounded-lg border px-2 py-1 text-left text-xs flex items-center justify-between"
            style={{ borderColor: "var(--stroke)" }}
          >
            <span className="opacity-70">Recent sets (newest first)</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showRecent ? "rotate-180" : ""
              }`}
            />
          </button>

          {showRecent && (
            <div className="mt-2">
              <RecentList
                exerciseId={exerciseId}
                items={recent}
                units={units}
                onChange={() => setV((x) => x + 1)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---- Recent list with edit/delete ---- */

function RecentList({
  exerciseId,
  items,
  units,
  onChange,
}: {
  exerciseId: string;
  items: SetEntryLog[];
  units: "imperial" | "metric";
  onChange: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [wEdit, setWEdit] = useState("");
  const [rEdit, setREdit] = useState("");

  function startEdit(it: SetEntryLog) {
    setEditing(it.id);
    setWEdit(
      units === "imperial"
        ? String(Math.round(kgToLb(it.weightKg)))
        : String(Math.round(it.weightKg))
    );
    setREdit(String(it.reps));
  }
  function cancel() {
    setEditing(null);
  }
  function save(id: string) {
    const weightKg =
      units === "imperial" ? lbToKg(Number(wEdit)) : Number(wEdit);
    updateSet(exerciseId, id, {
      weightKg,
      reps: Number(rEdit) || 0,
    });
    setEditing(null);
    onChange();
  }
  function remove(id: string) {
    removeSet(exerciseId, id);
    onChange();
  }

  const loadsChrono = useMemo(() => {
    // last 8 loads in chronological order
    const asc = listSetsAsc(exerciseId);
    const last8 = asc.slice(-8);
    return last8.map((e) => e.weightKg * e.reps);
  }, [exerciseId]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
      <div className="text-xs opacity-70">Recent sets (newest first)</div>

      {/* header row: title + sparkline */}
      <div className="flex items-center justify-between gap-2">
        <div className="shrink-0 opacity-80">
          <Sparkline values={loadsChrono} />
        </div>
      </div>

      {items.map((it) =>
        editing === it.id ? (
          <div
            key={it.id || `${it.isoDate}-${it.weightKg}-${it.reps}`}
            className="grid grid-cols-[1fr_auto_auto] gap-2 items-center"
          >
            <div className="grid grid-cols-3 gap-2">
              <input
                className="rounded px-2 py-1 bg-black/40 border border-white/10"
                inputMode="decimal"
                value={wEdit}
                onChange={(e) => setWEdit(e.target.value)}
              />
              <input
                className="rounded px-2 py-1 bg-black/40 border border-white/10"
                inputMode="numeric"
                value={rEdit}
                onChange={(e) => setREdit(e.target.value)}
              />
            </div>
            <button
              className="rounded border px-2 py-1 text-xs"
              onClick={() => save(it.id)}
            >
              <Check size={14} />
            </button>
            <button
              className="rounded border px-2 py-1 text-xs"
              onClick={cancel}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            key={it.id}
            className="grid grid-cols-[1fr_auto_auto] gap-2 items-center"
          >
            <div className="text-[11px] opacity-80">
              <span className="opacity-60 mr-2">{it.isoDate}</span>
              <span className="font-medium">
                {units === "imperial"
                  ? `${Math.round(kgToLb(it.weightKg))} lb`
                  : `${Math.round(it.weightKg)} kg`}
              </span>
              <span className="opacity-70"> × {it.reps}</span>
            </div>
            <button
              className="rounded border px-2 py-1 text-xs"
              onClick={() => startEdit(it)}
            >
              <Pencil size={14} />
            </button>
            <button
              className="rounded border px-2 py-1 text-xs"
              onClick={() => remove(it.id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      )}
    </div>
  );
}

/* tiny helpers */
function kgToLb(n: number) {
  return n * 2.2046226218;
}
function lbToKg(n: number) {
  return n / 2.2046226218;
}
