import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './config'
import type { DriverRoute, Stop, VehicleType, Schedule, DriverPricing } from '@/types'

const COLLECTION = 'driverRoutes'

export interface CreateDriverRoutePayload {
  driverId: string
  name: string
  vehicleType: VehicleType
  stops: Stop[]
  geometry: GeoJSON.LineString | null
  schedule: Schedule
  pricing: DriverPricing | null
}

function serializeGeometry(geometry: GeoJSON.LineString | null): string | null {
  if (!geometry) return null
  return JSON.stringify(geometry)
}

function deserializeGeometry(raw: unknown): GeoJSON.LineString | null {
  if (!raw) return null
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as GeoJSON.LineString } catch { return null }
  }
  return (raw as GeoJSON.LineString) ?? null
}

function toDriverRoute(id: string, data: Record<string, unknown>): DriverRoute {
  return {
    id,
    driverId: data.driverId as string,
    name: data.name as string,
    vehicleType: data.vehicleType as VehicleType,
    stops: (data.stops as Stop[]) ?? [],
    geometry: deserializeGeometry(data.geometry),
    schedule: data.schedule as Schedule,
    pricing: (data.pricing as DriverPricing) ?? null,
    isActive: (data.isActive as boolean) ?? false,
    createdAt:
      (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      new Date().toISOString(),
    updatedAt:
      (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      new Date().toISOString(),
  }
}

export async function createDriverRoute(
  payload: CreateDriverRoutePayload,
): Promise<DriverRoute> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...payload,
    geometry: serializeGeometry(payload.geometry),
    isActive: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return {
    id: ref.id,
    ...payload,
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function subscribeDriverRoutes(
  driverId: string,
  callback: (routes: DriverRoute[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('driverId', '==', driverId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => toDriverRoute(d.id, d.data())))
  })
}

export async function deleteDriverRoute(routeId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, routeId))
}

export async function updateDriverRoute(
  routeId: string,
  updates: Partial<Omit<DriverRoute, 'id' | 'driverId' | 'createdAt'>>,
): Promise<void> {
  const { geometry, ...rest } = updates
  await updateDoc(doc(db, COLLECTION, routeId), {
    ...rest,
    ...(geometry !== undefined && { geometry: serializeGeometry(geometry) }),
    updatedAt: serverTimestamp(),
  })
}

export async function setRouteActive(
  routeId: string,
  isActive: boolean,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, routeId), {
    isActive,
    updatedAt: serverTimestamp(),
  })
}
