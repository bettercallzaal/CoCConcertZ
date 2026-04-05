"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  if (user) {
    if (user.role === "admin") router.push("/admin");
    else if (user.role === "artist") router.push("/portal");
    else router.push("/");
    return null;
  }

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (!user) { setError("Sign-in failed."); return; }
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "artist") router.push("/portal");
      else router.push("/");
    } catch { setError("Sign-in failed."); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full p-8 clip-corner" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h1 className="text-4xl tracking-wider text-center mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--yellow)" }}>COC CONCERTZ</h1>
        <p className="text-center text-sm mb-8" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Sign in to continue</p>
        <button onClick={handleSignIn} disabled={loading} className="w-full py-3 px-6 text-sm font-bold tracking-widest uppercase transition-all clip-corner" style={{ fontFamily: "var(--font-mono)", background: loading ? "var(--border)" : "var(--yellow)", color: "var(--black)", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "SIGNING IN..." : "SIGN IN WITH GOOGLE"}
        </button>
        {error && <p className="text-red-400 text-xs text-center mt-4">{error}</p>}
      </div>
    </main>
  );
}
