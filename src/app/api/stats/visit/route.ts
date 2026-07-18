import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

type Delta = 1 | -1;

async function bump(delta: Delta) {
  const { adminDb } = await import("@/lib/firebase-admin");
  const ref = adminDb.collection("stats").doc("visitors");
  await ref.set({ count: FieldValue.increment(delta) }, { merge: true });

  // Update peak concurrent count on increments only (read-then-write is
  // safe here — peak is best-effort and only ever grows).
  if (delta === 1) {
    const snap = await ref.get();
    const current: number = typeof snap.data()?.count === "number" ? (snap.data()!.count as number) : 1;
    await adminDb
      .collection("stats")
      .doc("visitors_peak")
      .set({ count: current, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
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
