import { NextRequest, NextResponse } from "next/server";
import { getCookieAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

// Sets are written by both admins and the artist who owns the set.
// For artist callers we verify the artistId on the body matches their cookie.
async function authorizeArtist(
  req: NextRequest,
  artistId: string
): Promise<NextResponse | null> {
  const auth = getCookieAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (auth.role === "admin") return null;

  const { adminDb } = await import("@/lib/firebase-admin");
  const snap = await adminDb.collection("artists").doc(artistId).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }
  if (snap.data()?.slug !== auth.artistSlug) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (!data.artistId) {
    return NextResponse.json({ error: "artistId required" }, { status: 400 });
  }
  const denied = await authorizeArtist(req, data.artistId);
  if (denied) return denied;

  const { adminDb } = await import("@/lib/firebase-admin");
  const ref = adminDb.collection("sets").doc();
  await ref.set(data);
  const snap = await ref.get();
  return NextResponse.json({ ...snap.data(), id: snap.id });
}
