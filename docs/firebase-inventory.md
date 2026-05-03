# Firebase Usage Inventory

Snapshot of every Firestore collection touched by the app. Used to ground `firestore.rules` so writes don't get silently denied in prod.

Auth model: passcode-cookie (`coc-role`, `coc-artist-slug`). Firebase Auth is initialized but **not used** for end-user auth (`getAuth(app)` is exported from `src/lib/firebase.ts:16` and `signInWithGoogle` exists in `src/lib/auth.ts` but is not wired up to any UI). `request.auth` is always `null` in client requests.

## Collections

| Path | Client writes | Admin writes | Client reads | Server reads | Notes |
|------|---------------|--------------|--------------|--------------|-------|
| `events` | `setDoc` create+update+delete (admin/admin-page client SDK), `updateEvent` from admin page | `getEventsServer`, `getEventByNumberServer` (read only) | `getEvents` (one-shot), `LiveMode` (`onSnapshot` collection), `ShowRecap` (one-shot where status=completed orderBy date desc), `archive/upload/page`, `content/page`, `newsletter/page` | server reads via Admin SDK from `db-server.ts` | Composite query: `where status == "completed"` + `orderBy date desc` (ShowRecap) — needs index |
| `artists` | `setDoc` create+update from `db.ts` | `/api/artists` POST/PUT use Admin SDK | `getArtists`, `getArtistBySlug`, `getArtistByUserId` | `getArtistsServer`, `getArtistBySlugServer` | Single-field queries only (slug, userId) — no composite index needed |
| `sets` | `setDoc`/`updateDoc`/`deleteDoc` from `db.ts` | none | `getSetsForEvent`, `getSetsForArtist` | `getSetsForArtistServer` | Composite queries: `where eventId ==` + `orderBy order asc`, `where artistId ==` + `orderBy order asc` — needs indexes |
| `live/nowPlaying` (single doc) | `setDoc`/`deleteDoc` from admin page (client SDK) | none | `NowPlaying` (`onSnapshot`), admin page (`onSnapshot`) | none | Real-time listener on home page |
| `recaps/{eventId}` | `setDoc` from admin page (client SDK) | none | `ShowRecap` (`getDoc`) | none | Written client-side from `/admin` |
| `chat/{eventId}/messages` | `addDoc` from `LiveChat` (public, browser) | none | `LiveChat` (`onSnapshot` orderBy timestamp asc limit 100), admin page (`getDocs` for count) | none | **Public-write subcollection.** Composite queries on `messages` use `orderBy timestamp` only |
| `gallery` | `addDoc` from `FanGallery` (public) | none | `FanGallery` (orderBy createdAt desc limit 20), admin page count | none | **Public-write.** Image URLs come from internal `/api/upload` (Cloudinary) |
| `subscribers` | `addDoc` from `EmailSignup` (public), `getDocs where email ==` for dedupe | none | admin page `getDocs` + `getCountFromServer` (admin-gated UI, but rules apply) | none | **Public-write but admin-only read in spec.** Currently the admin page reads via client SDK — this will break under the locked-down rule unless migrated to an API route |
| `invites` | `setDoc` create + update from `db.ts`, `auth.ts` | none | `getInvites`, `auth.ts` query by email | none | Used by Google sign-in flow that is not currently wired up |
| `users` | `setDoc` create+update from `db.ts`, `auth.ts` | none | `getUsers`, `auth.ts` getDoc by uid | none | Same as invites — only used by dormant Google auth path |
| `stats/visitors` (single doc) | `setDoc({ count: increment(±1) }, { merge: true })` from `VisitorCount` (public) | none | `VisitorCount` (`onSnapshot`), admin page (`getDoc`) | none | **Abuse-prone public increment.** Written field: `count` only (no `updatedAt`). `admin/page.tsx:331` also tries to read `peak` and `total` — those keys are never written |

## Field schemas (actual, from code)

### `events/{id}` (written from admin page client SDK + seed script)
- `name: string`
- `number: number`
- `date: Timestamp`
- `description: string`
- `rsvpLink: string`
- `venue: { spatialLink: string, streamLink?: string }`
- `status: "upcoming" | "live" | "completed"`
- `flyerUrl?: string`
- `bannerUrl?: string`
- `announcement?: string`
- `artists: EventArtist[]`
- `createdAt: serverTimestamp`
- `updatedAt: serverTimestamp`

