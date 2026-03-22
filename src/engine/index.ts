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

  const finalVehicles = {
    min: layer2.vehicleRange.min + layer3.vehicleBoost,
    max: layer2.vehicleRange.max + layer3.vehicleBoost,
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
