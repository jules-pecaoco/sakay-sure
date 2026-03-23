import { TramFront, Bus, Bike, Clock, Pencil, Navigation, Trash2 } from "lucide-react";
import type { DriverRoute } from "@/types";
import { Link } from "react-router-dom";
import ActiveToggle from "./ActiveToggle";
import { useState } from "react";
import { deleteDriverRoute } from "@/services/firebase/routes";

interface DriverRouteCardProps {
  route: DriverRoute;
}

export default function DriverRouteCard({ route }: DriverRouteCardProps) {
  const Icon = route.vehicleType === "bus" ? Bus : route.vehicleType === "jeepney" ? TramFront : Bike;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    
    setIsDeleting(true);
    try {
      await deleteDriverRoute(route.id);
    } catch (error) {
      console.error("Failed to delete route:", error);
      alert("Failed to delete route. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border-[1.5px] border-ink rounded-xl shadow-[4px_4px_0px_0px_rgba(26,18,8,0.05)] overflow-hidden group hover:border-primary-500 transition-all">
      {/* Route info */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-accent-500 px-2 py-0.5 rounded-[6px] text-[10px] font-display uppercase tracking-wider text-ink border border-ink/10">
              {route.vehicleType}
            </span>
            {route.isActive && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-tighter">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live Now
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-display text-ink uppercase tracking-tight mb-2 group-hover:text-primary-500 transition-colors">
            {route.name}
          </h3>
          
          <div className="flex items-center gap-3 text-xs font-semibold text-muted uppercase tracking-tight">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{route.schedule.startTime} - {route.schedule.endTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>{route.stops.length} Stops</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0 items-end">
          <div className="w-12 h-12 rounded-xl bg-surface border-[1.5px] border-slate-200 flex items-center justify-center text-ink shadow-inner group-hover:bg-primary-50 group-hover:border-primary-200 transition-all">
            <Icon className="w-6 h-6" strokeWidth={2.2} />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-10 h-10 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-sm hover:bg-red-600 hover:text-white active:translate-y-0.5 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <Link
              to={`/driver/edit-route/${route.id}`}
              className="w-10 h-10 rounded-lg bg-ink text-white flex items-center justify-center shadow-md hover:bg-slate-900 active:translate-y-0.5 transition-all"
            >
              <Pencil className="w-4 h-4 text-accent-500" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Active Toggle integrated */}
      <div className="px-5 pb-4 border-t border-slate-100">
        <ActiveToggle route={route} />
      </div>
    </div>
  );
}
