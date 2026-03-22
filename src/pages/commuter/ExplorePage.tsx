import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAllRoutes } from "@/hooks/useAllRoutes";
import { useUserLocation } from "@/hooks/useUserLocation";
import RouteTypeToggle, { type RouteFilter } from "@/components/routes/RouteTypeToggle";
import { DriverRouteCard, CommuterRouteCard } from "@/components/routes/RouteCard";
import TopBar from "@/components/common/TopBar";
import EmptyState from "@/components/common/EmptyState";
import LocationPermissionBanner from "@/components/common/LocationPermissionBanner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { MapIcon, Search, Plus } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_CENTER: [number, number] = [120.9842, 14.5995]; // Manila

export default function ExplorePage() {
  const { driverRoutes, commuterRoutes, activeDrivers, loading } = useAllRoutes();
  const { location: userLocation, status: locationStatus, request: requestLocation } = useUserLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<RouteFilter>("all");
  const [search, setSearch] = useState("");
  const [showMap, setShowMap] = useState(true);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

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
      "bottom-right",
    );
    
    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap]);

  // ── Sync Location to Map ─────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current && mapLoaded && userLocation) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        essential: true,
      });
    }
  }, [userLocation, mapLoaded]);

  // ── Sync Routes to Map ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showMap || !mapLoaded) return;

    const addRouteLayer = (route: any, type: "driver" | "commuter", index: number) => {
      if (!route.geometry) return;
      const sourceId = `route-${route.id}`;
      const isVisible = filter === "all" || filter === type;

      // Add Source if not exists
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: { type: "Feature", properties: { id: route.id, name: route.name, type }, geometry: route.geometry },
        });

        // Add Layer
        map.addLayer({
          id: sourceId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round", visibility: isVisible ? "visible" : "none" },
          paint: {
            "line-color": type === "driver" ? (route.isActive ? "#E8321A" : "#1A1208") : "#FFD84D",
            "line-width": 4,
            "line-opacity": 0.8,
            "line-offset": type === "commuter" ? 4 + index * 2 : index * 2, // Dynamic offset based on index and type
          },
        });

        // Click handler
        map.on("click", sourceId, (e) => {
          const popupNode = document.createElement("div");
          popupNode.className = "p-2 min-w-30";
          popupNode.innerHTML = `
            <p class="text-xs font-display text-ink uppercase tracking-tight">${route.name}</p>
            <p class="text-[9px] font-bold text-muted mb-2 tracking-widest uppercase">${type === "driver" ? "Driver" : "Community"} Route</p>
          `;
          
          const btn = document.createElement("button");
          btn.className = "text-[10px] font-bold text-primary-500 hover:underline cursor-pointer transition-colors block text-left border-none bg-transparent p-0";
          btn.textContent = "View details";
          btn.onclick = () => navigate(`/predict?routeId=${route.id}&type=${type}`);
          popupNode.appendChild(btn);

          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setDOMContent(popupNode)
            .addTo(map);
        });

        map.on("mouseenter", sourceId, () => {
          map.getCanvas().style.cursor = "pointer";
          map.setPaintProperty(sourceId, "line-width", 6);
          map.setPaintProperty(sourceId, "line-opacity", 1);
        });

        map.on("mouseleave", sourceId, () => {
          map.getCanvas().style.cursor = "";
          map.setPaintProperty(sourceId, "line-width", 4);
          map.setPaintProperty(sourceId, "line-opacity", 0.8);
        });

        // Add start marker
        const startPos = route.stops[0].coordinates;
        const el = document.createElement("div");
        el.className = "w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-125";
        el.style.backgroundColor = type === "driver" ? (route.isActive ? "#E8321A" : "#1A1208") : "#FFD84D";
        el.dataset.routeId = route.id; // Store ID for lookup

        const popupNode = document.createElement("div");
        popupNode.className = "p-2 min-w-30";
        popupNode.innerHTML = `
          <p class="text-xs font-display text-ink uppercase tracking-tight">${route.name}</p>
          <p class="text-[9px] font-bold text-muted mb-2 tracking-widest uppercase">${type === "driver" ? "Driver" : "Community"} Route</p>
        `;
        
        const btn = document.createElement("button");
        btn.className = "text-[10px] font-bold text-primary-500 hover:underline cursor-pointer transition-colors block text-left border-none bg-transparent p-0";
        btn.textContent = "View details";
        btn.onclick = () => navigate(`/predict?routeId=${route.id}&type=${type}`);
        popupNode.appendChild(btn);

        new mapboxgl.Marker({ element: el })
          .setLngLat([startPos.lng, startPos.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 10 }).setDOMContent(popupNode)
          )
          .addTo(map);
      } else {
        // Update visibility if already exists
        map.setLayoutProperty(sourceId, "visibility", isVisible ? "visible" : "none");

        // Update marker visibility - search for marker by element logic
        const markers = document.querySelectorAll(`[data-route-id="${route.id}"]`);
        markers.forEach((m) => {
          (m as HTMLElement).style.display = isVisible ? "block" : "none";
        });
      }
    };

    driverRoutes.forEach((r, i) => addRouteLayer(r, "driver", i));
    commuterRoutes.forEach((r, i) => addRouteLayer(r, "commuter", i));
  }, [driverRoutes, commuterRoutes, filter, showMap, mapLoaded]);


  // ── Update active driver markers ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showMap || !mapLoaded) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    activeDrivers.forEach((driver) => {
      const el = document.createElement("div");
      el.style.cssText = `
        width:34px;height:34px;border-radius:10px;
        background:#E8321A;border:2.5px solid white;
        box-shadow:4px 4px 0px 0px rgba(26,18,8,0.1);
        display:flex;align-items:center;justify-content:center;
      `;
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/></svg>`;
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([driver.position.lng, driver.position.lat]).addTo(map);
      markersRef.current.push(marker);
    });
  }, [activeDrivers, showMap, mapLoaded]);

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
    <div className="min-h-screen bg-surface">
      <TopBar
        title="ExploreSure"
        rightElement={
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all border-[1.5px] ${
              showMap
                ? "bg-white text-primary-500 border-white shadow-md active:translate-y-0.5"
                : "bg-primary-600 text-white border-primary-400 hover:bg-primary-700 active:translate-y-0.5"
            }`}
          >
            <MapIcon className="w-4 h-4" />
            {showMap ? "Hide" : "Map"}
          </button>
        }
      />

      <div className="bg-primary-500 px-4 pb-5 shadow-lg border-b-[3px] border-ink/10">
        {/* Search — Inverted dark block */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="search"
            placeholder="Search routes, stops, or drivers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border-none bg-ink/90 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-accent-500/50 shadow-inner"
          />
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Map */}
        {showMap && (
          <div className="space-y-4 pb-2">
            <LocationPermissionBanner status={locationStatus} onRequest={requestLocation} />

            <div className="relative h-72 w-full overflow-hidden rounded-xl border-2 border-ink shadow-lg">
              <div ref={mapContainerRef} className="h-full w-full" />

              {/* Legend Overlay — Signboard Style */}
              <div className="absolute top-3 left-3 bg-white border-[1.5px] border-ink rounded-lg p-2 z-10 space-y-2 pointer-events-none shadow-md">
                <h3 className="section-label mb-1.5">Map Legend</h3>
                <LegendItem color="#E8321A" label="Active Driver" />
                <LegendItem color="#1A1208" label="Scheduled/Inactive" />
                <LegendItem color="#FFD84D" label="Community Shared" />
              </div>
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div className="bg-white border-[1.5px] border-slate-200 rounded-lg p-1.5">
          <RouteTypeToggle value={filter} onChange={setFilter} driverCount={driverRoutes.length} commuterCount={commuterRoutes.length} />
        </div>

        {/* Route list */}
        <div className="space-y-6 pt-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner message="Loading routes…" />
            </div>
          ) : totalFiltered === 0 ? (
            <EmptyState
              title={search ? "No matches found" : "No community routes"}
              message={search ? "Try searching for a different signboard or landmark." : "Be the first to share a guide for this area!"}
              icon={search ? undefined : <Plus className="w-12 h-12 text-slate-300" />}
              action={
                !search &&
                filter !== "driver" && (
                  <button
                    onClick={() => navigate("/commuter/add-route")}
                    className="w-full bg-ink text-white py-3 rounded-xl text-[10px] font-display uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                  >
                    Add Route Guide
                  </button>
                )
              }
            />
          ) : (
            <>
              {filteredDriverRoutes.length > 0 && (
                <div className="space-y-3">
                  {filter === "all" && <p className="section-label pl-1">Driver routes</p>}
                  {filteredDriverRoutes.map((r) => (
                    <DriverRouteCard key={r.id} route={r} onSelect={(id) => navigate(`/predict?routeId=${id}&type=driver`)} />
                  ))}
                </div>
              )}

              {filteredCommuterRoutes.length > 0 && (
                <div className="space-y-3">
                  {filter === "all" && <p className="section-label pl-1">Community routes</p>}
                  {filteredCommuterRoutes.map((r) => (
                    <CommuterRouteCard key={r.id} route={r} onSelect={(id) => navigate(`/predict?routeId=${id}&type=commuter`)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-2.5 h-2.5 rounded-sm border border-ink/20" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-bold text-ink uppercase tracking-tight">{label}</span>
    </div>
  );
}
