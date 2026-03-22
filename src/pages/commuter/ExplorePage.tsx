import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAllRoutes } from "@/hooks/useAllRoutes";
import { useUserLocation } from "@/hooks/useUserLocation";
import RouteTypeToggle, { type RouteFilter } from "@/components/routes/RouteTypeToggle";
import { DriverRouteCard, CommuterRouteCard } from "@/components/routes/RouteCard";
import LocationPermissionBanner from "@/components/common/LocationPermissionBanner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { MapIcon, Search } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_CENTER: [number, number] = [123.8854, 10.3157];

export default function ExplorePage() {
  const { driverRoutes, commuterRoutes, activeDrivers, loading } = useAllRoutes();
  const { location: userLocation, status: locationStatus, request: requestLocation } = useUserLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<RouteFilter>("all");
  const [search, setSearch] = useState("");
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showMap || !mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userLocation ? [userLocation.lng, userLocation.lat] : DEFAULT_CENTER,
      zoom: userLocation ? 14 : 12,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "bottom-right"
    );
    mapRef.current = map;

    map.on("load", () => {
      // 1. Add Driver Routes
      driverRoutes.forEach((route) => {
        if (!route.geometry) return;
        const sourceId = `route-${route.id}`;
        if (map.getSource(sourceId)) return;
        map.addSource(sourceId, { type: "geojson", data: { type: "Feature", properties: { id: route.id, name: route.name, type: 'driver' }, geometry: route.geometry } });
        map.addLayer({
          id: sourceId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": route.isActive ? "#22c55e" : "#000000",
            "line-width": 4,
            "line-opacity": 0.7,
          },
        });

        // Add start marker for driver route
        const startPos = route.stops[0].coordinates;
        const el = document.createElement('div');
        el.className = 'w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-pointer';
        el.style.backgroundColor = route.isActive ? '#22c55e' : '#000000';
        new mapboxgl.Marker({ element: el })
          .setLngLat([startPos.lng, startPos.lat])
          .setPopup(new mapboxgl.Popup({ offset: 10 }).setHTML(`
            <div class="p-2 min-w-30">
              <p class="text-xs font-bold text-slate-800">${route.name}</p>
              <p class="text-[10px] text-slate-500 mb-2">Driver Route</p>
              <a href="/predict?routeId=${route.id}&type=driver" class="text-[10px] font-bold text-primary-600 hover:underline">View details →</a>
            </div>
          `))
          .addTo(map);

        // Click handler for line
        map.on('click', sourceId, (e) => {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2 min-w-30">
                <p class="text-xs font-bold text-slate-800">${route.name}</p>
                <p class="text-[10px] text-slate-500 mb-2">Driver Route</p>
                <a href="/predict?routeId=${route.id}&type=driver" class="text-[10px] font-bold text-primary-600 hover:underline">View details →</a>
              </div>
            `)
            .addTo(map);
        });
        map.on('mouseenter', sourceId, () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', sourceId, () => map.getCanvas().style.cursor = '');
      });

      // 2. Add Community Routes
      commuterRoutes.forEach((route) => {
        if (!route.geometry) return;
        const sourceId = `route-${route.id}`;
        if (map.getSource(sourceId)) return;
        map.addSource(sourceId, { type: "geojson", data: { type: "Feature", properties: { id: route.id, name: route.name, type: 'commuter' }, geometry: route.geometry } });
        map.addLayer({
          id: sourceId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#9333ea", // Brand accent purple
            "line-width": 4,
            "line-opacity": 0.7,
          },
        });

        // Add start marker for community route
        const startPos = route.stops[0].coordinates;
        const el = document.createElement('div');
        el.className = 'w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-pointer';
        el.style.backgroundColor = '#9333ea';
        new mapboxgl.Marker({ element: el })
          .setLngLat([startPos.lng, startPos.lat])
          .setPopup(new mapboxgl.Popup({ offset: 10 }).setHTML(`
            <div class="p-2 min-w-30">
              <p class="text-xs font-bold text-slate-800">${route.name}</p>
              <p class="text-[10px] text-slate-500 mb-2">Community Route</p>
              <a href="/predict?routeId=${route.id}&type=commuter" class="text-[10px] font-bold text-primary-600 hover:underline">View details →</a>
            </div>
          `))
          .addTo(map);

        // Click handler for line
        map.on('click', sourceId, (e) => {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2 min-w-30">
                <p class="text-xs font-bold text-slate-800">${route.name}</p>
                <p class="text-[10px] text-slate-500 mb-2">Community Route</p>
                <a href="/predict?routeId=${route.id}&type=commuter" class="text-[10px] font-bold text-primary-600 hover:underline">View details →</a>
              </div>
            `)
            .addTo(map);
        });
        map.on('mouseenter', sourceId, () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', sourceId, () => map.getCanvas().style.cursor = '');
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap]);

  // ── Update active driver markers ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    activeDrivers.forEach((driver) => {
      const el = document.createElement("div");
      el.style.cssText = `
        width:32px;height:32px;border-radius:50%;
        background:#22c55e;border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
      `;
      // Use an SVG bus icon instead of emoji
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/></svg>`;
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([driver.position.lng, driver.position.lat]).addTo(map);
      markersRef.current.push(marker);
    });
  }, [activeDrivers, showMap]);

  // ── Filtered routes ───────────────────────────────────────────────────────
  const filteredDriverRoutes = driverRoutes.filter((r) => {
    if (filter === "commuter") return false;
    if (!search) return true;
    return r.name.toLowerCase().includes(search.toLowerCase()) || r.stops.some((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  });

  const filteredCommuterRoutes = commuterRoutes.filter((r) => {
    if (filter === "driver") return false;
    if (!search) return true;
    return r.name.toLowerCase().includes(search.toLowerCase()) || r.stops.some((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  });

  const totalFiltered = filteredDriverRoutes.length + filteredCommuterRoutes.length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white px-4 pt-14 pb-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Explore</h1>
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              showMap ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <MapIcon className="w-4 h-4" />
            {showMap ? "Hide map" : "Map view"}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search routes or stops…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary-400 focus:bg-white"
          />
        </div>

        {/* Filter pills */}
        <RouteTypeToggle value={filter} onChange={setFilter} driverCount={driverRoutes.length} commuterCount={commuterRoutes.length} />
      </div>

      {/* Map */}
      {showMap && (
        <div className="space-y-3 px-4 pb-1">
          <LocationPermissionBanner status={locationStatus} onRequest={requestLocation} />
          
          <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-200">
            <div ref={mapContainerRef} className="h-full w-full" />
            
            {/* Legend Overlay */}
            <div className="absolute top-2 left-2 bg-white/95 backdrop-blur shadow-lg border border-slate-200 rounded-xl p-2.5 z-10 space-y-2 pointer-events-none">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Legend</h3>
              <LegendItem color="#22c55e" label="Active Driver" />
              <LegendItem color="#000000" label="Scheduled/Inactive" />
              <LegendItem color="#9333ea" label="Community Shared" />
            </div>
          </div>
        </div>
      )}

      {/* Route list */}
      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Loading routes…" />
          </div>
        ) : totalFiltered === 0 ? (
          <div className="flex flex-col items-center py-16 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
              <Search className="w-7 h-7 text-primary-500" />
            </div>
            <p className="font-semibold text-slate-600">No routes found</p>
            <p className="text-sm text-slate-400">{search ? "Try a different search term." : "Be the first to add a community route!"}</p>
          </div>
        ) : (
          <>
            {filteredDriverRoutes.length > 0 && (
              <div className="space-y-2">
                {filter === "all" && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Driver routes</p>}
                {filteredDriverRoutes.map((r) => (
                  <DriverRouteCard key={r.id} route={r} onSelect={(route) => navigate(`/predict?routeId=${route.id}&type=driver`)} />
                ))}
              </div>
            )}

            {filteredCommuterRoutes.length > 0 && (
              <div className="space-y-2">
                {filter === "all" && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 pt-2">Community routes</p>}
                {filteredCommuterRoutes.map((r) => (
                  <CommuterRouteCard key={r.id} route={r} onSelect={(route) => navigate(`/predict?routeId=${route.id}&type=commuter`)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-medium text-slate-700">{label}</span>
    </div>
  )
}
