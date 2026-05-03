import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Event, Artist, SetItem, Invite, User, UserRole } from "./types";

// All read paths use the Firebase client SDK (allowed by firestore.rules).
// All write paths route through Admin SDK API endpoints — clients never
// write Firestore directly. Function signatures are unchanged so callers
// don't need to know.

async function postJson<T>(
  url: string,
  init: { method: string; body?: unknown }
): Promise<T> {
  const res = await fetch(url, {
    method: init.method,
    headers: init.body !== undefined ? { "content-type": "application/json" } : undefined,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${init.method} ${url} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

// ============================================================================
// EVENTS
// ============================================================================

export async function getEvents(): Promise<Event[]> {
  const q = query(collection(db, "events"), orderBy("number", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    createdAt: (doc.data().createdAt as Timestamp).toDate(),
    updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    date: (doc.data().date as Timestamp).toDate(),
  } as Event));
}

export async function getEvent(id: string): Promise<Event | null> {
  const docRef = doc(db, "events", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
    date: (data.date as Timestamp).toDate(),
  } as Event;
}

export async function getEventByNumber(num: number): Promise<Event | null> {
  const q = query(collection(db, "events"), where("number", "==", num));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
    date: (data.date as Timestamp).toDate(),
  } as Event;
}

export async function createEvent(
  data: Omit<Event, "id" | "createdAt" | "updatedAt">
): Promise<Event> {
  const created = await postJson<Event & { date: string; createdAt: string; updatedAt: string }>(
    "/api/admin/events",
    { method: "POST", body: { ...data, date: data.date instanceof Date ? data.date.toISOString() : data.date } }
  );
  return {
    ...created,
    date: new Date(created.date),
    createdAt: new Date(created.createdAt),
    updatedAt: new Date(created.updatedAt),
  };
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<Event, "id" | "createdAt">>
): Promise<void> {
  const body: Record<string, unknown> = { ...data };
  if (data.date instanceof Date) body.date = data.date.toISOString();
  await postJson(`/api/admin/events/${id}`, { method: "PATCH", body });
}

export async function deleteEvent(id: string): Promise<void> {
  await postJson(`/api/admin/events/${id}`, { method: "DELETE" });
}

// ============================================================================
// ARTISTS
// ============================================================================

export async function getArtists(): Promise<Artist[]> {
  const q = query(collection(db, "artists"), orderBy("stageName", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    createdAt: (doc.data().createdAt as Timestamp).toDate(),
  } as Artist));
}

export async function getArtist(id: string): Promise<Artist | null> {
  const docRef = doc(db, "artists", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: (data.createdAt as Timestamp).toDate(),
  } as Artist;
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const q = query(collection(db, "artists"), where("slug", "==", slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: (data.createdAt as Timestamp).toDate(),
  } as Artist;
}

export async function getArtistByUserId(userId: string): Promise<Artist | null> {
  const q = query(collection(db, "artists"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: (data.createdAt as Timestamp).toDate(),
  } as Artist;
}

export async function createArtist(
  data: Omit<Artist, "id" | "createdAt">
): Promise<Artist> {
  const created = await postJson<Artist & { createdAt: string }>("/api/artists", {
    method: "POST",
    body: data,
  });
  return { ...created, createdAt: new Date(created.createdAt) };
}

export async function updateArtist(
  id: string,
  data: Partial<Omit<Artist, "id" | "createdAt">>
): Promise<void> {
  await postJson("/api/artists", {
    method: "PUT",
    body: { artistId: id, ...data },
  });
}

// ============================================================================
// SETS
// ============================================================================

export async function getSetsForEvent(eventId: string): Promise<SetItem[]> {
  const q = query(
    collection(db, "sets"),
    where("eventId", "==", eventId),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  } as SetItem));
}

export async function getSetsForArtist(artistId: string): Promise<SetItem[]> {
  const q = query(
    collection(db, "sets"),
    where("artistId", "==", artistId),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  } as SetItem));
}

export async function createSet(data: Omit<SetItem, "id">): Promise<SetItem> {
  return postJson<SetItem>("/api/admin/sets", { method: "POST", body: data });
}

export async function updateSet(
  id: string,
  data: Partial<Omit<SetItem, "id">>
): Promise<void> {
  await postJson(`/api/admin/sets/${id}`, { method: "PATCH", body: data });
}

export async function deleteSet(id: string): Promise<void> {
  await postJson(`/api/admin/sets/${id}`, { method: "DELETE" });
}

// ============================================================================
// INVITES
// ============================================================================

export async function getInvites(): Promise<Invite[]> {
  const res = await fetch("/api/admin/invites/list", { cache: "no-store" });
  if (!res.ok) throw new Error(`getInvites failed: ${res.status}`);
  const { items } = (await res.json()) as {
    items: (Omit<Invite, "createdAt" | "acceptedAt"> & {
      createdAt: string | null;
      acceptedAt: string | null;
    })[];
  };
  return items.map((i) => ({
    ...i,
    createdAt: i.createdAt ? new Date(i.createdAt) : new Date(),
    acceptedAt: i.acceptedAt ? new Date(i.acceptedAt) : undefined,
  }));
}

export async function createInvite(
  data: Omit<Invite, "id" | "createdAt">
): Promise<Invite> {
  const created = await postJson<Invite & { createdAt: string; acceptedAt?: string }>(
    "/api/admin/invites",
    { method: "POST", body: data }
  );
  return {
    ...created,
    createdAt: new Date(created.createdAt),
    acceptedAt: created.acceptedAt ? new Date(created.acceptedAt) : undefined,
  };
}

export async function updateInvite(
  id: string,
  data: Partial<Omit<Invite, "id" | "createdAt">>
): Promise<void> {
  await postJson(`/api/admin/invites/${id}`, { method: "PATCH", body: data });
}

// ============================================================================
// USERS
// ============================================================================

export async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/admin/users", { cache: "no-store" });
  if (!res.ok) throw new Error(`getUsers failed: ${res.status}`);
  const { items } = (await res.json()) as {
    items: (Omit<User, "createdAt" | "lastLogin"> & {
      createdAt: string | null;
      lastLogin: string | null;
    })[];
  };
  return items.map((u) => ({
    ...u,
    createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
    lastLogin: u.lastLogin ? new Date(u.lastLogin) : new Date(),
  }));
}

export async function updateUserRole(
  uid: string,
  role: UserRole
): Promise<void> {
  await postJson(`/api/admin/users/${uid}/role`, {
    method: "PATCH",
    body: { role },
  });
}
