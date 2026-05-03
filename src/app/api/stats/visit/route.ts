import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

type Delta = 1 | -1;

async function bump(delta: Delta) {
  const { adminDb } = await import("@/lib/firebase-admin");
  await adminDb
    .collection("stats")
    .doc("visitors")
    .set({ count: FieldValue.increment(delta) }, { merge: true });
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
