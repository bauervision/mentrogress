"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ICON_OPTIONS } from "@/lib/iconForName";

export default function IconPicker({
  value,
  onChange,
  buttonClassName = "",
}: {
  value?: string;
  onChange: (key: string | undefined) => void;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const current = ICON_OPTIONS.find((o) => o.key === value) ?? null;
  const CurrentIcon = current?.Icon;

  // close on ANY outside click/tap, Esc, scroll, resize, or route change
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScrollOrResize() {
      setOpen(false);
    }
    // next/navigation route changes
    const unlisten = router ? router : null;

    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      } as any);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, {
        capture: true,
      } as any);
      window.removeEventListener("resize", onScrollOrResize);
      // no explicit router unsubscribe needed here; included for completeness
      void unlisten;
    };
  }, [router]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={
          buttonClassName ||
          "w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10 flex items-center justify-between"
        }
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center">
            {CurrentIcon ? (
              <CurrentIcon className="w-4 h-4 opacity-90" />
            ) : (
              <span className="text-[10px] opacity-70">A</span>
            )}
          </div>
          <span className="text-sm">
            {current ? current.label : "Auto (from name)"}
          </span>
        </span>
        <span
          className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 w-[min(92vw,22rem)] max-h-72 overflow-auto rounded-xl border border-white/10 bg-black/85 backdrop-blur p-1 shadow-lg"
        >
          <button
            role="option"
            aria-selected={value === undefined}
            className="w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-white/10"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
          >
            <div className="w-6 h-6 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center">
              <span className="text-[10px] opacity-70">A</span>
            </div>
            Auto (from name)
          </button>

          <div className="my-1 h-px bg-white/10" />

          {ICON_OPTIONS.map((opt) => {
            const Icon = opt.Icon;
            const selected = value === opt.key;
            return (
              <button
                key={opt.key}
                role="option"
                aria-selected={selected}
                className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-white/10 ${
                  selected ? "bg-white/10" : ""
                }`}
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
              >
                <div className="w-6 h-6 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center">
                  <Icon className="w-4 h-4 opacity-90" />
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
