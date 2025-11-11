"use client";
import { useEffect, useState } from "react";
import { readProfile, writeProfileMerge } from "@/lib/profile";

const PRESETS = [
  "#ffffff",
  "#60a5fa",
  "#22d3ee",
  "#34d399",
  "#f59e0b",
  "#f43f5e",
  "#a78bfa",
  "#ff63b5",
];

export default function TonePicker() {
  const [hex, setHex] = useState("#ffffff");
  const [contrast, setContrast] = useState(0.06);
  const [brightness, setBrightness] = useState(0.0);

  useEffect(() => {
    const p = readProfile();
    const tone = p.toneHex ?? "#ffffff";
    const c = p.toneTintAlpha ?? 0.06;
    const b = p.toneBrightness ?? 0.0;
    setHex(tone);
    setContrast(c);
    setBrightness(b);
    applyCSS(tone, c, b); // immediate on page load
  }, []);

  function emitTone() {
    window.dispatchEvent(new Event("mentrogress:tone"));
  }

  function save(hexVal: string, c: number, b: number) {
    const p = readProfile();
    writeProfileMerge({
      ...p,
      toneHex: hexVal,
      toneTintAlpha: c,
      toneBrightness: b,
    });
    emitTone();
  }

  return (
    <div className="space-y-3">
      {/* presets */}
      <div className="grid grid-cols-8 gap-2">
        {PRESETS.map((c) => (
          <button
            key={c}
            className="rounded-lg h-8 border border-white/10"
            style={{ background: c }}
            onClick={() => {
              setHex(c);
              applyCSS(c, contrast, brightness);
              save(c, contrast, brightness);
            }}
            aria-label={`Pick ${c}`}
          />
        ))}
      </div>

      {/* custom color */}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hex}
          onChange={(e) => {
            setHex(e.target.value);
            applyCSS(e.target.value, contrast, brightness);
            emitTone();
          }}
          onBlur={() => save(hex, contrast, brightness)}
          className="h-9 w-10 rounded-md border border-white/10 bg-black/40 p-0"
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => {
            setHex(e.target.value);
            applyCSS(e.target.value, contrast, brightness);
            emitTone();
          }}
          onBlur={() => save(hex, contrast, brightness)}
          className="flex-1 rounded-xl px-3 py-2 bg-black/40 border border-white/10 text-sm"
          placeholder="#ff63b5"
        />
      </div>

      {/* Contrast (color tint) — onInput for live dragging */}
      <label className="grid gap-1">
        <span className="text-xs opacity-70">Contrast (color tint)</span>
        <input
          type="range"
          min={0}
          max={0.18}
          step={0.01}
          value={contrast}
          onInput={(e) => {
            const c = Number((e.target as HTMLInputElement).value);
            setContrast(c);
            applyCSS(hex, c, brightness);
            emitTone();
          }}
          onChange={(e) => {
            const c = Number((e.target as HTMLInputElement).value);
            setContrast(c);
            applyCSS(hex, c, brightness);
            emitTone();
          }}
          onMouseUp={() => save(hex, contrast, brightness)}
          onTouchEnd={() => save(hex, contrast, brightness)}
          className="w-full"
        />
      </label>

      {/* Brightness (overall) — onInput for live dragging */}
      <label className="grid gap-1">
        <span className="text-xs opacity-70">Brightness (overall)</span>
        <input
          type="range"
          min={0}
          max={0.3}
          step={0.01}
          value={brightness}
          onInput={(e) => {
            const b = Number((e.target as HTMLInputElement).value);
            setBrightness(b);
            applyCSS(hex, contrast, b);
            emitTone();
          }}
          onChange={(e) => {
            const b = Number((e.target as HTMLInputElement).value);
            setBrightness(b);
            applyCSS(hex, contrast, b);
            emitTone();
          }}
          onMouseUp={() => save(hex, contrast, brightness)}
          onTouchEnd={() => save(hex, contrast, brightness)}
          className="w-full"
        />
      </label>
    </div>
  );
}

/* helpers */
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
function applyCSS(hex: string, tintAlpha: number, brightness: number) {
  const [r, g, b] = hexToRgb(hex);
  const root = document.documentElement;
  root.style.setProperty("--accent", hex);
  root.style.setProperty("--accent-contrast", contrastOn(hex));
  root.style.setProperty("--accent-r", String(r));
  root.style.setProperty("--accent-g", String(g));
  root.style.setProperty("--accent-b", String(b));
  root.style.setProperty("--bg-tint-alpha", String(tintAlpha));
  root.style.setProperty("--bg-brightness", String(brightness));
}
