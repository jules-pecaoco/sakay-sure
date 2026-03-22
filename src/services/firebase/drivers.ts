import { doc, setDoc, deleteDoc, onSnapshot, collection, serverTimestamp, type Unsubscribe } from "firebase/firestore";
import { db } from "./config";
import type { ActiveDriver, Coordinates } from "@/types";

const COLLECTION = "activeDrivers";
const TTL_MINUTES = 30;

function toActiveDriver(id: string, data: Record<string, unknown>): ActiveDriver {
  return {
    driverId: id,
    routeId: data.routeId as string,
    position: data.position as Coordinates,
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    expiresAt: (data.expiresAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}

// ─── Go active ────────────────────────────────────────────────────────────────

export async function setDriverActive(driverId: string, routeId: string, position: Coordinates): Promise<void> {
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000);
  await setDoc(doc(db, COLLECTION, driverId), {
    routeId,
    position,
    updatedAt: serverTimestamp(),
    expiresAt,
  });
}

// ─── Go inactive ──────────────────────────────────────────────────────────────

export async function setDriverInactive(driverId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, driverId));
}

// ─── Subscribe to all active drivers ─────────────────────────────────────────

export function subscribeActiveDrivers(callback: (drivers: ActiveDriver[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    const now = new Date();
    const active = snap.docs.map((d) => toActiveDriver(d.id, d.data())).filter((d) => new Date(d.expiresAt) > now);
    callback(active);
  });
}
