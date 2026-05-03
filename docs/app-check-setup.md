# Firebase App Check Setup

App Check binds every Firestore request to a token issued by reCAPTCHA v3 (or App Attest on iOS / Play Integrity on Android). Without it, anyone with the public project ID can hammer the public-write collections (`chat`, `gallery`, `subscribers`) directly via the REST API. With it, those calls only succeed from a verified browser session on our domains.

This doc is the 5-minute switch-on once we are ready.

## 1. Create a reCAPTCHA v3 site key

1. Sign in at https://www.google.com/recaptcha/admin/create
2. Pick reCAPTCHA v3
3. Add the domains we serve from (`cocconcertz.com`, the Vercel preview wildcard, `localhost` for dev)
4. Copy the **site key** (public) and the **secret key** (server-side, not used here)

## 2. Register the site key in the Firebase console

1. Open https://console.firebase.google.com → COC ConcertZ project → App Check
2. Apps → pick the web app
3. Provider → reCAPTCHA v3 → paste the site key
4. Set the token TTL (default 1 hour is fine)
5. Leave Enforcement OFF for now (monitor mode)

## 3. Wire the client

Add the site key to environment variables:

```env
# .env.local AND Vercel project settings (Production + Preview)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then uncomment the `initializeAppCheck` block in `src/lib/firebase.ts`. The skeleton is already in place — only the import and the call need to be live.

## 4. Verify in monitor mode

Deploy. In Firebase console → App Check → Requests, you should see request volume split between "verified" and "unverified". Wait until traffic from production users is ~100% verified.

## 5. Flip enforcement

In Firebase console → App Check → Firestore → Enforce. From this point, any request without a valid App Check token gets a `permission-denied`. Roll back is one click.

## 6. Tighten the dependent rules

Once enforcement is on, the public-write collections (`chat`, `gallery`, `subscribers`) get an effective second layer: even if someone bypasses our domain, they can't mint a valid App Check token. The rules in `firestore.rules` stay the same — App Check enforcement is independent of rules and applies on top of them.

## Notes

- The npm package is `@firebase/app-check` (already added to `package.json`). It is a peer of `firebase` v12.
- App Check tokens auto-refresh while the page is open; users don't see the reCAPTCHA challenge unless score-based risk is high.
- For server-side Admin SDK calls, App Check is NOT enforced — those use service-account credentials and are trusted.
