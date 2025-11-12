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
    <div className="fixed inset-0 z-100 bg-black" style={{ height: "100dvh" }}>
      <div className="absolute inset-0 flex">
        <div className="relative w-full h-full max-w-[640px] mx-auto bg-(--surface) flex flex-col overflow-hidden md:rounded-2xl">
          {/* BIG CORNER ICON */}
          <div className="pointer-events-none absolute right-3 top-15 opacity-15">
            <IconForName
              name={templateName}
              iconKey={templateIconKey}
              className="w-28 h-28 md:w-36 md:h-36"
            />
          </div>

          {/* Sticky header */}
          <div
            className="accent-outline flex items-center justify-between px-4 py-3 border-b"
            style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
          >
            <div className="text-xl font-extrabold">Session Summary</div>
            <button
              onClick={onClose}
              className="text-sm opacity-70 hover:opacity-100"
            >
              Close
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <div className="grid gap-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="opacity-70">Template:</span>

                <span className="font-medium">{templateName}</span>
              </div>
              <div>
                <span className="opacity-70">Duration:</span>{" "}
                <span className="font-medium">{duration}</span>
              </div>
              <div>
                <span className="opacity-70">Total volume:</span>{" "}
                <span
                  className="font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  {Math.round(volDisp).toLocaleString()}{" "}
                  {units === "imperial" ? "lb·reps" : "kg·reps"}
                </span>
              </div>
            </div>

            <div className="text-2xl font-medium pt-1">Sets</div>
            <ul className="space-y-2">
              {sets.map((s, i) => (
                <li
                  key={i}
                  className="rounded-lg px-3 py-2 border accent-btn"
                  style={{ borderColor: "var(--stroke)" }}
                >
                  <div className="text-[11px] opacity-60">{s.isoDate}</div>
                  <div className="text-sm">
                    <span className="font-medium text-xl">
                      {units === "imperial"
                        ? `${Math.round(s.weightKg * 2.2046226218)} lb`
                        : `${Math.round(s.weightKg)} kg`}
                    </span>
                    <span className="opacity-70 text-xl"> × {s.reps}</span>
                    <span className="opacity-60 ml-2">({s.exerciseId})</span>
                  </div>
                </li>
              ))}

              <button
                onClick={onClose}
                className="rounded-xl px-3 py-2 border text-sm"
                style={{ borderColor: "var(--stroke)" }}
              >
                Done
              </button>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
