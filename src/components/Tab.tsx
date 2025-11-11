"use client";
import Link from "next/link";

export function Tab({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        prefetch={false}
        className="block px-3 py-3 text-center hover:bg-white/5 focus:bg-white/10"
      >
        {label}
      </Link>
    </li>
  );
}
