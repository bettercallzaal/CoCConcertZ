import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function getAuth(request: NextRequest) {
  const role = request.cookies.get("coc-role")?.value;
  const artistSlug = request.cookies.get("coc-artist-slug")?.value;
  return { role, artistSlug };
}

export async function PUT(request: NextRequest) {
  const { role, artistSlug } = getAuth(request);

  if (!role || (role !== "admin" && role !== "artist")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { artistId, ...data } = body;

  if (!artistId) {
    return NextResponse.json({ error: "artistId required" }, { status: 400 });
  }

  // Verify artist can only update their own profile
  if (role === "artist") {
    const doc = await adminDb.collection("artists").doc(artistId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }
    if (doc.data()?.slug !== artistSlug) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await adminDb.collection("artists").doc(artistId).update(data);
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const { role, artistSlug } = getAuth(request);

  if (!role || (role !== "admin" && role !== "artist")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  // Artists can only create their own profile
  if (role === "artist" && data.slug !== artistSlug) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ref = adminDb.collection("artists").doc();
  await ref.set({
    ...data,
    createdAt: new Date(),
  });

  const created = await ref.get();
  return NextResponse.json({
    ...created.data(),
    id: created.id,
    createdAt: created.data()?.createdAt?.toDate?.() ?? new Date(),
  });
}
