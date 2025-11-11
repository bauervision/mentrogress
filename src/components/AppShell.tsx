"use client";

import { Tab } from "./Tab";
import ToneLoader from "./ToneLoader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <ToneLoader />
      {/* brightness (white) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: "rgba(255,255,255,var(--bg-brightness))" }}
      />
      {/* color tint */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundColor:
            "rgba(var(--accent-r), var(--accent-g), var(--accent-b), var(--bg-tint-alpha))",
        }}
      />

      <div className="flex-1">{children}</div>

      {/* mobile bottom nav */}
      <nav
        id="bottom-nav"
        className="sticky bottom-0 inset-x-0 z-10 border-t border-white/10 bg-black/70 backdrop-blur supports-backdrop-filter:bg-black/55"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4 text-sm">
          <Tab href="/today" label="Today" />
          <Tab href="/log" label="Log" />
          <Tab href="/progress" label="Progress" />
          <Tab href="/profile" label="Profile" />
        </ul>
      </nav>
    </div>
  );
}
