import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const data = await req.json();
  const { adminDb } = await import("@/lib/firebase-admin");

  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  };
  if (data.date) {
    updateData.date = new Date(data.date);
  }

  await adminDb.collection("events").doc(id).update(updateData);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { adminDb } = await import("@/lib/firebase-admin");
  await adminDb.collection("events").doc(id).delete();
  return NextResponse.json({ ok: true });
}
