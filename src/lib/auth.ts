import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc, getDocs, collection, query, where, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { User, UserRole } from "./types";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;

  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    return userSnap.data() as User;
  }

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
    await setDoc(doc(db, "invites", invite.id), { status: "accepted", acceptedAt: serverTimestamp() }, { merge: true });
  }

  const newUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || "Anonymous",
    photoURL: firebaseUser.photoURL,
    role,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  };

  await setDoc(userRef, newUser);
  return { ...newUser, createdAt: new Date(), lastLogin: new Date() } as unknown as User;
}

export async function signOut() {
  await firebaseSignOut(auth);
}