### `artists/{id}` (mix: `db.ts` client SDK + `/api/artists` Admin SDK)
- `userId: string`
- `stageName: string`
- `slug: string`
- `bio: string`
- `profilePhoto?: string`
- `socialLinks: { twitter?, farcaster?, audius?, spotify?, youtube?, website? }`
- `cardCustomization: {...}`
- `linkedEvents: string[]`
- `walletAddress?: string`
- `createdAt: serverTimestamp` (client) / `new Date()` (admin)

### `sets/{id}`
- `artistId: string`
- `eventId: string`
- `songs: Song[]`
- `videos: Video[]`
- `notes?: string`
- `order: number`

### `live/nowPlaying`
- `songTitle: string`
- `artistName: string`
- `timestamp: Date | serverTimestamp` (writer uses `new Date()`; type field declared as `unknown`)

### `recaps/{eventId}`
- `eventName: string`
- `eventDate: string` (ISO)
- `visitorCount: number`
- `chatMessages: number`
- `artists: string[]`
- `generatedAt: string` (ISO)

### `chat/{eventId}/messages/{id}` (PUBLIC WRITE)
- `name: string` (1–24 chars enforced client-side via `nameInput.slice(0, 24)`)
- `text: string` (1–280 chars enforced via `maxLength={280}`)
- `timestamp: serverTimestamp` (NOT `createdAt` as suggested in the brief)

### `gallery/{id}` (PUBLIC WRITE)
- `url: string` (Cloudinary URL — NOT `imageUrl` as suggested in the brief)
- `name: string` (NOT `submittedBy` as suggested in the brief — used for fan name)
- `caption: string | null` (≤ 280 chars enforced client-side via Input maxlength absence — no hard cap on server side)
- `createdAt: serverTimestamp`

### `subscribers/{id}` (PUBLIC WRITE)
- `email: string` (lowercased)
- `subscribedAt: serverTimestamp` (NOT `createdAt` as suggested in the brief)

### `stats/visitors`
- `count: number` (only field actually written)

## Composite indexes required

| Collection | Fields | Source |
|------------|--------|--------|
| `events` | `status ASC`, `date DESC` | `ShowRecap.tsx:27-30` |
| `events` | `number DESC` (single field — auto-indexed) | `db.ts:23`, `db-server.ts:16` |
| `sets` | `eventId ASC`, `order ASC` | `db.ts:180-183` |
| `sets` | `artistId ASC`, `order ASC` | `db.ts:193-196`, `db-server.ts:78-80` |
| `chat/{eventId}/messages` | `timestamp ASC` (single field — auto-indexed) | `LiveChat.tsx:64-66` |
| `gallery` | `createdAt DESC` (single field — auto-indexed) | `FanGallery.tsx:42-44` |
| `invites` | `createdAt DESC` (single field — auto-indexed) | `db.ts:235` |
| `users` | `createdAt DESC` (single field — auto-indexed) | `db.ts:284` |

Single-field indexes are created automatically by Firestore. Only the composite ones (`events.status+date`, `sets.eventId+order`, `sets.artistId+order`) need to be declared.

## Critical mismatches to flag before locking rules

1. **`recaps`, `live`, `events` writes happen from the admin client SDK, not API routes.** The brief says "all writes go through `/api/*` Admin SDK routes" but the admin page (`src/app/admin/page.tsx`) uses client SDK directly for `setDoc(doc(db, "recaps", ...))`, `setDoc(doc(db, "live", "nowPlaying"))`, `deleteDoc(doc(db, "live", "nowPlaying"))`, and `updateEvent`. Also `db.ts` has many admin-only client SDK functions (createEvent, updateEvent, createArtist, deleteSet, …). If we deny client writes to these collections, the admin UI breaks until these are migrated to API routes.
2. **`subscribers` reads from admin page also use client SDK.** Admin spec wants client reads denied — that breaks the admin Subscribers panel until migrated.
3. **`artists` writes split across both layers.** `/api/artists` uses Admin SDK; `db.ts` (client SDK) also has `createArtist`/`updateArtist` callable from anywhere with the client SDK. Only the Admin SDK path is locked behind cookie auth.
4. **`stats/visitors` is incremented directly from the browser.** Anyone can hit the page in a loop and inflate the counter. Step 5 fixes this.
5. **Field name divergences from the brief**: `gallery` uses `url`/`name`, not `imageUrl`/`submittedBy`. `chat` uses `timestamp`, not `createdAt`. `subscribers` uses `subscribedAt`, not `createdAt`. The rules below match the actual code, NOT the brief.
