import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { adminDb } = await import("@/lib/firebase-admin");
  const snap = await adminDb.collection("invites").orderBy("createdAt", "desc").get();
  const items = snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      acceptedAt: data.acceptedAt?.toDate?.()?.toISOString?.() ?? null,
    };
  });
  return NextResponse.json({ items });
}
