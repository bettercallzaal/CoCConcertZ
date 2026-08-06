import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

// Fan/contest image upload -> Cloudinary.
//
// Hardened 2026-07-20 after contest + gallery uploads were down ~5 days with no
// diagnosable error. Root cause was the Cloudinary credentials going missing in
// the deploy env ("Needs Attention" in Vercel), but the old route had no config
// check and no try/catch, so a missing key surfaced as an opaque 500 that
// nobody could trace. Now a missing credential fails LOUD and specific, and
// upload errors return a real reason instead of a blank 500.

export const runtime = "nodejs";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Feature flag mirror: the UI reads NEXT_PUBLIC_UPLOADS_ENABLED too, but the
// API must also gate so a direct POST can't bypass the paused state.
function uploadsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_UPLOADS_ENABLED === "true";
}

// Fan uploads are intentionally public (no session gate) - this is a contest /
// fan gallery, not an internal tool. Guard against abuse instead of blocking:
// cap size and restrict to images so /api/upload can't be turned into free
// arbitrary-file hosting.
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_PREFIX = "image/";

function cloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

// Only these Cloudinary folders may be targeted - the folder used to come
// straight from the caller, letting anyone upload anywhere in the account.
const ALLOWED_FOLDERS = new Set(["coc-concertz", "user-uploads", "recaps", "sets"]);

export async function POST(request: NextRequest) {
  if (!uploadsEnabled()) {
    return NextResponse.json(
      { error: "Uploads are currently paused. Check back soon." },
      { status: 503 },
    );
  }

  // Config check first - turns a 5-day silent outage into an obvious 503 the
  // moment a credential is missing, naming exactly which var to fix.
  if (!cloudinaryConfigured()) {
    const missing = [
      !CLOUD_NAME && "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
      !API_KEY && "CLOUDINARY_API_KEY",
      !API_SECRET && "CLOUDINARY_API_SECRET",
    ].filter(Boolean);
    console.error("[upload] Cloudinary not configured - missing:", missing.join(", "));
    return NextResponse.json(
      { error: "Uploads are temporarily unavailable (storage not configured).", missing },
      { status: 503 },
    );
  }

  // CONFLICT RESOLUTION NOTE (2026-07-27, rebasing PR #55 onto main):
  //
  // The original security branch added `getCookieAuth(request)` here and 401'd
  // anonymous callers. That was written before main landed the comment above:
  // "Fan uploads are intentionally public (no session gate) - this is a contest
  // / fan gallery, not an internal tool."
  //
  // Those two intents directly contradict. Gating this route on a session would
  // break contest submissions and the fan gallery outright - the exact feature
  // the Cloudinary work is trying to restore. So the auth gate is deliberately
  // NOT carried over, and that decision is called out in the PR for a human to
  // confirm rather than being buried in a conflict resolution.
  //
  // The branch's OTHER upload hardening IS kept: the folder allowlist below.
  // That closes the real hole (caller-supplied folder = write anywhere in the
  // Cloudinary account) without blocking a single legitimate fan upload.

  cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });

  let file: File | null;
  let folder: string;
  try {
    const formData = await request.formData();
    file = formData.get("file") as File | null;
    const requestedFolder = (formData.get("folder") as string) || "coc-concertz";
    // Was taken straight from the caller. Anything unrecognised falls back to
    // the default bucket instead of being trusted.
    folder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : "coc-concertz";
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (typeof file.size === "number" && file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 15 MB)." }, { status: 413 });
  }
  if (file.type && !file.type.startsWith(ALLOWED_PREFIX)) {
    return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 415 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder, resource_type: "image" }, (error, uploaded) => {
          if (error || !uploaded) reject(error ?? new Error("empty upload result"));
          else resolve(uploaded as { secure_url: string });
        })
        .end(buffer);
    });
    return NextResponse.json({ url: result.secure_url });
  } catch (error: unknown) {
    // Surface a real reason server-side (never the secret) so the next outage
    // is diagnosable from logs in minutes, not days.
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("[upload] Cloudinary upload failed:", message);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }
}
