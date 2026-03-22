import {
  BASE_ETA_BY_HOUR,
  BASE_VEHICLES_BY_HOUR,
  BEST_TIME_BY_HOUR,
} from '../constants'
import type { PredictionResult } from '@/types'

export interface TimeOfDayResult {
  etaRange: PredictionResult['etaRange']
  vehicleRange: PredictionResult['vehicleRange']
  bestTimeWindow: PredictionResult['bestTimeWindow']
  isRushHour: boolean
}

export function timeOfDayLayer(now: Date = new Date()): TimeOfDayResult {
  const hour = now.getHours()
  const isRush =
    (hour >= 6 && hour < 9) || (hour >= 17 && hour < 20)

  return {
    etaRange: BASE_ETA_BY_HOUR[hour] ?? { min: 10, max: 25 },
    vehicleRange: BASE_VEHICLES_BY_HOUR[hour] ?? { min: 1, max: 3 },
    bestTimeWindow: BEST_TIME_BY_HOUR[hour] ?? { from: '07:00', to: '08:00' },
    isRushHour: isRush,
  }
}
