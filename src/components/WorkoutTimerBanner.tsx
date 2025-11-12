// components/WorkoutTimerBanner.tsx
"use client";
import { useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";

export default function WorkoutTimerBanner({
  elapsedMs,
  isRunning,
  onStart,
  onPause,
}: {
  elapsedMs: number; // computed outside
  isRunning: boolean;
  onStart: () => void; // resume or first start
  onPause: () => void;
}) {
  const s = Math.max(0, Math.floor(elapsedMs / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");

  const hasStarted = elapsedMs > 0 || isRunning;

  return (
    <div
      className="rounded-xl border px-3 py-2 bg-(--surface) flex items-center justify-between"
      style={{ borderColor: "var(--stroke)" }}
    >
      <div className="font-semibold text-3xl tabular-nums leading-none">
        {mm}:{ss}
      </div>

      {!hasStarted ? (
        <button
          onClick={onStart}
          className="accent-btn rounded-xl px-3 py-1.5 bg-white text-black text-sm"
        >
          Start workout
        </button>
      ) : (
        <button
          onClick={isRunning ? onPause : onStart}
          className="rounded-full p-2 border"
          style={{ borderColor: "var(--stroke)" }}
          aria-label={isRunning ? "Pause workout" : "Resume workout"}
          title={isRunning ? "Pause workout" : "Resume workout"}
        >
          {isRunning ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
}
