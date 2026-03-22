import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAllRoutes } from "@/hooks/useAllRoutes";
import RouteTypeToggle, { type RouteFilter } from "@/components/routes/RouteTypeToggle";
import { DriverRouteCard, CommuterRouteCard } from "@/components/routes/RouteCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_CENTER: [number, number] = [123.8854, 10.3157];

export default function ExplorePage() {
  const { driverRoutes, commuterRoutes, activeDrivers, loading } = useAllRoutes();
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
      center: DEFAULT_CENTER,
      zoom: 12,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    mapRef.current = map;

    map.on("load", () => {
      // Add route line sources for all driver routes
      driverRoutes.forEach((route) => {
        if (!route.geometry) return;
        const sourceId = `route-${route.id}`;
        if (map.getSource(sourceId)) return;
        map.addSource(sourceId, { type: "geojson", data: { type: "Feature", properties: {}, geometry: route.geometry } });
        map.addLayer({
          id: sourceId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": route.isActive ? "#22c55e" : "#3b82f6",
            "line-width": 3,
            "line-opacity": 0.75,
          },
        });
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
        font-size:14px;
      `;
      el.textContent = "🚌";
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
              showMap ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M8.157 2.176a1.5 1.5 0 00-1.147 0l-4.083 1.69A1.5 1.5 0 002 5.25v10.877a.75.75 0 001.07.68l3.428-1.419 2.841 1.177a1.5 1.5 0 001.147 0l2.841-1.177 3.428 1.42a.75.75 0 001.07-.68V5.25a1.5 1.5 0 00-.927-1.384l-4.083-1.69zM7.5 4.42V15.31l-3 1.242V5.66l3-1.242zM9 15.31V4.42l2 .828V16.14l-2-.829zm3.5.829V5.248l3 1.242v10.892l-3-1.243z"
                clipRule="evenodd"
              />
            </svg>
            {showMap ? "Hide map" : "Map view"}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            placeholder="Search routes or stops…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:bg-white"
          />
        </div>

        {/* Filter pills */}
        <RouteTypeToggle value={filter} onChange={setFilter} driverCount={driverRoutes.length} commuterCount={commuterRoutes.length} />
      </div>

      {/* Map */}
      {showMap && <div ref={mapContainerRef} className="h-56 w-full" />}

      {/* Route list */}
      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Loading routes…" />
          </div>
        ) : totalFiltered === 0 ? (
          <div className="flex flex-col items-center py-16 text-center gap-3">
            <span className="text-4xl">🗺️</span>
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
