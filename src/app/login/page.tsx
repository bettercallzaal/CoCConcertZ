"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { role, signIn } = useAuth();

  if (role === "admin") {
    router.push("/admin");
    return null;
  }
  if (role === "artist") {
    router.push("/portal");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn(passcode);
    if (result === "admin") {
      router.push("/admin");
    } else if (result === "artist") {
      router.push("/portal");
    } else {
      setError("Invalid passcode.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-sm w-full p-8 clip-corner"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <h1
          className="text-4xl tracking-wider text-center mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--yellow)" }}
        >
          COC CONCERTZ
        </h1>
        <p
          className="text-center text-sm mb-8"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
        >
          Enter passcode to continue
        </p>

        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          className="w-full px-4 py-3 text-sm mb-4 outline-none"
          style={{
            fontFamily: "var(--font-mono)",
            background: "var(--black)",
            border: "1px solid var(--border)",
            color: "#fff",
            letterSpacing: "0.1em",
          }}
          autoFocus
        />

        <button
          type="submit"
          disabled={loading || !passcode}
          className="w-full py-3 px-6 text-sm font-bold tracking-widest uppercase transition-all clip-corner"
          style={{
            fontFamily: "var(--font-mono)",
            background: loading || !passcode ? "var(--border)" : "var(--yellow)",
            color: "var(--black)",
            cursor: loading || !passcode ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "ENTERING..." : "ENTER"}
        </button>

        {error && (
          <p className="text-red-400 text-xs text-center mt-4">{error}</p>
        )}
      </form>
    </main>
  );
}
