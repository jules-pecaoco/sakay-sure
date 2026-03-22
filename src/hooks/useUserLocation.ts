import { useEffect, useState, useCallback } from 'react'
import type { Coordinates } from '@/types'

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'

export interface UseUserLocationReturn {
  location: Coordinates | null
  status: LocationStatus
  request: () => void
}

export function useUserLocation(autoRequest = false): UseUserLocationReturn {
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [status, setStatus] = useState<LocationStatus>('idle')

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      return
    }
    setStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude })
        setStatus('granted')
      },
      () => {
        setStatus('denied')
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [])

  useEffect(() => {
    if (autoRequest) request()
  }, [autoRequest, request])

  return { location, status, request }
}
