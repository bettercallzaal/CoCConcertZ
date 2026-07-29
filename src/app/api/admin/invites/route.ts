import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { adminDb } = await import("@/lib/firebase-admin");
  const ref = adminDb.collection("invites").doc();
  const now = new Date();
  await ref.set({ ...data, createdAt: now });
  const snap = await ref.get();
  const out = snap.data();
  return NextResponse.json({
    ...out,
    id: snap.id,
    createdAt: out?.createdAt?.toDate?.() ?? now,
    acceptedAt: out?.acceptedAt?.toDate?.(),
  });
}
