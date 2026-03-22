import { TramFront, Bus, Bike, User, Clock, ChevronRight, Pencil, Banknote, Snowflake, AlertTriangle } from "lucide-react";
import type { DriverRoute, CommuterRoute } from "@/types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import RouteVoteButtons from "@/components/commuter/RouteVoteButtons";
import StatusBadge from "@/components/common/StatusBadge";

interface RouteCardProps {
  onSelect?: (id: string) => void;
}

export function DriverRouteCard({ route, onSelect }: RouteCardProps & { route: DriverRoute }) {
  const Icon = route.vehicleType === "bus" ? Bus : route.vehicleType === "jeepney" ? TramFront : Bike;

  return (
    <div
      onClick={() => onSelect?.(route.id)}
      className="group relative bg-white border-[1.5px] border-slate-200 rounded-xl p-4 transition-all hover:border-ink cursor-pointer active:translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status="warning" label={route.vehicleType} />
            {route.isActive && <StatusBadge status="active" animate />}
          </div>
          <h3 className="text-lg font-display text-ink leading-tight mb-1 group-hover:text-primary-500 transition-colors">
            {route.name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted font-medium">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>Driver {route.driverId.slice(0, 4)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{route.schedule.startTime} - {route.schedule.endTime}</span>
            </div>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-surface border border-slate-200 flex items-center justify-center text-ink shrink-0 group-hover:bg-primary-50 group-hover:border-primary-200 transition-all">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex -space-x-1">
          {route.stops.slice(0, 3).map((_, i) => (
            <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
              {i + 1}
            </div>
          ))}
          {route.stops.length > 3 && (
            <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[8px] font-bold text-slate-400">
              +{route.stops.length - 3}
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 translate-x-0 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}

export function CommuterRouteCard({ route, onSelect }: RouteCardProps & { route: CommuterRoute }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthor = user?.uid === route.authorId;

  return (
    <div
      onClick={() => onSelect?.(route.id)}
      className="group bg-white border-[1.5px] border-slate-200 rounded-xl p-4 transition-all hover:border-ink cursor-pointer active:translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status="community" />
            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-tight">
              Route Guide
            </span>
          </div>
          <h3 className="text-lg font-display text-ink leading-tight mb-1 group-hover:text-primary-500 transition-colors">
            {route.name}
          </h3>
          <p className="text-xs text-muted line-clamp-1 font-medium italic">
            "{route.tips.notes || "No additional notes"}"
          </p>
        </div>
        
        {isAuthor && (
          <button
            className="p-2 rounded-lg bg-surface border border-slate-200 text-ink hover:bg-primary-500 hover:text-white hover:border-primary-600 transition-all shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/commuter/edit-route/${route.id}`);
            }}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge icon={<Banknote className="w-3 h-3" />} label={`₱${route.tips.fare}`} />
          {route.tips.hasAC && <Badge icon={<Snowflake className="w-3 h-3" />} label="AC" />}
          {route.tips.hazards && <Badge icon={<AlertTriangle className="w-3 h-3 text-primary-500" />} label="Warning" />}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <RouteVoteButtons
            routeId={route.id}
            helpfulVotes={route.helpfulVotes}
            notHelpfulVotes={route.notHelpfulVotes}
          />
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 bg-surface border border-slate-200 px-2 py-1 rounded-[6px] text-[10px] font-bold text-ink uppercase tracking-tight">
      {icon}
      <span>{label}</span>
    </div>
  );
}
