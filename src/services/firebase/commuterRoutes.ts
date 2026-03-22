import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  increment,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import type { CommuterRoute, CommuterRouteTips, Stop } from "@/types";

const COLLECTION = "commuterRoutes";

export interface CreateCommuterRoutePayload {
  authorId: string;
  name: string;
  stops: Stop[];
  geometry: GeoJSON.LineString | null;
  tips: CommuterRouteTips;
}

function serializeGeometry(geometry: GeoJSON.LineString | null): string | null {
  if (!geometry) return null;
  return JSON.stringify(geometry);
}

function deserializeGeometry(raw: unknown): GeoJSON.LineString | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as GeoJSON.LineString;
    } catch {
      return null;
    }
  }
  return (raw as GeoJSON.LineString) ?? null;
}

function toCommuterRoute(id: string, data: Record<string, unknown>): CommuterRoute {
  return {
    id,
    authorId: data.authorId as string,
    name: data.name as string,
    stops: (data.stops as Stop[]) ?? [],
    geometry: deserializeGeometry(data.geometry),
    tips: (data.tips as CommuterRouteTips) ?? {
      fare: "",
      notes: "",
      isCashOnly: false,
      hasAC: false,
      hazards: "",
    },
    helpfulVotes: (data.helpfulVotes as number) ?? 0,
    notHelpfulVotes: (data.notHelpfulVotes as number) ?? 0,
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}

export async function createCommuterRoute(payload: CreateCommuterRoutePayload): Promise<CommuterRoute> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...payload,
    geometry: serializeGeometry(payload.geometry),
    helpfulVotes: 0,
    notHelpfulVotes: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return {
    id: ref.id,
    ...payload,
    helpfulVotes: 0,
    notHelpfulVotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function subscribeCommuterRoutes(callback: (routes: CommuterRoute[]) => void): Unsubscribe {
  const q = query(collection(db, COLLECTION), orderBy("helpfulVotes", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => toCommuterRoute(d.id, d.data())));
  });
}

// ─── Votes ────────────────────────────────────────────────────────────────────
// One vote per user per route, stored at /votes/{userId}_{routeId}.
// Voting the same value again = undo (removes doc, decrements counter).
// Switching from like ↔ dislike requires undoing first.

export type VoteValue = "helpful" | "notHelpful";

interface VoteDoc {
  userId: string;
  routeId: string;
  value: VoteValue;
}

const VOTES_COLLECTION = "votes";

function voteDocId(userId: string, routeId: string) {
  return `${userId}_${routeId}`;
}

/** Read the current user's stored vote for a route. Returns null if none. */
export async function getUserVote(userId: string, routeId: string): Promise<VoteValue | null> {
  const snap = await getDoc(doc(db, VOTES_COLLECTION, voteDocId(userId, routeId)));
  if (!snap.exists()) return null;
  return (snap.data() as VoteDoc).value;
}

/**
 * Cast or undo a vote.
 *
 * - No existing vote   cast it, increment counter, return the value.
 * - Same vote exists   undo it, decrement counter, return null.
 * - Diff vote exists   no-op, return the existing value (UI blocks this).
 */
export async function castVote(userId: string, routeId: string, value: VoteValue): Promise<VoteValue | null> {
  const voteRef = doc(db, VOTES_COLLECTION, voteDocId(userId, routeId));
  const routeRef = doc(db, COLLECTION, routeId);
  const existing = await getDoc(voteRef);

  if (existing.exists()) {
    const current = (existing.data() as VoteDoc).value;

    if (current === value) {
      // Undo: remove vote doc and decrement counter
      await deleteDoc(voteRef);
      await updateDoc(routeRef, {
        [value === "helpful" ? "helpfulVotes" : "notHelpfulVotes"]: increment(-1),
        updatedAt: serverTimestamp(),
      });
      return null;
    }

    // Different vote already exists — block the action
    return current;
  }

  // Cast new vote
  const voteData: VoteDoc = { userId, routeId, value };
  await setDoc(voteRef, voteData);
  await updateDoc(routeRef, {
    [value === "helpful" ? "helpfulVotes" : "notHelpfulVotes"]: increment(1),
    updatedAt: serverTimestamp(),
  });
  return value;
}

export async function deleteCommuterRoute(routeId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, routeId));
}

export async function updateCommuterRoute(routeId: string, updates: Partial<Omit<CommuterRoute, "id" | "authorId" | "createdAt">>): Promise<void> {
  const { geometry, ...rest } = updates;
  await updateDoc(doc(db, COLLECTION, routeId), {
    ...rest,
    ...(geometry !== undefined && { geometry: serializeGeometry(geometry) }),
    updatedAt: serverTimestamp(),
  });
}
