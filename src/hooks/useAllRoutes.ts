import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { subscribeCommuterRoutes } from "@/services/firebase/commuterRoutes";
import { subscribeActiveDrivers } from "@/services/firebase/drivers";
import type { DriverRoute, CommuterRoute, ActiveDriver, VehicleType, Stop, Schedule, DriverPricing } from "@/types";

function toDriverRoute(id: string, data: Record<string, unknown>): DriverRoute {
  let geometry: GeoJSON.LineString | null = null;
  if (typeof data.geometry === "string") {
    try {
      geometry = JSON.parse(data.geometry);
    } catch {
      geometry = null;
    }
  }
  return {
    id,
    driverId: data.driverId as string,
    name: data.name as string,
    vehicleType: data.vehicleType as VehicleType,
    stops: (data.stops as Stop[]) ?? [],
    geometry,
    schedule: data.schedule as Schedule,
    pricing: (data.pricing as DriverPricing | null) ?? null,
    isActive: (data.isActive as boolean) ?? false,
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}

export interface UseAllRoutesReturn {
  driverRoutes: DriverRoute[];
  commuterRoutes: CommuterRoute[];
  activeDrivers: ActiveDriver[];
  loading: boolean;
}

export function useAllRoutes(): UseAllRoutesReturn {
  const [driverRoutes, setDriverRoutes] = useState<DriverRoute[]>([]);
  const [commuterRoutes, setCommuterRoutes] = useState<CommuterRoute[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([]);
  const [loadingDriver, setLoadingDriver] = useState(true);
  const [loadingCommuter, setLoadingCommuter] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "driverRoutes"), orderBy("createdAt", "desc"));
    const unsubDriver = onSnapshot(q, (snap) => {
      setDriverRoutes(snap.docs.map((d) => toDriverRoute(d.id, d.data())));
      setLoadingDriver(false);
    });
    const unsubCommuter = subscribeCommuterRoutes((routes) => {
      setCommuterRoutes(routes);
      setLoadingCommuter(false);
    });
    const unsubActive = subscribeActiveDrivers(setActiveDrivers);

    return () => {
      unsubDriver();
      unsubCommuter();
      unsubActive();
    };
  }, []);

  return { driverRoutes, commuterRoutes, activeDrivers, loading: loadingDriver || loadingCommuter };
}
