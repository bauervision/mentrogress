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
import TimerPanel from "@/components/TimerPanel";
import { TemplatePickerDialog } from "./TemplatePickerDialog";
import { SavedSet } from "@/lib/types";
import {
  fmtDuration,
  gatherSessionSetsFor,
  isoToday,
  KG2LB,
} from "./logHelpers";
import { Clock3, Layers } from "lucide-react";

export default function LogClient() {
  const params = useSearchParams();
  const router = useRouter();

  const paramTemplateId = params.get("template") || "";
  const allTemplates: Template[] = useMemo(() => readTemplates(), []);
  const units = readProfile().unitSystem ?? "imperial";

  const [extraExercises, setExtraExercises] = useState<
    { id: string; name: string }[]
  >([]);
  const [showAddExerciseDialog, setShowAddExerciseDialog] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [showTimer, setShowTimer] = useState(false);
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

    // Regular template exercises
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

    // Extra exercises added for this workout
    for (const ex of extraExercises) {
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
  }, [activeTemplate, active?.templateId, extraExercises]);

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
    setExtraExercises([]); // 🔹 reset extras for new workout
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
              <h2
                className="justify-self-start text-3xl accent-outline"
                style={{
                  fontFamily: "var(--font-brand), system-ui, sans-serif",
                }}
              >
                LOG
              </h2>

              {activeTemplate ? (
                <span
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm"
                  style={{ borderColor: "var(--stroke)" }}
                  title="Active template"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-black/30">
                    <IconForName
                      name={activeTemplate.name}
                      iconKey={activeTemplate.iconKey}
                      className="h-5 w-5 opacity-90"
                    />
                  </span>
                  <span>{activeTemplate.name}</span>
                </span>
              ) : null}

              {/* 🔹 Timer toggle button */}
              <button
                type="button"
                onClick={() => setShowTimer((v) => !v)}
                title={showTimer ? "Hide timer" : "Show timer"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-black/40 text-xs opacity-80 hover:opacity-100"
                style={{
                  borderColor: showTimer ? "var(--accent)" : "var(--stroke)",
                }}
              >
                <Clock3 className="h-4 w-4" />
              </button>
            </header>

            {showTimer && <TimerPanel />}

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
                        setExtraExercises([]);
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

                {/* 🔹 Extra exercises added for this session */}
                {extraExercises.map((ex) => (
                  <SetEntry
                    key={ex.id}
                    exerciseId={ex.id}
                    label={ex.name}
                    recentSessionsForExercise={7}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => setShowAddExerciseDialog(true)}
                  className="mt-2 rounded-full border border-sky-400/70 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100 hover:bg-sky-500/20"
                >
                  + Exercise
                </button>
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

        {showAddExerciseDialog && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-black/90 p-4">
              <h2 className="text-sm font-semibold">Add exercise</h2>
              <p className="mt-1 text-xs opacity-70">
                This exercise will be added to this workout. You can choose to
                update the template after you finish.
              </p>

              <form
                className="mt-3 space-y-3 text-xs"
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = newExerciseName.trim();
                  if (!name) return;
                  setExtraExercises((prev) => [
                    ...prev,
                    { id: `extra-${Date.now()}`, name },
                  ]);
                  setNewExerciseName("");
                  setShowAddExerciseDialog(false);
                }}
              >
                <label className="flex flex-col gap-1">
                  <span className="opacity-80">Exercise name</span>
                  <input
                    autoFocus
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-xs outline-none focus:border-sky-400/80"
                  />
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddExerciseDialog(false);
                      setNewExerciseName("");
                    }}
                    className="rounded-full border border-white/10 px-3 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full border border-sky-400/70 bg-sky-500/10 px-3 py-1 font-medium text-sky-100 hover:bg-sky-500/20"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
