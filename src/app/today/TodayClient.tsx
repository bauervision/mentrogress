"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/providers/AuthProvider";
import AppLayout from "@/components/AppLayout";
import LiftOnMount from "@/components/LiftOnMount";
import WeighInQuickCard from "@/components/WeighInQuickCard";
import WeighInNudge from "@/components/WeighInNudge";

import { allEntriesAsc } from "@/lib/logs";
import { readTemplates, type Template } from "@/lib/templates";
import { useMemo, useState } from "react";
import Link from "next/link";

// simple 7d snapshot (kg·reps)
const KG_TO_LB = 2.20462262185;
function unitLabel(units: "imperial" | "metric") {
  return units === "imperial" ? "lb·reps" : "kg·reps";
}

function readUnits(): "imperial" | "metric" {
  try {
    const raw = localStorage.getItem("mentrogress_profile_v1");
    const u = (raw ? JSON.parse(raw)?.unitSystem : "metric") as
      | "imperial"
      | "metric";
    return u === "imperial" ? "imperial" : "metric";
  } catch {
    return "metric";
  }
}

const ROT_KEY = "mentrogress:lastTemplateIndex";
const getLastIdx = () => Number(localStorage.getItem(ROT_KEY) ?? "-1");
const setLastIdx = (i: number) => localStorage.setItem(ROT_KEY, String(i));

export default function TodayClient() {
  const { logout } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);

  const templates = useMemo<Template[]>(
    () => readTemplates(),
    [] // read once on mount; user can edit via /templates
  );

  const { suggestedIdx, suggestedName } = useMemo(() => {
    const anyLogs = (allEntriesAsc() || []).length > 0;
    const lastIdx = getLastIdx();
    const idx =
      templates.length === 0
        ? -1
        : anyLogs
        ? (lastIdx + 1 + templates.length) % templates.length
        : 0;
    return {
      suggestedIdx: idx,
      suggestedName: idx >= 0 ? templates[idx].name : "",
    };
  }, [templates]);

  function startTemplateByIndex(i: number) {
    if (i < 0 || i >= templates.length) return;
    setLastIdx(i);
    const t = templates[i];
    // Pass template id for preselection (safe if /log ignores).
    window.location.href = `/log?template=${encodeURIComponent(t.id)}`;
  }

  const units = readUnits();
  const { vol7d, days7d } = useMemo(() => {
    const all = allEntriesAsc();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    let vol = 0;
    const days = new Set<string>();
    for (const e of all) {
      const t = new Date(e.isoDate + "T00:00:00").getTime();
      if (t >= start.getTime() && t <= end.getTime()) {
        vol += e.weightKg * e.reps;
        days.add(e.isoDate);
      }
    }
    if (units === "imperial") vol *= KG_TO_LB;
    return { vol7d: Math.round(vol), days7d: days.size };
  }, [units]);

  return (
    <ProtectedRoute>
      <AppLayout>
        <LiftOnMount>
          <div className="flex-1 flex">
            <main
              className="p-4 max-w-md mx-auto flex-1 w-full rounded-2xl  bg-(--surface) pb-16 flex flex-col gap-4"
              style={{
                minHeight: "calc(100dvh - 56px)", // <-- bottom nav (h-14) space
              }}
            >
              {/* Header */}
              <header className="flex items-center justify-between mb-4">
                <h2 className="accent-outline text-xl font-semibold">Today</h2>
                <div className="flex items-center gap-3">
                  <Link
                    href="/templates"
                    className="rounded-xl px-3 py-1.5 border text-sm"
                    style={{ borderColor: "var(--stroke)" }}
                  >
                    Templates
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm opacity-80 underline"
                  >
                    Logout
                  </button>
                </div>
              </header>

              {/* Daily CTA */}
              <section
                className="rounded-xl border p-4 bg-(--surface) mb-4"
                style={{ borderColor: "var(--stroke)" }}
              >
                {templates.length ? (
                  <>
                    <p className="opacity-90 mb-3">
                      {getLastIdx() < 0 ? "Jump into " : "Knock out "}
                      <span
                        className="font-semibold"
                        style={{ color: "var(--accent)" }}
                      >
                        {suggestedName}
                      </span>
                      !
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startTemplateByIndex(suggestedIdx)}
                        className="accent-btn rounded-xl px-3 py-2 bg-white text-black font-medium"
                      >
                        Start {suggestedName}
                      </button>
                      <button
                        onClick={() => setPickerOpen(true)}
                        className="rounded-xl px-3 py-2 border text-sm"
                        style={{ borderColor: "var(--stroke)" }}
                      >
                        Choose Another
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="opacity-90 mb-2">Welcome to Mentrogress.</p>
                    <p className="text-sm opacity-70 mb-3">
                      Create your first workout template to get started.
                    </p>
                    <Link
                      href="/templates"
                      className="accent-btn inline-block text-sm rounded-xl px-3 py-2 bg-white text-black font-medium"
                    >
                      Create Templates
                    </Link>
                  </>
                )}
              </section>

              {/* Progress overview → button to Progress page */}
              <Link
                href="/progress"
                className="block rounded-xl border p-3 mb-4 hover:opacity-95 transition"
                style={{
                  borderColor: "var(--stroke)",
                  background: "color-mix(in oklab, var(--surface), black 5%)",
                }}
              >
                <div className="text-sm font-medium mb-1">
                  Progress overview
                </div>
                <div className="text-sm opacity-80">
                  7-day volume:{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--accent)" }}
                  >
                    {vol7d.toLocaleString()} {unitLabel(units)}
                  </span>{" "}
                  • Active days:{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--accent)" }}
                  >
                    {days7d}
                  </span>
                </div>
                <div className="mt-1 text-xs opacity-60">
                  Tap to see full charts & milestones
                </div>
              </Link>

              {/* MIDDLE wordmark */}
              <div className="flex-1 flex items-center justify-center">
                <h1
                  className="select-none pointer-events-none text-center
               text-7xl md:text-6xl leading-none tracking-wide"
                  style={{
                    fontFamily: "var(--font-brand), system-ui, sans-serif",
                  }}
                >
                  Mentrogress
                </h1>
              </div>
              {/* Weigh-in helpers at the bottom */}
              <WeighInNudge />
              <WeighInQuickCard />

              {/* Template picker dialog */}
              {pickerOpen && (
                <TemplatePickerDialog
                  templates={templates}
                  onClose={() => setPickerOpen(false)}
                  onPick={(i) => startTemplateByIndex(i)}
                />
              )}
            </main>
          </div>
        </LiftOnMount>
      </AppLayout>
    </ProtectedRoute>
  );
}

