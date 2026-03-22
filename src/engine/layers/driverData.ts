import type { DriverRoute } from "@/types";
import type { TimeOfDayResult } from "./timeOfDay";

export interface DriverLayerResult {
  etaRange: { min: number; max: number };
  vehicleRange: { min: number; max: number };
  adjusted: boolean;
}

export function driverDataLayer(base: TimeOfDayResult, activeDrivers: DriverRoute[], allDriverRoutes: DriverRoute[]): DriverLayerResult {
  if (allDriverRoutes.length === 0) {
    return {
      etaRange: base.etaRange,
      vehicleRange: base.vehicleRange,
      adjusted: false,
    };
  }

  const activeCount = activeDrivers.length;
  const scheduledCount = allDriverRoutes.filter((r) => {
    if (!r.schedule) return false;
    const now = new Date();
    const [sh, sm] = r.schedule.startTime.split(":").map(Number);
    const [eh, em] = r.schedule.endTime.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin >= startMin && nowMin <= endMin;
  }).length;

  const effectiveCount = Math.max(activeCount, scheduledCount);

  // More drivers on the route lower ETA, higher vehicle count
  const etaMultiplier = effectiveCount > 0 ? Math.max(0.5, 1 - effectiveCount * 0.08) : 1;

  const vehicleBoost = effectiveCount > 0 ? effectiveCount : 0;

  return {
    etaRange: {
      min: Math.round(base.etaRange.min * etaMultiplier),
      max: Math.round(base.etaRange.max * etaMultiplier),
    },
    vehicleRange: {
      min: base.vehicleRange.min + vehicleBoost,
      max: base.vehicleRange.max + vehicleBoost,
    },
    adjusted: true,
  };
}
