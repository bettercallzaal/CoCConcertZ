import { NextRequest, NextResponse } from "next/server";
import { getCookieAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

async function authorizeForSet(
  req: NextRequest,
  setId: string
): Promise<NextResponse | null> {
  const auth = getCookieAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (auth.role === "admin") return null;

  const { adminDb } = await import("@/lib/firebase-admin");
  const setSnap = await adminDb.collection("sets").doc(setId).get();
  if (!setSnap.exists) {
    return NextResponse.json({ error: "Set not found" }, { status: 404 });
  }
  const artistId = setSnap.data()?.artistId;
  if (!artistId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const artistSnap = await adminDb.collection("artists").doc(artistId).get();
  if (artistSnap.data()?.slug !== auth.artistSlug) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const denied = await authorizeForSet(req, id);
  if (denied) return denied;

  const data = await req.json();
  const { adminDb } = await import("@/lib/firebase-admin");
  await adminDb.collection("sets").doc(id).update(data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const denied = await authorizeForSet(req, id);
  if (denied) return denied;

  const { adminDb } = await import("@/lib/firebase-admin");
  await adminDb.collection("sets").doc(id).delete();
  return NextResponse.json({ ok: true });
}
