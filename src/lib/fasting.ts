// lib/fasting.ts
"use client";

const FASTING_KEY = "mentrogress:fasting";

export type FastingState = {
  startedAtIso: string | null;
  endedAtIso?: string | null;
};

function safeParse(raw: string | null): FastingState | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (typeof obj !== "object" || !obj) return null;
    return {
      startedAtIso:
        typeof obj.startedAtIso === "string" ? obj.startedAtIso : null,
      endedAtIso:
        typeof obj.endedAtIso === "string" ? obj.endedAtIso : undefined,
    };
  } catch {
    return null;
  }
}

export function readFastingState(): FastingState {
  if (typeof window === "undefined") {
    return { startedAtIso: null, endedAtIso: undefined };
  }
  const raw = window.localStorage.getItem(FASTING_KEY);
  return safeParse(raw) ?? { startedAtIso: null, endedAtIso: undefined };
}

export function writeFastingState(state: FastingState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FASTING_KEY, JSON.stringify(state));
}

export function startFast(startIso: string) {
  writeFastingState({ startedAtIso: startIso, endedAtIso: undefined });
}

export function endFast(endIso: string) {
  const current = readFastingState();
  if (!current.startedAtIso) return;
  writeFastingState({ ...current, endedAtIso: endIso });
}

export function computeFastingDurationMs(state: FastingState): number {
  if (!state.startedAtIso) return 0;
  const start = new Date(state.startedAtIso).getTime();
  const end = state.endedAtIso
    ? new Date(state.endedAtIso).getTime()
    : Date.now();
  return Math.max(0, end - start);
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Very rough “what’s happening in my body” milestones
export function fastingMilestones(ms: number): string[] {
  const hours = ms / (1000 * 60 * 60);
  const out: string[] = [];

  if (hours >= 8) out.push("Glycogen stores are being used for energy");
  if (hours >= 12)
    out.push("Insulin levels are falling; fat burning is increasing");
  if (hours >= 16) out.push("Autophagy is starting to ramp up");
  if (hours >= 20) out.push("Growth hormone and repair processes are elevated");

  if (out.length === 0) {
    out.push(
      "Early fast: you’re clearing recent meals and stabilizing blood sugar."
    );
  }

  return out;
}
