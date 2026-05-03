# Security

## Reporting a vulnerability

If you find a security issue, please email **zaalp99@gmail.com** with the details. Do not open a public GitHub issue. We aim to respond within 72 hours.

When reporting, please include:

- A description of the vulnerability and the affected component (e.g. `firestore.rules`, an `/api/*` route, the auth flow, the Cloudinary upload path)
- Steps to reproduce, ideally with a minimal payload or curl command
- The impact you believe it has (data exposure, integrity, availability)

## Scope

In scope:

- The deployed site at https://cocconcertz.com
- The Next.js app in this repo (`src/app`, `src/lib`, `src/components`)
- The Firestore configuration in this repo (`firestore.rules`, `firestore.indexes.json`)
- The Firestore Admin SDK API routes under `src/app/api/`

Out of scope:

- Third-party services we depend on (Firebase, Cloudinary, Vercel, Spatial.io, Twitch, Luma) — please report those upstream
- Social-engineering, physical attacks, denial-of-service that requires sustained traffic
- Findings in archived branches or pre-production preview deploys

## Public-write collections

The following Firestore collections accept writes from the browser:

- `chat/{eventId}/messages` — live-show chat
- `gallery` — fan photo submissions
- `subscribers` — email signups

Each is protected by:

1. **Field-level validation in `firestore.rules`** — schema, length caps, Cloudinary URL prefix on gallery, server-side timestamps required.
2. **Firebase App Check (planned, not yet enforced).** Once enforced, requests without a valid reCAPTCHA-v3-backed token will be rejected at the edge. See `docs/app-check-setup.md`.
3. **Rate limiting at the application layer** — `LiveChat` enforces a 2-second send cooldown per client.

If you find a way to bypass any of these, please report it.

## Secrets

This repo does not commit secrets. The Firebase Admin private key, Cloudinary API secret, and admin/artist passcodes live in environment variables managed via Vercel and `.env.local`. If you find a leaked secret in the git history, treat it as a critical report.
