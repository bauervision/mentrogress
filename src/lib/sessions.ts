import { storageKey } from "./storageKeys";

// src/lib/sessions.ts
export type Session = {
  id: string;
  templateId: string;
  templateName: string;
  templateIconKey?: string;
  startedAt: number; // epoch ms
  endedAt?: number; // epoch ms
  dayISO: string; // YYYY-MM-DD (from startedAt)
};

const KEY = storageKey("sessions");
const CUR = storageKey("_current_session_id");

const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function readAll(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Session[];
  } catch {
    return [];
  }
}
function writeAll(arr: Session[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(arr));
  // notify listeners
  window.dispatchEvent(new Event(KEY));
}

export function startSession(opts: {
  templateId: string;
  templateName: string;
  templateIconKey?: string;
  startedAt?: number;
}): Session {
  const t = opts.startedAt ?? Date.now();
  const dayISO = new Date(t).toISOString().slice(0, 10);
  const s: Session = {
    id: uid(),
    templateId: opts.templateId,
    templateName: opts.templateName,
    templateIconKey: opts.templateIconKey,
    startedAt: t,
    dayISO,
  };
  const all = readAll();
  all.push(s);
  writeAll(all);
  localStorage.setItem(CUR, s.id);
  return s;
}

export function endSession(id: string, endedAt?: number) {
  const all = readAll();
  const i = all.findIndex((x) => x.id === id);
  if (i >= 0) {
    all[i] = { ...all[i], endedAt: endedAt ?? Date.now() };
    writeAll(all);
  }
  localStorage.removeItem(CUR);
}

export function currentSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUR);
}

export function listSessionsForDay(dayISO: string): Session[] {
  return readAll()
    .filter((s) => s.dayISO === dayISO)
    .sort((a, b) => a.startedAt - b.startedAt);
}

export function getSession(id: string): Session | null {
  return readAll().find((s) => s.id === id) ?? null;
}
