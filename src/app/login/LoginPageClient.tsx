"use client";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function LoginPageClient() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const ok = await login(email, pass);
    if (ok) router.replace("/today");
    else setErr("Invalid credentials");
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h1 className="text-2xl font-bold mb-4">Mentrogress</h1>
        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm opacity-80">Email</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="mike@bauer.com"
              className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm opacity-80">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="password"
              className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </label>

          {err && <p className="text-red-400 text-sm">{err}</p>}

          <button className="mt-2 rounded-xl px-3 py-2 bg-white text-black font-medium">
            Sign in
          </button>

          <p className="text-xs opacity-70 mt-2">
            Demo creds: <b>mike@bauer.com</b> / <b>{"pl,PL<"}</b>
          </p>
        </form>
      </div>
    </main>
  );
}
