"use client";
import { useEffect, useRef, useState } from "react";
import { readProfile, writeProfileMerge } from "@/lib/profile";

/** ---- Preset swatches (tweak freely) ---- */
const PRESETS = [
  "#ffffff", // white
  "#60a5fa", // blue
  "#22d3ee", // cyan
  "#34d399", // green
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#a78bfa", // violet
  "#ff63b5", // pink
];

/** ---- Tiny native-range hook: per-frame updates while dragging ---- */
function useLiveRange(
  value: number,
  setValue: (n: number) => void,
  onLive: (n: number, el: HTMLInputElement) => void
) {
  const ref = useRef<HTMLInputElement | null>(null);

  // Attach native 'input' for buttery-smooth dragging on all browsers
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      const n = Number(el.value);
      onLive(n, el); // write CSS vars immediately
      setValue(n); // keep React state in sync
    };
    el.addEventListener("input", handler, { passive: true });
    return () => el.removeEventListener("input", handler as any);
  }, [onLive, setValue]);

  // Keep DOM input in sync if value changes programmatically
  useEffect(() => {
    const el = ref.current;
    if (el && el.value !== String(value)) el.value = String(value);
  }, [value]);

  return ref;
}

/** ---- Local helpers (no external deps/race conditions) ---- */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function contrastOn(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return L > 0.6 ? "#000000" : "#ffffff";
}
function emitTone() {
  window.dispatchEvent(new Event("mentrogress:tone"));
}
function applyCSS(hex: string, tintAlpha: number, brightness: number) {
  const [r, g, b] = hexToRgb(hex);
  const root = document.documentElement;
  root.style.setProperty("--accent", hex);
  root.style.setProperty("--accent-contrast", contrastOn(hex));
  root.style.setProperty("--accent-r", String(r));
  root.style.setProperty("--accent-g", String(g));
  root.style.setProperty("--accent-b", String(b));
  root.style.setProperty("--bg-tint-alpha", String(tintAlpha)); // Contrast
  root.style.setProperty("--bg-brightness", String(brightness)); // Brightness
  emitTone();
}

/** ---- Component ---- */
export default function TonePicker() {
  const [hex, setHex] = useState("#ffffff");
  const [contrast, setContrast] = useState(0.06); // color tint strength
  const [brightness, setBrightness] = useState(0.0); // white lift

  // Initial load → hydrate state + immediately apply CSS vars
  useEffect(() => {
    const p = readProfile();
    const tone = p.toneHex ?? "#ffffff";
    const c = p.toneTintAlpha ?? 0.06;
    const b = p.toneBrightness ?? 0.0;
    setHex(tone);
    setContrast(c);
    setBrightness(b);
    applyCSS(tone, c, b);
  }, []);

  // Live slider refs (native input events)
  const contrastRef = useLiveRange(contrast, setContrast, (n) => {
    applyCSS(hex, n, brightness);
  });
  const brightRef = useLiveRange(brightness, setBrightness, (n) => {
    applyCSS(hex, contrast, n);
  });

  // Persist to localStorage (merge) and broadcast (so all pages refresh)
  function saveAll(h: string, c: number, b: number) {
    writeProfileMerge({ toneHex: h, toneTintAlpha: c, toneBrightness: b });
    emitTone();
  }

  return (
    <div className="space-y-3">
      <div className="text-sm opacity-80">Tone & Theme</div>

      {/* Presets */}
      <div className="grid grid-cols-8 gap-2">
        {PRESETS.map((c) => (
          <button
            key={c}
            className="rounded-lg h-8 border border-white/10"
            style={{ background: c }}
            onClick={() => {
              setHex(c);
              applyCSS(c, contrast, brightness); // live
              saveAll(c, contrast, brightness); // persist + broadcast
            }}
            aria-label={`Pick ${c}`}
          />
        ))}
      </div>

      {/* Custom color */}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hex}
          onChange={(e) => {
            const h = e.target.value;
            setHex(h);
            applyCSS(h, contrast, brightness); // live
          }}
          onBlur={() => saveAll(hex, contrast, brightness)}
          className="h-9 w-10 rounded-md border border-white/10 bg-black/40 p-0"
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => {
            const h = e.target.value;
            setHex(h);
            applyCSS(h, contrast, brightness); // live
          }}
          onBlur={() => saveAll(hex, contrast, brightness)}
          className="flex-1 rounded-xl px-3 py-2 bg-black/40 border border-white/10 text-sm"
          placeholder="#ff63b5"
        />
      </div>

      {/* Contrast slider (color tint) */}
      <label className="grid gap-1">
        <span className="text-xs opacity-70">Contrast (color tint)</span>
        <input
          ref={contrastRef}
          type="range"
          min={0}
          max={0.18}
          step={0.01}
          defaultValue={contrast}
          onMouseUp={() => saveAll(hex, contrast, brightness)}
          onTouchEnd={() => saveAll(hex, contrast, brightness)}
          className="w-full"
        />
      </label>

      {/* Brightness slider (overall lift) */}
      <label className="grid gap-1">
        <span className="text-xs opacity-70">Brightness (overall)</span>
        <input
          ref={brightRef}
          type="range"
          min={0}
          max={0.3}
          step={0.01}
          defaultValue={brightness}
          onMouseUp={() => saveAll(hex, contrast, brightness)}
          onTouchEnd={() => saveAll(hex, contrast, brightness)}
          className="w-full"
        />
      </label>

      <div className="rounded-lg border border-white/10 p-2 text-xs opacity-80">
        Contrast controls the strength of the color wash. Brightness lifts the
        metal base. Set contrast to 0 for a neutral gray theme.
      </div>
    </div>
  );
}
