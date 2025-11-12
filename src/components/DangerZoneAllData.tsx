"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import MiniToast from "@/components/MiniToast";
import { safeStorage } from "@/lib/safeStorage";

export function DangerZoneAllData() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Rough key count (client-only)
  const keyCount = useMemo(() => {
    if (typeof window === "undefined") return 0;
    try {
      return Object.keys(window.localStorage || {}).length;
    } catch {
      return 0;
    }
  }, []);

  if (keyCount === 0) return null; // hide if nothing to clear

  function clearAll() {
    // clear everything
    safeStorage.clear();

    // fire any custom events listeners might care about
    try {
      window.dispatchEvent(new Event("mentrogress:profile"));
      window.dispatchEvent(new Event("mentrogress:logs"));
      window.dispatchEvent(new Event("mentrogress:sessions"));
    } catch {}

    // toast + soft reload
    setToast("All Mentrogress data cleared.");
    setTimeout(() => {
      setToast(null);
      window.location.reload();
    }, 1200);
  }

  return (
    <section
      className="mt-10 rounded-xl p-3 bg-red-950/30 border"
      style={{ borderColor: "var(--stroke, #7f1d1d)" }}
    >
      {toast && <MiniToast text={toast} />}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full"
      >
        <span className="font-semibold text-red-400">Danger Zone</span>
        <ChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          color="red"
          size={18}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-sm opacity-80">
            This will permanently delete all local Mentrogress data — workouts,
            sets, templates, sessions, and profile preferences. There is no
            undo.
          </p>

          <button
            onClick={clearAll}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-2 text-sm bg-red-600 hover:bg-red-700 font-medium"
          >
            <Trash2 size={16} /> Delete All Data
          </button>
        </div>
      )}
    </section>
  );
}
