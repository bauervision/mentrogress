"use client";

export default function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "flex-1 rounded-xl px-3 py-2 text-sm border transition-colors",
        active
          ? "accent-btn text-black border-white/20"
          : "bg-black/40 text-white border-white/10 hover:bg-black/30",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
