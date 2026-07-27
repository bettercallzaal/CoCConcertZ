/**
 * Asserts that the configured Cloudinary API key can actually READ and CREATE.
 *
 * Why this exists: on 2026-07-03 the key for cloud `dzzqdbo9k` silently lost its
 * `read` and `create` permissions. Credentials stayed valid - `api.ping()` kept
 * returning `{status: "ok"}` - so every shallow health check passed while
 * /api/upload returned 500 for every contest submission and gallery upload. The
 * break went unnoticed for 24 days.
 *
 * Ping is not a permissions check. This is: it exercises the two actions the app
 * actually depends on, and cleans up after itself.
 *
 *   npx tsx scripts/check-cloudinary-perms.ts
 *
 * Exit 0 = uploads work. Exit 1 = uploads are broken, with the reason.
 */
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

/** Never let a key or secret reach stdout, even inside an error string. */
function redact(value: unknown): string {
  let s = String(value ?? "");
  if (apiKey) s = s.split(apiKey).join("<API_KEY>");
  if (apiSecret) s = s.split(apiSecret).join("<API_SECRET>");
  return s;
}

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

if (!cloudName) fail("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set in .env.local");
if (!apiKey) fail("CLOUDINARY_API_KEY is not set in .env.local");
if (!apiSecret) fail("CLOUDINARY_API_SECRET is not set in .env.local");

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

// 1x1 transparent PNG - smallest possible real upload.
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

async function main(): Promise<void> {
  console.log(`cloud: ${cloudName}`);

  // 1. Credentials valid at all? Deliberately NOT treated as a pass on its own -
  //    this is exactly the call that stayed green through the whole outage.
  try {
    await cloudinary.api.ping();
    console.log("  ping         OK  (credentials valid - proves nothing about permissions)");
  } catch (err: unknown) {
    fail(`ping failed - credentials are wrong or revoked: ${redact((err as Error)?.message)}`);
  }

  // 2. READ - the media library / usage scope.
  let readOk = false;
  try {
    await cloudinary.api.usage();
    console.log("  read         OK");
    readOk = true;
  } catch (err: unknown) {
    console.error(`  read         FAILED: ${redact((err as { error?: Error })?.error?.message ?? (err as Error)?.message)}`);
  }

  // 3. CREATE - what /api/upload needs. The one that actually matters.
  let createOk = false;
  let publicId: string | undefined;
  try {
    const res = await cloudinary.uploader.upload(PIXEL, {
      folder: "coc-concertz/_permcheck",
      resource_type: "image",
    });
    publicId = res.public_id;
    console.log("  create       OK");
    createOk = true;
  } catch (err: unknown) {
    console.error(`  create       FAILED: ${redact((err as { error?: Error })?.error?.message ?? (err as Error)?.message)}`);
  }

  // Clean up the probe asset. A failure here is cosmetic - never fail the check
  // over leftover test pixels.
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err: unknown) {
      console.warn(`  (cleanup of ${publicId} failed, harmless): ${redact((err as Error)?.message)}`);
    }
  }

  if (!readOk || !createOk) {
    fail(
      "Cloudinary key is missing permissions - /api/upload will return 500 for every " +
        "contest submission and gallery upload.\n" +
        "      Fix: Cloudinary console -> Settings -> Access Keys -> grant read + create on " +
        "this key, or generate an unrestricted pair and update CLOUDINARY_API_KEY / " +
        "CLOUDINARY_API_SECRET in Vercel and .env.local, then redeploy.",
    );
  }

  console.log("OK: Cloudinary key can read and upload.");
}

main().catch((err: unknown) => fail(redact((err as Error)?.message)));
