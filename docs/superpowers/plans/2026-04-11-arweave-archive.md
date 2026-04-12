# Arweave Permanent Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a permanent Arweave archive at `/archive` where token-gated promoters (100M ZABAL on Base) upload media that gets permanently stored on Arweave, with metadata in Supabase and CDN delivery via ar.io gateway.

**Architecture:** ArDrive Turbo SDK uploads files to Arweave using a community fund wallet. Supabase stores metadata (titles, tags, artist links, transaction IDs). wagmi checks ZABAL balance on Base for token gate. Public browse page at `/archive`, gated upload at `/archive/upload`. Three upload types: Simple, Atomic Asset (UDL), Show Bundle.

**Tech Stack:** Next.js 16 App Router, React 19, @ardrive/turbo-sdk, @supabase/supabase-js, wagmi v2, viem v2, existing COC Concertz design system

---

## File Structure

```
src/
├── lib/
│   ├── supabase.ts                    # Supabase client (NEW)
│   ├── arweave.ts                     # ArDrive Turbo upload helpers (NEW)
│   ├── tokenGate.ts                   # ZABAL balance check helper (NEW)
│   └── types.ts                       # Add archive types (MODIFY)
├── components/
│   └── archive/
│       ├── ArchiveGrid.tsx            # Browse grid with filters (NEW)
│       ├── ArchiveCard.tsx            # Single archive entry card (NEW)
│       ├── ArchiveUploader.tsx        # Upload form with type picker (NEW)
│       ├── TokenGate.tsx              # Wallet connect + balance check (NEW)
│       └── UDLPicker.tsx              # License preset selector (NEW)
├── app/
│   ├── archive/
│   │   └── page.tsx                   # Public browse page (NEW)
│   └── api/archive/
│       ├── upload/route.ts            # Upload to Arweave + save metadata (NEW)
│       ├── list/route.ts              # Query archive entries (NEW)
│       └── gate-check/route.ts        # Check ZABAL balance (NEW)
├── context/
│   └── WalletContext.tsx              # wagmi provider wrapper (NEW)
└── app/layout.tsx                     # Add WalletProvider (MODIFY)

concertz.config.ts                     # Add archive config (MODIFY)
```

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Supabase, Arweave, and wallet packages**

```bash
npm install @supabase/supabase-js @ardrive/turbo-sdk wagmi@^2 viem@^2 @tanstack/react-query
```

Note: `@tanstack/react-query` is a peer dep of wagmi v2.

- [ ] **Step 2: Verify installation**

```bash
node -e "require('@supabase/supabase-js'); require('wagmi'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase, arweave, wagmi, viem dependencies"
```

---

### Task 2: Add Archive Types

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Add archive types to the end of types.ts**

Add these types after the existing `Invite` interface:

```typescript
export type UploadType = "simple" | "atomic_asset" | "show_bundle";
export type ArchiveFileType = "image" | "video" | "audio" | "document";

export interface UDLLicense {
  preset: "community-share" | "collectible" | "premium" | "open";
  commercialUse?: boolean;
  derivativeWorks?: boolean;
  attribution?: boolean;
}

export interface ArchiveUpload {
  id: string;
  arweave_tx_id: string;
  upload_type: UploadType;
  file_type: ArchiveFileType;
  file_size_bytes: number;
  title: string;
  description: string;
  tags: string[];
  show_id: string | null;
  artist_slugs: string[];
  uploaded_by_wallet: string;
  udl_license: UDLLicense | null;
  manifest_children: string[] | null;
  created_at: string;
}

export interface ArchiveFund {
  id: string;
  wallet_address: string;
  balance_ar: number;
  total_spent_ar: number;
  total_uploads: number;
  last_topped_up: string;
}

export interface TokenGateConfig {
  id: string;
  token_address: string;
  chain_id: number;
  min_balance: string;
  gate_type: string;
  active: boolean;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add archive, fund, and token gate types"
```

---

### Task 3: Supabase Client + Config

