import type { ConfidenceLevel } from '@/types'

interface ConfidenceInput {
  hasDriverRoutes: boolean
  hasActiveDrivers: boolean
  hasCommuterRoutes: boolean
}

export function scoreConfidence(input: ConfidenceInput): {
  level: ConfidenceLevel
  layersUsed: string[]
} {
  const layersUsed: string[] = ['Time of day']

  if (input.hasDriverRoutes) layersUsed.push('Driver schedules')
  if (input.hasActiveDrivers) layersUsed.push('Live driver positions')
  if (input.hasCommuterRoutes) layersUsed.push('Community routes')

  const score =
    (input.hasDriverRoutes ? 2 : 0) +
    (input.hasActiveDrivers ? 3 : 0) +
    (input.hasCommuterRoutes ? 1 : 0)

  const level: ConfidenceLevel =
    score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low'

  return { level, layersUsed }
}