/* ---- tiny inline dialog ---- */
function TemplatePickerDialog({
  templates,
  onClose,
  onPick,
}: {
  templates: Template[];
  onClose: () => void;
  onPick: (index: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4 ">
      <div
        className="w-full max-w-sm rounded-2xl border bg-(--surface)"
        style={{ borderColor: "var(--stroke)" }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{ borderColor: "var(--stroke)" }}
        >
          <div className="text-sm font-medium">Choose a template</div>
          <button
            onClick={onClose}
            className="text-sm opacity-70 hover:opacity-100"
          >
            Close
          </button>
        </div>
        <ul className="max-h-72 overflow-auto py-1">
          {templates.map((t, i) => (
            <li key={t.id}>
              <button
                onClick={() => {
                  onPick(i);
                  onClose();
                }}
                className="w-full text-left px-3 py-2 hover:bg-white/5"
              >
                <div className="font-medium">{t.name}</div>
                {t.exercises?.length ? (
                  <div className="text-xs opacity-70">
                    {t.exercises.length} exercises
                  </div>
                ) : null}
              </button>
            </li>
          ))}
          {!templates.length && (
            <li className="px-3 py-2 text-sm opacity-70">No templates yet.</li>
          )}
        </ul>
        <div
          className="px-3 py-2 border-t flex justify-end gap-2"
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
            className="rounded-xl px-3 py-2 text-sm opacity-80"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
