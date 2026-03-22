import { useEffect, useState, useCallback } from 'react'
import type { Coordinates } from '@/types'

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'

export interface UseUserLocationReturn {
  location: Coordinates | null
  status: LocationStatus
  request: () => void
}

// Global cache for seamless navigation
let cachedLocation: Coordinates | null = null;
let cachedStatus: LocationStatus = 'idle';

export function useUserLocation(autoRequest = false): UseUserLocationReturn {
  const [location, setLocation] = useState<Coordinates | null>(cachedLocation);
  const [status, setStatus] = useState<LocationStatus>(cachedStatus);

  const updateLocation = (coords: Coordinates | null) => {
    cachedLocation = coords;
    setLocation(coords);
  };
  
  const updateStatus = (st: LocationStatus) => {
    cachedStatus = st;
    setStatus(st);
  };

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      updateStatus('unavailable');
      return;
    }
    updateStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        updateStatus('granted');
      },
      () => {
        updateStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    if (autoRequest) {
      request();
    } else if (cachedStatus === 'idle' && typeof navigator !== 'undefined' && navigator.permissions) {
      // Passive check if location is already granted so we can auto-fetch it silently
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          request();
        }
      }).catch(() => {});
    }
  }, [autoRequest, request, status]);

  return { location, status, request }
}
