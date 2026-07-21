import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

// Admin push-notification sender - the /admin Show Night panel's backend.
// Mirrors scripts/send-notification.ts: batched sends (100 tokens/POST),
// stable notificationId dedupe (24h per user), invalid-token auto-disable.

async function getAdminDb() {
  const { adminDb } = await import("@/lib/firebase-admin");
  return adminDb;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const adminDb = await getAdminDb();
  const snap = await adminDb.collection("notificationTokens").where("enabled", "==", true).get();
  return NextResponse.json({ enabledTokens: snap.size });
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { notificationId, title, message, targetUrl } = body ?? {};
  if (!notificationId?.trim() || !title?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "notificationId, title, message required" },
      { status: 400 }
    );
  }
  if (title.length > 32) {
    return NextResponse.json({ error: "title max 32 chars" }, { status: 400 });
  }
  if (message.length > 128) {
    return NextResponse.json({ error: "message max 128 chars" }, { status: 400 });
  }

  const adminDb = await getAdminDb();
  const snap = await adminDb.collection("notificationTokens").where("enabled", "==", true).get();
  const docs = snap.docs
    .map((d) => d.data() as { fid: number; token: string; url: string })
    .filter((t) => t.token && t.url);

  if (docs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, invalid: 0, rateLimited: 0 });
  }

  const byUrl = new Map<string, string[]>();
  for (const t of docs) {
    const list = byUrl.get(t.url) ?? [];
    list.push(t.token);
    byUrl.set(t.url, list);
  }

  let sent = 0;
  let invalidCount = 0;
  let rateLimited = 0;

  for (const [url, tokens] of byUrl) {
    for (let i = 0; i < tokens.length; i += 100) {
      const batch = tokens.slice(i, i + 100);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: notificationId.trim(),
          title: title.trim(),
          body: message.trim(),
          targetUrl: targetUrl?.trim() || "https://cocconcertz.com",
          tokens: batch,
        }),
      });
      const result = await res.json().catch(() => ({}));
      sent += result.successfulTokens?.length ?? 0;
      rateLimited += result.rateLimitedTokens?.length ?? 0;
      const invalid: string[] = result.invalidTokens ?? [];
      invalidCount += invalid.length;

      for (const bad of invalid) {
        const match = docs.find((t) => t.token === bad);
        if (match) {
          await adminDb.collection("notificationTokens").doc(String(match.fid)).set(
            { enabled: false, updatedAt: new Date() },
            { merge: true }
          );
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent, invalid: invalidCount, rateLimited });
}
