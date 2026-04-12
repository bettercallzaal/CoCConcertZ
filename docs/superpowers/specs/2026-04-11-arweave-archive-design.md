# COC Concertz Permanent Archive — Design Spec

> **Date:** April 11, 2026
> **Project:** COC Concertz
> **Status:** Approved for implementation
> **Dependencies:** Newsletter Builder v1 (shipped), ZAO OS research docs 150/152/153/155

---

## Problem

COC Concertz has no permanent media storage. Show recaps, artist photos, performance clips, and community content live in Cloudinary (ephemeral CDN) or don't get saved at all. There's no archive, no historical record, and no way for the community to own their content permanently.

## Solution

Arweave-first permanent archive with Supabase metadata, token-gated access via ZABAL balance, and a community fund wallet that covers upload costs.

## Architecture

```
Promoter opens /archive
    ↓
Token gate: check ZABAL balance >= 100M on Base (via wagmi readContract)
    ↓
Upload form: drag-and-drop files + metadata (show #, artists, description)
    ↓
Choose upload type: Simple | Atomic Asset (UDL) | Show Bundle
    ↓
ArDrive Turbo SDK uploads to Arweave (fund wallet pays fees)
    ↓
ar:// transaction ID stored in Supabase (metadata, tags, relationships)
    ↓
CDN delivery via ar.io Wayfinder gateway
    ↓
Content browsable at /archive on the COC Concertz site
```

### Stack

| Layer | Technology |
|-------|-----------|
| Permanent storage | Arweave via ArDrive Turbo SDK (`@ardrive/turbo-sdk`) |
| CDN | ar.io Wayfinder gateway for fast delivery |
| Metadata DB | Supabase (new — first Supabase integration in COC Concertz) |
| Token gate | wagmi `readContract` checking ZABAL balance on Base (chain 8453) |
| Upload UI | New `/archive` page, reuses existing FileUpload component pattern |
| Funding | Community Arweave fund wallet, managed by admin |

### Cost Model

- Arweave via ArDrive Turbo: ~$0.034 per 5MB (one-time, permanent)
- 100 uploads of 5MB each = ~$3.40 total
- 1000 uploads = ~$34
- Fund wallet topped up by admin/treasury as needed
- ArDrive Turbo supports both AR token and Stripe (credit card) for topping up

## Upload Types

### Simple (default)

Upload file to Arweave, get `ar://` transaction ID, store metadata in Supabase. Fast and straightforward.

### Atomic Asset (UDL)

Upload as an Arweave Atomic Asset with Universal Data License baked in. The content becomes:
- **Ownable** — has a creator/owner on Arweave
- **Licenseable** — UDL defines how others can use it
- **Tradeable** — can be listed on BazAR marketplace

UDL presets for COC Concertz:
- **Community Share** — free to view/share, attribution required
- **Collectible** — viewable, purchasable as a collectible
- **Premium** — gated, requires payment to access

### Show Bundle

Groups multiple files from one show into a single Arweave path manifest:
- Recap newsletter (markdown)
- Photos (jpg/png)
- Video clips (mp4)
- Audio recordings (mp3/wav)

One manifest transaction ID = one show archive entry containing all assets.

## Token Gate

| Parameter | Value |
|-----------|-------|
| Token | ZABAL |
| Chain | Base (8453) |
| Min balance | 100,000,000 (100M) |
| Check method | wagmi `readContract` on ERC-20 `balanceOf` |
| Gate scope | `/archive` upload functionality |
| Browse access | Public — anyone can view the archive |

Additional token gates can be configured via the `token_gates` Supabase table for future use (e.g., different thresholds for different features, other tokens).

## Data Model (Supabase)

### `archive_uploads`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| arweave_tx_id | text | The `ar://` permanent link |
| upload_type | text | `simple`, `atomic_asset`, or `show_bundle` |
| file_type | text | `image`, `video`, `audio`, `document` |
| file_size_bytes | bigint | File size |
| title | text | User-provided title |
| description | text | User-provided description |
| tags | text[] | Searchable tags, e.g. `["concertz-4", "recap"]` |
| show_id | text | Links to Firestore event (nullable) |
| artist_slugs | text[] | Links to Firestore artists |
| uploaded_by_wallet | text | Wallet that passed token gate |
| udl_license | jsonb | UDL params if atomic asset (nullable) |
| manifest_children | uuid[] | Child upload IDs if show bundle (nullable) |
| created_at | timestamptz | Auto-set |

