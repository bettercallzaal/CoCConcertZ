import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { adminDb } = await import("@/lib/firebase-admin");
  const snap = await adminDb.collection("subscribers").get();
  const items = snap.docs.map((d) => {
    const data = d.data();
    const subscribedAt =
      data.subscribedAt && typeof data.subscribedAt.toDate === "function"
        ? data.subscribedAt.toDate().toISOString()
        : data.subscribedAt
        ? String(data.subscribedAt)
        : null;
    return {
      id: d.id,
      email: data.email ?? d.id,
      subscribedAt,
    };
  });
  return NextResponse.json({ count: items.length, items });
}
