import type { CommuterRoute } from '@/types'

export interface CommuterLayerResult {
  etaAdjustment: number   // multiplier, e.g. 0.9 = 10% shorter
  vehicleBoost: number    // flat add to vehicle range
  adjusted: boolean
}

export function commuterDataLayer(
  commuterRoutes: CommuterRoute[],
): CommuterLayerResult {
  if (commuterRoutes.length === 0) {
    return { etaAdjustment: 1, vehicleBoost: 0, adjusted: false }
  }

  // Community confidence: high helpful-vote routes signal a well-served corridor
  const totalVotes = commuterRoutes.reduce(
    (sum, r) => sum + r.helpfulVotes + r.notHelpfulVotes,
    0,
  )
  const helpfulVotes = commuterRoutes.reduce(
    (sum, r) => sum + r.helpfulVotes,
    0,
  )

  const helpfulRatio = totalVotes > 0 ? helpfulVotes / totalVotes : 0.5

  // More helpful routes → slightly more confidence in shorter ETA
  const etaAdjustment = helpfulRatio > 0.6 ? 0.9 : helpfulRatio < 0.3 ? 1.1 : 1
  const vehicleBoost = commuterRoutes.length >= 3 ? 1 : 0

  return { etaAdjustment, vehicleBoost, adjusted: true }
}
