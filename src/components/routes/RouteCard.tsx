import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import RouteVoteButtons from "@/components/commuter/RouteVoteButtons";
import { Bus, TramFront, Bike, User, Banknote, Snowflake, AlertTriangle, ChevronRight, Pencil } from "lucide-react";
import type { DriverRoute, CommuterRoute } from "@/types";
import type { JSX } from "react";

const VEHICLE_ICON: Record<string, JSX.Element> = {
  jeepney: <TramFront className="w-5 h-5" />,
  bus: <Bus className="w-5 h-5" />,
  tricycle: <Bike className="w-5 h-5" />,
};

// ─── Driver Route Card ────────────────────────────────────────────────────────

export function DriverRouteCard({ route, onSelect }: { route: DriverRoute; onSelect?: (r: DriverRoute) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(route)}
      className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-4 active:scale-[.98] transition-transform"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-primary-600">
          {VEHICLE_ICON[route.vehicleType] ?? <TramFront className="w-5 h-5" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug">{route.name}</h3>
            {route.isActive && (
              <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">
            {route.vehicleType} · {route.stops.length} stops · {route.schedule.startTime}–{route.schedule.endTime}
            {route.pricing && (
              <span className="text-primary-600 font-medium">
                {" "}
                · ₱{route.pricing.minFare}
                {route.pricing.perStopFare ? `+₱${route.pricing.perStopFare}/stop` : " flat"}
              </span>
            )}
          </p>
          {route.stops.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {route.stops.slice(0, 3).map((s, i) => (
                <span key={s.id} className="text-[11px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 flex items-center gap-1">
                  {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />}
                  {s.name.split(",")[0]}
                </span>
              ))}
              {route.stops.length > 3 && <span className="text-[11px] text-slate-400">+{route.stops.length - 3}</span>}
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
      </div>
    </button>
  );
}

// ─── Commuter Route Card ──────────────────────────────────────────────────────

export function CommuterRouteCard({ route, onSelect }: { route: CommuterRoute; onSelect?: (r: CommuterRoute) => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthor = user?.uid === route.authorId;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      {/* Tappable header → predict */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.(route)}
        onKeyDown={(e) => e.key === 'Enter' && onSelect?.(route)}
        className="w-full text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center shrink-0 mt-0.5 text-accent-600">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-800 text-sm leading-snug">{route.name}</h3>
              <div className="flex items-center gap-1.5 shrink-0">
                {isAuthor && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/commuter/edit-route/${route.id}`);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    aria-label="Edit route"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-[10px] font-bold bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full">Community</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{route.stops.length} stops</p>

            {/* Stop endpoints */}
            {route.stops.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="truncate">{route.stops[0].name.split(",")[0]}</span>
                <span className="text-slate-300 mx-0.5">→</span>
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <span className="truncate">{route.stops[route.stops.length - 1].name.split(",")[0]}</span>
              </div>
            )}

            {/* Tip tags */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {route.tips.fare && <span className="text-[11px] bg-primary-50 text-primary-700 rounded-full px-2 py-0.5 font-medium">₱{route.tips.fare}</span>}
              {route.tips.isCashOnly && (
                <span className="text-[11px] bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                  <Banknote className="w-3 h-3" /> Cash only
                </span>
              )}
              {route.tips.hasAC && (
                <span className="text-[11px] bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                  <Snowflake className="w-3 h-3" /> A/C
                </span>
              )}
              {route.tips.hazards && (
                <span className="text-[11px] bg-red-50 text-red-600 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {route.tips.hazards.slice(0, 24)}
                </span>
              )}
            </div>
            {route.tips.notes && <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 italic">"{route.tips.notes}"</p>}
          </div>
        </div>
      </div>

      {/* Vote buttons — outside the tappable area */}
      <div className="mt-3 pt-3 border-t border-slate-100 pl-11">
        <RouteVoteButtons routeId={route.id} helpfulVotes={route.helpfulVotes} notHelpfulVotes={route.notHelpfulVotes} />
      </div>
    </div>
  );
}
