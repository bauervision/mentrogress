"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
type User = { email: string } | null;
type AuthCtx = {
  user: User;
  authReady: boolean;
  login: (e: string, p: string) => Promise<boolean>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

const KEY = "mentrogress_auth_v1";
const EMAIL = "mike@bauer.com";
const PASS = "pl,PL<";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // sync init (prevents redirect before we read storage)
  const initialUser: User = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [user, setUser] = useState<User>(initialUser);
  const [authReady, setAuthReady] = useState<boolean>(false);

  useEffect(() => {
    // in case storage changes after hydration
    if (user == null) {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {}
    }
    setAuthReady(true);
  }, []); // run once

  async function login(email: string, pass: string) {
    const ok = email.trim().toLowerCase() === EMAIL && pass === PASS;
    if (ok) {
      const u = { email: EMAIL };
      localStorage.setItem(KEY, JSON.stringify(u));
      setUser(u);
    }
    return ok;
  }

  function logout() {
    localStorage.removeItem(KEY);
    setUser(null);
    router.replace("/"); // always go back to the gate
  }

  return (
    <Ctx.Provider value={{ user, authReady, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
