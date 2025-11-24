import { Template } from "@/lib/templates";
import Link from "next/link";

export function TemplatePickerDialog({
  templates,
  onClose,
  onPick,
  currentTemplateId,
}: {
  templates: Template[];
  onClose: () => void;
  onPick: (index: number) => void;
  currentTemplateId?: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md rounded-2xl border bg-(--surface) shadow-2xl accent-outline overflow-hidden"
        style={{ borderColor: "var(--stroke)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b bg-white/3"
          style={{ borderColor: "var(--stroke)" }}
        >
          <div className="text-sm font-semibold tracking-wide">
            Choose a template
          </div>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-wide opacity-70 hover:opacity-100"
          >
            Close
          </button>
        </div>

        {/* List */}
        <ul className="max-h-72 overflow-auto py-1">
          {templates.map((t, i) => {
            const isActive = currentTemplateId && currentTemplateId === t.id;
            return (
              <li key={t.id}>
                <button
                  onClick={() => {
                    onPick(i);
                    onClose();
                  }}
                  className={[
                    "w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors",
                    "hover:bg-white/5",
                    isActive ? "bg-white/5 border-l-4 border-(--accent)" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    {t.exercises?.length ? (
                      <div className="text-xs opacity-70">
                        {t.exercises.length} exercises
                      </div>
                    ) : null}
                  </div>
                  {isActive && (
                    <span
                      className="text-[10px] px-2 py-1 rounded-full border"
                      style={{ borderColor: "var(--accent)" }}
                    >
                      Current
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {!templates.length && (
            <li className="px-4 py-3 text-sm opacity-70">No templates yet.</li>
          )}
        </ul>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t flex justify-end gap-2 bg-black/30"
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
            className="rounded-xl px-3 py-2 text-sm opacity-80 hover:opacity-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
