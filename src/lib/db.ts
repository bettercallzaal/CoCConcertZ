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
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Event, Artist, SetItem, Invite, User, UserRole } from "./types";

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
  const newRef = doc(collection(db, "events"));
  const eventData = {
    ...data,
    date: data.date instanceof Date ? new Date(data.date) : data.date,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(newRef, eventData);
  const created = await getEvent(newRef.id);
  if (!created) throw new Error("Failed to create event");
  return created;
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<Event, "id" | "createdAt">>
): Promise<void> {
  const updateData: Record<string, any> = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  if (data.date) {
    updateData.date =
      data.date instanceof Date ? new Date(data.date) : data.date;
  }
  const docRef = doc(db, "events", id);
  await updateDoc(docRef, updateData);
}

export async function deleteEvent(id: string): Promise<void> {
  const docRef = doc(db, "events", id);
  await deleteDoc(docRef);
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
  const newRef = doc(collection(db, "artists"));
  const artistData = {
    ...data,
    createdAt: serverTimestamp(),
  };
  await setDoc(newRef, artistData);
  const created = await getArtist(newRef.id);
  if (!created) throw new Error("Failed to create artist");
  return created;
}

export async function updateArtist(
  id: string,
  data: Partial<Omit<Artist, "id" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "artists", id);
  await updateDoc(docRef, data);
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

export async function createSet(
  data: Omit<SetItem, "id">
): Promise<SetItem> {
  const newRef = doc(collection(db, "sets"));
  await setDoc(newRef, data);
  const created = await getDoc(newRef);
  if (!created.exists()) throw new Error("Failed to create set");
  return {
    ...created.data(),
    id: created.id,
  } as SetItem;
}

export async function updateSet(
  id: string,
  data: Partial<Omit<SetItem, "id">>
): Promise<void> {
  const docRef = doc(db, "sets", id);
  await updateDoc(docRef, data);
}

export async function deleteSet(id: string): Promise<void> {
  const docRef = doc(db, "sets", id);
  await deleteDoc(docRef);
}

// ============================================================================
// INVITES
// ============================================================================

export async function getInvites(): Promise<Invite[]> {
  const q = query(collection(db, "invites"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: (data.createdAt as Timestamp).toDate(),
      acceptedAt: data.acceptedAt ? (data.acceptedAt as Timestamp).toDate() : undefined,
    } as Invite;
  });
}

export async function createInvite(
  data: Omit<Invite, "id" | "createdAt">
): Promise<Invite> {
  const newRef = doc(collection(db, "invites"));
  const inviteData = {
    ...data,
    createdAt: serverTimestamp(),
  };
  await setDoc(newRef, inviteData);
  const created = await getDoc(newRef);
  if (!created.exists()) throw new Error("Failed to create invite");
  const createdData = created.data();
  return {
    ...createdData,
    id: created.id,
    createdAt: (createdData.createdAt as Timestamp).toDate(),
    acceptedAt: createdData.acceptedAt
      ? (createdData.acceptedAt as Timestamp).toDate()
      : undefined,
  } as Invite;
}

export async function updateInvite(
  id: string,
  data: Partial<Omit<Invite, "id" | "createdAt">>
): Promise<void> {
  const updateData: Record<string, any> = { ...data };
  const docRef = doc(db, "invites", id);
  await updateDoc(docRef, updateData);
}

// ============================================================================
// USERS
// ============================================================================

export async function getUsers(): Promise<User[]> {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      uid: doc.id,
      createdAt: (data.createdAt as Timestamp).toDate(),
      lastLogin: (data.lastLogin as Timestamp).toDate(),
    } as User;
  });
}

export async function updateUserRole(
  uid: string,
  role: UserRole
): Promise<void> {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, { role });
}
