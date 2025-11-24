// app/(main)/fasting/page.tsx
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import {
  readFastingState,
  startFast,
  endFast,
  computeFastingDurationMs,
  formatDuration,
  fastingMilestones,
  type FastingState,
} from "@/lib/fasting";
import LiftOnMount from "@/components/LiftOnMount";

const isoNow = () => new Date().toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

export default function FastingPageClient() {
  const [state, setState] = useState<FastingState>({ startedAtIso: null });
  const [startInput, setStartInput] = useState(isoNow());
  const [tick, setTick] = useState(0); // force refresh while active

  useEffect(() => {
    setState(readFastingState());
  }, []);

  useEffect(() => {
    if (!state.startedAtIso || state.endedAtIso) return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [state.startedAtIso, state.endedAtIso]);

  const hasActiveFast = !!state.startedAtIso && !state.endedAtIso;
  const durationMs = computeFastingDurationMs(state);
  const milestones = fastingMilestones(durationMs);

  const handleStart = () => {
    const iso = startInput || isoNow();
    startFast(iso);
    setState(readFastingState());
  };

  const handleEnd = () => {
    endFast(new Date().toISOString());
    setState(readFastingState());
  };

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
                FASTING
              </h2>
            </header>

            <section className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-lg shadow-black/40">
              {hasActiveFast ? (
                <>
                  <div className="text-sm opacity-70">Current fast</div>
                  <div className="mt-1 text-3xl font-semibold">
                    {formatDuration(durationMs)}
                  </div>
                  <div className="mt-1 text-xs opacity-70">
                    Started at{" "}
                    <span className="font-mono">
                      {state.startedAtIso?.replace("T", " ").slice(0, 16)}
                    </span>
                  </div>

                  <button
                    onClick={handleEnd}
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20"
                  >
                    End fast
                  </button>
                </>
              ) : (
                <>
                  <div className="text-sm opacity-70">Start a new fast</div>
                  <label className="mt-3 flex flex-col gap-1 text-xs">
                    <span className="opacity-80">Start time</span>
                    <input
                      type="datetime-local"
                      value={startInput}
                      onChange={(e) => setStartInput(e.target.value)}
                      className="rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-sm outline-none focus:border-emerald-400/80"
                    />
                  </label>

                  <button
                    onClick={handleStart}
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-sky-400/60 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-100 hover:bg-sky-500/20"
                  >
                    Start fast
                  </button>
                </>
              )}
            </section>

            {durationMs > 0 && (
              <section className="rounded-2xl border border-white/5 bg-black/30 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide opacity-60">
                  What this fast means
                </div>
                <ul className="mt-2 space-y-2 text-xs">
                  {milestones.map((m, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </main>
        </LiftOnMount>
      </AppLayout>
    </ProtectedRoute>
  );
}
