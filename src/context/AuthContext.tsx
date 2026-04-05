"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthContextValue {
  role: "admin" | "artist" | null;
  artistSlug: string | null;
  loading: boolean;
  signIn: (passcode: string) => Promise<"admin" | "artist" | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  role: null,
  artistSlug: null,
  loading: true,
  signIn: async () => null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<"admin" | "artist" | null>(null);
  const [artistSlug, setArtistSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setRole(data.role || null);
        setArtistSlug(data.artistSlug || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function signIn(passcode: string): Promise<"admin" | "artist" | null> {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (res.ok) {
      const data = await res.json();
      setRole(data.role);
      setArtistSlug(data.artistSlug ?? null);
      return data.role;
    }
    return null;
  }

  async function signOut() {
    await fetch("/api/auth", { method: "DELETE" });
    setRole(null);
    setArtistSlug(null);
  }

  return (
    <AuthContext.Provider value={{ role, artistSlug, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
