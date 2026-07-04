import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Admin battle control - the /admin Show Night panel's backend. Mirrors
// scripts/manage-battle.ts so shows can run without a terminal.

async function getAdminDb() {
  const { adminDb } = await import("@/lib/firebase-admin");
  return adminDb;
}

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get("coc-role")?.value === "admin";
}

async function tally(votesSnap: FirebaseFirestore.QuerySnapshot) {
  let a = 0;
  let b = 0;
  votesSnap.forEach((v) => {
    if (v.data().choice === "a") a += 1;
    else if (v.data().choice === "b") b += 1;
  });
  return { a, b };
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const adminDb = await getAdminDb();
  const snap = await adminDb.collection("battles").where("status", "==", "live").get();
  if (snap.empty) return NextResponse.json({ live: null });

  const d = snap.docs[0];
  const { a, b } = await tally(await d.ref.collection("votes").get());
  return NextResponse.json({
    live: { id: d.id, ...d.data(), votesA: a, votesB: b },
  });
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;
  const adminDb = await getAdminDb();

  if (action === "create") {
    const { title, sideA, sideB } = body;
    if (!title?.trim() || !sideA?.trim() || !sideB?.trim()) {
      return NextResponse.json({ error: "title, sideA, sideB required" }, { status: 400 });
    }
    // Close any existing live battle first - one live battle at a time
    const live = await adminDb.collection("battles").where("status", "==", "live").get();
    for (const d of live.docs) {
      const { a, b } = await tally(await d.ref.collection("votes").get());
      await d.ref.set(
        { status: "closed", winner: a === b ? null : a > b ? "a" : "b", finalVotesA: a, finalVotesB: b, closedAt: new Date() },
        { merge: true }
      );
    }
    const ref = await adminDb.collection("battles").add({
      title: title.trim(),
      sideA: sideA.trim(),
      sideB: sideB.trim(),
      status: "live",
      winner: null,
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true, id: ref.id });
  }

  if (action === "close") {
    const live = await adminDb.collection("battles").where("status", "==", "live").get();
    if (live.empty) return NextResponse.json({ ok: true, closed: 0 });

    const results = [];
    for (const d of live.docs) {
      const { a, b } = await tally(await d.ref.collection("votes").get());
      const winner = a === b ? null : a > b ? "a" : "b";
      await d.ref.set(
        { status: "closed", winner, finalVotesA: a, finalVotesB: b, closedAt: new Date() },
        { merge: true }
      );
      const data = d.data();
      results.push({
        title: data.title,
        votesA: a,
        votesB: b,
        winnerName: winner === "a" ? data.sideA : winner === "b" ? data.sideB : "TIE",
      });
    }
    return NextResponse.json({ ok: true, closed: results.length, results });
  }

  return NextResponse.json({ error: "action must be create or close" }, { status: 400 });
}
