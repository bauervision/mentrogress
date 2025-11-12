"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tab } from "./Tab";
import { useMemo, useEffect } from "react";
import { useActiveWorkout } from "@/providers/ActiveWorkoutProvider";
import { readTemplates } from "@/lib/templates";
import { IconForName } from "@/lib/iconForName";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { active, end } = useActiveWorkout();
  const templates = useMemo(() => readTemplates(), []);
  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === active?.templateId) ?? null,
    [templates, active?.templateId]
  );

  // If provider points to a missing/deleted template, clear it so the nav flips back to "Log"
  useEffect(() => {
    if (active?.templateId && !activeTemplate) end();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.templateId, activeTemplate?.id]);

  const is = (href: string) => pathname?.startsWith(href);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* brightness layer */}
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

      <div className="flex-1 flex flex-col">{children}</div>

      <nav
        id="bottom-nav"
        className="sticky bottom-0 inset-x-0 z-10 accent-outline bg-black/70 backdrop-blur supports-backdrop-filter:bg-black/55 h-14"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4 text-sm relative">
          <Tab href="/today" label="Today" active={is("/today")} />

          {activeTemplate ? (
            <li className="relative">
              <Link
                href="/log"
                className="flex h-14 items-center justify-center"
                aria-label={`Log — ${activeTemplate.name}`}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-black/30">
                  <IconForName
                    name={activeTemplate.name}
                    iconKey={activeTemplate.iconKey}
                    className="w-5 h-5 opacity-90"
                  />
                </span>
              </Link>
              {is("/log") && (
                <span className="absolute left-1/2 -translate-x-1/2 top-0 mt-1 h-0.5 w-6 rounded-full bg-[var(--accent)]" />
              )}
            </li>
          ) : (
            <Tab href="/log" label="Log" active={is("/log")} />
          )}

          <Tab href="/progress" label="Progress" active={is("/progress")} />
          <Tab href="/profile" label="Profile" active={is("/profile")} />
        </ul>
      </nav>
    </div>
  );
}
