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
  const { role } = await req.json();
  if (role !== "admin" && role !== "artist" && role !== "fan") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const { adminDb } = await import("@/lib/firebase-admin");
  await adminDb.collection("users").doc(uid).update({ role });
  return NextResponse.json({ ok: true });
}
