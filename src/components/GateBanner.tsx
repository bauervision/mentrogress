"use client";
export default function GateBanner({
  verdict,
  title,
  detail,
  suggestion,
  onUseSuggestion,
}: {
  verdict: "green" | "amber" | "red";
  title: string;
  detail: string;
  suggestion?: string;
  onUseSuggestion?: () => void;
}) {
  const tone =
    verdict === "green"
      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
      : verdict === "amber"
      ? "border-amber-400/30 bg-amber-500/15 text-amber-200"
      : "border-rose-400/30 bg-rose-500/15 text-rose-200";
  return (
    <div className={`rounded-xl border px-3 py-2 ${tone}`}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-sm opacity-90">{detail}</div>
      {suggestion && onUseSuggestion && (
        <div className="mt-2">
          <button
            onClick={onUseSuggestion}
            className="rounded-lg border border-white/20 px-2 py-1 text-xs"
          >
            Use {suggestion}
          </button>
        </div>
      )}
    </div>
  );
}
