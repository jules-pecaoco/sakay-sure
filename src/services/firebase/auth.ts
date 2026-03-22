import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import type { AppUser, UserRole } from "@/types";

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, displayName: string, role: UserRole): Promise<AppUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  await updateProfile(user, { displayName });

  const appUser: Omit<AppUser, "uid"> = {
    email: user.email,
    displayName,
    role,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", user.uid), {
    ...appUser,
    createdAt: serverTimestamp(),
  });

  return { uid: user.uid, ...appUser };
}

// ─── Sign In ─────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<AppUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return fetchAppUser(credential.user);
}

// ─── Sign Out ────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ─── Fetch User Profile ──────────────────────────────────────────────────────

export async function fetchAppUser(firebaseUser: User): Promise<AppUser> {
  const snap = await getDoc(doc(db, "users", firebaseUser.uid));

  if (!snap.exists()) {
    throw new Error("User profile not found in Firestore.");
  }

  const data = snap.data();

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    role: data.role as UserRole,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
  };
}

// ─── Auth State Observer ─────────────────────────────────────────────────────

export function onAuthChange(callback: (user: AppUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    try {
      const appUser = await fetchAppUser(firebaseUser);
      callback(appUser);
    } catch {
      callback(null);
    }
  });
}
