import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { adminDb } = await import("@/lib/firebase-admin");
  const snap = await adminDb
    .collection("subscribers")
    .where("email", "==", email)
    .limit(1)
    .get();

  return NextResponse.json({ exists: !snap.empty });
}
