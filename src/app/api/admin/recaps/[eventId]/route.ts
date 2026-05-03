import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { eventId } = await params;
  const data = await req.json();
  const { adminDb } = await import("@/lib/firebase-admin");
  await adminDb.collection("recaps").doc(eventId).set(data);
  return NextResponse.json({ ok: true });
}
