import { NextResponse } from "next/server";
import { collection, getCountFromServer, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [gallerySnap, visitorsSnap, contestSnap] = await Promise.all([
      getCountFromServer(collection(db, "gallery")),
      getDoc(doc(db, "stats", "visitors")),
      getCountFromServer(collection(db, "contestEntries")),
    ]);

    const galleryCount = gallerySnap.data().count;
    const visitorCount = visitorsSnap.exists()
      ? typeof visitorsSnap.data().count === "number"
        ? visitorsSnap.data().count
        : 0
      : 0;
    const contestCount = contestSnap.data().count;

    return NextResponse.json({
      event: "COC Concertz #7: WaveWarZ Takeover",
      date: "2026-07-18",
      metrics: {
        uniqueVisitors: Math.max(1, visitorCount),
        contestSubmissions: contestCount,
        galleryUploads: galleryCount,
      },
      notes:
        "Gallery uploads are tracked from /api/archive/upload. Contest submissions are stored in contestEntries collection. Wallet-connects: currently optional (NEXT_PUBLIC_WALLET_GATE_ENABLED=false for pilot). Real wallet requirement will be re-enabled post-pilot.",
      capturedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Metrics fetch failed:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch metrics",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