**Files:**
- Create: `src/lib/supabase.ts`
- Modify: `concertz.config.ts`

- [ ] **Step 1: Create Supabase client**

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for API routes)
export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

- [ ] **Step 2: Add archive config to concertz.config.ts**

Add inside the config object, after the `newsletter` block:

```typescript
  archive: {
    arweaveGateway: "https://arweave.net",
    tokenGate: {
      tokenAddress: process.env.ZABAL_TOKEN_ADDRESS || "",
      chainId: 8453,
      minBalance: process.env.ZABAL_MIN_BALANCE || "100000000",
    },
    udlPresets: {
      "community-share": { commercialUse: false, derivativeWorks: true, attribution: true },
      collectible: { commercialUse: false, derivativeWorks: false, attribution: true },
      premium: { commercialUse: true, derivativeWorks: false, attribution: true },
      open: { commercialUse: true, derivativeWorks: true, attribution: false },
    },
  },
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts concertz.config.ts
git commit -m "feat: add Supabase client and archive config"
```

---

### Task 4: Token Gate Helper + API Route

**Files:**
- Create: `src/lib/tokenGate.ts`
- Create: `src/app/api/archive/gate-check/route.ts`

- [ ] **Step 1: Create token gate helper**

Create `src/lib/tokenGate.ts`:

```typescript
import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";

const ERC20_ABI = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
]);

const client = createPublicClient({
  chain: base,
  transport: http(),
});

export async function checkTokenBalance(
  walletAddress: string,
  tokenAddress: string,
  minBalance: string
): Promise<{ eligible: boolean; balance: string }> {
  const balance = await client.readContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [walletAddress as `0x${string}`],
  });

  const balanceStr = balance.toString();
  const eligible = balance >= BigInt(minBalance);

  return { eligible, balance: balanceStr };
}
```

- [ ] **Step 2: Create gate-check API route**

Create `src/app/api/archive/gate-check/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { checkTokenBalance } from "@/lib/tokenGate";
import { config as siteConfig } from "../../../../../concertz.config";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
    }

    const { tokenAddress, minBalance } = siteConfig.archive.tokenGate;

    if (!tokenAddress) {
      return NextResponse.json({ error: "Token gate not configured" }, { status: 500 });
    }

    const result = await checkTokenBalance(walletAddress, tokenAddress, minBalance);

    return NextResponse.json({
      eligible: result.eligible,
      balance: result.balance,
      required: minBalance,
      token: "ZABAL",
      chain: "Base",
    });
  } catch (err) {
    console.error("Gate check error:", err);
    return NextResponse.json({ error: "Failed to check balance" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/tokenGate.ts src/app/api/archive/gate-check/route.ts
git commit -m "feat: add ZABAL token gate check helper and API route"
```

---

### Task 5: Arweave Upload Helper

**Files:**
- Create: `src/lib/arweave.ts`

- [ ] **Step 1: Create Arweave upload helper**

Create `src/lib/arweave.ts`:

```typescript
import { TurboFactory } from "@ardrive/turbo-sdk";

let turboClient: ReturnType<typeof TurboFactory.authenticated> | null = null;

function getTurboClient() {
  if (turboClient) return turboClient;

  const jwkString = process.env.ARWEAVE_FUND_WALLET_JWK;
  if (!jwkString) throw new Error("ARWEAVE_FUND_WALLET_JWK not configured");

  const jwk = JSON.parse(jwkString);
  turboClient = TurboFactory.authenticated({ privateKey: jwk });
  return turboClient;
}

export async function uploadToArweave(
  fileBuffer: Buffer,
  contentType: string,
  tags?: { name: string; value: string }[]
): Promise<{ txId: string; gatewayUrl: string }> {
  const turbo = getTurboClient();

  const allTags = [
    { name: "Content-Type", value: contentType },
    { name: "App-Name", value: "COC-Concertz-Archive" },
    { name: "App-Version", value: "1.0.0" },
    ...(tags || []),
  ];

  const response = await turbo.uploadFile({
    fileStreamFactory: () => {
      const { Readable } = require("stream");
      return Readable.from(fileBuffer);
    },
    fileSizeFactory: () => fileBuffer.length,
    dataItemOpts: { tags: allTags },
  });

  const txId = response.id;
  const gatewayUrl = `https://arweave.net/${txId}`;

  return { txId, gatewayUrl };
}

