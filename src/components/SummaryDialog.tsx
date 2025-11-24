import { IconForName } from "@/lib/iconForName";
import { SavedSet } from "@/lib/types";

export function SummaryDialog({
  units,
  sets,
  templateName,
  duration,
  templateIconKey,
  onClose,
}: {
  units: "imperial" | "metric";
  sets: SavedSet[];
  templateName: string;
  duration: string;
  templateIconKey?: string;
  onClose: () => void;
}) {
  const totalVolKg = sets.reduce((a, s) => a + s.weightKg * s.reps, 0);
  const volDisp = units === "imperial" ? totalVolKg * 2.2046226218 : totalVolKg;

  return (
    <div
      className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm"
      style={{ height: "100dvh" }}
    >
      <div className="absolute inset-0 flex">
        <div
          className="relative mx-auto flex h-full w-full max-w-[640px] flex-col overflow-hidden border border-white/10 bg-black/60 shadow-2xl shadow-black/70 md:rounded-2xl"
          style={{
            background: "radial-gradient(circle at top, #0f172a, #020617)",
          }}
        >
          {/* BIG CORNER ICON */}
          <div className="pointer-events-none absolute right-3 top-16 opacity-15">
            <IconForName
              name={templateName}
              iconKey={templateIconKey}
              className="h-28 w-28 md:h-36 md:w-36"
            />
          </div>

          {/* Sticky header */}
          <div
            className="flex items-center justify-between border-b border-white/10 bg-black/60 px-4 py-3"
            style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
          >
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-300/80">
                Mentrogress
              </div>
              <div className="text-xl font-extrabold">Session summary</div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-medium opacity-80 hover:opacity-100"
            >
              Close
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
            {/* Top meta row */}
            <div className="grid gap-3 text-xs md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/50 px-3 py-2">
                <div className="opacity-60">Template</div>
                <div className="mt-0.5 text-sm font-semibold">
                  {templateName}
                </div>
              </div>
              <div className="rounded-xl border border-sky-400/50 bg-sky-500/10 px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide opacity-70">
                  Duration
                </div>
                <div className="mt-0.5 text-sm font-semibold text-sky-100">
                  {duration}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide opacity-70">
                  Total volume
                </div>
                <div className="mt-0.5 text-sm font-semibold text-emerald-100">
                  {Math.round(volDisp).toLocaleString()}{" "}
                  {units === "imperial" ? "lb·reps" : "kg·reps"}
                </div>
              </div>
            </div>

            {/* Sets */}
            <div className="pt-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-wide opacity-70">
                  Sets
                </div>
                <div className="text-[11px] opacity-60">
                  {sets.length} set{sets.length === 1 ? "" : "s"}
                </div>
              </div>

              <ul className="mt-2 space-y-2">
                {sets.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-white/10 bg-black/60 px-3 py-2"
                  >
                    <div className="flex items-center justify-between text-[11px] opacity-60">
                      <span>{s.isoDate}</span>
                      <span className="font-mono">{s.exerciseId}</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-semibold">
                        {units === "imperial"
                          ? `${Math.round(s.weightKg * 2.2046226218)} lb`
                          : `${Math.round(s.weightKg)} kg`}
                      </span>
                      <span className="text-lg opacity-70">× {s.reps}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer button */}
            <div className="pb-2 pt-1">
              <button
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium hover:bg-white/10"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
