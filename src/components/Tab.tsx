"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TabProps = {
  href: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
};

export function Tab({ href, label, active, icon }: TabProps) {
  return (
    <li className="relative">
      <Link
        href={href}
        className="flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] opacity-80 hover:opacity-100"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center">
          {icon}
        </span>
      </Link>
      {active && (
        <span className="absolute left-1/2 top-0 mt-1 h-0.5 w-6 -translate-x-1/2 rounded-full bg-(--accent)" />
      )}
    </li>
  );
}
