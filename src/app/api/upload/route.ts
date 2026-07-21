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

// Fan uploads are intentionally public (no session gate) - this is a contest /
// fan gallery, not an internal tool. Guard against abuse instead of blocking:
// cap size and restrict to images so /api/upload can't be turned into free
// arbitrary-file hosting.
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_PREFIX = "image/";

function cloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

export async function POST(request: NextRequest) {
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

  cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });

  let file: File | null;
  let folder: string;
  try {
    const formData = await request.formData();
    file = formData.get("file") as File | null;
    folder = (formData.get("folder") as string) || "coc-concertz";
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
