import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAllRoutes } from "@/hooks/useAllRoutes";
import { runPrediction } from "@/engine";
import { fetchRouteDuration } from "@/services/mapbox/directions";
import PredictionCard from "@/components/predictions/PredictionCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import RouteMapPreview from "@/components/map/RouteMapPreview";
import RouteVoteButtons from "@/components/commuter/RouteVoteButtons";
import TopBar from "@/components/common/TopBar";
import EmptyState from "@/components/common/EmptyState";

export default function PredictPage() {
  const [params] = useSearchParams();
  const routeId = params.get("routeId");
  const routeType = params.get("type") as "driver" | "commuter" | null;

  const { driverRoutes, commuterRoutes, activeDrivers, loading } = useAllRoutes();

  // Find the selected route
  const selectedDriver = routeType === "driver" ? driverRoutes.find((r) => r.id === routeId) : null;
  const selectedCommuter = routeType === "commuter" ? commuterRoutes.find((r) => r.id === routeId) : null;
  const selectedRoute = selectedDriver ?? selectedCommuter;

  // Base prediction from synchronously checking engine
  const basePrediction = useMemo(() => {
    if (!selectedRoute) return null;
    return runPrediction({
      driverRoutes: selectedDriver ? driverRoutes.filter((r) => r.id === routeId) : [],
      activeDriverRoutes: selectedDriver
        ? activeDrivers
            .filter((a) => a.routeId === routeId)
            .map((a) => driverRoutes.find((r) => r.id === a.routeId))
            .filter((r): r is NonNullable<typeof r> => !!r)
        : [],
      commuterRoutes: selectedCommuter ? commuterRoutes.filter((r) => r.id === routeId) : commuterRoutes,
    });
  }, [selectedRoute, selectedDriver, selectedCommuter, driverRoutes, commuterRoutes, activeDrivers, routeId]);

  const [liveDuration, setLiveDuration] = useState<{ min: number; max: number } | null>(null);

  useEffect(() => {
    setLiveDuration(null);
    if (!selectedRoute || selectedRoute.stops.length < 2) return;

    let canceled = false;
    const coords = selectedRoute.stops.map((s) => s.coordinates);
    
    fetchRouteDuration(coords).then((durationMinutes) => {
      if (!canceled && durationMinutes !== null) {
        const maxDuration = Math.max(durationMinutes + 2, Math.round(durationMinutes * 1.2));
        setLiveDuration({ min: durationMinutes, max: maxDuration });
      }
    });

    return () => {
      canceled = true;
    };
  }, [selectedRoute]);

  const prediction = basePrediction
    ? liveDuration
      ? { ...basePrediction, etaRange: liveDuration }
      : basePrediction
    : null;

  const stops = selectedRoute?.stops ?? [];
  const geometry = selectedRoute?.geometry ?? null;

  return (
    <div className="min-h-screen bg-surface">
      <TopBar title={routeType === "driver" ? "PredictSure" : "PredictSure"} />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Loading estimations…" />
          </div>
        ) : !selectedRoute ? (
          <EmptyState title="Route not found" message="Tap any route signboard on the Explore page to see real-time predictions." />
        ) : (
          <>
            {/* Prediction card */}
            {prediction && <PredictionCard prediction={prediction} routeName={selectedRoute.name} stops={stops} />}

            {/* Voting Component for Commuter Routes */}
            {routeType === "commuter" && selectedCommuter && (
              <div className="bg-white rounded-xl border-[1.5px] border-slate-200 p-5 shadow-sm">
                <RouteVoteButtons
                  routeId={selectedCommuter.id}
                  helpfulVotes={selectedCommuter.helpfulVotes}
                  notHelpfulVotes={selectedCommuter.notHelpfulVotes}
                />
              </div>
            )}

            {/* Map preview */}
            {stops.length > 0 && (
              <div className="space-y-3">
                <p className="section-label pl-1">Route Map View</p>
                <div className="border-2 border-ink rounded-xl overflow-hidden shadow-md">
                  <RouteMapPreview stops={stops} geometry={geometry} className="h-60" interactive={true} />
                </div>
              </div>
            )}

            {/* Stop list */}
            {stops.length > 0 && (
              <div className="space-y-3">
                <p className="section-label pl-1">Signboard Stops</p>
                <div className="bg-white rounded-xl border-[1.5px] border-slate-200 overflow-hidden shadow-sm">
                  <div className="divide-y divide-slate-100">
                    {stops.map((stop, i) => (
                      <div key={stop.id} className="px-5 py-4 flex items-center gap-4 group hover:bg-surface transition-colors cursor-default">
                        <div
                          className={`
                          w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[11px] font-display shrink-0 shadow-sm
                          ${
                            i === 0
                              ? "bg-primary-500 border-ink text-white"
                              : i === stops.length - 1
                                ? "bg-accent-500 border-ink text-ink font-bold"
                                : "bg-white border-slate-200 text-ink"
                          }
                        `}
                        >
                          {i === 0 ? "START" : i === stops.length - 1 ? "END" : i}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-bold text-ink tracking-tight uppercase group-hover:text-primary-500 flex items-center gap-2">
                            {stop.name.split(",")[0]}
                          </span>
                          <p className="text-[10px] text-muted tracking-tight font-medium uppercase mt-0.5">Philippines</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
