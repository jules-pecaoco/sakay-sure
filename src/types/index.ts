// ─── User / Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'commuter' | 'driver'

export interface AppUser {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  createdAt: string
}

// ─── Geo ─────────────────────────────────────────────────────────────────────

export interface Coordinates {
  lng: number
  lat: number
}

export interface Stop {
  id: string
  name: string
  coordinates: Coordinates
  /** Optional fare from the previous stop to this one (₱) */
  fareFromPrev?: number
}

// ─── Vehicle ──────────────────────────────────────────────────────────────────

export type VehicleType = 'jeepney' | 'bus' | 'tricycle'

// ─── Driver Routes ───────────────────────────────────────────────────────────

export interface Schedule {
  startTime: string  // "06:00"
  endTime: string    // "22:00"
}

export interface DriverPricing {
  /** Minimum base fare (₱) for boarding */
  minFare: number
  /** Whether fare increases per stop */
  perStopFare: number | null
}

export interface DriverRoute {
  id: string
  driverId: string
  name: string
  vehicleType: VehicleType
  stops: Stop[]
  geometry: GeoJSON.LineString | null
  schedule: Schedule
  pricing: DriverPricing | null
  isActive: boolean
  updatedAt: string
  createdAt: string
}

// ─── Commuter Routes ─────────────────────────────────────────────────────────

export interface CommuterRouteTips {
  fare: string
  notes: string
  isCashOnly: boolean
  hasAC: boolean
  hazards: string
}

export interface CommuterRoute {
  id: string
  authorId: string
  name: string
  stops: Stop[]
  geometry: GeoJSON.LineString | null
  tips: CommuterRouteTips
  helpfulVotes: number
  notHelpfulVotes: number
  createdAt: string
  updatedAt: string
}

// ─── Active Drivers ──────────────────────────────────────────────────────────

export interface ActiveDriver {
  driverId: string
  routeId: string
  position: Coordinates
  updatedAt: string
  expiresAt: string
}

// ─── Prediction ──────────────────────────────────────────────────────────────

export type ConfidenceLevel = 'low' | 'medium' | 'high'

export interface PredictionResult {
  etaRange: { min: number; max: number }         // minutes
  vehicleRange: { min: number; max: number }
  bestTimeWindow: { from: string; to: string }   // "07:00"
  isRushHour: boolean
  confidence: ConfidenceLevel
  layersUsed: string[]
}
