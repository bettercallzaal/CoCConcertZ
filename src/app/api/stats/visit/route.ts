import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

type Delta = 1 | -1;

async function bump(delta: Delta) {
  const { adminDb } = await import("@/lib/firebase-admin");
  const ref = adminDb.collection("stats").doc("visitors");
  await ref.set({ count: FieldValue.increment(delta) }, { merge: true });

  // Update peak concurrent count only when current exceeds the stored peak
  // (read-then-write is acceptable here — peak is best-effort).
  if (delta === 1) {
    const snap = await ref.get();
    const current: number = typeof snap.data()?.count === "number" ? (snap.data()!.count as number) : 1;
    const peakRef = adminDb.collection("stats").doc("visitors_peak");
    const peakSnap = await peakRef.get();
    // `exists` is a PROPERTY on the Admin SDK's DocumentSnapshot, not a method
    // - only the client SDK exposes exists(). Calling it failed the build with
    // TS2349 "Type 'Boolean' has no call signatures", which is why this PR's
    // Vercel deploy went red.
    const storedPeak: number =
      peakSnap.exists && typeof peakSnap.data()?.count === "number"
        ? (peakSnap.data()!.count as number)
        : 0;
    if (current > storedPeak) {
      await peakRef.set({ count: current, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
  }
}

export async function POST() {
  try {
    await bump(1);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("stats/visit increment failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await bump(-1);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("stats/visit decrement failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
