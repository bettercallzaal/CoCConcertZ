import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyJfs } from "@/lib/farcaster-jfs";

// Farcaster Mini App webhook - receives events when users add/remove the app
// or toggle notifications, and stores the per-user notification tokens that
// let us send show-day / battle-live pushes (docs/coc-agent-roadmap.md Stage 2).
//
// Events arrive as a JSON Farcaster Signature (JFS). Full verification in
// src/lib/farcaster-jfs.ts: ed25519 signature (hard requirement) + KeyRegistry
// membership on Optimism (rejected only on a definitive "not registered";
// RPC outages don't drop real events).

interface WebhookEvent {
  event: "miniapp_added" | "miniapp_removed" | "notifications_enabled" | "notifications_disabled"
    // Older clients used frame_* names
    | "frame_added" | "frame_removed";
  notificationDetails?: { url: string; token: string };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.header || !body?.payload || !body?.signature) {
    return NextResponse.json({ error: "Not a JFS envelope" }, { status: 400 });
  }

  const result = await verifyJfs(body);
  if (!result) {
    return NextResponse.json({ error: "Malformed envelope" }, { status: 400 });
  }
  if (!result.signatureValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  if (result.keyRegistered === false) {
    return NextResponse.json({ error: "Key not registered to fid" }, { status: 401 });
  }
  if (result.keyRegistered === null) {
    console.warn(`JFS key registry check unavailable for fid ${result.fid} - accepting signature-valid event`);
  }

  const event = result.payload as WebhookEvent;
  if (!event?.event) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const ref = adminDb.collection("notificationTokens").doc(String(result.fid));

  switch (event.event) {
    case "miniapp_added":
    case "frame_added":
    case "notifications_enabled":
      if (event.notificationDetails?.token && event.notificationDetails?.url) {
        await ref.set(
          {
            fid: result.fid,
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
