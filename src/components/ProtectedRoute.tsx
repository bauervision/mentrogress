"use client";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return; // wait until we've checked storage
    if (!user) router.replace("/login");
  }, [user, authReady, router]);

  if (!authReady) return null; // or a tiny spinner
  if (!user) return null;
  return <>{children}</>;
}
