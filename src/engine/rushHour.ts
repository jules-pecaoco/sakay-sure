import { RUSH_HOUR_WINDOWS } from './constants'

export function isRushHour(date: Date = new Date()): boolean {
  const hour = date.getHours()
  return RUSH_HOUR_WINDOWS.some((w) => hour >= w.from && hour < w.to)
}

export function getRushHourLabel(date: Date = new Date()): string | null {
  const hour = date.getHours()
  if (hour >= 6 && hour < 9) return 'Morning rush'
  if (hour >= 17 && hour < 20) return 'Evening rush'
  return null
}
