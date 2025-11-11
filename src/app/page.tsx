"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    router.replace(user ? "/today" : "/login");
  }, [user, router]);
  return null;
}
