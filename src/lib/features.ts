/**
 * Feature flags.
 *
 * PHOTO UPLOADS (2026-07-28)
 * --------------------------
 * Uploads are OFF by default. They are not broken code - the whole path works
 * - they are unplugged because the Cloudinary credential behind them lost its
 * permissions on 2026-07-03 and nothing on the free plan can restore it.
 *
 * Background, so whoever re-enables this does not re-derive it:
 *   - The app used a NON-ROOT key (498841...). On Cloudinary's free tier a
 *     non-root key carries no editable permission set, and its scopes appear
 *     to have been stripped by a plan/trial change rather than by a person.
 *     `api.ping()` kept returning {"status":"ok"} the entire time, which is
 *     why the outage went unnoticed for 24 days.
 *   - There IS a working path: the account's Root key (829645836778628) has
 *     full permissions. Re-enabling means pointing the env at that key.
 *
 * Deliberately a flag, not a deletion. The upload route, the gallery modal,
 * the contest submission flow and the Cloudinary SDK wiring all still exist
 * and are still typechecked and built. Turning this back on is an env change,
 * not a rebuild.
 *
 * TO RE-ENABLE
 *   1. Cloudinary -> Settings -> API Keys -> Root key -> copy the API Secret.
 *   2. Vercel (project co-c-concert-z) -> Environment Variables:
 *        CLOUDINARY_API_KEY          = 829645836778628
 *        CLOUDINARY_API_SECRET       = <the Root secret>
 *        NEXT_PUBLIC_UPLOADS_ENABLED = true
 *      Leave NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as dzzqdbo9k.
 *   3. Redeploy. Env vars only apply to builds created AFTER they are added.
 *   4. Verify: npx tsx scripts/check-cloudinary-perms.ts
 *      Expect: "OK: Cloudinary key can read and upload."
 *
 * NOTE ON THE ROOT KEY: it is the account's highest-privilege credential. On a
 * paid plan, create a scoped upload-only key instead. Free tier does not offer
 * that, so Root is the pragmatic option - keep the secret in Vercel only.
 *
 * What is NOT affected: every photo already uploaded. Those are plain public
 * res.cloudinary.com URLs served from the CDN and never touch the API key. The
 * gallery still renders in full; only NEW submissions are paused.
 */
export function uploadsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_UPLOADS_ENABLED === "true";
}

/** Shown wherever an upload entry point would otherwise be. */
export const UPLOADS_PAUSED_NOTE =
  "Photo submissions are paused right now. Existing photos are unaffected.";
