import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Farcaster Mini App webhook - receives events when users add/remove the app
// or toggle notifications, and stores the per-user notification tokens that
// let us send show-day / battle-live pushes (docs/coc-agent-roadmap.md Stage 2).
//
// Events arrive as a JSON Farcaster Signature (JFS): base64url header/payload/
// signature. v1 decodes and stores without onchain key verification - tokens
// are opaque and sends to a forged token simply fail. TODO: verify signature
// against the Farcaster key registry (or move to Neynar managed webhooks).

interface WebhookEvent {
  event: "miniapp_added" | "miniapp_removed" | "notifications_enabled" | "notifications_disabled"
    // Older clients used frame_* names
    | "frame_added" | "frame_removed";
  notificationDetails?: { url: string; token: string };
}

function b64urlJson<T>(s: string): T | null {
  try {
    return JSON.parse(Buffer.from(s, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.header || !body?.payload) {
    return NextResponse.json({ error: "Not a JFS envelope" }, { status: 400 });
  }

  const header = b64urlJson<{ fid: number }>(body.header);
  const event = b64urlJson<WebhookEvent>(body.payload);
  if (!header?.fid || !event?.event) {
    return NextResponse.json({ error: "Malformed envelope" }, { status: 400 });
  }

  const ref = adminDb.collection("notificationTokens").doc(String(header.fid));

  switch (event.event) {
    case "miniapp_added":
    case "frame_added":
    case "notifications_enabled":
      if (event.notificationDetails?.token && event.notificationDetails?.url) {
        await ref.set(
          {
            fid: header.fid,
            token: event.notificationDetails.token,
            url: event.notificationDetails.url,
            enabled: true,
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }
      break;

    case "miniapp_removed":
    case "frame_removed":
    case "notifications_disabled":
      await ref.set({ enabled: false, updatedAt: new Date() }, { merge: true });
      break;
  }

  return NextResponse.json({ ok: true });
}
