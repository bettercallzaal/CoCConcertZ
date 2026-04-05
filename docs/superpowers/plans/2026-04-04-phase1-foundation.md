# Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate COC ConcertZ from static HTML to Next.js with Firebase backend, admin dashboard, and artist portal.

**Architecture:** Next.js 15 App Router on Vercel. Firebase Auth (Google sign-in) with role-based access (admin/artist/fan). Firestore for data, Firebase Storage for uploads. Tailwind CSS with the existing cyberpunk design system (black/yellow/cyan). The current static `index.html` content becomes React components pulling data from Firestore.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Firebase Auth, Firestore, Firebase Storage, Vercel

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, metadata, providers)
│   ├── page.tsx                      # Public homepage
│   ├── globals.css                   # Tailwind + design system CSS vars
│   ├── login/
│   │   └── page.tsx                  # Google sign-in page
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout (sidebar nav, role guard)
│   │   ├── page.tsx                  # Admin dashboard home
│   │   ├── events/
│   │   │   └── page.tsx              # Event CRUD
│   │   ├── invites/
│   │   │   └── page.tsx              # Invite management
│   │   └── users/
│   │       └── page.tsx              # User management
│   ├── portal/
│   │   ├── layout.tsx                # Artist portal layout (nav, role guard)
│   │   ├── page.tsx                  # Artist portal home
│   │   ├── profile/
│   │   │   └── page.tsx              # Edit artist profile
│   │   ├── sets/
│   │   │   └── page.tsx              # Manage setlists
│   │   └── card/
│   │       └── page.tsx              # Customize artist card
│   ├── artists/
│   │   └── [slug]/
│   │       └── page.tsx              # Public artist profile page
│   └── events/
│       └── [number]/
│           └── page.tsx              # Public event page
├── components/
│   ├── ui/                           # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── FileUpload.tsx
│   ├── layout/
│   │   ├── Header.tsx                # Public site header
│   │   ├── Footer.tsx                # Public site footer
│   │   ├── AdminSidebar.tsx          # Admin nav sidebar
│   │   └── PortalSidebar.tsx         # Artist portal nav sidebar
│   ├── home/                         # Homepage sections
│   │   ├── Hero.tsx
│   │   ├── Countdown.tsx
│   │   ├── VenueEmbed.tsx
│   │   ├── About.tsx
│   │   ├── HowToJoin.tsx
│   │   ├── UpcomingShows.tsx
│   │   ├── PastShows.tsx
│   │   ├── ArtistLineup.tsx
│   │   ├── Community.tsx
│   │   ├── ShareSection.tsx
│   │   └── FinalCTA.tsx
│   ├── admin/
│   │   ├── EventForm.tsx             # Create/edit event form
│   │   ├── EventList.tsx             # Event list with actions
│   │   ├── InviteForm.tsx            # Send invite form
│   │   ├── InviteList.tsx            # Invite list with status
│   │   └── UserList.tsx              # User list with role controls
│   ├── portal/
│   │   ├── ProfileForm.tsx           # Artist profile edit form
│   │   ├── SetlistEditor.tsx         # Setlist management
│   │   ├── CardCustomizer.tsx        # Card appearance editor
│   │   └── CardPreview.tsx           # Live preview of artist card
│   └── ArtistCard.tsx                # Shared artist card (used public + preview)
├── lib/
│   ├── firebase.ts                   # Firebase app init (client)
│   ├── firebase-admin.ts             # Firebase Admin SDK (server)
│   ├── auth.ts                       # Auth helpers (sign in, sign out, session)
│   ├── db.ts                         # Firestore helpers (CRUD for each collection)
│   ├── storage.ts                    # Firebase Storage upload helpers
│   └── types.ts                      # TypeScript types for all data models
├── hooks/
│   ├── useAuth.ts                    # Auth state hook
│   └── useFirestore.ts               # Generic Firestore query hook
├── context/
│   └── AuthContext.tsx               # Auth provider wrapping the app
├── middleware.ts                      # Route protection (admin, portal)
public/
├── images/                           # Existing images (moved from /images)
├── robots.txt
├── sitemap.xml
└── .well-known/
    └── farcaster.json
concertz.config.ts                    # Site config (branding, venue URLs, etc.)
```

---

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Move: `images/*` → `public/images/`, `.well-known/` → `public/.well-known/`, `robots.txt` → `public/robots.txt`, `sitemap.xml` → `public/sitemap.xml`
- Preserve: `index.html` (keep as reference, don't delete yet)

- [ ] **Step 1: Create Next.js project in a temp directory and move files**

```bash
cd /Users/zaalpanthaki/Documents/COCConcertZ
npx create-next-app@latest temp-next --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm
```

Select defaults when prompted.

- [ ] **Step 2: Move Next.js scaffolding into the project root**

```bash
# Move Next.js files into root (without overwriting existing files we want to keep)
cp temp-next/package.json .
cp temp-next/tsconfig.json .
cp temp-next/next.config.ts .
cp temp-next/tailwind.config.ts .
cp temp-next/postcss.config.mjs .
cp -r temp-next/src .
rm -rf temp-next
```

- [ ] **Step 3: Move static assets to public/**

```bash
mkdir -p public
mv images public/images
mv robots.txt public/robots.txt
mv sitemap.xml public/sitemap.xml
mv .well-known public/.well-known
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

- [ ] **Step 5: Create the design system in globals.css**

Replace `src/app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --yellow: #FFD600;
  --yellow-dim: rgba(255, 214, 0, 0.15);
  --cyan: #00F0FF;
  --cyan-dim: rgba(0, 240, 255, 0.1);
  --black: #050505;
  --card: #0a0a0a;
  --border: #1a1a1a;
  --text: #c8c8c8;
  --text-dim: #666;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  background: var(--black);
  color: #fff;
  overflow-x: hidden;
}

/* Grain overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.12'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
}

/* Scanlines */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
  z-index: 9998;
}

/* Halftone background */
.halftone-bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle, rgba(255,214,0,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
  z-index: 0;
}

/* Cyberpunk cut corner clip path */
.clip-corner {
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
}
```

- [ ] **Step 6: Create root layout with fonts**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "COC Concertz — Live Metaverse Concerts",
  description:
    "COC Concertz hosts free live concerts inside the metaverse. Experience immersive music from anywhere — no tickets, no lines, just vibes.",
  metadataBase: new URL("https://cocconcertz.com"),
  openGraph: {
    title: "COC Concertz — Live Metaverse Concerts",
    description:
      "Free live concerts inside the metaverse. Experience immersive music from anywhere — no tickets, no lines, just vibes.",
    url: "https://cocconcertz.com",
    siteName: "COC Concertz",
    images: [
      {
        url: "/images/coc4.jpg",
        width: 1500,
        height: 843,
        type: "image/jpeg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "COC Concertz — Live Metaverse Concerts",
    description:
      "Free live concerts inside the metaverse. No tickets, no lines, just vibes.",
    images: ["/images/coc4.jpg"],
  },
  icons: {
    icon: "/images/coc-concertz-logo.jpeg",
    apple: "/images/coc-concertz-logo.jpeg",
  },
  themeColor: "#FFD600",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${bebasNeue.variable} ${ibmPlexMono.variable} font-sans`}
        style={{ fontFamily: "'Satoshi', sans-serif" }}
      >
        <div className="halftone-bg" />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Create a placeholder homepage**

Replace `src/app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1
        className="text-6xl tracking-wider"
        style={{ fontFamily: "var(--font-display)", color: "var(--yellow)" }}
      >
        COC CONCERTZ
      </h1>
    </main>
  );
}
```

- [ ] **Step 8: Update vercel.json for Next.js**

Replace `vercel.json` with:

```json
{
  "framework": "nextjs",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: Dev server starts at `http://localhost:3000`, shows "COC CONCERTZ" in yellow on black background with grain overlay.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js project with design system"
