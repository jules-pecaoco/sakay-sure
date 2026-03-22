// ─── Rush hour windows (Philippine commute patterns) ─────────────────────────

export const RUSH_HOUR_WINDOWS = [
  { from: 6, to: 9 },   // Morning rush
  { from: 17, to: 20 }, // Evening rush
]

// ─── Base ETA by hour bucket (minutes) ───────────────────────────────────────
// Index = hour of day (0–23). Values represent average wait/travel time.

export const BASE_ETA_BY_HOUR: Record<number, { min: number; max: number }> = {
  0:  { min: 20, max: 40 },
  1:  { min: 25, max: 50 },
  2:  { min: 25, max: 50 },
  3:  { min: 25, max: 50 },
  4:  { min: 15, max: 30 },
  5:  { min: 10, max: 20 },
  6:  { min: 10, max: 20 },
  7:  { min: 15, max: 30 }, // rush start
  8:  { min: 20, max: 40 }, // peak rush
  9:  { min: 15, max: 25 },
  10: { min: 8,  max: 18 },
  11: { min: 8,  max: 18 },
  12: { min: 10, max: 20 }, // lunch
  13: { min: 8,  max: 18 },
  14: { min: 8,  max: 18 },
  15: { min: 8,  max: 18 },
  16: { min: 12, max: 22 }, // pre-rush
  17: { min: 15, max: 30 }, // rush start
  18: { min: 20, max: 40 }, // peak rush
  19: { min: 18, max: 35 },
  20: { min: 12, max: 22 },
  21: { min: 10, max: 20 },
  22: { min: 15, max: 30 },
  23: { min: 20, max: 40 },
}

// ─── Base vehicle count by hour bucket ───────────────────────────────────────

export const BASE_VEHICLES_BY_HOUR: Record<number, { min: number; max: number }> = {
  0:  { min: 0, max: 1 },
  1:  { min: 0, max: 1 },
  2:  { min: 0, max: 1 },
  3:  { min: 0, max: 1 },
  4:  { min: 1, max: 2 },
  5:  { min: 1, max: 3 },
  6:  { min: 2, max: 4 },
  7:  { min: 3, max: 6 },
  8:  { min: 3, max: 6 },
  9:  { min: 2, max: 5 },
  10: { min: 2, max: 5 },
  11: { min: 2, max: 5 },
  12: { min: 2, max: 4 },
  13: { min: 2, max: 5 },
  14: { min: 2, max: 5 },
  15: { min: 2, max: 5 },
  16: { min: 3, max: 6 },
  17: { min: 3, max: 7 },
  18: { min: 3, max: 7 },
  19: { min: 2, max: 5 },
  20: { min: 2, max: 4 },
  21: { min: 1, max: 3 },
  22: { min: 1, max: 2 },
  23: { min: 0, max: 2 },
}

// ─── Best time windows ────────────────────────────────────────────────────────
// Suggest off-peak windows by hour bucket

export const BEST_TIME_BY_HOUR: Record<number, { from: string; to: string }> = {
  0:  { from: '05:00', to: '06:00' },
  1:  { from: '05:00', to: '06:00' },
  2:  { from: '05:00', to: '06:00' },
  3:  { from: '05:00', to: '06:00' },
  4:  { from: '05:00', to: '06:30' },
  5:  { from: '05:30', to: '06:30' },
  6:  { from: '06:00', to: '07:00' },
  7:  { from: '09:30', to: '10:30' }, // avoid rush, suggest after
  8:  { from: '09:30', to: '10:30' },
  9:  { from: '10:00', to: '11:00' },
  10: { from: '10:00', to: '11:30' },
  11: { from: '10:30', to: '12:00' },
  12: { from: '13:30', to: '14:30' },
  13: { from: '13:30', to: '14:30' },
  14: { from: '14:00', to: '15:30' },
  15: { from: '15:00', to: '16:30' },
  16: { from: '20:30', to: '21:30' }, // avoid rush, suggest after
  17: { from: '20:30', to: '21:30' },
  18: { from: '20:30', to: '21:30' },
  19: { from: '21:00', to: '22:00' },
  20: { from: '20:30', to: '21:30' },
  21: { from: '07:00', to: '08:00' }, // tomorrow morning
  22: { from: '07:00', to: '08:00' },
  23: { from: '07:00', to: '08:00' },
}
