import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { uid } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { role } = body as { role: string };
  if (role !== "admin" && role !== "artist" && role !== "fan") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const { adminDb } = await import("@/lib/firebase-admin");
  await adminDb.collection("users").doc(uid).update({ role });
  return NextResponse.json({ ok: true });
}
