// components/TimerPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

type TimerMode = "stopwatch" | "countdown" | "tabata";

type TabataState = {
  workSec: number;
  restSec: number;
  rounds: number;
};

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}

export default function TimerPanel() {
  const [mode, setMode] = useState<TimerMode>("stopwatch");
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // countdown config
  const [countdownMinutes, setCountdownMinutes] = useState(5);

  // tabata config
  const [tabata, setTabata] = useState<TabataState>({
    workSec: 20,
    restSec: 10,
    rounds: 8,
  });
  const [tabataRound, setTabataRound] = useState(1);
  const [tabataPhase, setTabataPhase] = useState<"work" | "rest">("work");

  // ticking
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // tabata / countdown behavior
  useEffect(() => {
    if (!running) return;

    if (mode === "countdown") {
      const total = countdownMinutes * 60;
      if (seconds >= total) {
        setRunning(false);
      }
    }

    if (mode === "tabata") {
      const phaseLimit =
        tabataPhase === "work" ? tabata.workSec : tabata.restSec;

      if (seconds >= phaseLimit) {
        setSeconds(0);
        if (tabataPhase === "work") {
          setTabataPhase("rest");
        } else {
          if (tabataRound >= tabata.rounds) {
            setRunning(false);
          } else {
            setTabataRound((r) => r + 1);
            setTabataPhase("work");
          }
        }
      }
    }
  }, [
    seconds,
    running,
    mode,
    countdownMinutes,
    tabata,
    tabataPhase,
    tabataRound,
  ]);

  const handleStart = () => {
    setRunning(true);
    // for countdown, start from 0 and count up towards total
    // for stopwatch and tabata, same behavior
  };

  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setSeconds(0);
    setTabataRound(1);
    setTabataPhase("work");
  };

  const displaySeconds =
    mode === "countdown"
      ? Math.max(0, countdownMinutes * 60 - seconds)
      : seconds;

  const tabataLabel =
    mode === "tabata"
      ? `Round ${tabataRound}/${tabata.rounds} – ${
          tabataPhase === "work" ? "Work" : "Rest"
        }`
      : "";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="opacity-70">Timer</span>
          <select
            value={mode}
            onChange={(e) => {
              handleReset();
              setMode(e.target.value as TimerMode);
            }}
            className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs outline-none"
          >
            <option value="stopwatch">Stopwatch</option>
            <option value="countdown">Countdown</option>
            <option value="tabata">Tabata</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={running ? handlePause : handleStart}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sky-400/60 bg-sky-500/10 hover:bg-sky-500/20"
          >
            {running ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/40 hover:bg-black/60"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-3xl font-semibold tabular-nums">
          {formatMmSs(displaySeconds)}
        </div>
        {mode === "tabata" && (
          <div className="rounded-full border border-amber-400/60 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-100">
            {tabataLabel}
          </div>
        )}
      </div>

      {/* Config */}
      {mode === "countdown" && (
        <div className="mt-3 flex items-center gap-2">
          <span className="opacity-70">Minutes:</span>
          <input
            type="number"
            min={1}
            max={120}
            value={countdownMinutes}
            onChange={(e) => setCountdownMinutes(Number(e.target.value) || 1)}
            className="w-16 rounded-md border border-white/10 bg-black/70 px-2 py-1 text-xs outline-none"
          />
        </div>
      )}

      {mode === "tabata" && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-1">
            <span className="opacity-70">Work (s)</span>
            <input
              type="number"
              min={5}
              max={120}
              value={tabata.workSec}
              onChange={(e) =>
                setTabata((t) => ({
                  ...t,
                  workSec: Number(e.target.value) || 20,
                }))
              }
              className="w-full rounded-md border border-white/10 bg-black/70 px-2 py-1 text-xs outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="opacity-70">Rest (s)</span>
            <input
              type="number"
              min={5}
              max={120}
              value={tabata.restSec}
              onChange={(e) =>
                setTabata((t) => ({
                  ...t,
                  restSec: Number(e.target.value) || 10,
                }))
              }
              className="w-full rounded-md border border-white/10 bg-black/70 px-2 py-1 text-xs outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="opacity-70">Rounds</span>
            <input
              type="number"
              min={1}
              max={20}
              value={tabata.rounds}
              onChange={(e) =>
                setTabata((t) => ({
                  ...t,
                  rounds: Number(e.target.value) || 8,
                }))
              }
              className="w-full rounded-md border border-white/10 bg-black/70 px-2 py-1 text-xs outline-none"
            />
          </label>
        </div>
      )}
    </div>
  );
}
