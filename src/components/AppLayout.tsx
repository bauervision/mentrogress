"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tab } from "./Tab";
import { useMemo, useEffect } from "react";
import { useActiveWorkout } from "@/providers/ActiveWorkoutProvider";
import { readTemplates } from "@/lib/templates";
import { IconForName } from "@/lib/iconForName";
import {
  Dumbbell,
  Flame,
  Layers,
  LineChart,
  SunMedium,
  UserRound,
} from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { active, end } = useActiveWorkout();
  const templates = useMemo(() => readTemplates(), []);
  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === active?.templateId) ?? null,
    [templates, active?.templateId]
  );

  // icon should show only when a workout is actually running
  const hasActiveRunning = !!activeTemplate && active.isRunning;

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
        <ul className="relative mx-auto grid max-w-md grid-cols-6 text-sm">
          <Tab
            href="/today"
            label="Today"
            active={is("/today")}
            icon={<SunMedium className="h-4 w-4" />}
          />

          {hasActiveRunning ? (
            <li className="relative">
              <Link
                href="/log"
                className="flex h-14 items-center justify-center"
                aria-label={`Log — ${activeTemplate!.name}`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/30">
                  <IconForName
                    name={activeTemplate!.name}
                    iconKey={activeTemplate!.iconKey}
                    className="h-5 w-5 opacity-90"
                  />
                </span>
              </Link>
              {is("/log") && (
                <span className="absolute left-1/2 top-0 mt-1 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[var(--accent)]" />
              )}
            </li>
          ) : (
            <Tab
              href="/log"
              label="Log"
              active={is("/log")}
              icon={<Dumbbell className="h-4 w-4" />}
            />
          )}

          <Tab
            href="/progress"
            label="Progress"
            active={is("/progress")}
            icon={<LineChart className="h-4 w-4" />}
          />
          <Tab
            href="/fasting"
            label="Fasting"
            active={is("/fasting")}
            icon={<Flame className="h-4 w-4" />}
          />
          <Tab
            href="/templates"
            label="Templates"
            active={is("/templates")}
            icon={<Layers className="h-4 w-4" />}
          />
          <Tab
            href="/profile"
            label="Profile"
            active={is("/profile")}
            icon={<UserRound className="h-4 w-4" />}
          />
        </ul>
      </nav>
    </div>
  );
}
