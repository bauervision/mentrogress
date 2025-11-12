import { useMemo, useState, useSyncExternalStore } from "react";
import { listSetsAsc, removeSet } from "@/lib/logs";
import { ChevronDown, AlertTriangle } from "lucide-react";

const ROT_KEY = "mentrogress_logs_v1:version";

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

// subscribe to log changes (same-tab + cross-tab)
function useLogsVersion() {
  return useSyncExternalStore<number>(
    (on) => {
      const handler = () => on();
      window.addEventListener("storage", handler);
      window.addEventListener("mentrogress:logs", handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener("mentrogress:logs", handler);
      };
    },
    () => Number(localStorage.getItem(ROT_KEY) || "0"),
    () => 0
  );
}

export function DangerZoneToday({
  template,
}: {
  template: { name: string; exercises: { id: string; name: string }[] } | null;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const version = useLogsVersion();

  // live count of today's sets across this template
  const todayCount = useMemo(() => {
    if (!template) return 0;
    const today = isoToday();
    let n = 0;
    for (const ex of template.exercises || []) {
      for (const row of listSetsAsc(ex.id)) if (row.isoDate === today) n++;
    }
    return n;
    // re-calc when logs change
  }, [template, version]);

  async function deleteToday() {
    if (!template || busy) return;
    setBusy(true);
    const today = isoToday();
    let removed = 0;

    for (const ex of template.exercises || []) {
      for (const row of listSetsAsc(ex.id)) {
        if (row.isoDate === today) {
          removeSet(ex.id, row.id);
          removed++;
        }
      }
    }

    try {
      localStorage.setItem(ROT_KEY, String(Date.now()));
      // custom same-tab event so subscribers re-render immediately
      window.dispatchEvent(new Event("mentrogress:logs"));
    } catch {}

    setBusy(false);
    setNote(
      removed
        ? `Deleted ${removed} set${removed === 1 ? "" : "s"} from today.`
        : "No sets to delete for today."
    );
    // close + clear note shortly; section will auto-hide if count == 0
    setTimeout(() => setNote(null), 1400);
    if (removed) setOpen(false);
  }

  // Hide the entire danger section when there’s nothing to delete
  if (!template || todayCount === 0) return null;

  return (
    <section
      className="mt-4 rounded-xl border"
      style={{
        borderColor: "var(--stroke)",
        background: "color-mix(in oklab, var(--surface), crimson 6%)",
      }}
    >
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-3 py-2"
      >
        <span className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-md"
            style={{ background: "rgba(220, 38, 38, 0.15)" }}
            aria-hidden
          >
            <AlertTriangle className="w-4 h-4" style={{ color: "salmon" }} />
          </span>
          <span className="text-sm font-medium" style={{ color: "salmon" }}>
            Danger zone
          </span>
          <span className="text-xs opacity-70">
            {todayCount} set{todayCount === 1 ? "" : "s"} today
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Accordion body */}
      {open && (
        <div className="px-3 pb-3">
          <div className="text-xs opacity-75 mb-2">
            This permanently removes all sets logged <b>today</b> for the
            exercises in <span className="font-medium">{template.name}</span>.
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs opacity-60">Action cannot be undone.</div>
            <button
              disabled={busy || todayCount === 0}
              onClick={deleteToday}
              className="rounded-xl px-3 py-2 text-sm border"
              style={{
                borderColor: "var(--stroke)",
                color: "salmon",
                opacity: busy || todayCount === 0 ? 0.6 : 1,
                background: "transparent",
              }}
            >
              Delete today’s records
            </button>
          </div>
          {note && (
            <div className="mt-2 text-xs" style={{ color: "var(--accent)" }}>
              {note}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
