/**
 * Server-side Firestore helpers using Firebase Admin SDK.
 * Use these in Server Components and API routes instead of db.ts (client SDK).
 */
import type { Event, Artist, SetItem } from "./types";

async function getAdminDb() {
  const { adminDb } = await import("./firebase-admin");
  return adminDb;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getEventsServer(): Promise<Event[]> {
  const db = await getAdminDb();
  const snapshot = await db.collection("events").orderBy("number", "desc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      date: data.date?.toDate?.() ?? new Date(),
    } as Event;
  });
}

export async function getEventByNumberServer(num: number): Promise<Event | null> {
  const db = await getAdminDb();
  const snapshot = await db.collection("events").where("number", "==", num).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    date: data.date?.toDate?.() ?? new Date(),
  } as Event;
}

// ─── Artists ─────────────────────────────────────────────────────────────────

export async function getArtistsServer(): Promise<Artist[]> {
  const db = await getAdminDb();
  const snapshot = await db.collection("artists").orderBy("stageName", "asc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as Artist;
  });
}

export async function getArtistBySlugServer(slug: string): Promise<Artist | null> {
  const db = await getAdminDb();
  const snapshot = await db.collection("artists").where("slug", "==", slug).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  } as Artist;
}

// ─── Sets ────────────────────────────────────────────────────────────────────

export async function getSetsForArtistServer(artistId: string): Promise<SetItem[]> {
  const db = await getAdminDb();
  const snapshot = await db
    .collection("sets")
    .where("artistId", "==", artistId)
    .orderBy("order", "asc")
    .get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  } as SetItem));
}