export async function getFundBalance(): Promise<{
  balanceWinc: string;
  balanceAR: number;
}> {
  const turbo = getTurboClient();
  const balance = await turbo.getBalance();
  const balanceWinc = balance.winc;
  const balanceAR = Number(balanceWinc) / 1e12;
  return { balanceWinc, balanceAR };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/arweave.ts
git commit -m "feat: add ArDrive Turbo upload helper for Arweave"
```

---

### Task 6: Archive Upload API Route

**Files:**
- Create: `src/app/api/archive/upload/route.ts`

- [ ] **Step 1: Create the upload API route**

Create `src/app/api/archive/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { uploadToArweave } from "@/lib/arweave";
import { createServerSupabase } from "@/lib/supabase";
import { checkTokenBalance } from "@/lib/tokenGate";
import { config as siteConfig } from "../../../../../concertz.config";
import type { UploadType, ArchiveFileType } from "@/lib/types";

function detectFileType(contentType: string): ArchiveFileType {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";
  return "document";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const walletAddress = formData.get("walletAddress") as string;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const tagsRaw = formData.get("tags") as string;
    const showId = (formData.get("showId") as string) || null;
    const artistSlugsRaw = (formData.get("artistSlugs") as string) || "[]";
    const uploadType = (formData.get("uploadType") as UploadType) || "simple";
    const udlLicenseRaw = formData.get("udlLicense") as string | null;

    if (!file || !walletAddress || !title) {
      return NextResponse.json(
        { error: "file, walletAddress, and title are required" },
        { status: 400 }
      );
    }

    // Token gate check
    const { tokenAddress, minBalance } = siteConfig.archive.tokenGate;
    if (tokenAddress) {
      const gate = await checkTokenBalance(walletAddress, tokenAddress, minBalance);
      if (!gate.eligible) {
        return NextResponse.json(
          {
            error: "Insufficient ZABAL balance",
            balance: gate.balance,
            required: minBalance,
          },
          { status: 403 }
        );
      }
    }

    // Upload to Arweave
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tags: { name: string; value: string }[] = [];
    if (title) tags.push({ name: "Title", value: title });
    if (uploadType === "atomic_asset") {
      tags.push({ name: "Type", value: "atomic-asset" });
    }

    const { txId, gatewayUrl } = await uploadToArweave(
      buffer,
      file.type,
      tags
    );

    // Save metadata to Supabase
    const supabase = createServerSupabase();
    const parsedTags = tagsRaw ? JSON.parse(tagsRaw) : [];
    const artistSlugs = JSON.parse(artistSlugsRaw);
    const udlLicense = udlLicenseRaw ? JSON.parse(udlLicenseRaw) : null;

    const { data, error } = await supabase
      .from("archive_uploads")
      .insert({
        arweave_tx_id: txId,
        upload_type: uploadType,
        file_type: detectFileType(file.type),
        file_size_bytes: buffer.length,
        title,
        description,
        tags: parsedTags,
        show_id: showId,
        artist_slugs: artistSlugs,
        uploaded_by_wallet: walletAddress,
        udl_license: udlLicense,
        manifest_children: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save metadata" }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      arweave_tx_id: txId,
      gateway_url: gatewayUrl,
    });
  } catch (err) {
    console.error("Archive upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/archive/upload/route.ts
git commit -m "feat: add archive upload API route (Arweave + Supabase + token gate)"
```

---

### Task 7: Archive List API Route

**Files:**
- Create: `src/app/api/archive/list/route.ts`

- [ ] **Step 1: Create the list API route**

Create `src/app/api/archive/list/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const showId = url.searchParams.get("show");
  const artist = url.searchParams.get("artist");
  const fileType = url.searchParams.get("type");
  const uploadType = url.searchParams.get("uploadType");

  const supabase = createServerSupabase();
  let query = supabase
    .from("archive_uploads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (showId) query = query.eq("show_id", showId);
  if (artist) query = query.contains("artist_slugs", [artist]);
  if (fileType) query = query.eq("file_type", fileType);
  if (uploadType) query = query.eq("upload_type", uploadType);

  const { data, error, count } = await query;

  if (error) {
    console.error("Archive list error:", error);
    return NextResponse.json({ error: "Failed to fetch archive" }, { status: 500 });
  }

  return NextResponse.json({
    items: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/archive/list/route.ts
git commit -m "feat: add archive list API with filtering and pagination"
```

---

### Task 8: Wallet Context Provider

**Files:**
- Create: `src/context/WalletContext.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create WalletContext**

Create `src/context/WalletContext.tsx`:

```typescript
"use client";

import React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

- [ ] **Step 2: Add WalletProvider to root layout**

In `src/app/layout.tsx`, add the import and wrap:

```typescript
import { WalletProvider } from "@/context/WalletContext";
```

Change the body content from:

```tsx
<AuthProvider>{children}</AuthProvider>
```

To:

```tsx
<WalletProvider>
  <AuthProvider>{children}</AuthProvider>
</WalletProvider>
```

- [ ] **Step 3: Commit**

```bash
git add src/context/WalletContext.tsx src/app/layout.tsx
git commit -m "feat: add wagmi WalletProvider for Base chain wallet connection"
```

---

### Task 9: TokenGate Component

**Files:**
- Create: `src/components/archive/TokenGate.tsx`

- [ ] **Step 1: Create TokenGate component**

Create `src/components/archive/TokenGate.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

interface TokenGateProps {
  onGatePass: (walletAddress: string) => void;
}

export function TokenGate({ onGatePass }: TokenGateProps) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gateResult, setGateResult] = useState<{
    eligible: boolean;
    balance: string;
    required: string;
  } | null>(null);

  const checkGate = async () => {
    if (!address) return;
    setChecking(true);
    setError(null);

    try {
      const res = await fetch("/api/archive/gate-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gate check failed");
        return;
      }

      setGateResult(data);
      if (data.eligible) {
        onGatePass(address);
      }
    } catch {
      setError("Failed to check token balance");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--card)",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px",
          color: "var(--yellow)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          margin: 0,
        }}
      >
        Archive Access
      </h2>

      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-dim)",
          textAlign: "center",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        Connect your wallet and hold 100M+ ZABAL on Base to upload to the permanent archive.
      </p>

      {!isConnected ? (
        <button
          onClick={() => connect({ connector: injected() })}
          style={{
            background: "var(--yellow)",
            color: "#000",
            border: "none",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "12px 32px",
            cursor: "pointer",
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-dim)",
            }}
          >
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            <button
              onClick={() => disconnect()}
              style={{
                background: "none",
                border: "none",
                color: "var(--yellow)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                marginLeft: "8px",
                textDecoration: "underline",
              }}
            >
              disconnect
            </button>
          </div>

          {!gateResult && (
            <button
              onClick={checkGate}
              disabled={checking}
              style={{
                background: "var(--yellow)",
                color: "#000",
                border: "none",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                padding: "12px 32px",
                cursor: checking ? "wait" : "pointer",
                opacity: checking ? 0.6 : 1,
              }}
            >
              {checking ? "Checking..." : "Verify ZABAL Balance"}
            </button>
          )}

          {gateResult && !gateResult.eligible && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "#ff4444",
                textAlign: "center",
              }}
            >
              Insufficient ZABAL. You have {gateResult.balance}, need {gateResult.required}.
            </div>
          )}
        </>
      )}

      {error && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "#ff4444",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/archive/TokenGate.tsx
git commit -m "feat: add TokenGate component with wallet connect and ZABAL check"
```

---

### Task 10: UDLPicker Component

**Files:**
- Create: `src/components/archive/UDLPicker.tsx`

- [ ] **Step 1: Create UDLPicker component**

Create `src/components/archive/UDLPicker.tsx`:

```typescript
"use client";

import React from "react";
import type { UDLLicense } from "@/lib/types";

const PRESETS: { key: UDLLicense["preset"]; label: string; desc: string }[] = [
  { key: "community-share", label: "Community Share", desc: "Free to view & share, attribution required" },
  { key: "collectible", label: "Collectible", desc: "Viewable, purchasable as a collectible" },
  { key: "premium", label: "Premium", desc: "Gated, requires payment to access" },
  { key: "open", label: "Open", desc: "Fully open, no restrictions" },
];

interface UDLPickerProps {
  selected: UDLLicense["preset"] | null;
  onSelect: (preset: UDLLicense["preset"]) => void;
}

export function UDLPicker({ selected, onSelect }: UDLPickerProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var(--text-dim)",
        }}
      >
        License Preset
      </span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onSelect(p.key)}
            style={{
              background: selected === p.key ? "rgba(255,221,0,0.1)" : "var(--card)",
              border: `1px solid ${selected === p.key ? "var(--yellow)" : "var(--border)"}`,
              padding: "12px",
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 600,
                color: selected === p.key ? "var(--yellow)" : "#fff",
              }}
            >
              {p.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--text-dim)",
                marginTop: "4px",
              }}
            >
              {p.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/archive/UDLPicker.tsx
git commit -m "feat: add UDL license preset picker component"
```

---

### Task 11: ArchiveUploader Component

**Files:**
- Create: `src/components/archive/ArchiveUploader.tsx`

- [ ] **Step 1: Create ArchiveUploader component**

Create `src/components/archive/ArchiveUploader.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { UDLPicker } from "@/components/archive/UDLPicker";
import type { Event, Artist, UploadType, UDLLicense } from "@/lib/types";

interface ArchiveUploaderProps {
  walletAddress: string;
  events: Event[];
  artists: Artist[];
  onUploadComplete: (result: { id: string; arweave_tx_id: string; gateway_url: string }) => void;
}

export function ArchiveUploader({
  walletAddress,
  events,
  artists,
  onUploadComplete,
}: ArchiveUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [showId, setShowId] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [uploadType, setUploadType] = useState<UploadType>("simple");
  const [udlPreset, setUdlPreset] = useState<UDLLicense["preset"] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file || !title) {
      setError("File and title are required");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("walletAddress", walletAddress);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", JSON.stringify(tagsInput.split(",").map((t) => t.trim()).filter(Boolean)));
      formData.append("uploadType", uploadType);
      if (showId) formData.append("showId", showId);
      formData.append("artistSlugs", JSON.stringify(selectedArtists));
      if (uploadType === "atomic_asset" && udlPreset) {
        formData.append("udlLicense", JSON.stringify({ preset: udlPreset }));
      }

      const res = await fetch("/api/archive/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      onUploadComplete(data);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const inputStyle = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    color: "#fff",
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
  };

  const labelStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: 600 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    color: "var(--text-dim)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>
      {/* Upload Type Selector */}
      <div style={{ display: "flex", gap: "8px" }}>
        {(["simple", "atomic_asset", "show_bundle"] as UploadType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setUploadType(t)}
            style={{
              background: uploadType === t ? "rgba(255,221,0,0.1)" : "transparent",
              border: `1px solid ${uploadType === t ? "var(--yellow)" : "var(--border)"}`,
              color: uploadType === t ? "var(--yellow)" : "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* File Upload */}
      <FileUpload
        label="File"
        accept="image/*,video/*,audio/*,.pdf,.md"
        onUpload={setFile}
      />

      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={labelStyle}>Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. COC Concertz #4 Recap"
          style={inputStyle}
        />
      </div>

      {/* Description */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={labelStyle}>Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this content?"
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={labelStyle}>Tags (comma separated)</span>
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. concertz-4, recap, joseph-goats"
          style={inputStyle}
        />
      </div>

      {/* Show Selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={labelStyle}>Show (optional)</span>
        <select
          value={showId}
          onChange={(e) => setShowId(e.target.value)}
          style={inputStyle}
        >
          <option value="">No show linked</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              COC Concertz #{ev.number} — {ev.name}
            </option>
          ))}
        </select>
      </div>

      {/* Artist Selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={labelStyle}>Artists (optional)</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {artists.map((a) => (
            <button
              key={a.slug}
              type="button"
              onClick={() =>
                setSelectedArtists((prev) =>
                  prev.includes(a.slug) ? prev.filter((s) => s !== a.slug) : [...prev, a.slug]
                )
              }
              style={{
                background: selectedArtists.includes(a.slug) ? "rgba(255,221,0,0.1)" : "transparent",
                border: `1px solid ${selectedArtists.includes(a.slug) ? "var(--yellow)" : "var(--border)"}`,
                color: selectedArtists.includes(a.slug) ? "var(--yellow)" : "var(--text-dim)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              {a.stageName}
            </button>
          ))}
        </div>
      </div>

      {/* UDL Picker (only for atomic_asset) */}
      {uploadType === "atomic_asset" && (
        <UDLPicker selected={udlPreset} onSelect={setUdlPreset} />
      )}

      {/* Error */}
      {error && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#ff4444" }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={uploading || !file || !title}
        style={{
          background: "var(--yellow)",
          color: "#000",
          border: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          padding: "14px 32px",
          cursor: uploading ? "wait" : "pointer",
          opacity: uploading || !file || !title ? 0.5 : 1,
          transition: "opacity 0.15s",
        }}
      >
        {uploading ? "Uploading to Arweave..." : "Upload to Permanent Archive"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/archive/ArchiveUploader.tsx
git commit -m "feat: add ArchiveUploader component with type picker and metadata form"
```

---

### Task 12: ArchiveCard + ArchiveGrid Components

**Files:**
- Create: `src/components/archive/ArchiveCard.tsx`
- Create: `src/components/archive/ArchiveGrid.tsx`

- [ ] **Step 1: Create ArchiveCard**

Create `src/components/archive/ArchiveCard.tsx`:

```typescript
"use client";

import React from "react";
import type { ArchiveUpload } from "@/lib/types";

interface ArchiveCardProps {
  item: ArchiveUpload;
}

const TYPE_LABELS: Record<string, string> = {
  simple: "ARCHIVE",
  atomic_asset: "ATOMIC",
  show_bundle: "BUNDLE",
};

const FILE_ICONS: Record<string, string> = {
  image: "IMG",
  video: "VID",
  audio: "AUD",
  document: "DOC",
};

export function ArchiveCard({ item }: ArchiveCardProps) {
  const gatewayUrl = `https://arweave.net/${item.arweave_tx_id}`;
  const isMedia = item.file_type === "image" || item.file_type === "video";

  return (
    <a
      href={gatewayUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        border: "1px solid var(--border)",
        background: "var(--card)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        textDecoration: "none",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--yellow)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
      }}
    >
      {/* Thumbnail area */}
      <div
        style={{
          height: "160px",
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {isMedia && item.file_type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gatewayUrl}
            alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "36px",
              color: "var(--text-dim)",
            }}
          >
            {FILE_ICONS[item.file_type] || "FILE"}
          </span>
        )}

        {/* Upload type badge */}
        <span
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "rgba(0,0,0,0.8)",
            border: "1px solid var(--yellow)",
            color: "var(--yellow)",
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "2px 6px",
          }}
        >
          {TYPE_LABELS[item.upload_type] || "ARCHIVE"}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            fontWeight: 600,
            color: "#fff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </div>

        {item.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--text-dim)",
                  border: "1px solid var(--border)",
                  padding: "1px 5px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--text-dim)",
          }}
        >
          ar://{item.arweave_tx_id.slice(0, 8)}...
        </div>
      </div>
    </a>
  );
}
```

- [ ] **Step 2: Create ArchiveGrid**

Create `src/components/archive/ArchiveGrid.tsx`:

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import type { ArchiveUpload } from "@/lib/types";

export function ArchiveGrid() {
  const [items, setItems] = useState<ArchiveUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ type?: string; uploadType?: string }>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchArchive = async () => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filter.type) params.set("type", filter.type);
      if (filter.uploadType) params.set("uploadType", filter.uploadType);

      const res = await fetch(`/api/archive/list?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    };

    fetchArchive();
  }, [page, filter]);

  const filterBtnStyle = (active: boolean) => ({
    background: active ? "rgba(255,221,0,0.1)" : "transparent",
    border: `1px solid ${active ? "var(--yellow)" : "var(--border)"}`,
    color: active ? "var(--yellow)" : "var(--text-dim)",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: 600 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    padding: "6px 12px",
    cursor: "pointer" as const,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button style={filterBtnStyle(!filter.type)} onClick={() => setFilter((f) => ({ ...f, type: undefined }))}>
          All
        </button>
        {["image", "video", "audio", "document"].map((t) => (
          <button key={t} style={filterBtnStyle(filter.type === t)} onClick={() => setFilter((f) => ({ ...f, type: t }))}>
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)", textAlign: "center", padding: "40px" }}>
          Loading archive...
        </div>
      ) : items.length === 0 ? (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)", textAlign: "center", padding: "40px" }}>
          No archive entries yet. Be the first to upload.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
          {items.map((item) => (
            <ArchiveCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={filterBtnStyle(false)}
          >
            Prev
          </button>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", padding: "6px" }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={filterBtnStyle(false)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/archive/ArchiveCard.tsx src/components/archive/ArchiveGrid.tsx
git commit -m "feat: add ArchiveCard and ArchiveGrid components for browse view"
```

---

### Task 13: Archive Browse Page

**Files:**
- Create: `src/app/archive/page.tsx`

- [ ] **Step 1: Create the archive browse page**

Create `src/app/archive/page.tsx`:

```typescript
"use client";

import React from "react";
import { ArchiveGrid } from "@/components/archive/ArchiveGrid";

export default function ArchivePage() {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "48px",
            color: "var(--yellow)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: 0,
          }}
        >
          Permanent Archive
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--text-dim)",
            marginTop: "8px",
            lineHeight: 1.6,
          }}
        >
          Every show, every moment — stored forever on Arweave. Community-funded, community-owned.
        </p>

        <a
          href="/archive/upload"
          style={{
            display: "inline-block",
            marginTop: "16px",
            background: "var(--yellow)",
            color: "#000",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "10px 24px",
            textDecoration: "none",
          }}
        >
          Upload to Archive
        </a>
      </div>

      <ArchiveGrid />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/archive/page.tsx
git commit -m "feat: add public archive browse page"
```

---

### Task 14: Archive Upload Page

**Files:**
- Create: `src/app/archive/upload/page.tsx`

- [ ] **Step 1: Create the token-gated upload page**

Create `src/app/archive/upload/page.tsx`:

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event, Artist } from "@/lib/types";
import { TokenGate } from "@/components/archive/TokenGate";
import { ArchiveUploader } from "@/components/archive/ArchiveUploader";

export default function ArchiveUploadPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [success, setSuccess] = useState<{
    id: string;
    arweave_tx_id: string;
    gateway_url: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [evSnap, arSnap] = await Promise.all([
        getDocs(query(collection(db, "events"), orderBy("number", "desc"))),
        getDocs(collection(db, "artists")),
      ]);
      setEvents(evSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Event));
      setArtists(arSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Artist));
    };
    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "40px",
          color: "var(--yellow)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          margin: "0 0 8px 0",
        }}
      >
        Upload to Archive
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-dim)",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}
      >
        Permanently store content on Arweave. Funded by the COC Concertz community archive fund.
      </p>

      {success ? (
        <div
          style={{
            border: "1px solid var(--yellow)",
            background: "rgba(255,221,0,0.05)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              color: "var(--yellow)",
              margin: 0,
            }}
          >
            Archived Forever
          </h2>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)" }}>
            Transaction: ar://{success.arweave_tx_id}
          </div>
          <a
            href={success.gateway_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--yellow)",
            }}
          >
            View on Arweave →
          </a>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              onClick={() => setSuccess(null)}
              style={{
                background: "var(--yellow)",
                color: "#000",
                border: "none",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Upload Another
            </button>
            <a
              href="/archive"
              style={{
                border: "1px solid var(--yellow)",
                color: "var(--yellow)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                padding: "10px 20px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Browse Archive
            </a>
          </div>
        </div>
      ) : !walletAddress ? (
        <TokenGate onGatePass={setWalletAddress} />
      ) : (
        <ArchiveUploader
          walletAddress={walletAddress}
          events={events}
          artists={artists}
          onUploadComplete={setSuccess}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/archive/upload/page.tsx
git commit -m "feat: add token-gated archive upload page"
```

---

### Task 15: Supabase Setup + Environment Variables

**Files:**
- Modify: `.env.local` (manual)

- [ ] **Step 1: Create Supabase project**

Go to [supabase.com](https://supabase.com), create a new project named `coc-concertz-archive`.

- [ ] **Step 2: Create tables via Supabase SQL editor**

Run this SQL in the Supabase SQL editor:

```sql
-- Archive uploads
create table archive_uploads (
  id uuid default gen_random_uuid() primary key,
  arweave_tx_id text not null,
  upload_type text not null default 'simple' check (upload_type in ('simple', 'atomic_asset', 'show_bundle')),
  file_type text not null check (file_type in ('image', 'video', 'audio', 'document')),
  file_size_bytes bigint not null,
  title text not null,
  description text default '',
  tags text[] default '{}',
  show_id text,
  artist_slugs text[] default '{}',
  uploaded_by_wallet text not null,
  udl_license jsonb,
  manifest_children uuid[],
  created_at timestamptz default now()
);

-- Archive fund tracking
create table archive_fund (
  id uuid default gen_random_uuid() primary key,
  wallet_address text not null,
  balance_ar decimal default 0,
  total_spent_ar decimal default 0,
  total_uploads int default 0,
  last_topped_up timestamptz default now()
);

-- Token gate configuration
create table token_gates (
  id uuid default gen_random_uuid() primary key,
  token_address text not null,
  chain_id int not null default 8453,
  min_balance text not null,
  gate_type text not null,
  active boolean default true
);

-- Enable RLS
alter table archive_uploads enable row level security;
alter table archive_fund enable row level security;
alter table token_gates enable row level security;

-- Public read access for archive
create policy "Public read archive" on archive_uploads for select using (true);

-- Service role can insert (API routes use service key)
create policy "Service insert archive" on archive_uploads for insert with check (true);

-- Public read for fund status
create policy "Public read fund" on archive_fund for select using (true);

-- Public read for gate config
create policy "Public read gates" on token_gates for select using (true);

-- Insert initial token gate config
insert into token_gates (token_address, chain_id, min_balance, gate_type, active)
values ('ZABAL_CONTRACT_ADDRESS_HERE', 8453, '100000000', 'archive_upload', true);
```

- [ ] **Step 3: Add environment variables to .env.local**

Add to `.env.local`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Arweave Fund Wallet (JWK from your Arweave wallet)
ARWEAVE_FUND_WALLET_JWK={"kty":"RSA","n":"..."}

# Token Gate
ZABAL_TOKEN_ADDRESS=0xbB48...
ZABAL_MIN_BALANCE=100000000
```

- [ ] **Step 4: Add same env vars to Vercel**

Add all 6 new env vars in Vercel Settings > Environment Variables.

---

### Task 16: Build Verification + Push

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with `/archive` and `/archive/upload` in the route list.

- [ ] **Step 2: Push to deploy**

```bash
git push origin main
```

---
