"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Tab({
  href,
  label,
  before,
  active,
}: {
  href: string;
  label?: string;
  before?: React.ReactNode;
  active: boolean;
}) {
  return (
    <li className="relative h-14">
      {/* tiny active indicator ABOVE the tab */}
      {active && (
        <span
          className="absolute -top-0.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
      )}

      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className="h-full flex items-center justify-center gap-1"
      >
        {before}
        {label && <span>{label}</span>}
      </Link>
    </li>
  );
}
