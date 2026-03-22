import { timeOfDayLayer } from "./layers/timeOfDay";
import { driverDataLayer } from "./layers/driverData";
import { commuterDataLayer } from "./layers/commuterData";
import { scoreConfidence } from "./confidence";
import type { DriverRoute, CommuterRoute, PredictionResult } from "@/types";

export interface PredictionContext {
  now?: Date;
  driverRoutes: DriverRoute[]; // all registered driver routes for this corridor
  activeDriverRoutes: DriverRoute[]; // subset currently active
  commuterRoutes: CommuterRoute[]; // community routes for this corridor
}

export function runPrediction(ctx: PredictionContext): PredictionResult {
  const now = ctx.now ?? new Date();

  // Layer 1 — always available
  const layer1 = timeOfDayLayer(now);

  // Layer 2 — driver data (if any)
  const layer2 = driverDataLayer(layer1, ctx.activeDriverRoutes, ctx.driverRoutes);

  // Layer 3 — commuter community data (if any)
  const layer3 = commuterDataLayer(ctx.commuterRoutes);

  // Apply layer 3 adjustments on top of layer 2
  const finalEta = {
    min: Math.max(1, Math.round(layer2.etaRange.min * layer3.etaAdjustment)),
    max: Math.max(2, Math.round(layer2.etaRange.max * layer3.etaAdjustment)),
  };

  // Calculate highly accurate vehicles near based on real data
  const driverMin = ctx.activeDriverRoutes.length;
  let driverMax = Math.max(driverMin, ctx.driverRoutes.length);

  // Using registered community routes as a gauge of total unregulated rides
  const commuterMin = Math.round(ctx.commuterRoutes.length * 0.5);
  const commuterMax = ctx.commuterRoutes.length;

  let finalVehiclesMin = driverMin + commuterMin;
  let finalVehiclesMax = driverMax + commuterMax;

  // Only fallback to mock layer1 data if absolutely nothing exists
  if (ctx.driverRoutes.length === 0 && ctx.commuterRoutes.length === 0) {
    finalVehiclesMin = layer1.vehicleRange.min;
    finalVehiclesMax = layer1.vehicleRange.max;
  } else if (finalVehiclesMax === 0) {
    // Found routes, but zero drivers are online/visible right now
    // Fallback to max potential based on time of day
    finalVehiclesMax = layer1.vehicleRange.min;
  }

  const finalVehicles = {
    min: finalVehiclesMin,
    max: Math.max(finalVehiclesMin + 1, finalVehiclesMax),
  };

  const { level, layersUsed } = scoreConfidence({
    hasDriverRoutes: ctx.driverRoutes.length > 0,
    hasActiveDrivers: ctx.activeDriverRoutes.length > 0,
    hasCommuterRoutes: ctx.commuterRoutes.length > 0,
  });

  return {
    etaRange: finalEta,
    vehicleRange: finalVehicles,
    bestTimeWindow: layer1.bestTimeWindow,
    isRushHour: layer1.isRushHour,
    confidence: level,
    layersUsed,
  };
}
