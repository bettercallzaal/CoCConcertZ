import { NextResponse } from "next/server";
import { collection, getCountFromServer, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createServerSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Update these two constants once the COC #8 show is confirmed.
const COC8_EVENT_NAME = "COC Concertz #8";
const COC8_DATE = "2026-08-TBD"; // e.g. "2026-08-09"

export async function GET() {
  try {
    // Firebase: visitor count (live concurrent + show-night peak), gallery uploads
    const [gallerySnap, visitorsSnap, visitorsPeakSnap] = await Promise.all([
      getCountFromServer(collection(db, "gallery")),
      getDoc(doc(db, "stats", "visitors")),
      getDoc(doc(db, "stats", "visitors_peak")),
    ]);

    const galleryCount = gallerySnap.data().count;
    const concurrentViewers = visitorsSnap.exists()
      ? typeof visitorsSnap.data().count === "number"
        ? visitorsSnap.data().count
        : 0
      : 0;
    const peakViewers = visitorsPeakSnap.exists()
      ? typeof visitorsPeakSnap.data().count === "number"
        ? visitorsPeakSnap.data().count
        : 0
      : 0;

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
      event: COC8_EVENT_NAME,
      date: COC8_DATE,
      metrics: {
        concurrentViewers: Math.max(1, concurrentViewers),
        peakViewers,
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
      },
      capturedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("COC #8 metrics fetch failed:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch metrics",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