```

---

### Task 2: Site Config and TypeScript Types

**Files:**
- Create: `concertz.config.ts`, `src/lib/types.ts`

- [ ] **Step 1: Create the site config**

Create `concertz.config.ts`:

```ts
export const config = {
  site: {
    name: "COC Concertz",
    tagline: "Virtual Stages. Real Music.",
    description:
      "COC Concertz hosts free live concerts inside the metaverse, giving fans a front-row experience from anywhere in the world.",
    url: "https://cocconcertz.com",
  },
  venue: {
    spatialUrl:
      "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349",
    spatialEmbedUrl:
      "https://www.spatial.io/embed/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349",
    twitchChannel: "bettercallzaal",
  },
  communities: [
    {
      name: "The ZAO",
      url: "https://thezao.com",
      logo: "/images/zao-logo.png",
    },
    {
      name: "Community of Communities",
      url: "https://communityofcommunities.xyz/",
      logo: "/images/coc-logo-circle.jpeg",
    },
  ],
  social: {
    farcasterChannel: "cocconcertz",
    youtube:
      "https://www.youtube.com/watch?v=-ggYAdu4KRE&list=PLAJfhSekeHMLPEd-PjFnuU_UZmXFR5kvA",
  },
  branding: {
    colors: {
      yellow: "#FFD600",
      cyan: "#00F0FF",
      black: "#050505",
      card: "#0a0a0a",
      border: "#1a1a1a",
    },
  },
} as const;
```

- [ ] **Step 2: Create TypeScript types**

Create `src/lib/types.ts`:

```ts
export type UserRole = "admin" | "artist" | "fan";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  walletAddress?: string;
  invitedBy?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface Event {
  id: string;
  name: string;
  number: number;
  date: Date;
  venue: {
    spatialLink: string;
    streamLink?: string;
  };
  rsvpLink: string;
  status: "upcoming" | "live" | "completed";
  flyerUrl?: string;
  bannerUrl?: string;
  description: string;
  announcement?: string;
  artists: EventArtist[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EventArtist {
  artistId: string;
  order: number;
  setTime?: string;
}

export interface Artist {
  id: string;
  userId: string;
  stageName: string;
  slug: string;
  bio: string;
  profilePhoto?: string;
  socialLinks: {
    twitter?: string;
    farcaster?: string;
    audius?: string;
    spotify?: string;
    youtube?: string;
    website?: string;
  };
  cardCustomization: {
    primaryColor?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    featuredMedia?: string;
  };
  linkedEvents: string[];
  walletAddress?: string;
  createdAt: Date;
}

export interface SetItem {
  id: string;
  artistId: string;
  eventId: string;
  songs: Song[];
  videos: Video[];
  notes?: string;
  order: number;
}

export interface Song {
  title: string;
  platform: "youtube" | "audius" | "spotify" | "soundcloud" | "other";
  url: string;
  videoId?: string;
}

export interface Video {
  title: string;
  url: string;
  platform: "youtube" | "twitch" | "other";
}

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  status: "pending" | "accepted" | "revoked";
  createdAt: Date;
  acceptedAt?: Date;
}
```

- [ ] **Step 3: Commit**

```bash
git add concertz.config.ts src/lib/types.ts
git commit -m "feat: add site config and TypeScript types"
```

---

### Task 3: Firebase Setup

**Files:**
- Create: `src/lib/firebase.ts`, `src/lib/firebase-admin.ts`, `.env.local.example`
- Modify: `package.json` (add firebase deps)

- [ ] **Step 1: Install Firebase dependencies**

```bash
npm install firebase firebase-admin
```

- [ ] **Step 2: Create .env.local.example**

Create `.env.local.example`:

```
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

- [ ] **Step 3: Create Firebase client initialization**

Create `src/lib/firebase.ts`:

```ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

- [ ] **Step 4: Create Firebase Admin initialization**

Create `src/lib/firebase-admin.ts`:

```ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
```

- [ ] **Step 5: Add .env.local to .gitignore**

Append to `.gitignore`:

```
.env.local
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/firebase.ts src/lib/firebase-admin.ts .env.local.example .gitignore
git commit -m "feat: add Firebase client and admin SDK setup"
```

---

### Task 4: Auth Context and Google Sign-In

**Files:**
- Create: `src/context/AuthContext.tsx`, `src/hooks/useAuth.ts`, `src/lib/auth.ts`, `src/app/login/page.tsx`

- [ ] **Step 1: Create auth helpers**

Create `src/lib/auth.ts`:

```ts
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { User, UserRole } from "./types";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;

  // Check if user exists in Firestore
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // Update last login
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    return userSnap.data() as User;
  }

  // Check if this email has a pending invite
  const { getDocs, collection, query, where } = await import(
    "firebase/firestore"
  );
  const inviteQuery = query(
    collection(db, "invites"),
    where("email", "==", firebaseUser.email),
    where("status", "==", "pending")
  );
  const inviteSnap = await getDocs(inviteQuery);

  let role: UserRole = "fan";
  if (!inviteSnap.empty) {
    const invite = inviteSnap.docs[0];
    role = invite.data().role as UserRole;
    // Mark invite as accepted
    await setDoc(
      doc(db, "invites", invite.id),
      { status: "accepted", acceptedAt: serverTimestamp() },
      { merge: true }
    );
  }

  // Create new user
  const newUser: Omit<User, "createdAt" | "lastLogin"> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    lastLogin: ReturnType<typeof serverTimestamp>;
  } = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || "Anonymous",
    photoURL: firebaseUser.photoURL,
    role,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  };

  await setDoc(userRef, newUser);
  return { ...newUser, createdAt: new Date(), lastLogin: new Date() } as User;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function getCurrentUser(): Promise<User | null> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;

  return { uid: firebaseUser.uid, ...userSnap.data() } as User;
}
```

- [ ] **Step 2: Create Auth context provider**

Create `src/context/AuthContext.tsx`:

```tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser(uid: string) {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      setUser({ uid, ...userSnap.data() } as User);
    } else {
      setUser(null);
    }
  }

  async function refreshUser() {
    if (auth.currentUser) {
      await fetchUser(auth.currentUser.uid);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUser(firebaseUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

- [ ] **Step 3: Wrap app in AuthProvider**

Update `src/app/layout.tsx` — add the AuthProvider wrapper around `{children}`:

```tsx
// Add import at top:
import { AuthProvider } from "@/context/AuthContext";

// Wrap children in the body:
<body ...>
  <div className="halftone-bg" />
  <AuthProvider>
    {children}
  </AuthProvider>
</body>
```

- [ ] **Step 4: Create login page**

Create `src/app/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    if (user.role === "admin") router.push("/admin");
    else if (user.role === "artist") router.push("/portal");
    else router.push("/");
    return null;
  }

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (!user) {
        setError("Sign-in failed. Please try again.");
        return;
      }
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "artist") router.push("/portal");
      else router.push("/");
    } catch (err) {
      setError("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div
        className="max-w-sm w-full p-8 clip-corner"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <h1
          className="text-4xl tracking-wider text-center mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--yellow)" }}
        >
          COC CONCERTZ
        </h1>
        <p
          className="text-center text-sm mb-8"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
        >
          Sign in to continue
        </p>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full py-3 px-6 text-sm font-bold tracking-widest uppercase transition-all clip-corner"
          style={{
            fontFamily: "var(--font-mono)",
            background: loading ? "var(--border)" : "var(--yellow)",
            color: "var(--black)",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "SIGNING IN..." : "SIGN IN WITH GOOGLE"}
        </button>

        {error && (
          <p className="text-red-400 text-xs text-center mt-4">{error}</p>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verify login page renders**

```bash
npm run dev
```

Navigate to `http://localhost:3000/login`. Expected: cyberpunk-styled login card with Google sign-in button.

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/context/AuthContext.tsx src/app/login/ src/app/layout.tsx
git commit -m "feat: add Firebase auth with Google sign-in and role-based routing"
```

---

### Task 5: Route Protection Middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create middleware for route protection**

Create `src/middleware.ts`:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Client-side route protection is handled by the layout components.
// This middleware handles redirecting unauthenticated users from
// protected routes when they don't have a Firebase session cookie.
// For now, we rely on client-side guards in the admin/portal layouts
// since Firebase Auth is client-side by default.

export function middleware(request: NextRequest) {
  // Allow all routes — auth is handled client-side via AuthContext
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add route protection middleware stub"
```

---

### Task 6: Firestore CRUD Helpers

**Files:**
- Create: `src/lib/db.ts`, `src/lib/storage.ts`

- [ ] **Step 1: Create Firestore CRUD helpers**

Create `src/lib/db.ts`:

```ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Event, Artist, SetItem, Invite, User } from "./types";

// ---- Events ----

export async function getEvents(): Promise<Event[]> {
  const snap = await getDocs(
    query(collection(db, "events"), orderBy("number", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Event);
}

export async function getEvent(id: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, "events", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Event) : null;
}

export async function getEventByNumber(num: number): Promise<Event | null> {
  const snap = await getDocs(
    query(collection(db, "events"), where("number", "==", num))
  );
  return snap.empty
    ? null
    : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Event);
}

export async function createEvent(
  data: Omit<Event, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = doc(collection(db, "events"));
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(
  id: string,
  data: Partial<Event>
): Promise<void> {
  await updateDoc(doc(db, "events", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, "events", id));
}

// ---- Artists ----

export async function getArtists(): Promise<Artist[]> {
  const snap = await getDocs(
    query(collection(db, "artists"), orderBy("stageName"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Artist);
}

export async function getArtist(id: string): Promise<Artist | null> {
  const snap = await getDoc(doc(db, "artists", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Artist) : null;
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const snap = await getDocs(
    query(collection(db, "artists"), where("slug", "==", slug))
  );
  return snap.empty
    ? null
    : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Artist);
}

export async function getArtistByUserId(
  userId: string
): Promise<Artist | null> {
  const snap = await getDocs(
    query(collection(db, "artists"), where("userId", "==", userId))
  );
  return snap.empty
    ? null
    : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Artist);
}

export async function createArtist(
  data: Omit<Artist, "id" | "createdAt">
): Promise<string> {
  const ref = doc(collection(db, "artists"));
  await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateArtist(
  id: string,
  data: Partial<Artist>
): Promise<void> {
  await updateDoc(doc(db, "artists", id), data);
}

// ---- Sets ----

export async function getSetsForEvent(eventId: string): Promise<SetItem[]> {
  const snap = await getDocs(
    query(
      collection(db, "sets"),
      where("eventId", "==", eventId),
      orderBy("order")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SetItem);
}

export async function getSetsForArtist(artistId: string): Promise<SetItem[]> {
  const snap = await getDocs(
    query(collection(db, "sets"), where("artistId", "==", artistId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SetItem);
}

export async function createSet(
  data: Omit<SetItem, "id">
): Promise<string> {
  const ref = doc(collection(db, "sets"));
  await setDoc(ref, data);
  return ref.id;
}

export async function updateSet(
  id: string,
  data: Partial<SetItem>
): Promise<void> {
  await updateDoc(doc(db, "sets", id), data);
}

export async function deleteSet(id: string): Promise<void> {
  await deleteDoc(doc(db, "sets", id));
}

// ---- Invites ----

export async function getInvites(): Promise<Invite[]> {
  const snap = await getDocs(
    query(collection(db, "invites"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Invite);
}

export async function createInvite(
  data: Omit<Invite, "id" | "createdAt">
): Promise<string> {
  const ref = doc(collection(db, "invites"));
  await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateInvite(
  id: string,
  data: Partial<Invite>
): Promise<void> {
  await updateDoc(doc(db, "invites", id), data);
}

// ---- Users ----

export async function getUsers(): Promise<User[]> {
  const snap = await getDocs(
    query(collection(db, "users"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as User);
}

export async function updateUserRole(
  uid: string,
  role: User["role"]
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role });
}
```

- [ ] **Step 2: Create Firebase Storage upload helpers**

Create `src/lib/storage.ts`:

```ts
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

export async function uploadFile(
  path: string,
  file: File
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export function getStoragePath(
  type: "events" | "artists" | "sets",
  id: string,
  filename: string
): string {
  return `${type}/${id}/${filename}`;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts src/lib/storage.ts
git commit -m "feat: add Firestore CRUD helpers and Firebase Storage uploads"
```

---

### Task 7: UI Primitives

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/Modal.tsx`, `src/components/ui/FileUpload.tsx`

- [ ] **Step 1: Create Button component**

Create `src/components/ui/Button.tsx`:

```tsx
"use client";

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: {
    background: "var(--yellow)",
    color: "var(--black)",
    border: "none",
  },
  outline: {
    background: "transparent",
    color: "var(--yellow)",
    border: "1px solid var(--yellow)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text)",
    border: "1px solid var(--border)",
  },
};

const sizes = {
  sm: "py-1.5 px-4 text-xs",
  md: "py-2.5 px-6 text-sm",
  lg: "py-3 px-8 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`font-bold tracking-widest uppercase clip-corner transition-opacity ${sizes[size]} ${className}`}
      style={{
        fontFamily: "var(--font-mono)",
        ...variants[variant],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      disabled={disabled}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Create Input component**

Create `src/components/ui/Input.tsx`:

```tsx
"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="block mb-4">
      <span
        className="block text-xs uppercase tracking-widest mb-1.5"
        style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
      >
        {label}
      </span>
      <input
        className={`w-full px-3 py-2 text-sm outline-none transition-colors ${className}`}
        style={{
          fontFamily: "var(--font-mono)",
          background: "var(--black)",
          border: "1px solid var(--border)",
          color: "#fff",
        }}
        {...props}
      />
    </label>
  );
}

export function Textarea({
  label,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <label className="block mb-4">
      <span
        className="block text-xs uppercase tracking-widest mb-1.5"
        style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
      >
        {label}
      </span>
      <textarea
        className={`w-full px-3 py-2 text-sm outline-none resize-y min-h-[80px] ${className}`}
        style={{
          fontFamily: "var(--font-mono)",
          background: "var(--black)",
          border: "1px solid var(--border)",
          color: "#fff",
        }}
        {...props}
      />
    </label>
  );
}
```

- [ ] **Step 3: Create Card component**

Create `src/components/ui/Card.tsx`:

```tsx
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export default function Card({
  hoverable = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`clip-corner p-6 transition-all ${
        hoverable ? "hover:border-[var(--yellow)]" : ""
      } ${className}`}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create Badge component**

Create `src/components/ui/Badge.tsx`:

```tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "live" | "completed" | "upcoming";
}

const badgeColors = {
  default: { bg: "var(--yellow-dim)", color: "var(--yellow)" },
  live: { bg: "rgba(255, 0, 0, 0.15)", color: "#ff4444" },
  completed: { bg: "rgba(255, 255, 255, 0.05)", color: "var(--text-dim)" },
  upcoming: { bg: "var(--cyan-dim)", color: "var(--cyan)" },
};

export default function Badge({ children, variant = "default" }: BadgeProps) {
  const colors = badgeColors[variant];
  return (
    <span
      className="inline-block px-3 py-1 text-xs uppercase tracking-widest"
      style={{
        fontFamily: "var(--font-mono)",
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.color}`,
      }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Create Modal component**

Create `src/components/ui/Modal.tsx`:

```tsx
"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80" />
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto clip-corner p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl tracking-wider"
            style={{ fontFamily: "var(--font-display)", color: "var(--yellow)" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none"
            style={{ color: "var(--text-dim)" }}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create FileUpload component**

Create `src/components/ui/FileUpload.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";

interface FileUploadProps {
  label: string;
  accept?: string;
  onUpload: (file: File) => Promise<void>;
  currentUrl?: string;
}

export default function FileUpload({
  label,
  accept = "image/*",
  onUpload,
  currentUrl,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-4">
      <span
        className="block text-xs uppercase tracking-widest mb-1.5"
        style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
      >
        {label}
      </span>
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full max-w-xs h-auto mb-2 clip-corner"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="py-2 px-4 text-xs uppercase tracking-widest clip-corner"
        style={{
          fontFamily: "var(--font-mono)",
          background: "transparent",
          border: "1px solid var(--border)",
          color: uploading ? "var(--text-dim)" : "var(--text)",
          cursor: uploading ? "not-allowed" : "pointer",
        }}
      >
        {uploading ? "UPLOADING..." : preview ? "CHANGE FILE" : "CHOOSE FILE"}
      </button>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add UI primitives (Button, Input, Card, Badge, Modal, FileUpload)"
```

---

### Task 8: Admin Layout and Dashboard

**Files:**
- Create: `src/components/layout/AdminSidebar.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`

- [ ] **Step 1: Create AdminSidebar**

Create `src/components/layout/AdminSidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/invites", label: "Invites" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside
      className="w-56 min-h-screen p-4 flex flex-col"
      style={{
        background: "var(--card)",
        borderRight: "1px solid var(--border)",
      }}
    >
      <Link href="/" className="block mb-8">
        <h1
          className="text-xl tracking-wider"
          style={{ fontFamily: "var(--font-display)", color: "var(--yellow)" }}
        >
          COC CONCERTZ
        </h1>
        <span
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
        >
          Admin
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2 px-3 text-sm tracking-wider transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                color: active ? "var(--yellow)" : "var(--text)",
                background: active ? "var(--yellow-dim)" : "transparent",
                borderLeft: active
                  ? "2px solid var(--yellow)"
                  : "2px solid transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <p
          className="text-xs mb-2 truncate"
          style={{ color: "var(--text-dim)" }}
        >
          {user?.email}
        </p>
        <button
          onClick={() => signOut()}
          className="text-xs uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--text-dim)",
            cursor: "pointer",
            background: "none",
            border: "none",
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create admin layout with role guard**

Create `src/app/admin/layout.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (user.role !== "admin") {
    router.push("/");
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create admin dashboard page**

Create `src/app/admin/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { getEvents, getArtists, getUsers, getInvites } from "@/lib/db";
import type { Event, Artist, User, Invite } from "@/lib/types";

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);

  useEffect(() => {
    Promise.all([getEvents(), getArtists(), getUsers(), getInvites()]).then(
      ([e, a, u, i]) => {
        setEvents(e);
        setArtists(a);
        setUsers(u);
        setInvites(i);
      }
    );
  }, []);

  const upcoming = events.filter((e) => e.status === "upcoming");
  const pendingInvites = invites.filter((i) => i.status === "pending");

  return (
    <div>
      <h1
        className="text-4xl tracking-wider mb-8"
        style={{ fontFamily: "var(--font-display)", color: "var(--yellow)" }}
      >
        DASHBOARD
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Events</p>
          <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{events.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Artists</p>
          <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{artists.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Users</p>
          <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{users.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Pending Invites</p>
          <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{pendingInvites.length}</p>
        </Card>
      </div>

      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl tracking-wider mb-4" style={{ fontFamily: "var(--font-display)" }}>
            UPCOMING SHOWS
          </h2>
          {upcoming.map((event) => (
            <Card key={event.id} className="mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="upcoming">Upcoming</Badge>
                  <p className="text-lg mt-2" style={{ fontFamily: "var(--font-display)" }}>
                    {event.name}
                  </p>
                  <p className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                    {event.artists.length} artists
                  </p>
                </div>
                <Link
                  href="/admin/events"
                  className="text-xs uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}
                >
                  Manage →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/AdminSidebar.tsx src/app/admin/
git commit -m "feat: add admin layout, sidebar, and dashboard page"
```

---

### Task 9: Admin — Event Management

**Files:**
- Create: `src/app/admin/events/page.tsx`, `src/components/admin/EventForm.tsx`, `src/components/admin/EventList.tsx`

- [ ] **Step 1: Create EventForm component**

Create `src/components/admin/EventForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import FileUpload from "@/components/ui/FileUpload";
import { createEvent, updateEvent } from "@/lib/db";
import { uploadFile, getStoragePath } from "@/lib/storage";
import type { Event } from "@/lib/types";

interface EventFormProps {
  event?: Event;
  onSaved: () => void;
  onCancel: () => void;
}

export default function EventForm({ event, onSaved, onCancel }: EventFormProps) {
  const [name, setName] = useState(event?.name || "");
  const [number, setNumber] = useState(event?.number?.toString() || "");
  const [date, setDate] = useState(
    event?.date
      ? new Date(event.date as unknown as string).toISOString().slice(0, 16)
      : ""
  );
  const [description, setDescription] = useState(event?.description || "");
  const [rsvpLink, setRsvpLink] = useState(event?.rsvpLink || "");
  const [spatialLink, setSpatialLink] = useState(event?.venue?.spatialLink || "");
  const [streamLink, setStreamLink] = useState(event?.venue?.streamLink || "");
  const [status, setStatus] = useState<Event["status"]>(event?.status || "upcoming");
  const [flyerUrl, setFlyerUrl] = useState(event?.flyerUrl || "");
  const [bannerUrl, setBannerUrl] = useState(event?.bannerUrl || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name,
        number: parseInt(number),
        date: new Date(date),
        description,
        rsvpLink,
        venue: { spatialLink, streamLink },
        status,
        flyerUrl,
        bannerUrl,
        artists: event?.artists || [],
      };

      if (event) {
        await updateEvent(event.id, data);
      } else {
        await createEvent(data);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleFlyerUpload(file: File) {
    const id = event?.id || "new-" + Date.now();
    const url = await uploadFile(
      getStoragePath("events", id, "flyer-" + file.name),
      file
    );
    setFlyerUrl(url);
  }

  async function handleBannerUpload(file: File) {
    const id = event?.id || "new-" + Date.now();
    const url = await uploadFile(
      getStoragePath("events", id, "banner-" + file.name),
      file
    );
    setBannerUrl(url);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Event Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Number" type="number" value={number} onChange={(e) => setNumber(e.target.value)} required />
      <Input label="Date & Time" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
      <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="RSVP Link" value={rsvpLink} onChange={(e) => setRsvpLink(e.target.value)} />
      <Input label="Spatial Link" value={spatialLink} onChange={(e) => setSpatialLink(e.target.value)} />
      <Input label="Stream Link" value={streamLink} onChange={(e) => setStreamLink(e.target.value)} />

      <label className="block mb-4">
        <span className="block text-xs uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
          Status
        </span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Event["status"])}
          className="w-full px-3 py-2 text-sm outline-none"
          style={{ fontFamily: "var(--font-mono)", background: "var(--black)", border: "1px solid var(--border)", color: "#fff" }}
        >
          <option value="upcoming">Upcoming</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
        </select>
      </label>

      <FileUpload label="Flyer Image" onUpload={handleFlyerUpload} currentUrl={flyerUrl} />
      <FileUpload label="Banner Image" onUpload={handleBannerUpload} currentUrl={bannerUrl} />

      <div className="flex gap-3 mt-6">
        <Button type="submit" disabled={saving}>
          {saving ? "SAVING..." : event ? "UPDATE EVENT" : "CREATE EVENT"}
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel}>
          CANCEL
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create EventList component**

Create `src/components/admin/EventList.tsx`:

```tsx
"use client";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { deleteEvent } from "@/lib/db";
import type { Event } from "@/lib/types";

interface EventListProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onRefresh: () => void;
}

const statusVariant = {
  upcoming: "upcoming" as const,
  live: "live" as const,
  completed: "completed" as const,
};

export default function EventList({ events, onEdit, onRefresh }: EventListProps) {
  async function handleDelete(event: Event) {
    if (!confirm(`Delete "${event.name}"? This cannot be undone.`)) return;
    await deleteEvent(event.id);
    onRefresh();
  }

  if (events.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
        No events yet. Create your first show.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id}>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant={statusVariant[event.status]}>{event.status}</Badge>
              <h3 className="text-lg mt-2" style={{ fontFamily: "var(--font-display)" }}>
                {event.name}
              </h3>
              <p className="text-xs mt-1" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                {event.description}
              </p>
              <p className="text-xs mt-1" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                {event.artists.length} artist{event.artists.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(event)}>
                EDIT
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(event)}>
                DELETE
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create events page**

Create `src/app/admin/events/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EventForm from "@/components/admin/EventForm";
import EventList from "@/components/admin/EventList";
import { getEvents } from "@/lib/db";
import type { Event } from "@/lib/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();

  async function loadEvents() {
    setEvents(await getEvents());
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function handleEdit(event: Event) {
    setEditingEvent(event);
    setShowForm(true);
  }

  function handleSaved() {
    setShowForm(false);
    setEditingEvent(undefined);
    loadEvents();
  }

  function handleCancel() {
    setShowForm(false);
    setEditingEvent(undefined);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl tracking-wider" style={{ fontFamily: "var(--font-display)", color: "var(--yellow)" }}>
          EVENTS
        </h1>
        <Button onClick={() => setShowForm(true)}>+ NEW EVENT</Button>
      </div>

      <EventList events={events} onEdit={handleEdit} onRefresh={loadEvents} />

      <Modal
        open={showForm}
        onClose={handleCancel}
        title={editingEvent ? "EDIT EVENT" : "NEW EVENT"}
      >
        <EventForm event={editingEvent} onSaved={handleSaved} onCancel={handleCancel} />
      </Modal>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/events/ src/components/admin/EventForm.tsx src/components/admin/EventList.tsx
git commit -m "feat: add admin event management (CRUD with image uploads)"
```

---

### Task 10: Admin — Invite System

**Files:**
- Create: `src/app/admin/invites/page.tsx`, `src/components/admin/InviteForm.tsx`, `src/components/admin/InviteList.tsx`

- [ ] **Step 1: Create InviteForm component**

Create `src/components/admin/InviteForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createInvite } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";

interface InviteFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

export default function InviteForm({ onSaved, onCancel }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("artist");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createInvite({
        email: email.toLowerCase().trim(),
        role,
        invitedBy: user!.uid,
        status: "pending",
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label className="block mb-4">
        <span className="block text-xs uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
          Role
        </span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full px-3 py-2 text-sm outline-none"
          style={{ fontFamily: "var(--font-mono)", background: "var(--black)", border: "1px solid var(--border)", color: "#fff" }}
        >
          <option value="artist">Artist</option>
          <option value="admin">Admin</option>
          <option value="fan">Fan</option>
        </select>
      </label>

      <div className="flex gap-3 mt-6">
        <Button type="submit" disabled={saving}>
          {saving ? "SENDING..." : "SEND INVITE"}
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel}>
          CANCEL
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create InviteList component**

Create `src/components/admin/InviteList.tsx`:

```tsx
"use client";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { updateInvite } from "@/lib/db";
import type { Invite } from "@/lib/types";

interface InviteListProps {
  invites: Invite[];
  onRefresh: () => void;
}

export default function InviteList({ invites, onRefresh }: InviteListProps) {
  async function handleRevoke(invite: Invite) {
    await updateInvite(invite.id, { status: "revoked" });
    onRefresh();
  }

  if (invites.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
        No invites sent yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {invites.map((invite) => (
        <Card key={invite.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{invite.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={invite.status === "accepted" ? "completed" : invite.status === "pending" ? "upcoming" : "default"}>
                  {invite.status}
                </Badge>
                <span className="text-xs uppercase" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                  {invite.role}
                </span>
              </div>
            </div>
            {invite.status === "pending" && (
              <Button size="sm" variant="ghost" onClick={() => handleRevoke(invite)}>
                REVOKE
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create invites page**

Create `src/app/admin/invites/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import InviteForm from "@/components/admin/InviteForm";
import InviteList from "@/components/admin/InviteList";
import { getInvites } from "@/lib/db";
import type { Invite } from "@/lib/types";

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function loadInvites() {
    setInvites(await getInvites());
  }

  useEffect(() => {
    loadInvites();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl tracking-wider" style={{ fontFamily: "var(--font-display)", color: "var(--yellow)" }}>
          INVITES
        </h1>
        <Button onClick={() => setShowForm(true)}>+ SEND INVITE</Button>
      </div>

      <InviteList invites={invites} onRefresh={loadInvites} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="SEND INVITE">
        <InviteForm
          onSaved={() => { setShowForm(false); loadInvites(); }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/invites/ src/components/admin/InviteForm.tsx src/components/admin/InviteList.tsx
git commit -m "feat: add admin invite system with role assignment"
```

---

### Task 11: Admin — User Management

**Files:**
- Create: `src/app/admin/users/page.tsx`, `src/components/admin/UserList.tsx`

- [ ] **Step 1: Create UserList component**

Create `src/components/admin/UserList.tsx`:

```tsx
"use client";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { updateUserRole } from "@/lib/db";
import type { User, UserRole } from "@/lib/types";

interface UserListProps {
  users: User[];
  currentUserId: string;
  onRefresh: () => void;
}

export default function UserList({ users, currentUserId, onRefresh }: UserListProps) {
  async function handleRoleChange(uid: string, role: UserRole) {
    await updateUserRole(uid, role);
    onRefresh();
  }

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <Card key={u.uid}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {u.photoURL && (
                <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full" />
              )}
              <div>
                <p className="text-sm font-medium">{u.displayName}</p>
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {u.uid === currentUserId ? (
                <Badge>You</Badge>
              ) : (
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                  className="px-2 py-1 text-xs outline-none"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "var(--black)",
                    border: "1px solid var(--border)",
                    color: "#fff",
                  }}
                >
                  <option value="fan">Fan</option>
                  <option value="artist">Artist</option>
                  <option value="admin">Admin</option>
                </select>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create users page**

Create `src/app/admin/users/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import UserList from "@/components/admin/UserList";
import { getUsers } from "@/lib/db";
import type { User } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();

  async function loadUsers() {
    setUsers(await getUsers());
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <h1 className="text-4xl tracking-wider mb-8" style={{ fontFamily: "var(--font-display)", color: "var(--yellow)" }}>
        USERS
      </h1>
      <UserList users={users} currentUserId={user?.uid || ""} onRefresh={loadUsers} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/users/ src/components/admin/UserList.tsx
git commit -m "feat: add admin user management with role switching"
```

---

### Task 12: Artist Portal Layout and Dashboard

**Files:**
- Create: `src/components/layout/PortalSidebar.tsx`, `src/app/portal/layout.tsx`, `src/app/portal/page.tsx`

- [ ] **Step 1: Create PortalSidebar**

Create `src/components/layout/PortalSidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/portal", label: "Home" },
  { href: "/portal/profile", label: "Profile" },
  { href: "/portal/sets", label: "Setlists" },
  { href: "/portal/card", label: "Card Design" },
];

export default function PortalSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside
      className="w-56 min-h-screen p-4 flex flex-col"
      style={{
        background: "var(--card)",
        borderRight: "1px solid var(--border)",
      }}
    >
      <Link href="/" className="block mb-8">
        <h1
          className="text-xl tracking-wider"
          style={{ fontFamily: "var(--font-display)", color: "var(--cyan)" }}
        >
          COC CONCERTZ
        </h1>
        <span
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
        >
          Artist Portal
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2 px-3 text-sm tracking-wider transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                color: active ? "var(--cyan)" : "var(--text)",
                background: active ? "var(--cyan-dim)" : "transparent",
                borderLeft: active
                  ? "2px solid var(--cyan)"
                  : "2px solid transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs mb-2 truncate" style={{ color: "var(--text-dim)" }}>
          {user?.displayName}
        </p>
        <button
          onClick={() => signOut()}
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)", cursor: "pointer", background: "none", border: "none" }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create portal layout with role guard**

Create `src/app/portal/layout.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PortalSidebar from "@/components/layout/PortalSidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (user.role !== "artist" && user.role !== "admin") {
    router.push("/");
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <PortalSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create portal dashboard**

Create `src/app/portal/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { getArtistByUserId, getEvents } from "@/lib/db";
import type { Artist, Event } from "@/lib/types";

export default function PortalDashboard() {
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getArtistByUserId(user.uid), getEvents()]).then(
      ([a, e]) => {
        setArtist(a);
        setEvents(e);
        setLoading(false);
      }
    );
  }, [user]);

  if (loading) {
    return <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Loading...</p>;
  }

  const myEvents = artist
    ? events.filter((e) => e.artists.some((a) => a.artistId === artist.id))
    : [];

  return (
    <div>
      <h1 className="text-4xl tracking-wider mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--cyan)" }}>
        {artist ? `WELCOME, ${artist.stageName.toUpperCase()}` : "ARTIST PORTAL"}
      </h1>
      <p className="text-sm mb-8" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
        Manage your profile, setlists, and artist card.
      </p>

      {!artist && (
        <Card className="mb-8">
          <p className="text-sm mb-3">You don&apos;t have an artist profile yet.</p>
          <Link
            href="/portal/profile"
            className="text-xs uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}
          >
            Create Profile →
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/portal/profile">
          <Card hoverable>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Profile</p>
            <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>Edit Bio & Links</p>
          </Card>
        </Link>
        <Link href="/portal/sets">
          <Card hoverable>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Setlists</p>
            <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>Manage Songs & Videos</p>
          </Card>
        </Link>
        <Link href="/portal/card">
          <Card hoverable>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Card Design</p>
            <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>Customize Your Look</p>
          </Card>
        </Link>
      </div>

      {myEvents.length > 0 && (
        <div>
          <h2 className="text-xl tracking-wider mb-4" style={{ fontFamily: "var(--font-display)" }}>YOUR SHOWS</h2>
          {myEvents.map((event) => (
            <Card key={event.id} className="mb-3">
              <Badge variant={event.status === "upcoming" ? "upcoming" : event.status === "live" ? "live" : "completed"}>
                {event.status}
              </Badge>
              <p className="text-lg mt-2" style={{ fontFamily: "var(--font-display)" }}>{event.name}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/PortalSidebar.tsx src/app/portal/
git commit -m "feat: add artist portal layout, sidebar, and dashboard"
```

---

### Task 13: Artist Portal — Profile Editor

**Files:**
- Create: `src/app/portal/profile/page.tsx`, `src/components/portal/ProfileForm.tsx`

- [ ] **Step 1: Create ProfileForm component**

Create `src/components/portal/ProfileForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import FileUpload from "@/components/ui/FileUpload";
import { createArtist, updateArtist } from "@/lib/db";
import { uploadFile, getStoragePath } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import type { Artist } from "@/lib/types";

interface ProfileFormProps {
  artist: Artist | null;
  onSaved: () => void;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProfileForm({ artist, onSaved }: ProfileFormProps) {
  const { user } = useAuth();
  const [stageName, setStageName] = useState(artist?.stageName || "");
  const [bio, setBio] = useState(artist?.bio || "");
  const [profilePhoto, setProfilePhoto] = useState(artist?.profilePhoto || "");
  const [twitter, setTwitter] = useState(artist?.socialLinks?.twitter || "");
  const [farcaster, setFarcaster] = useState(artist?.socialLinks?.farcaster || "");
  const [audius, setAudius] = useState(artist?.socialLinks?.audius || "");
  const [spotify, setSpotify] = useState(artist?.socialLinks?.spotify || "");
  const [youtube, setYoutube] = useState(artist?.socialLinks?.youtube || "");
  const [website, setWebsite] = useState(artist?.socialLinks?.website || "");
  const [walletAddress, setWalletAddress] = useState(artist?.walletAddress || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const data = {
        userId: user.uid,
        stageName,
        slug: slugify(stageName),
        bio,
        profilePhoto,
        socialLinks: { twitter, farcaster, audius, spotify, youtube, website },
        cardCustomization: artist?.cardCustomization || {},
        linkedEvents: artist?.linkedEvents || [],
        walletAddress: walletAddress || undefined,
      };

      if (artist) {
        await updateArtist(artist.id, data);
      } else {
        await createArtist(data);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(file: File) {
    const id = artist?.id || user!.uid;
    const url = await uploadFile(
      getStoragePath("artists", id, "profile-" + file.name),
      file
    );
    setProfilePhoto(url);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg">
      <Input label="Stage Name" value={stageName} onChange={(e) => setStageName(e.target.value)} required />
      <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell fans about yourself..." />
      <FileUpload label="Profile Photo" onUpload={handlePhotoUpload} currentUrl={profilePhoto} />

      <h3 className="text-lg tracking-wider mt-8 mb-4" style={{ fontFamily: "var(--font-display)" }}>SOCIAL LINKS</h3>
      <Input label="Twitter / X" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/..." />
      <Input label="Farcaster" value={farcaster} onChange={(e) => setFarcaster(e.target.value)} placeholder="@username" />
      <Input label="Audius" value={audius} onChange={(e) => setAudius(e.target.value)} placeholder="https://audius.co/..." />
      <Input label="Spotify" value={spotify} onChange={(e) => setSpotify(e.target.value)} placeholder="https://open.spotify.com/..." />
      <Input label="YouTube" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/..." />
      <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />

      <h3 className="text-lg tracking-wider mt-8 mb-4" style={{ fontFamily: "var(--font-display)" }}>WALLET</h3>
      <Input label="ETH Wallet Address (for tips)" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="0x..." />

      <Button type="submit" disabled={saving} className="mt-6">
        {saving ? "SAVING..." : artist ? "UPDATE PROFILE" : "CREATE PROFILE"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Create profile page**

Create `src/app/portal/profile/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileForm from "@/components/portal/ProfileForm";
import { getArtistByUserId } from "@/lib/db";
import type { Artist } from "@/lib/types";

export default function PortalProfilePage() {
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadArtist() {
    if (!user) return;
    const a = await getArtistByUserId(user.uid);
    setArtist(a);
    setLoading(false);
  }

  useEffect(() => {
    loadArtist();
  }, [user]);

  if (loading) {
    return <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-4xl tracking-wider mb-8" style={{ fontFamily: "var(--font-display)", color: "var(--cyan)" }}>
        {artist ? "EDIT PROFILE" : "CREATE PROFILE"}
      </h1>
      <ProfileForm artist={artist} onSaved={loadArtist} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/portal/profile/ src/components/portal/ProfileForm.tsx
git commit -m "feat: add artist profile editor with photo upload and social links"
```

---

### Task 14: Artist Portal — Setlist Manager

**Files:**
- Create: `src/app/portal/sets/page.tsx`, `src/components/portal/SetlistEditor.tsx`

- [ ] **Step 1: Create SetlistEditor component**

Create `src/components/portal/SetlistEditor.tsx`:

```tsx
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { createSet, updateSet, deleteSet } from "@/lib/db";
import type { SetItem, Song, Video } from "@/lib/types";

interface SetlistEditorProps {
  set: SetItem | null;
  artistId: string;
  eventId: string;
  onSaved: () => void;
}

export default function SetlistEditor({
  set,
  artistId,
  eventId,
  onSaved,
}: SetlistEditorProps) {
  const [songs, setSongs] = useState<Song[]>(set?.songs || []);
  const [videos, setVideos] = useState<Video[]>(set?.videos || []);
  const [notes, setNotes] = useState(set?.notes || "");
  const [saving, setSaving] = useState(false);

  function addSong() {
    setSongs([...songs, { title: "", platform: "youtube", url: "" }]);
  }

  function updateSong(index: number, field: keyof Song, value: string) {
    const updated = [...songs];
    (updated[index] as Record<string, string>)[field] = value;
    setSongs(updated);
  }

  function removeSong(index: number) {
    setSongs(songs.filter((_, i) => i !== index));
  }

  function addVideo() {
    setVideos([...videos, { title: "", url: "", platform: "youtube" }]);
  }

  function updateVideo(index: number, field: keyof Video, value: string) {
    const updated = [...videos];
    (updated[index] as Record<string, string>)[field] = value;
    setVideos(updated);
  }

  function removeVideo(index: number) {
    setVideos(videos.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = {
        artistId,
        eventId,
        songs: songs.filter((s) => s.title),
        videos: videos.filter((v) => v.title),
        notes,
        order: set?.order || 0,
      };

      if (set) {
        await updateSet(set.id, data);
      } else {
        await createSet(data);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!set) return;
    if (!confirm("Delete this setlist?")) return;
    await deleteSet(set.id);
    onSaved();
  }

  return (
    <div>
      <h3 className="text-lg tracking-wider mb-4" style={{ fontFamily: "var(--font-display)" }}>
        SONGS
      </h3>
      {songs.map((song, i) => (
        <Card key={i} className="mb-3 p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input label="Title" value={song.title} onChange={(e) => updateSong(i, "title", e.target.value)} />
              <Input label="URL" value={song.url} onChange={(e) => updateSong(i, "url", e.target.value)} />
              <label className="block mb-4">
                <span className="block text-xs uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Platform</span>
                <select
                  value={song.platform}
                  onChange={(e) => updateSong(i, "platform", e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{ fontFamily: "var(--font-mono)", background: "var(--black)", border: "1px solid var(--border)", color: "#fff" }}
                >
                  <option value="youtube">YouTube</option>
                  <option value="audius">Audius</option>
                  <option value="spotify">Spotify</option>
                  <option value="soundcloud">SoundCloud</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            <Button size="sm" variant="ghost" onClick={() => removeSong(i)}>X</Button>
          </div>
        </Card>
      ))}
      <Button variant="outline" size="sm" onClick={addSong} className="mb-8">+ ADD SONG</Button>

      <h3 className="text-lg tracking-wider mb-4" style={{ fontFamily: "var(--font-display)" }}>
        VIDEOS
      </h3>
      {videos.map((video, i) => (
        <Card key={i} className="mb-3 p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input label="Title" value={video.title} onChange={(e) => updateVideo(i, "title", e.target.value)} />
              <Input label="URL" value={video.url} onChange={(e) => updateVideo(i, "url", e.target.value)} />
            </div>
            <Button size="sm" variant="ghost" onClick={() => removeVideo(i)}>X</Button>
          </div>
        </Card>
      ))}
      <Button variant="outline" size="sm" onClick={addVideo} className="mb-8">+ ADD VIDEO</Button>

      <div>
        <label className="block mb-4">
          <span className="block text-xs uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm outline-none resize-y min-h-[60px]"
            style={{ fontFamily: "var(--font-mono)", background: "var(--black)", border: "1px solid var(--border)", color: "#fff" }}
            placeholder="Any notes about this set..."
          />
        </label>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "SAVING..." : "SAVE SETLIST"}
        </Button>
        {set && <Button variant="ghost" onClick={handleDelete}>DELETE</Button>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create sets page**

Create `src/app/portal/sets/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SetlistEditor from "@/components/portal/SetlistEditor";
import { getArtistByUserId, getEvents, getSetsForArtist } from "@/lib/db";
import type { Artist, Event, SetItem } from "@/lib/types";

export default function PortalSetsPage() {
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [sets, setSets] = useState<SetItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!user) return;
    const a = await getArtistByUserId(user.uid);
    setArtist(a);
    const e = await getEvents();
    setEvents(e);
    if (a) {
      const s = await getSetsForArtist(a.id);
      setSets(s);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Loading...</p>;
  }

  if (!artist) {
    return (
      <div>
        <h1 className="text-4xl tracking-wider mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--cyan)" }}>SETLISTS</h1>
        <p style={{ color: "var(--text-dim)" }}>Create your artist profile first.</p>
      </div>
    );
  }

  const myEvents = events.filter((e) =>
    e.artists.some((a) => a.artistId === artist.id)
  );

  const selectedSet = selectedEventId
    ? sets.find((s) => s.eventId === selectedEventId) || null
    : null;

  return (
    <div>
      <h1 className="text-4xl tracking-wider mb-8" style={{ fontFamily: "var(--font-display)", color: "var(--cyan)" }}>
        SETLISTS
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {myEvents.map((event) => (
          <Card
            key={event.id}
            hoverable
            className={`cursor-pointer ${selectedEventId === event.id ? "!border-[var(--cyan)]" : ""}`}
            onClick={() => setSelectedEventId(event.id)}
          >
            <Badge variant={event.status === "upcoming" ? "upcoming" : "completed"}>
              {event.status}
            </Badge>
            <p className="text-lg mt-2" style={{ fontFamily: "var(--font-display)" }}>{event.name}</p>
          </Card>
        ))}
        {myEvents.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            You haven&apos;t been assigned to any events yet.
          </p>
        )}
      </div>

      {selectedEventId && (
        <SetlistEditor
          set={selectedSet}
          artistId={artist.id}
          eventId={selectedEventId}
          onSaved={loadData}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/portal/sets/ src/components/portal/SetlistEditor.tsx
git commit -m "feat: add artist setlist manager with songs and videos"
```

---

### Task 15: Artist Portal — Card Customizer

**Files:**
- Create: `src/app/portal/card/page.tsx`, `src/components/portal/CardCustomizer.tsx`, `src/components/portal/CardPreview.tsx`, `src/components/ArtistCard.tsx`

- [ ] **Step 1: Create shared ArtistCard component**

Create `src/components/ArtistCard.tsx`:

```tsx
import type { Artist } from "@/lib/types";

interface ArtistCardProps {
  artist: Artist;
  className?: string;
}

export default function ArtistCard({ artist, className = "" }: ArtistCardProps) {
  const { cardCustomization: card } = artist;
  const bg = card?.backgroundColor || "var(--card)";
  const accent = card?.primaryColor || "var(--yellow)";

  return (
    <div
      className={`clip-corner p-6 relative overflow-hidden ${className}`}
      style={{
        background: bg,
        border: `1px solid ${accent}33`,
      }}
    >
      {card?.backgroundImage && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${card.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div className="relative z-10">
        {artist.profilePhoto && (
          <img
            src={artist.profilePhoto}
            alt={artist.stageName}
            className="w-16 h-16 rounded-full mb-3 object-cover"
            style={{ border: `2px solid ${accent}` }}
          />
        )}
        <h3
          className="text-xl tracking-wider"
          style={{ fontFamily: "var(--font-display)", color: accent }}
        >
          {artist.stageName.toUpperCase()}
        </h3>
        {artist.bio && (
          <p className="text-sm mt-2 line-clamp-3" style={{ color: "var(--text)" }}>
            {artist.bio}
          </p>
        )}
        {Object.values(artist.socialLinks || {}).some(Boolean) && (
          <div className="flex gap-3 mt-3">
            {artist.socialLinks.twitter && (
              <a href={artist.socialLinks.twitter} target="_blank" rel="noopener" className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>X</a>
            )}
            {artist.socialLinks.farcaster && (
              <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>FC</span>
            )}
            {artist.socialLinks.spotify && (
              <a href={artist.socialLinks.spotify} target="_blank" rel="noopener" className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Spotify</a>
            )}
            {artist.socialLinks.audius && (
              <a href={artist.socialLinks.audius} target="_blank" rel="noopener" className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Audius</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CardCustomizer and CardPreview**

Create `src/components/portal/CardCustomizer.tsx`:

```tsx
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FileUpload from "@/components/ui/FileUpload";
import { updateArtist } from "@/lib/db";
import { uploadFile, getStoragePath } from "@/lib/storage";
import type { Artist } from "@/lib/types";

interface CardCustomizerProps {
  artist: Artist;
  onSaved: () => void;
}

export default function CardCustomizer({ artist, onSaved }: CardCustomizerProps) {
  const [primaryColor, setPrimaryColor] = useState(artist.cardCustomization?.primaryColor || "#FFD600");
  const [backgroundColor, setBackgroundColor] = useState(artist.cardCustomization?.backgroundColor || "#0a0a0a");
  const [backgroundImage, setBackgroundImage] = useState(artist.cardCustomization?.backgroundImage || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateArtist(artist.id, {
        cardCustomization: { primaryColor, backgroundColor, backgroundImage },
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleBgUpload(file: File) {
    const url = await uploadFile(
      getStoragePath("artists", artist.id, "card-bg-" + file.name),
      file
    );
    setBackgroundImage(url);
  }

  return (
    <div className="max-w-md">
      <div className="mb-4">
        <span className="block text-xs uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
          Accent Color
        </span>
        <div className="flex items-center gap-3">
          <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 cursor-pointer" style={{ background: "none", border: "1px solid var(--border)" }} />
          <Input label="" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="!mb-0" />
        </div>
      </div>

      <div className="mb-4">
        <span className="block text-xs uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
          Background Color
        </span>
        <div className="flex items-center gap-3">
          <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-10 cursor-pointer" style={{ background: "none", border: "1px solid var(--border)" }} />
          <Input label="" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="!mb-0" />
        </div>
      </div>

      <FileUpload label="Background Image" onUpload={handleBgUpload} currentUrl={backgroundImage} />

      <Button onClick={handleSave} disabled={saving} className="mt-4">
        {saving ? "SAVING..." : "SAVE DESIGN"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Create card page with live preview**

Create `src/app/portal/card/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ArtistCard from "@/components/ArtistCard";
import CardCustomizer from "@/components/portal/CardCustomizer";
import { getArtistByUserId } from "@/lib/db";
import type { Artist } from "@/lib/types";

export default function PortalCardPage() {
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadArtist() {
    if (!user) return;
    const a = await getArtistByUserId(user.uid);
    setArtist(a);
    setLoading(false);
  }

  useEffect(() => {
    loadArtist();
  }, [user]);

  if (loading) {
    return <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Loading...</p>;
  }

  if (!artist) {
    return (
      <div>
        <h1 className="text-4xl tracking-wider mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--cyan)" }}>CARD DESIGN</h1>
        <p style={{ color: "var(--text-dim)" }}>Create your artist profile first.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl tracking-wider mb-8" style={{ fontFamily: "var(--font-display)", color: "var(--cyan)" }}>
        CARD DESIGN
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CardCustomizer artist={artist} onSaved={loadArtist} />
        <div>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
            Live Preview
          </p>
          <ArtistCard artist={artist} className="max-w-sm" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ArtistCard.tsx src/components/portal/CardCustomizer.tsx src/app/portal/card/
git commit -m "feat: add artist card customizer with live preview"
```

---

### Task 16: Seed Firestore with Existing Data

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1: Create seed script**

Create `scripts/seed.ts`:

```ts
/**
 * Seed Firestore with existing COC ConcertZ data.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires .env.local with Firebase Admin credentials.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();

const events = [
  {
    name: "+COC CONCERTZ #1",
    number: 1,
    date: new Date("2025-03-29T20:00:00Z"),
    description: "The first-ever COC Concertz metaverse show.",
    rsvpLink: "",
    venue: {
      spatialLink: "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349",
    },
    status: "completed",
    artists: [],
    flyerUrl: "",
    bannerUrl: "",
  },
  {
    name: "+COC CONCERTZ #2",
    number: 2,
    date: new Date("2025-10-11T20:00:00Z"),
    description: "Second installment — bigger crowd, bigger sound.",
    rsvpLink: "",
    venue: {
      spatialLink: "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349",
    },
    status: "completed",
    flyerUrl: "/images/concertz2-flyer.jpg",
    bannerUrl: "",
    artists: [],
  },
  {
    name: "+COC CONCERTZ #3",
    number: 3,
    date: new Date("2026-03-07T21:15:00Z"),
    description: "Web3 metaverse music experience in StiloWorld.",
    rsvpLink: "",
    venue: {
      spatialLink: "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349",
    },
    status: "completed",
    flyerUrl: "/images/concertz3-flyer.jpeg",
    bannerUrl: "",
    artists: [],
  },
  {
    name: "+COC CONCERTZ #4",
    number: 4,
    date: new Date("2026-04-11T20:00:00Z"),
    description: "Live in StiloWorld — Joseph Goats, Stilo, Tom Fellenz.",
    rsvpLink: "https://luma.com/0ksej24k",
    venue: {
      spatialLink: "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349",
      streamLink: "https://twitch.tv/bettercallzaal",
    },
    status: "upcoming",
    flyerUrl: "/images/coc4.1.jpg",
    bannerUrl: "/images/coc4.jpg",
    artists: [],
  },
  {
    name: "+COC CONCERTZ #5",
    number: 5,
    date: new Date("2026-05-09T20:00:00Z"),
    description: "Next metaverse concert — don't miss it.",
    rsvpLink: "https://luma.com/dwrdi3gg",
    venue: {
      spatialLink: "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349",
    },
    status: "upcoming",
    flyerUrl: "",
    bannerUrl: "",
    artists: [],
  },
];

async function seed() {
  console.log("Seeding events...");
  for (const event of events) {
    const ref = db.collection("events").doc();
    await ref.set({
      ...event,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  Created: ${event.name} (${ref.id})`);
  }

  console.log("\nDone! Seed complete.");
}

seed().catch(console.error);
```

- [ ] **Step 2: Install tsx for running TypeScript scripts**

```bash
npm install -D tsx dotenv
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed.ts package.json package-lock.json
git commit -m "feat: add Firestore seed script with existing event data"
```

---

### Task 17: Verify Everything Works End-to-End

- [ ] **Step 1: Set up Firebase project**

Create a Firebase project at https://console.firebase.google.com, enable Google Auth, Firestore, and Storage. Copy credentials into `.env.local`.

- [ ] **Step 2: Run seed script**

```bash
npx tsx scripts/seed.ts
```

Expected: 5 events created in Firestore.

- [ ] **Step 3: Start dev server and verify all pages**

```bash
npm run dev
```

Verify:
- `http://localhost:3000` — placeholder homepage renders
- `http://localhost:3000/login` — Google sign-in page renders
- Sign in with Google → redirects based on role
- `http://localhost:3000/admin` — dashboard shows events from Firestore
- `http://localhost:3000/admin/events` — CRUD works
- `http://localhost:3000/admin/invites` — invite system works
- `http://localhost:3000/admin/users` — user list with role switching
- `http://localhost:3000/portal` — artist portal renders
- `http://localhost:3000/portal/profile` — profile form works
- `http://localhost:3000/portal/sets` — setlist editor works
- `http://localhost:3000/portal/card` — card customizer with live preview

- [ ] **Step 4: Final commit and push**

```bash
git add -A
git commit -m "chore: verify end-to-end setup complete"
git push
```
