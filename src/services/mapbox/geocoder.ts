export async function reverseGeocode(lng: number, lat: number): Promise<string> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) {
    console.warn("No Mapbox token found. Cannot reverse geocode.");
    return "Pinned Location";
  }

  try {
    const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${token}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("Failed to reverse geocode:", res.statusText);
      return "Pinned Location";
    }

    const data = await res.json();
    const feature = data.features?.[0];

    if (!feature) {
      return "Pinned Location";
    }

    return feature.properties.name || feature.properties.place_name || feature.properties.full_address || "Pinned Location";
  } catch (err) {
    console.error("Error reverse geocoding:", err);
    return "Pinned Location";
  }
}
