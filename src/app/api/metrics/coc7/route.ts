import { NextResponse } from "next/server";
import { collection, getCountFromServer, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createServerSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Firebase: visitor count (live concurrent), contest entries, gallery uploads
    const [gallerySnap, visitorsSnap, contestSnap] = await Promise.all([
      getCountFromServer(collection(db, "gallery")),
      getDoc(doc(db, "stats", "visitors")),
      getCountFromServer(collection(db, "contestEntries")),
    ]);

    const galleryCount = gallerySnap.data().count;
    const concurrentViewers = visitorsSnap.exists()
      ? typeof visitorsSnap.data().count === "number"
        ? visitorsSnap.data().count
        : 0
      : 0;
    const contestCount = contestSnap.data().count;

    // Supabase: archive uploads with wallet-vs-gateless split
    let archiveTotal = 0;
    let archiveGateless = 0;
    let archiveFromWallet = 0;
    let supabaseError: string | null = null;

    try {
      const supabase = createServerSupabase();
      const { data, error } = await supabase
        .from("archive_uploads")
        .select("uploaded_by_wallet");

      if (error) {
        supabaseError = error.message;
      } else if (data) {
        archiveTotal = data.length;
        archiveGateless = data.filter((r) => r.uploaded_by_wallet === "ungated").length;
        archiveFromWallet = archiveTotal - archiveGateless;
      }
    } catch (err) {
      supabaseError = err instanceof Error ? err.message : "Supabase unavailable";
    }

    return NextResponse.json({
      event: "COC Concertz #7: WaveWarZ Takeover",
      date: "2026-07-18",
      metrics: {
        // Live concurrent viewers at time of snapshot (increments on page load, decrements on unload)
        concurrentViewers: Math.max(1, concurrentViewers),
        contestSubmissions: contestCount,
        // Fan gallery photos via Cloudinary -> Firestore. NOTE: Cloudinary key is DOWN until
        // Zaal rotates the key in Vercel (CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET).
        fanGalleryUploads: galleryCount,
        archiveUploads: {
          total: archiveTotal,
          fromWallet: archiveFromWallet,
          gateless: archiveGateless,
          ...(supabaseError ? { error: supabaseError } : {}),
        },
      },
      pilotStatus: {
        walletGateEnabled: process.env.NEXT_PUBLIC_WALLET_GATE_ENABLED !== "false",
        // Set NEXT_PUBLIC_WALLET_GATE_ENABLED=false in Vercel + redeploy before show.
        // When false: archive upload page is open to anyone with an artist/admin cookie,
        // and uploaded_by_wallet is stored as "ungated" in Supabase.
      },
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
