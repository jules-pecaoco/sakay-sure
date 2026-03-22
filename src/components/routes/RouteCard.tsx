import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import RouteVoteButtons from "@/components/commuter/RouteVoteButtons";
import type { DriverRoute, CommuterRoute } from "@/types";

const VEHICLE_EMOJI: Record<string, string> = {
  jeepney: "🚌",
  bus: "🚍",
  tricycle: "🛺",
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
        <span className="text-2xl mt-0.5">{VEHICLE_EMOJI[route.vehicleType] ?? "🚌"}</span>
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
              <span className="text-sky-600 font-medium">
                {" "}
                · ₱{route.pricing.minFare}
                {route.pricing.perStopFare ? `+₱${route.pricing.perStopFare}/stop` : " flat"}
              </span>
            )}
          </p>
          {route.stops.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {route.stops.slice(0, 3).map((s, i) => (
                <span key={s.id} className="text-[11px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                  {i === 0 ? "🟢 " : ""}
                  {s.name.split(",")[0]}
                </span>
              ))}
              {route.stops.length > 3 && <span className="text-[11px] text-slate-400">+{route.stops.length - 3}</span>}
            </div>
          )}
        </div>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-300 shrink-0 mt-1">
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
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
        className="w-full text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-sm">👤</span>
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
                    className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                    aria-label="Edit route"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M11.013 1.427a1.75 1.75 0 012.474 0l.973.973a1.75 1.75 0 010 2.474l-7.266 7.266A1.75 1.75 0 016 12.697H3.75a.75.75 0 01-.75-.75V9.697a1.75 1.75 0 01.513-1.237l7.5-7.033zm1.414 1.06a.25.25 0 00-.354 0l-.97.97 1.883 1.884.97-.97a.25.25 0 000-.354l-1.529-1.53zm-9.158 9.79a.25.25 0 00-.073.177v1.896h1.896a.25.25 0 00.177-.073l6.43-6.43-2-2-6.43 6.43z" />
                    </svg>
                  </button>
                )}
                <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Community</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{route.stops.length} stops</p>

            {/* Stop endpoints */}
            {route.stops.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-500">
                <span className="text-green-500">●</span>
                <span className="truncate">{route.stops[0].name.split(",")[0]}</span>
                <span className="text-slate-300 mx-0.5">→</span>
                <span className="text-red-400">●</span>
                <span className="truncate">{route.stops[route.stops.length - 1].name.split(",")[0]}</span>
              </div>
            )}

            {/* Tip tags */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {route.tips.fare && <span className="text-[11px] bg-sky-50 text-sky-700 rounded-full px-2 py-0.5 font-medium">₱{route.tips.fare}</span>}
              {route.tips.isCashOnly && <span className="text-[11px] bg-amber-50 text-amber-700 rounded-full px-2 py-0.5">💵 Cash only</span>}
              {route.tips.hasAC && <span className="text-[11px] bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">❄️ A/C</span>}
              {route.tips.hazards && (
                <span className="text-[11px] bg-red-50 text-red-600 rounded-full px-2 py-0.5">⚠ {route.tips.hazards.slice(0, 24)}</span>
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
