"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PortalSidebar } from "@/components/layout/PortalSidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (role !== "artist" && role !== "admin") {
      router.replace("/login");
    }
  }, [role, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--black)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--cyan)",
            animation: "pulse 1.5s infinite",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (role !== "artist" && role !== "admin") {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--black)" }}>
      <PortalSidebar />
      <main style={{ flex: 1, overflow: "auto" }} className="portal-main">
        {children}
      </main>
      <style>{`
        @media (max-width: 768px) {
          .portal-main {
            padding-top: 64px;
          }
        }
      `}</style>
    </div>
  );
}
