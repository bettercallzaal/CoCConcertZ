import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  const { adminDb } = await import("@/lib/firebase-admin");
  await adminDb
    .collection("live")
    .doc("nowPlaying")
    .set({ ...data, timestamp: new Date() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { adminDb } = await import("@/lib/firebase-admin");
  await adminDb.collection("live").doc("nowPlaying").delete();
  return NextResponse.json({ ok: true });
}
