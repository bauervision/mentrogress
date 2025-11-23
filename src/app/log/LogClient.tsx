"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LiftOnMount from "@/components/LiftOnMount";
import SetEntry from "@/components/SetEntry";
import { IconForName } from "@/lib/iconForName";
import { readTemplates, type Template } from "@/lib/templates";
import { listSetsAsc } from "@/lib/logs";
import { readProfile } from "@/lib/profile";
import { useActiveWorkout } from "@/providers/ActiveWorkoutProvider";
import { SummaryDialog } from "@/components/SummaryDialog";
import { DangerZoneToday } from "@/components/DangerZoneToday";

type SavedSet = {
  exerciseId: string;
  isoDate: string;
  weightKg: number;
  reps: number;
};

const isoToday = () => new Date().toISOString().slice(0, 10);
const KG2LB = 2.2046226218;
const fmtDuration = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

function gatherSessionSetsFor(template: Template | null, preferToday = true) {
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

export default function LogClient() {
  const params = useSearchParams();
  const router = useRouter();

  const paramTemplateId = params.get("template") || "";
  const allTemplates: Template[] = useMemo(() => readTemplates(), []);
  const units = readProfile().unitSystem ?? "imperial";

  // Active workout provider
  const { active, start, pause, resume, end, elapsedMs, selectTemplate } =
    useActiveWorkout();

  // Derive current template from provider (truth source)
  const activeTemplate: Template | null = useMemo(() => {
    const id = (active?.templateId ?? paramTemplateId) || null;
    return id ? allTemplates.find((t) => t.id === id) ?? null : null;
  }, [allTemplates, active?.templateId, paramTemplateId]);

  // If we landed with ?template= and provider not started, start it; otherwise open picker when nothing is active.
  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => {
    if (paramTemplateId) {
      const t = allTemplates.find((x) => x.id === paramTemplateId);
      if (t && active?.templateId !== t.id) selectTemplate(t.id); // 🔹 no auto-start
      router.replace("/log");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramTemplateId]);

  // Re-render footer time each second while template active
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active?.templateId || !active.isRunning) return;
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [active?.templateId, active?.isRunning]);

  // Today’s sets for this template
  const todaysSets: SavedSet[] = useMemo(() => {
    if (!activeTemplate) return [];
    const today = isoToday();
    const out: SavedSet[] = [];
    for (const ex of activeTemplate.exercises || []) {
      for (const row of listSetsAsc(ex.id)) {
        if (row.isoDate === today) {
          out.push({
            exerciseId: ex.id,
            isoDate: row.isoDate,
            weightKg: row.weightKg,
            reps: row.reps,
          });
        }
      }
    }
    return out;
  }, [activeTemplate, active?.templateId]);

  const totalVolumeKgReps = useMemo(
    () => todaysSets.reduce((a, s) => a + s.weightKg * s.reps, 0),
    [todaysSets]
  );
  const totalVolume =
    units === "imperial" ? totalVolumeKgReps * KG2LB : totalVolumeKgReps;

  const durationStr = fmtDuration(elapsedMs());

  // End → freeze and open summary
  const [ended, setEnded] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    sets: SavedSet[];
    title: string;
    iconKey?: string;
    duration: string;
  } | null>(null);

  const onEndWorkout = () => {
    const finalMs = elapsedMs();
    pause();
    end(); // clears navbar icon via provider
    setEnded(true);
    setSummaryData({
      sets: todaysSets,
      title: activeTemplate?.name ?? "Workout",
      iconKey: activeTemplate?.iconKey,
      duration: fmtDuration(finalMs),
    });
    setSummaryOpen(true);
  };

  const onShowSummary = () => {
    // Use cached summary or rebuild from current day
    const fallback = {
      sets: todaysSets,
      title: activeTemplate?.name ?? "Workout",
      iconKey: activeTemplate?.iconKey,
      duration: fmtDuration(elapsedMs()),
    };
    setSummaryData((prev) => prev ?? fallback);
    setSummaryOpen(true);
  };

  function startTemplateByIndex(i: number) {
    const t = allTemplates[i];
    if (!t) return;
    selectTemplate(t.id); // 🔹 select only, don't run
    setEnded(false);
    setPickerOpen(false);
  }

  // If no workout active, allow viewing of last/today summary
  const lastSession = useMemo(() => {
    if (activeTemplate) return gatherSessionSetsFor(activeTemplate, true);
    // optionally peek at the first template if none active
    const first = allTemplates[0] ?? null;
    return gatherSessionSetsFor(first, true);
  }, [activeTemplate, allTemplates]);

  return (
    <ProtectedRoute>
      <AppLayout>
        <LiftOnMount>
          <main className="p-4 max-w-md mx-auto space-y-4">
            {/* Header */}
            <header className="flex items-center justify-between">
              <h2 className="text-xl font-semibold accent-outline">Log</h2>
              <div className="flex items-center justify-center gap-2">
                {activeTemplate ? (
                  <span
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm"
                    style={{ borderColor: "var(--stroke)" }}
                    title="Active template"
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-black/30">
                      <IconForName
                        name={activeTemplate.name}
                        iconKey={activeTemplate.iconKey}
                        className="w-5 h-5 opacity-90"
                      />
                    </span>
                    <span>{activeTemplate.name}</span>
                  </span>
                ) : null}
                <Link
                  href="/templates"
                  className="text-sm opacity-80 underline"
                >
                  Templates
                </Link>
              </div>
            </header>

            {/* Timer / controls */}
            {activeTemplate && (
              <section
                className="rounded-xl border p-3 bg-(--surface)"
                style={{ borderColor: "var(--stroke)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-semibold tracking-tight">
                    {fmtDuration(elapsedMs())}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Start / Pause */}
                    {!active?.isRunning ? (
                      <button
                        onClick={() =>
                          active?.templateId
                            ? resume()
                            : start(activeTemplate.id)
                        }
                        className="rounded-xl px-3 py-2 border text-sm"
                        style={{ borderColor: "var(--stroke)" }}
                      >
                        ▶︎ Start
                      </button>
                    ) : (
                      <button
                        onClick={pause}
                        className="rounded-xl px-3 py-2 border text-sm"
                        style={{ borderColor: "var(--stroke)" }}
                      >
                        ❚❚ Pause
                      </button>
                    )}

                    {/* ⏹ Stop (full bail) */}
                    <button
                      onClick={() => {
                        // full bail from this session: clear provider state and local cache
                        setEnded(false);
                        setSummaryOpen(false);
                        setSummaryData(null);
                        end();
                      }}
                      className="rounded-xl px-3 py-2 border text-sm opacity-80 hover:opacity-100"
                      style={{ borderColor: "var(--stroke)" }}
                    >
                      ⏹ Stop
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Exercise entries or prompt */}
            {activeTemplate ? (
              <>
                {activeTemplate.exercises?.length ? (
                  activeTemplate.exercises.map((ex) => (
                    <SetEntry
                      key={ex.id}
                      exerciseId={ex.id}
                      label={ex.name}
                      recentSessionsForExercise={7}
                    />
                  ))
                ) : (
                  <div
                    className="rounded-xl border p-3 bg-(--surface)"
                    style={{ borderColor: "var(--stroke)" }}
                  >
                    <div className="text-sm opacity-80">
                      No exercises in this template yet.
                    </div>
                    <Link
                      href="/templates"
                      className="mt-2 inline-block rounded-xl px-3 py-2 border text-sm"
                      style={{ borderColor: "var(--stroke)" }}
                    >
                      Edit Template
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div
                className="rounded-xl border p-3 bg-(--surface)"
                style={{ borderColor: "var(--stroke)" }}
              >
                <div className="text-sm opacity-80 mb-2">
                  No active template. Choose a template to start a workout.
                </div>
                <button
                  onClick={() => setPickerOpen(true)}
                  className="rounded-xl px-3 py-2 border text-sm"
                  style={{ borderColor: "var(--stroke)" }}
                >
                  Choose Template
                </button>

                {lastSession.date && lastSession.sets.length > 0 && (
                  <div
                    className="mt-3 rounded-xl border p-3"
                    style={{ borderColor: "var(--stroke)" }}
                  >
                    <div className="text-sm mb-2">
                      You have a session on{" "}
                      <span className="font-medium">{lastSession.date}</span>.
                    </div>
                    <button
                      onClick={() => {
                        const summaryTemplate: Template | null =
                          activeTemplate ?? allTemplates[0] ?? null;

                        setSummaryData({
                          sets: lastSession.sets,
                          title: summaryTemplate?.name ?? "Workout",
                          iconKey: summaryTemplate?.iconKey,
                          duration: "—",
                        });
                        setSummaryOpen(true);
                      }}
                      className="rounded-xl px-3 py-2 border text-sm"
                      style={{ borderColor: "var(--stroke)" }}
                    >
                      View summary
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Footer CTA */}
            {activeTemplate &&
              (todaysSets.length > 0 || active?.templateId) && (
                <div className="pt-2">
                  {!ended ? (
                    <>
                      <button
                        onClick={onEndWorkout}
                        className="accent-btn w-full rounded-xl px-3 py-2 bg-white text-black font-medium"
                      >
                        End workout
                      </button>
                      <div className="mt-2 text-xs opacity-70 text-center">
                        Session time: {durationStr} • Total volume:{" "}
                        <span
                          className="font-medium"
                          style={{ color: "var(--accent)" }}
                        >
                          {Math.round(totalVolume).toLocaleString()}{" "}
                          {units === "imperial" ? "lb·reps" : "kg·reps"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onShowSummary}
                        className="accent-btn w-full rounded-xl px-3 py-2 bg-white text-black font-medium"
                      >
                        Show summary
                      </button>
                      <div className="mt-2 text-xs opacity-70 text-center">
                        Session time:{" "}
                        {summaryData?.duration ?? fmtDuration(elapsedMs())} •
                        Total volume:{" "}
                        <span
                          className="font-medium"
                          style={{ color: "var(--accent)" }}
                        >
                          {Math.round(totalVolume).toLocaleString()}{" "}
                          {units === "imperial" ? "lb·reps" : "kg·reps"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

            {/* Danger zone (auto-hides if nothing to delete) */}
            {activeTemplate && typeof DangerZoneToday === "function" && (
              <DangerZoneToday template={activeTemplate} />
            )}
          </main>

          {/* Summary dialog */}
          {summaryOpen && summaryData && (
            <SummaryDialog
              units={units}
              sets={summaryData.sets}
              templateName={summaryData.title}
              templateIconKey={summaryData.iconKey}
              duration={summaryData.duration}
              onClose={() => setSummaryOpen(false)}
            />
          )}
        </LiftOnMount>

        {/* Template picker (same UX as Today) */}
        {pickerOpen && (
          <TemplatePickerDialog
            templates={allTemplates}
            onClose={() => setPickerOpen(false)}
            onPick={(i) => startTemplateByIndex(i)}
            currentTemplateId={activeTemplate?.id ?? null}
          />
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}

/* ----- inline picker ----- */
function TemplatePickerDialog({
  templates,
  onClose,
  onPick,
  currentTemplateId,
}: {
  templates: Template[];
  onClose: () => void;
  onPick: (index: number) => void;
  currentTemplateId?: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md rounded-2xl border bg-(--surface) shadow-2xl accent-outline overflow-hidden"
        style={{ borderColor: "var(--stroke)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b bg-white/3"
          style={{ borderColor: "var(--stroke)" }}
        >
          <div className="text-sm font-semibold tracking-wide">
            Choose a template
          </div>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-wide opacity-70 hover:opacity-100"
          >
            Close
          </button>
        </div>

        {/* List */}
        <ul className="max-h-72 overflow-auto py-1">
          {templates.map((t, i) => {
            const isActive = currentTemplateId && currentTemplateId === t.id;
            return (
              <li key={t.id}>
                <button
                  onClick={() => {
                    onPick(i);
                    onClose();
                  }}
                  className={[
                    "w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors",
                    "hover:bg-white/5",
                    isActive
                      ? "bg-white/5 border-l-4 border-[var(--accent)]"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    {t.exercises?.length ? (
                      <div className="text-xs opacity-70">
                        {t.exercises.length} exercises
                      </div>
                    ) : null}
                  </div>
                  {isActive && (
                    <span
                      className="text-[10px] px-2 py-1 rounded-full border"
                      style={{ borderColor: "var(--accent)" }}
                    >
                      Current
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {!templates.length && (
            <li className="px-4 py-3 text-sm opacity-70">No templates yet.</li>
          )}
        </ul>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t flex justify-end gap-2 bg-black/30"
          style={{ borderColor: "var(--stroke)" }}
        >
          <Link
            href="/templates"
            className="rounded-xl px-3 py-2 border text-sm"
            style={{ borderColor: "var(--stroke)" }}
          >
            Manage Templates
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm opacity-80 hover:opacity-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
