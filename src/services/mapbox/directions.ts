import type { Coordinates } from "@/types";

const BASE = "https://api.mapbox.com/directions/v5/mapbox/driving";

export async function fetchRouteGeometry(stops: Coordinates[]): Promise<GeoJSON.LineString | null> {
  if (stops.length < 2) return null;

  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const coords = stops.map((s) => `${s.lng},${s.lat}`).join(";");
  const url = `${BASE}/${coords}?geometries=geojson&overview=full&access_token=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      routes?: { geometry: GeoJSON.LineString }[];
    };
    return data.routes?.[0]?.geometry ?? null;
  } catch {
    return null;
  }
}