### `archive_fund`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| wallet_address | text | Arweave fund wallet address |
| balance_ar | decimal | Current AR balance |
| total_spent_ar | decimal | Cumulative spend |
| total_uploads | int | Total uploads funded |
| last_topped_up | timestamptz | Last time fund was refilled |

### `token_gates`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| token_address | text | ERC-20 contract address (e.g. ZABAL on Base) |
| chain_id | int | 8453 for Base |
| min_balance | text | Minimum balance required (as string for big numbers) |
| gate_type | text | `archive_upload`, `newsletter`, etc. |
| active | boolean | Whether this gate is currently enforced |

## Pages & Components

### `/archive` — Public browse page

- Grid/list view of all archived content
- Filter by: show, artist, file type, upload type, date
- Each card shows: thumbnail, title, artist tags, `ar://` link, upload type badge
- Click to view full detail with Arweave gateway URL

### `/archive/upload` — Token-gated upload page

- Wallet connect button (if not connected)
- Token gate check — shows balance and whether threshold is met
- Upload form:
  - Drag-and-drop file(s) — reuses FileUpload component pattern
  - Title, description, tags (auto-suggest from existing tags)
  - Show selector (dropdown from Firestore events)
  - Artist selector (multi-select from Firestore artists)
  - Upload type picker: Simple | Atomic Asset | Show Bundle
  - UDL license preset picker (if Atomic Asset selected)
- Upload progress with Arweave confirmation
- Success: shows `ar://` link and archive entry

### Components

| Component | Purpose |
|-----------|---------|
| ArchiveGrid | Browse view with filters |
| ArchiveCard | Single archive entry card |
| ArchiveUploader | Upload form with type picker |
| TokenGate | Wallet connect + balance check |
| UDLPicker | License preset selector for atomic assets |
| FundStatus | Shows current fund balance (admin only) |

## API Routes

### `POST /api/archive/upload`
- Accepts: file + metadata
- Token gate check (verify wallet signature + balance)
- Uploads to Arweave via ArDrive Turbo SDK using fund wallet
- Saves metadata to Supabase
- Returns: `{ arweave_tx_id, archive_id, gateway_url }`

### `GET /api/archive/list`
- Query params: show, artist, type, page, limit
- Returns: paginated archive entries from Supabase

### `GET /api/archive/fund`
- Admin only
- Returns: current fund balance, total uploads, total spent

### `POST /api/archive/gate-check`
- Accepts: wallet address
- Returns: `{ eligible: boolean, balance: string, required: string }`

## Environment Variables (New)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Arweave Fund Wallet
ARWEAVE_FUND_WALLET_JWK=  # JSON Web Key for the fund wallet

# Token Gate
ZABAL_TOKEN_ADDRESS=0xbB48...  # ZABAL contract on Base
ZABAL_MIN_BALANCE=100000000    # 100M
```

## Future Phases

| Phase | Feature | When |
|-------|---------|------|
| v1.1 | Knowledge graph from archive tags + relationships | After archive ships |
| v1.2 | Transcript import (old show transcripts into archive) | After knowledge graph |
| v1.3 | BazAR marketplace integration for atomic assets | After atomic assets are live |
| v1.4 | ZABAL rewards for archiving (earn ZABAL for contributing) | After wallet integration |
| v1.5 | Newsletter builder media picker (pull from archive) | After archive has content |

## Research References

- Doc 150: Arweave permanent music storage basics
- Doc 152: Arweave ecosystem deep dive (ArDrive Turbo, ar.io Wayfinder, AO compute)
- Doc 153: BazAR & atomic assets (UDL licensing, UCM orderbook)
- Doc 155: Music NFT end-to-end implementation (ArDrive Turbo upload flow)
- Doc 322: Paragraph + publish.new (newsletter platform context)
